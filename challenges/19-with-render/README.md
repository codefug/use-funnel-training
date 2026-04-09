# 19. Render 확장: with 모드 (이벤트 디스패치)

## 왜 필요한가?

하나의 스텝에서 여러 분기로 이동할 수 있을 때,
각 분기 전환 로직을 컴포넌트 안에 직접 쓰면 컴포넌트가 퍼널 로직에 강하게 결합된다.

`Render.with`를 사용하면 이벤트 이름으로 추상화해서 컴포넌트를 퍼널 로직에서 분리할 수 있다.

```tsx
<funnel.Render
  AStep={funnel.Render.with({
    events: {
      goB: (foo: string, { history }) => history.push('BStep', { foo }),
      goC: (_, { history }) => history.push('CStep'),
    },
    render: ({ dispatch }) => (
      <AStepComponent
        onGoB={(foo) => dispatch('goB', foo)}
        onGoC={() => dispatch('goC')}
      />
    ),
  })}
/>
```

## 문제

`index.ts`에 with 모드를 지원하는 `FunnelRenderWithEvents` 컴포넌트를 구현하라.

### WithDescriptor

```ts
type WithDescriptor = {
  type: 'render';
  events: Record<string, (payload: unknown, stepProps: StepProps) => void>;
  render: (props: { dispatch: (eventName: string, payload?: unknown) => void }) => ReactNode;
};
```

### dispatch 동작

`dispatch('eventName', payload)` 호출 시:
1. `events['eventName']`을 찾는다
2. `events['eventName'](payload, stepProps)`를 호출한다
3. `stepProps`에는 현재 step/context/history가 포함된다

## 힌트

```ts
const dispatch = (eventName: string, payload?: unknown) => {
  const handler = descriptor.events[eventName];
  if (!handler) throw new Error(`이벤트 '${eventName}'가 없습니다`);
  handler(payload, { step, context, index, history });
};

return descriptor.render({ dispatch });
```

## use-funnel 연결

```ts
// 실제 @use-funnel의 FunnelRender.tsx
} else if (render.type === 'render') {
  const dispatch = (event, ...args) => {
    const handler = render.events[event];
    handler?.(...args, funnelRenderStep); // 없는 이벤트는 silent no-op
  };
  return render.render({ ...funnelRenderStep, dispatch });
}
```

> **실제 라이브러리와의 차이**: 실제 `@use-funnel`은 없는 이벤트를 `handler?.()` — silent no-op으로 처리한다.
> 본 과제는 학습 목적으로 **에러를 throw**해 실수를 컴파일 전에 발견할 수 있도록 한다.

> **overlay와의 공통점**: 실제 `@use-funnel`에서 `Render.overlay({ events, render })`는
> `with` 모드와 거의 동일한 이벤트 구조를 공유한다 — overlay 안에서도 `dispatch`로 전환 로직을
> 분리할 수 있다. (17/18단계의 `OverlayDescriptor`에서 `events` 필드가 있는 이유)

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```ts
export function FunnelRenderWithEvents({
  currentStep,
  context,
  historySteps,
  currentIndex,
  onPush,
  onReplace,
  onGo,
  steps,
}: FunnelRenderWithEventsProps): ReactNode {
  const currentStepDef = steps[currentStep];
  if (!currentStepDef) return null;

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

  const stepProps: StepProps = {
    step: currentStep,
    context,
    index: currentIndex,
    history,
  };

  // 일반 스텝
  if (typeof currentStepDef === 'function') {
    return currentStepDef(stepProps);
  }

  // with 스텝
  if (currentStepDef.type === 'render') {
    const dispatch = (eventName: string, payload?: unknown) => {
      const handler = currentStepDef.events[eventName];
      if (!handler) throw new Error(`이벤트 '${eventName}'가 없습니다`);
      handler(payload, stepProps);
    };
    return currentStepDef.render({ ...stepProps, dispatch });
  }

  return null;
}
```

`dispatch`는 `eventName`으로 `events` 맵에서 핸들러를 찾아 `(payload, stepProps)`로 호출한다.
컴포넌트는 `dispatch`만 알면 되고, 실제 전환 로직은 `events`에 분리된다.

</details>
