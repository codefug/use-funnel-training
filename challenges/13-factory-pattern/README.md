# 13. Factory 패턴: createUseFunnel

## 왜 필요한가?

11단계에서 `FunnelRouterResult` 인터페이스를 만들었다.
이제 "어떤 라우터 구현체를 받아도 동일한 useFunnel 훅을 만들어주는" Factory 함수가 필요하다.

```ts
// 메모리 라우터를 사용하는 useFunnel
const useFunnel = createUseFunnel(useMemoryRouter);

// 다른 라우터를 사용하는 useFunnel (같은 API!)
const useFunnelWithMock = createUseFunnel(createMockRouter);
```

이것이 use-funnel이 Next.js, React Router 등 다양한 환경을 지원하는 핵심 메커니즘이다.

## 문제

`index.ts`에 `createUseFunnel(routerHook)` Factory 함수를 구현하라.

### 시그니처

```ts
function createUseFunnel(
  useRouter: (initialState: FunnelState) => FunnelRouterResult
): (initialState: FunnelState) => UseFunnelReturn
```

### `UseFunnelReturn`

```ts
type UseFunnelReturn = {
  step: string;
  context: Record<string, unknown>;
  historySteps: FunnelState[];
  currentIndex: number;
  history: {
    push(step: string, contextOrFn?: ...): void;
    replace(step: string, contextOrFn?: ...): void;
    go(delta: number): void;
    back(): void;
  };
};
```

### 동작

1. `useRouter(initialState)`를 호출해서 라우터 결과를 얻는다
2. 라우터의 `push(state)` 위에 `computeNextContext`를 씌워서 `history.push(step, contextOrFn)` API를 만든다
3. 현재 상태(`router.history[router.currentIndex]`)에서 `step`과 `context`를 꺼낸다

## useLatestRef가 필요한 이유

`history` 객체를 메모이제이션하지 않는다면, 렌더마다 새로운 함수가 생성되어 항상 그 렌더의 최신 `router`와 `currentState`를 캡처한다. 이 경우 stale closure 문제는 발생하지 않으므로 `useLatestRef`가 없어도 된다.

`useLatestRef`가 필요해지는 건 `history` 객체를 `useMemo`로 **안정화(memoize)** 하려 할 때다.

**왜 안정화가 필요한가?**

`history`를 매 렌더마다 새로 만들면, 이를 props로 받는 자식 컴포넌트들이 불필요하게 리렌더된다. 이를 막으려면 `useMemo`로 동일한 객체 참조를 유지해야 한다.

**안정화하면 왜 stale closure가 생기는가?**

`useMemo`의 deps에 `currentState`를 넣으면 state가 바뀔 때마다 history가 새 객체가 되어 안정화의 의미가 없어진다. 그래서 `currentState`를 deps에서 빼야 하는데, 그러면 콜백 안의 `currentState`가 처음 캡처된 값으로 고정된다 (stale closure).

```ts
// ❌ currentState가 deps에 없으면 stale
const history = useMemo(() => ({
  push: (step, contextOrFn) => {
    const newContext = computeNextContext(currentState.context, contextOrFn ?? {}); // stale!
    router.push({ step, context: newContext });
  },
}), [router.push, router.replace, router.go]);
//  ↑ currentState를 deps에 넣으면 매 렌더마다 history가 새 객체가 되므로 제외
```

이 문제를 해결하기 위해 `currentState` 대신 ref를 통해 최신값을 읽는다.

> `useLatestRef`는 렌더마다 `ref.current = value`로 갱신되는 단순한 훅이다.
> `useRef`는 렌더 사이에도 동일한 객체를 유지하므로, 콜백이 오래된 변수 대신
> `ref.current`를 읽으면 항상 최신 값을 얻는다.

```ts
// ✅ useMemo로 안정화하면서 최신값은 ref로 읽기
const history = useMemo(() => ({
  push: (step, contextOrFn) => {
    const current = routerRef.current; // ref를 통해 최신 router 읽기
    const latestState = current.history[current.currentIndex];
    const newContext = computeNextContext(latestState.context, contextOrFn ?? {});
    current.push({ step, context: newContext });
  },
}), [routerRef]); // routerRef는 항상 동일한 객체이므로 deps가 안정적
```

**정리:**

| 상황                              | stale closure | useLatestRef 필요 여부 |
| --------------------------------- | ------------- | ---------------------- |
| `history`를 매 렌더마다 새로 생성 | 없음          | 불필요                 |
| `history`를 `useMemo`로 안정화    | 발생          | 필요                   |

## 힌트

```ts
export function createUseFunnel(useRouter) {
  return function useFunnel(initialState) {
    const router = useRouter(initialState);
    const routerRef = useLatestRef(router);
    const currentState = router.history[router.currentIndex] ?? initialState;

    return {
      step: currentState.step,
      context: currentState.context,
      historySteps: router.history,
      currentIndex: router.currentIndex,
      history: {
        push: (step, contextOrFn) => {
          const newContext = computeNextContext(currentState.context, contextOrFn ?? {});
          router.push({ step, context: newContext });
        },
        // ...
      },
    };
  };
}
```

## use-funnel 연결

```ts
// use-funnel의 실제 createUseFunnel (단순화)
export function createUseFunnel(useFunnelRouter) {
  return function useFunnel(options) {
    const router = useFunnelRouter(options);
    // ... 상태 계산, transition 로직, Render 컴포넌트 생성
    return { step, context, history, Render };
  };
}
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```ts
export function createUseFunnel(
  useRouter: (initialState: FunnelState) => FunnelRouterResult,
) {
  return function useFunnel(initialState: FunnelState): UseFunnelReturn {
    const router = useRouter(initialState);
    const routerRef = useLatestRef(router); // stale closure 방지
    const currentState = router.history[router.currentIndex] ?? initialState;

    const history = {
      push: (step: string, contextOrFn?: ContextOrFn) => {
        const current = routerRef.current;
        const latestState = current.history[current.currentIndex] ?? initialState;
        const newContext = computeNextContext(latestState.context, contextOrFn ?? {});
        current.push({ step, context: newContext });
      },
      replace: (step: string, contextOrFn?: ContextOrFn) => {
        const current = routerRef.current;
        const latestState = current.history[current.currentIndex] ?? initialState;
        const newContext = computeNextContext(latestState.context, contextOrFn ?? {});
        current.replace({ step, context: newContext });
      },
      go: (delta: number) => routerRef.current.go(delta),
      back: () => routerRef.current.go(-1),
    };

    return {
      step: currentState.step,
      context: currentState.context,
      historySteps: router.history,
      currentIndex: router.currentIndex,
      history,
    };
  };
}
```

Factory 함수가 `useRouter`를 받아서 `useFunnel` 훅을 반환한다.
`useLatestRef(router)`를 사용해서 history 콜백이 항상 최신 router를 참조하도록 한다.
반환된 훅은 라우터의 `push(FunnelState)` 위에 `computeNextContext`를 씌워서
`push(step, contextOrFn)` API를 제공한다.

</details>
