# 15. Object.assign 컴포넌트 합성

## 왜 필요한가?

use-funnel에서 `funnel.Render`는 컴포넌트이면서 동시에 정적 메서드도 가진다.

```tsx
// Render는 컴포넌트
<funnel.Render StepA={(step) => <div />} />

// 동시에 정적 메서드도 있음
funnel.Render.overlay(({ close }) => <Modal onClose={close} />)
funnel.Render.with({ events: { ... }, render: ({ dispatch }) => <div /> })
```

JavaScript에서 함수는 객체이므로, `Object.assign(함수, { 메서드들 })`로 이를 구현할 수 있다.

## 문제

`index.tsx`에 `createRender()` 함수를 구현하라.
이 함수는 컴포넌트이면서 `overlay`와 `with` 정적 메서드를 가진 객체를 반환한다.

### 반환 타입

```ts
type RenderComponent = React.FC<RenderProps> & {
  overlay: (renderFn: OverlayRenderFn) => OverlayDescriptor;
  with: (config: WithConfig) => WithDescriptor;
};
```

### `overlay` 정적 메서드

overlay 스텝임을 나타내는 descriptor 객체를 반환한다.

```ts
const overlayDescriptor = Render.overlay(({ close }) => <Modal onClose={close} />);
// { type: 'overlay', render: fn }
```

### `with` 정적 메서드

이벤트 기반 렌더 descriptor 객체를 반환한다.

```ts
const withDescriptor = Render.with({
  events: { next: (_, step) => step.history.push('BStep') },
  render: ({ dispatch }) => <button onClick={() => dispatch('next')}>다음</button>,
});
// { type: 'render', events: {...}, render: fn }
```

## 힌트

```ts
function createRender(currentStep, historySteps) {
  // 컴포넌트 함수
  function Render(props) {
    const renderFn = props[currentStep];
    if (typeof renderFn === 'function') {
      return renderFn({ step: currentStep, /* ... */ });
    }
    // ...
  }

  // Object.assign으로 정적 메서드 부착
  return Object.assign(Render, {
    overlay: (renderFn) => ({ type: 'overlay', render: renderFn }),
    with: (config) => ({ type: 'render', ...config }),
  });
}
```

## use-funnel 연결

```ts
// use-funnel의 useFunnel.tsx
const Render = Object.assign(FunnelRender, {
  overlay: createFunnelRenderOverlay,
  with: createFunnelRenderWith,
});

return { step, context, history, Render };
```
