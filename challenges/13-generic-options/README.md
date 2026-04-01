# 13. 제네릭으로 라우터별 옵션 확장하기

## 왜 필요한가?

12단계의 `createUseFunnel`은 모든 라우터에서 동일한 `push(step, context)` API를 제공한다.
하지만 실제 라우터마다 추가 옵션이 있다.

- Next.js: `push(step, context, { shallow: true })`
- React Router: `push(step, context, { viewTransition: true })`

이 옵션들을 타입 안전하게 지원하려면 제네릭이 필요하다.

```ts
// Next.js 라우터 옵션
type NextRouteOption = { shallow?: boolean };

// Next.js용 useFunnel — push에 shallow 옵션이 타입에 나타남
const useNextFunnel = createUseFunnel<NextRouteOption>(useNextRouter);
funnel.history.push('BStep', { foo: '1' }, { shallow: true }); // ✅ 타입 안전
```

## 문제

`index.ts`에 제네릭 옵션을 지원하는 `createUseFunnel<TRouteOption>`을 구현하라.

### 변경 사항

12단계의 `createUseFunnel`에서 `TRouteOption` 제네릭을 추가한다.

```ts
// 기존 (12단계)
history.push(step: string, contextOrFn?: ContextOrFn): void

// 변경 (13단계)
history.push(step: string, contextOrFn?: ContextOrFn, option?: TRouteOption): void
```

라우터의 `push`도 옵션을 받도록 변경한다.

```ts
interface FunnelRouterResultWithOption<TRouteOption> {
  push(state: FunnelState, option?: TRouteOption): void;
  replace(state: FunnelState, option?: TRouteOption): void;
  // ...
}
```

## 힌트

```ts
export function createUseFunnel<TRouteOption = Record<never, never>>(
  useRouter: (initialState: FunnelState) => FunnelRouterResultWithOption<TRouteOption>,
) {
  return function useFunnel(initialState: FunnelState) {
    const router = useRouter(initialState);
    return {
      history: {
        push: (step, contextOrFn, option?: TRouteOption) => {
          const newContext = computeNextContext(currentState.context, contextOrFn ?? {});
          router.push({ step, context: newContext }, option);
        },
      },
    };
  };
}
```

## use-funnel 연결

```ts
// use-funnel의 실제 FunnelRouter 인터페이스
export interface FunnelRouter<TRouteOption, TFunnelOption> {
  (option: FunnelRouterOption & TFunnelOption): FunnelRouterResult<TRouteOption>;
}

// Next.js 어댑터
export const useFunnel = createUseFunnel<NextPageRouteOption, NextPageFunnelOption>(
  ({ id, initialState, shallow, stepQueryName }) => {
    // Next Router 연동 구현
  }
);
```
