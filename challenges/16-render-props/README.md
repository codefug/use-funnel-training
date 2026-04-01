# 16. Render Props: 함수형 렌더

## 왜 필요한가?

15단계에서 `createRender`로 컴포넌트를 만들었다.
이제 이 Render 컴포넌트가 실제로 step/context/history를 올바르게 전달하는지 확인한다.

use-funnel의 `<funnel.Render>` 컴포넌트는 각 스텝 함수에 다음을 전달한다:

```tsx
<funnel.Render
  AStep={({ step, context, history, index }) => (
    <AStepComponent
      name={context.name}
      onNext={(name) => history.push('BStep', { name })}
    />
  )}
/>
```

## 문제

`index.ts`에 완전한 `FunnelRender` 컴포넌트를 구현하라.

### Props

```ts
type FunnelRenderProps = {
  currentStep: string;
  context: Record<string, unknown>;
  historySteps: Array<{ step: string; context: Record<string, unknown> }>;
  currentIndex: number;
  onPush: (step: string, context: Record<string, unknown>) => void;
  onReplace: (step: string, context: Record<string, unknown>) => void;
  onGo: (delta: number) => void;
  steps: Record<string, StepRenderFn>;
};
```

### 각 스텝 함수에 전달하는 인자

```ts
{
  step: string;           // 현재 스텝 이름
  context: Record<...>;  // 현재 context
  index: number;          // 현재 히스토리 인덱스
  history: {
    push(step, contextOrFn?): void;
    replace(step, contextOrFn?): void;
    go(delta): void;
    back(): void;
  };
}
```

## 힌트

- `steps[currentStep]`으로 현재 스텝의 렌더 함수를 가져온다
- `history.back()`은 `onGo(-1)`과 동일하다
- `history.push`는 `computeNextContext`로 context를 계산한 뒤 `onPush`를 호출한다

## use-funnel 연결

```tsx
// use-funnel의 FunnelRender.tsx (단순화)
export function FunnelRender({ currentStep, steps, ... }) {
  const render = steps[currentStep];
  if (typeof render === 'function') {
    return render({ step: currentStep, context, history, index });
  }
  // overlay, with 처리는 17, 18단계에서
}
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```ts
export function FunnelRender({
  currentStep,
  context,
  historySteps,
  currentIndex,
  onPush,
  onReplace,
  onGo,
  steps,
}: FunnelRenderProps): ReactNode {
  const renderFn = steps[currentStep];
  if (!renderFn) return null;

  const history = {
    push: (step: string, contextOrFn?: ContextOrFn) => {
      const newContext = computeNextContext(context, contextOrFn ?? {});
      onPush(step, newContext as Record<string, unknown>);
    },
    replace: (step: string, contextOrFn?: ContextOrFn) => {
      const newContext = computeNextContext(context, contextOrFn ?? {});
      onReplace(step, newContext as Record<string, unknown>);
    },
    go: (delta: number) => onGo(delta),
    back: () => onGo(-1),
  };

  return renderFn({ step: currentStep, context, index: currentIndex, history });
}
```

`steps[currentStep]`으로 현재 스텝의 렌더 함수를 가져온 뒤,
`history` 객체를 만들어서 함께 전달한다.
`history.push`는 `computeNextContext`로 context를 계산한 뒤 `onPush`를 호출한다.

</details>
