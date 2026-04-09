# 21. Final: Mini useFunnel 조립

## 드디어 마지막 단계입니다.

1~20단계에서 만든 모든 조각을 조합해서 완전한 `useFunnel` 훅을 구현하라.

## 완성해야 하는 기능

### 1. 타입 안전한 step/context

```ts
const funnel = useFunnel<{
  NameStep: { name?: string };
  AgeStep: { name: string; age?: number };
  CompleteStep: { name: string; age: number };
}>({ initial: { step: 'NameStep', context: {} } });

funnel.step; // 'NameStep' | 'AgeStep' | 'CompleteStep'
// funnel.step === 'NameStep'이면 funnel.context는 { name?: string }
```

### 2. Factory + Strategy 패턴

```ts
// 메모리 라우터로 만든 useFunnel
const useFunnel = createUseFunnel(useMemoryRouter);
```

### 3. history.push/replace/back/go

```ts
funnel.history.push('AgeStep', { name: 'Alice' });
funnel.history.back();
```

### 4. Render 컴포넌트 (함수/overlay/with 3모드)

```tsx
<funnel.Render
  NameStep={({ history }) => (
    <input onChange={(e) => history.push('AgeStep', { name: e.target.value })} />
  )}
  AgeStep={funnel.Render.overlay(({ close }) => (
    <Modal onClose={close} />
  ))}
  CompleteStep={funnel.Render.with({
    events: { finish: (_, { history }) => history.push('NameStep') },
    render: ({ dispatch }) => <button onClick={() => dispatch('finish')}>완료</button>,
  })}
/>
```

### 5. Guard/Parse 런타임 검증

```ts
const funnel = useFunnel({
  steps: {
    AgeStep: { guard: (ctx) => 'name' in ctx },
  },
  initial: { step: 'NameStep', context: {} },
});
```

## 구현 방법

이전 단계들에서 만든 함수들을 import해서 조합하면 된다.

```ts
// 16단계: 런타임 타입 + PushArgs 타입
import type { AnyFunnelState, PushArgs } from '../16-typed-funnel-state/index';
// 08단계: stale closure 방지
import { useLatestRef } from '../08-use-latest-ref/index';
// 09단계: context 업데이트
import { computeNextContext } from '../09-functional-update/index';
// 11단계: 메모리 라우터
import { useMemoryRouter } from '../11-router-interface/index';
// 17단계: StepDef 타입 (overlay/with 디스크립터)
import type { OverlayDescriptor, WithDescriptor, StepDef, StepProps } from '../17-render-props/index';
// 20단계: guard/parse 검증 (내부적으로 15단계 StepOption 사용)
import { parseStepContext } from '../20-runtime-validation/index';
import type { StepOption } from '../20-runtime-validation/index';
```

## 테스트 시나리오

회원가입 퍼널:
1. NameStep: 이름 입력 → AgeStep으로 이동
2. AgeStep: 나이 입력 (overlay) → CompleteStep으로 이동
3. CompleteStep: 완료 버튼 → 처음으로 돌아가기
4. 뒤로가기: CompleteStep → AgeStep → NameStep
5. 잘못된 URL 접근: guard 실패 → NameStep으로 폴백

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```tsx
export function useFunnel(options: UseFunnelOptions): UseFunnelReturn {
  const router = useMemoryRouter(options.initial);
  const routerRef = useLatestRef(router); // 08: stale closure 방지
  const currentState = router.history[router.currentIndex] ?? options.initial;

  const transition = (
    step: string,
    contextOrFn?: ContextOrFn,
  ): AnyFunnelState => {
    const current = routerRef.current;
    const latestState = current.history[current.currentIndex] ?? options.initial;
    const newContext = computeNextContext(latestState.context, contextOrFn ?? {});
    // guard → parse 순차 실행 (20단계 parseStepContext, 실제 @use-funnel과 동일)
    return options.steps
      ? parseStepContext(step, newContext, options.steps, options.initial)
      : { step, context: newContext as Record<string, unknown> };
  };

  const history: FunnelHistoryAPI = {
    push: (step, contextOrFn) => {
      routerRef.current.push(transition(step, contextOrFn));
    },
    replace: (step, contextOrFn) => {
      routerRef.current.replace(transition(step, contextOrFn));
    },
    go: (delta) => routerRef.current.go(delta),
    back: () => routerRef.current.go(-1),
  };

  const Render = Object.assign(
    function FunnelRenderComponent(props: RenderProps) {
      const stepDef = props[currentState.step];
      if (!stepDef) return null;

      const stepProps = {
        step: currentState.step,
        context: currentState.context,
        index: router.currentIndex,
        history,
      };

      // with 모드
      if (typeof stepDef === 'object' && stepDef.type === 'render') {
        const dispatch = (eventName: string, payload?: unknown) => {
          const handler = stepDef.events[eventName];
          if (handler) handler(payload, stepProps);
        };
        return stepDef.render({ ...stepProps, dispatch });
      }

      // overlay 모드
      if (typeof stepDef === 'object' && stepDef.type === 'overlay') {
        const beforeSteps = router.history.slice(0, router.currentIndex);
        let backgroundNode: ReactNode = null;
        const disabledHistory = {
          push: (): never => { throw new Error('overlay 배경에서는 history를 사용할 수 없습니다'); },
          replace: (): never => { throw new Error('overlay 배경에서는 history를 사용할 수 없습니다'); },
          go: (): never => { throw new Error('overlay 배경에서는 history를 사용할 수 없습니다'); },
          back: (): never => { throw new Error('overlay 배경에서는 history를 사용할 수 없습니다'); },
        };
        for (const prev of [...beforeSteps].reverse()) {
          const prevDef = props[prev.step];
          if (typeof prevDef === 'function') {
            backgroundNode = prevDef({ step: prev.step, context: prev.context, index: router.currentIndex, history: disabledHistory });
            break;
          }
        }
        return (
          <Fragment>
            {backgroundNode}
            {/* overlay render에 stepProps + close 전달 — 실제 @use-funnel과 동일 */}
            {stepDef.render({ ...stepProps, close: () => history.back() })}
          </Fragment>
        );
      }

      // 일반 함수 모드
      if (typeof stepDef === 'function') {
        return stepDef(stepProps);
      }

      return null;
    } as RenderComponent,
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

  return {
    step: currentState.step,
    context: currentState.context,
    historySteps: router.history,
    currentIndex: router.currentIndex,
    history,
    Render,
  };
}
```

1~20단계의 모든 조각을 하나로 조립한다:
- **상태 관리**: `useMemoryRouter` (11) → `useHistory` (07) → `historyReducer` (06)
- **Stale closure 방지**: `useLatestRef` (08)
- **context 계산**: `computeNextContext` (09)
- **런타임 검증**: `parseStepContext` (20) + `StepOption` (15)
- **렌더**: `Render` 컴포넌트 — 함수(17)/overlay(18)/with(19) 3모드
- **컴포넌트 합성**: `Object.assign`으로 `overlay`/`with` 정적 메서드 부착 (17)
- **타입 안전성**: `AnyFunnelState`, `PushArgs` (16) ← `CompareMergeContext` (05) ← `FunnelState<T>` (03)

</details>
