# 12. URL SearchParams 라우터 구현

## 왜 필요한가?

11단계에서 `useMemoryRouter`를 만들었다. 이 라우터는 React state에 히스토리를 저장하기 때문에
**페이지를 새로고침하면 퍼널 상태가 사라지고, 브라우저 뒤로가기 버튼이 작동하지 않는다.**

실제 프로덕션 앱에서 useFunnel을 쓸 때는 퍼널 상태를 URL에 동기화해야 한다.
그래야 브라우저 뒤로가기/앞으로가기가 퍼널 네비게이션과 연동된다.

```
URL: /signup?funnel={"step":"AgeStep","context":{"name":"Alice"}}

브라우저 뒤로가기 → popstate 이벤트 → AgeStep 이전 상태로 복원
```

이것이 `@use-funnel/next`, `@use-funnel/react-router-dom` 같은 패키지가 하는 일이다.
이들은 모두 `FunnelRouterResult` 인터페이스를 구현하지만,
내부적으로 URL query params + `history.pushState`를 사용한다.

## 핵심 개념

### 1. 브라우저 History API

```ts
// URL을 바꾸되 페이지 이동 없이
history.pushState(state, '', url);    // 히스토리 스택에 추가
history.replaceState(state, '', url); // 현재 항목을 교체

// 뒤로/앞으로 이동 시 발생하는 이벤트
window.addEventListener('popstate', handler);
```

### 2. cleanup()이 필요한 이유

`useMemoryRouter`의 `cleanup()`은 아무것도 안 해도 됐다.
하지만 URL 라우터는 `popstate` 이벤트 리스너를 등록하므로,
컴포넌트 언마운트 시 반드시 제거해야 메모리 누수가 없다.

```ts
// 등록
window.addEventListener('popstate', onPopState);

// cleanup에서 제거
return () => window.removeEventListener('popstate', onPopState);
```

이것이 `FunnelRouterResult`에 `cleanup()` 메서드가 있는 이유다.

### 3. Strategy 패턴 확인

`useSearchParamsRouter`도 `FunnelRouterResult`를 구현하기 때문에,
13단계의 `createUseFunnel`에 그대로 꽂을 수 있다.

```ts
const useMemoryFunnel = createUseFunnel(useMemoryRouter);       // 메모리 기반
const useUrlFunnel    = createUseFunnel(useSearchParamsRouter); // URL 기반 — 동일한 API!
```

## 문제

`index.ts`에 `useSearchParamsRouter` 훅을 구현하라.

### 시그니처

```ts
function useSearchParamsRouter(initialState: FunnelState): FunnelRouterResult
```

### URL 직렬화 규칙

퍼널 전체 히스토리(배열)를 URL query param `funnel`에 JSON 형태로 저장한다.

```
?funnel=[{"step":"AStep","context":{}},{"step":"BStep","context":{"foo":"1"}}]&funnelIndex=1
```

- `funnel`: `FunnelState[]`를 `JSON.stringify`한 값
- `funnelIndex`: 현재 히스토리 인덱스

URL에 해당 파라미터가 없으면 `initialState`로 초기화한다.

### push / replace 동작

- `push(state)`: 현재 인덱스 이후 항목을 버리고, 새 상태를 추가.
  `history.pushState`로 URL을 갱신한다.
- `replace(state)`: 현재 인덱스 항목을 교체.
  `history.replaceState`로 URL을 갱신한다.
- `go(delta)`: `history.go(delta)`를 호출한다.

### popstate 처리

브라우저 뒤로/앞으로 버튼이 눌리면 `popstate` 이벤트가 발생한다.
이때 `event.state`에 저장된 `{ history, currentIndex }`로 상태를 복원한다.

### cleanup

`window.removeEventListener`로 popstate 핸들러를 제거한다.

## 힌트

- `useState`로 `{ history: FunnelState[], currentIndex: number }` 상태를 관리한다
- `useEffect`로 `popstate` 리스너를 등록하고, cleanup 함수에서 제거한다
- `history.pushState(stateObject, '', url)` — 첫 번째 인자가 `popstate`의 `event.state`가 된다
- URL을 구성할 때 `new URLSearchParams()`를 활용한다

## use-funnel 연결

이 단계가 완성되면, 다음과 같이 URL 기반 useFunnel을 만들 수 있다.

```ts
// 13단계 이후
const useUrlFunnel = createUseFunnel(useSearchParamsRouter);
```

실제 `@use-funnel/next`는 이 패턴으로 Next.js `useSearchParams`를 래핑한다.

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```ts
export function useSearchParamsRouter(initialState: FunnelState): FunnelRouterResult {
  const readFromUrl = (): { history: FunnelState[]; currentIndex: number } => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('funnel');
    const indexRaw = params.get('funnelIndex');
    if (raw) {
      try {
        const history = JSON.parse(raw) as FunnelState[];
        const currentIndex = indexRaw ? parseInt(indexRaw, 10) : history.length - 1;
        return { history, currentIndex };
      } catch {
        // 파싱 실패 시 초기 상태로
      }
    }
    return { history: [initialState], currentIndex: 0 };
  };

  const [state, setState] = useState(readFromUrl);

  const buildUrl = (history: FunnelState[], currentIndex: number): string => {
    const params = new URLSearchParams(window.location.search);
    params.set('funnel', JSON.stringify(history));
    params.set('funnelIndex', String(currentIndex));
    return `${window.location.pathname}?${params.toString()}`;
  };

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      if (event.state?.funnelHistory) {
        setState({
          history: event.state.funnelHistory,
          currentIndex: event.state.funnelIndex,
        });
      } else {
        setState(readFromUrl());
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const push = (newState: FunnelState) => {
    const newHistory = [...state.history.slice(0, state.currentIndex + 1), newState];
    const newIndex = newHistory.length - 1;
    const stateObj = { funnelHistory: newHistory, funnelIndex: newIndex };
    window.history.pushState(stateObj, '', buildUrl(newHistory, newIndex));
    setState({ history: newHistory, currentIndex: newIndex });
  };

  const replace = (newState: FunnelState) => {
    const newHistory = [
      ...state.history.slice(0, state.currentIndex),
      newState,
      ...state.history.slice(state.currentIndex + 1),
    ];
    const stateObj = { funnelHistory: newHistory, funnelIndex: state.currentIndex };
    window.history.replaceState(stateObj, '', buildUrl(newHistory, state.currentIndex));
    setState({ history: newHistory, currentIndex: state.currentIndex });
  };

  const go = (delta: number) => {
    window.history.go(delta);
  };

  const cleanup = () => {
    // useEffect cleanup이 처리하지만, 명시적 호출을 위해 노출
  };

  return {
    history: state.history,
    currentIndex: state.currentIndex,
    push,
    replace,
    go,
    cleanup,
  };
}
```

**핵심 포인트:**
- `useEffect`에서 popstate를 등록하고, 반환 함수에서 제거 → 메모리 누수 방지
- `pushState`의 첫 번째 인자(state object)가 뒤로가기 시 `event.state`로 복원됨
- `go(delta)`는 브라우저 자체 히스토리를 이동 → `popstate` 이벤트로 상태 복원이 연계됨
- `useMemoryRouter`와 완전히 동일한 인터페이스 → Strategy 패턴 확인

</details>
