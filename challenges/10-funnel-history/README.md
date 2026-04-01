# 10. useHistory + transition 조합

## 왜 필요한가?

07단계의 `useHistory`는 단순히 "어떤 값이든" 히스토리에 저장한다.
use-funnel에서는 저장하는 값이 `{ step, context }` 형태의 퍼널 상태다.

이 단계에서는 `useHistory`와 `computeNextContext`를 조합해서,
`push(step, contextOrFn)` 형태로 퍼널 상태를 전환하는 `useFunnelHistory` 훅을 만든다.

```ts
const funnelHistory = useFunnelHistory({
  step: 'AStep',
  context: {},
});

funnelHistory.step;    // 'AStep'
funnelHistory.context; // {}

funnelHistory.push('BStep', { foo: '1' });
// 히스토리: [{ step: 'AStep', context: {} }, { step: 'BStep', context: { foo: '1' } }]
// currentState: { step: 'BStep', context: { foo: '1' } }

funnelHistory.back();
// currentState: { step: 'AStep', context: {} }
```

## 문제

`index.ts`에 `useFunnelHistory` 훅을 구현하라.

### 타입

```ts
type FunnelState = {
  step: string;
  context: Record<string, unknown>;
};

type UseFunnelHistoryReturn = {
  step: string;
  context: Record<string, unknown>;
  historySteps: FunnelState[];
  currentIndex: number;
  push: (step: string, contextOrFn?: ...) => void;
  replace: (step: string, contextOrFn?: ...) => void;
  go: (delta: number) => void;
  back: () => void;
};
```

### push 동작

`push(step, contextOrFn)` 호출 시:
1. `computeNextContext(현재context, contextOrFn)`으로 새 context 계산
2. `{ step, context: 새context }`를 히스토리에 push

## 힌트

- `useHistory<FunnelState>`를 사용한다
- `push`는 `computeNextContext`로 context를 계산한 뒤 `history.push`를 호출한다
- `contextOrFn`이 없으면 현재 context를 그대로 유지한다

## use-funnel 연결

이 훅이 완성되면 use-funnel의 핵심 상태 전환 로직과 동일한 구조가 된다.
다음 단계(11~15)에서는 이 훅을 라우터와 연결하고 패턴으로 추상화한다.
