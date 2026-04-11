/**
 * 17. Render Props + Object.assign 컴포넌트 합성
 *
 * 현재 step에 맞는 렌더 함수를 호출하는 FunnelRender를 구현하고,
 * Object.assign으로 overlay/with 정적 메서드를 부착하세요.
 *
 * solution.test.tsx의 모든 테스트를 통과해야 합니다.
 */

import { computeNextContext } from '@challenges/09-functional-update';
import type { ReactNode } from 'react';

type ContextOrFn =
  | Partial<Record<string, unknown>>
  | ((prev: Record<string, unknown>) => Record<string, unknown>);

export type StepProps = {
  step: string;
  context: Record<string, unknown>;
  index: number;
  history: {
    push(step: string, contextOrFn?: ContextOrFn): void;
    replace(step: string, contextOrFn?: ContextOrFn): void;
    go(delta: number): void;
    back(): void;
  };
};

export type StepRenderFn = (props: StepProps) => ReactNode;

/**
 * overlay render 함수가 받는 props.
 * StepProps(step/context/index/history) + close 함수.
 * 실제 @use-funnel과 동일하게 overlay 안에서도 context/history에 접근할 수 있다.
 */
export type OverlayRenderProps = StepProps & { close: () => void };

/**
 * overlay 스텝을 나타내는 디스크립터.
 * render 함수는 step/context/history/close를 모두 받는다.
 * events를 추가하면 with 모드와 동일하게 dispatch 패턴도 사용할 수 있다.
 */
export type OverlayDescriptor = {
  type: 'overlay';
  events?: Record<string, (payload: unknown, stepProps: StepProps) => void>;
  render: (props: OverlayRenderProps) => ReactNode;
};

/**
 * overlay() 팩토리에 넘길 수 있는 config 객체 형태.
 * 실제 @use-funnel: Render.overlay({ render, events? })
 */
export type OverlayConfig = {
  render: (props: OverlayRenderProps) => ReactNode;
  events?: Record<string, (payload: unknown, stepProps: StepProps) => void>;
};

/**
 * 이벤트 디스패치 스텝을 나타내는 디스크립터.
 * dispatch 함수를 받아 컴포넌트가 이벤트 이름으로 네비게이션을 요청한다.
 */
export type WithDescriptor = {
  type: 'render';
  events: Record<string, (payload: unknown, stepProps: StepProps) => void>;
  render: (
    props: { dispatch: (eventName: string, payload?: unknown) => void } & StepProps,
  ) => ReactNode;
};

export type StepDef = StepRenderFn | OverlayDescriptor | WithDescriptor;

export type FunnelRenderProps = {
  currentStep: string;
  context: Record<string, unknown>;
  historySteps: Array<{ step: string; context: Record<string, unknown> }>;
  currentIndex: number;
  onPush: (step: string, context: Record<string, unknown>) => void;
  onReplace: (step: string, context: Record<string, unknown>) => void;
  onGo: (delta: number) => void;
  steps: Record<string, StepRenderFn>;
};

export type RenderComponent = React.FC<Record<string, StepDef>> & {
  /**
   * overlay 팩토리. 두 가지 형태를 모두 지원한다:
   * - 단축형: overlay(renderFn) — 함수를 직접 넘김
   * - 객체형: overlay({ render, events? }) — 실제 @use-funnel과 동일한 형태
   */
  overlay: (renderFnOrConfig: OverlayDescriptor['render'] | OverlayConfig) => OverlayDescriptor;
  with: (config: Omit<WithDescriptor, 'type'>) => WithDescriptor;
};

/**
 * 현재 step에 맞는 렌더 함수를 호출하는 컴포넌트입니다.
 * 각 스텝 함수에 step, context, index, history를 전달합니다.
 */
export function FunnelRender({
  currentStep,
  context,
  historySteps: _historySteps,
  currentIndex,
  onPush,
  onReplace,
  onGo,
  steps,
}: FunnelRenderProps): ReactNode {
  const renderFn = steps[currentStep];
  if (!renderFn) return null;
  // 1. steps[currentStep]으로 현재 스텝의 렌더 함수를 가져오세요.

  const history: StepProps['history'] = {
    push: (step, contextOrFn) => {
      const newContext = computeNextContext(context, contextOrFn ?? {});
      onPush(step, newContext);
    },
    replace: (step, contextOrFn) => {
      const newContext = computeNextContext(context, contextOrFn ?? {});
      onReplace(step, newContext);
    },
    go: (delta) => onGo(delta),
    back: () => onGo(-1),
  };
  // 2. 렌더 함수에 step, context, index, history를 전달하세요.
  // 3. history.push는 computeNextContext로 context를 계산한 뒤 onPush를 호출하세요.
  // 4. 현재 스텝이 없으면 null을 반환하세요.
  return renderFn({ context, history, index: currentIndex, step: currentStep });
}

/**
 * FunnelRender에 overlay/with 정적 메서드를 Object.assign으로 부착합니다.
 *
 * JavaScript에서 함수는 객체이므로, Object.assign으로 메서드를 추가할 수 있습니다.
 *
 * @example
 * typeof FunnelRenderWithStatics === 'function' // true
 * typeof FunnelRenderWithStatics.overlay === 'function' // true
 *
 * <FunnelRenderWithStatics
 *   AStep={({ history }) => <button onClick={() => history.push('BStep')}>다음</button>}
 *   BStep={FunnelRenderWithStatics.overlay(({ close }) => <Modal onClose={close} />)}
 * />
 */
export const FunnelRenderWithStatics: RenderComponent = Object.assign(
  // TODO: FunnelRender를 기반으로 overlay/with descriptor를 처리하는 컴포넌트를 만드세요.
  // (현재는 FunnelRender가 StepRenderFn만 처리하므로, 여기서는 descriptor 팩토리만 부착합니다)
  FunnelRender as unknown as React.FC<Record<string, StepDef>>,
  {
    // TODO: overlay 팩토리 메서드를 구현하세요.
    // 두 가지 형태를 지원합니다:
    // - 단축형: overlay(renderFn) → { type: 'overlay', render: renderFn }
    // - 객체형: overlay({ render, events? }) → { type: 'overlay', render, events }
    overlay: (
      _renderFnOrConfig: OverlayDescriptor['render'] | OverlayConfig,
    ): OverlayDescriptor => {
      if (typeof _renderFnOrConfig === 'function') {
        return { type: 'overlay', render: _renderFnOrConfig };
      }
      return { type: 'overlay', ..._renderFnOrConfig };
    },
    // TODO: with 팩토리 메서드를 구현하세요.
    // config를 받아 { type: 'render', ...config } 를 반환합니다.
    with: (_config: Omit<WithDescriptor, 'type'>): WithDescriptor => {
      return { type: 'render', ..._config };
    },
  },
);
