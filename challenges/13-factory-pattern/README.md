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

`history.push` 같은 콜백은 렌더 클로저 안에서 `router`를 캡처한다.
그런데 React에서 state가 바뀌면 새로운 `router` 객체가 생성되므로,
캡처된 콜백은 이전 렌더의 `router`를 참조하게 된다 (stale closure).

`useLatestRef(router)`를 사용하면 ref가 항상 최신 `router`를 가리키므로,
오래된 콜백에서도 `.current`를 통해 최신 상태를 읽을 수 있다.

```ts
const router = useRouter(initialState);
const routerRef = useLatestRef(router); // routerRef.current는 항상 최신 router

const history = {
  push: (step, contextOrFn) => {
    const current = routerRef.current; // 최신 router
    const newContext = computeNextContext(current.history[current.currentIndex].context, contextOrFn ?? {});
    current.push({ step, context: newContext });
  },
};
```

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
