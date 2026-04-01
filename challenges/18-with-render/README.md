# 18. Render 확장: with 모드 (이벤트 디스패치)

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
// use-funnel의 FunnelRender.tsx
} else if (render.type === 'render') {
  const dispatch = (event, ...args) => {
    const handler = render.events[event];
    handler?.(...args, funnelRenderStep);
  };
  return render.render({ ...funnelRenderStep, dispatch });
}
```
