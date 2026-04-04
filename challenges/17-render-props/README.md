# 17. Render Props + Object.assign 컴포넌트 합성

## 왜 필요한가?

use-funnel의 `<funnel.Render>` 컴포넌트는 두 가지 역할을 동시에 한다.

```tsx
// 1. 컴포넌트 — 현재 스텝을 렌더한다
<funnel.Render
  AStep={({ step, context, history }) => <div>...</div>}
  BStep={funnel.Render.overlay(({ close }) => <Modal onClose={close} />)}
/>

// 2. 정적 메서드 — 디스크립터(descriptor)를 생성한다
funnel.Render.overlay(renderFn)   // → OverlayDescriptor
funnel.Render.with({ events, render }) // → WithDescriptor
```

JavaScript에서 함수는 객체이므로, `Object.assign(함수, { 메서드들 })`으로 이를 구현한다.

## 문제

`index.tsx`에 두 가지를 구현하라.

### 1. `FunnelRender` 컴포넌트

현재 step에 맞는 렌더 함수를 호출하고, 각 함수에 step/context/index/history를 전달한다.

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

### 2. `FunnelRenderWithStatics` — Object.assign 합성

`FunnelRender`에 `overlay`와 `with` 정적 메서드를 부착한다.

```ts
export const FunnelRenderWithStatics = Object.assign(
  FunnelRender, // 컴포넌트
  {
    overlay: (renderFn) => ({ type: 'overlay', render: renderFn }),
    with: (config) => ({ type: 'render', ...config }),
  }
);
```

## 힌트

**FunnelRender:**
- `steps[currentStep]`으로 현재 스텝의 렌더 함수를 가져온다
- `history.back()`은 `onGo(-1)`과 동일하다
- `history.push`는 `computeNextContext`로 context를 계산한 뒤 `onPush`를 호출한다

**FunnelRenderWithStatics:**
- `Object.assign(target, source)`은 `source`의 모든 속성을 `target`에 복사하고 `target`을 반환한다
- JavaScript 함수는 객체이므로 속성을 붙일 수 있다

## use-funnel 연결

```tsx
// use-funnel의 Render 컴포넌트 패턴 (단순화)
const Render = Object.assign(
  function RenderComponent(props) {
    const stepDef = props[currentStep];
    if (typeof stepDef === 'function') return stepDef({ step, context, history, index });
    if (stepDef?.type === 'overlay') { /* 18단계 */ }
    if (stepDef?.type === 'render') { /* 19단계 */ }
    return null;
  },
  {
    overlay: (renderFn) => ({ type: 'overlay', render: renderFn }),
    with: (config) => ({ type: 'render', ...config }),
  }
);
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```tsx
export function FunnelRender({
  currentStep, context, historySteps, currentIndex,
  onPush, onReplace, onGo, steps,
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

export const FunnelRenderWithStatics: RenderComponent = Object.assign(
  FunnelRender as unknown as React.FC<Record<string, StepDef>>,
  {
    overlay: (renderFn: OverlayDescriptor['render']): OverlayDescriptor => ({
      type: 'overlay',
      render: renderFn,
    }),
    with: (config: Omit<WithDescriptor, 'type'>): WithDescriptor => ({
      type: 'render',
      ...config,
    }),
  },
);
```

**핵심 포인트:**
1. `FunnelRender`는 순수하게 "함수 스텝 렌더"만 담당
2. `Object.assign`으로 `overlay`/`with` 팩토리를 부착 → 컴포넌트이면서 메서드도 가짐
3. 18단계(overlay)와 19단계(with)는 이 디스크립터들을 처리하는 로직을 추가한다

</details>
