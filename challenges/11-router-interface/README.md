# 11. 인터페이스 설계: Router 계약 정의

## 왜 필요한가?

use-funnel이 Next.js, React Router, Browser History 등 다양한 라우터를 지원할 수 있는 이유는
"라우터가 무엇을 해줘야 하는지"를 인터페이스로 추상화했기 때문이다.

```ts
// 이 인터페이스만 구현하면 어떤 라우터든 use-funnel과 연동 가능
interface FunnelRouterResult {
  history: FunnelState[];
  currentIndex: number;
  push(state: FunnelState): void;
  replace(state: FunnelState): void;
  go(delta: number): void;
  cleanup(): void;
}
```

## 문제

`index.ts`에 `FunnelRouterResult` 인터페이스를 정의하고,
이 인터페이스를 구현하는 두 가지 구현체를 작성하라.

### 1. `FunnelRouterResult` 인터페이스

```ts
interface FunnelRouterResult {
  history: FunnelState[];
  currentIndex: number;
  push(state: FunnelState): void;
  replace(state: FunnelState): void;
  go(delta: number): void;
  cleanup(): void;
}
```

### 2. `createMemoryRouter(initialState)` 함수

메모리(React state)에 히스토리를 저장하는 구현체를 반환하는 훅.
07단계의 `useHistory`를 사용해서 구현한다.

```ts
// 사용 예시
function MyComponent() {
  const router = createMemoryRouter({ step: 'A', context: {} });
  // router.push, router.replace, router.go, router.cleanup 사용 가능
}
```

### 3. `createMockRouter(initialState)` 함수 (테스트용)

테스트에서 사용할 수 있는 mock 구현체.
실제 상태 변경 없이 호출 여부만 추적한다.

## 힌트

- `createMemoryRouter`는 `useHistory`를 내부에서 호출하므로 훅이다
- `createMockRouter`는 순수 함수로, 각 메서드가 호출됐는지 추적하는 spy 역할

## use-funnel 연결

```ts
// use-funnel의 FunnelRouter 인터페이스 (단순화)
export interface FunnelRouterResult<TRouteOption> {
  history: AnyFunnelState[];
  currentIndex: number;
  push(state: AnyFunnelState, option?: TRouteOption): void | Promise<void>;
  replace(state: AnyFunnelState, option?: TRouteOption): void | Promise<void>;
  go(index: number): void | Promise<void>;
  cleanup(): void;
}
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

### `useMemoryRouter`

```ts
export function useMemoryRouter(initialState: FunnelState): FunnelRouterResult {
  const history = useHistory<FunnelState>(initialState);

  return {
    history: history.history,
    currentIndex: history.currentIndex,
    push: (state) => history.push(state),
    replace: (state) => history.replace(state),
    go: (delta) => history.go(delta),
    cleanup: () => {},
  };
}
```

### `createMockRouter`

```ts
export function createMockRouter(initialState: FunnelState) {
  const calls: Array<{ method: string; args: unknown[] }> = [];

  return {
    history: [initialState],
    currentIndex: 0,
    push: (state: FunnelState) => {
      calls.push({ method: 'push', args: [state] });
    },
    replace: (state: FunnelState) => {
      calls.push({ method: 'replace', args: [state] });
    },
    go: (delta: number) => {
      calls.push({ method: 'go', args: [delta] });
    },
    cleanup: () => {
      calls.push({ method: 'cleanup', args: [] });
    },
    getCalls: () => calls,
  };
}
```

`useMemoryRouter`는 `useHistory`를 `FunnelRouterResult` 인터페이스로 감싸는 어댑터다.
`createMockRouter`는 실제 상태 변경 없이 호출 기록만 남기는 spy 패턴이다.

</details>
