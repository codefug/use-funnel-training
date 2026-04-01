# 12. Factory 패턴: createUseFunnel

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

## 힌트

```ts
export function createUseFunnel(useRouter) {
  return function useFunnel(initialState) {
    const router = useRouter(initialState);
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
    const currentState = router.history[router.currentIndex] ?? initialState;

    const history = {
      push: (step: string, contextOrFn?: ContextOrFn) => {
        const newContext = computeNextContext(currentState.context, contextOrFn ?? {});
        router.push({ step, context: newContext });
      },
      replace: (step: string, contextOrFn?: ContextOrFn) => {
        const newContext = computeNextContext(currentState.context, contextOrFn ?? {});
        router.replace({ step, context: newContext });
      },
      go: (delta: number) => router.go(delta),
      back: () => router.go(-1),
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
반환된 훅은 라우터의 `push(FunnelState)` 위에 `computeNextContext`를 씌워서
`push(step, contextOrFn)` API를 제공한다.

</details>
