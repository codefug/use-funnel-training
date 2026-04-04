/**
 * 17. Render Props + Object.assign 컴포넌트 합성
 *
 * 현재 step에 맞는 렌더 함수를 호출하는 FunnelRender를 구현하고,
 * Object.assign으로 overlay/with 정적 메서드를 부착하세요.
 *
 * solution.test.tsx의 모든 테스트를 통과해야 합니다.
 */

import type { ReactNode } from 'react';
import { computeNextContext } from '../09-functional-update/index';

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
 * overlay 스텝을 나타내는 디스크립터.
 * close 함수를 받아 모달/바텀시트를 렌더한다.
 */
export type OverlayDescriptor = {
  type: 'overlay';
  render: (props: { close: () => void }) => ReactNode;
};

/**
 * 이벤트 디스패치 스텝을 나타내는 디스크립터.
 * dispatch 함수를 받아 컴포넌트가 이벤트 이름으로 네비게이션을 요청한다.
 */
export type WithDescriptor = {
  type: 'render';
  events: Record<string, (payload: unknown, stepProps: StepProps) => void>;
  render: (props: { dispatch: (eventName: string, payload?: unknown) => void } & StepProps) => ReactNode;
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
  overlay: (renderFn: OverlayDescriptor['render']) => OverlayDescriptor;
  with: (config: Omit<WithDescriptor, 'type'>) => WithDescriptor;
};

/**
 * 현재 step에 맞는 렌더 함수를 호출하는 컴포넌트입니다.
 * 각 스텝 함수에 step, context, index, history를 전달합니다.
 */
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
  // TODO: 구현하세요
  // 1. steps[currentStep]으로 현재 스텝의 렌더 함수를 가져오세요.
  // 2. 렌더 함수에 step, context, index, history를 전달하세요.
  // 3. history.push는 computeNextContext로 context를 계산한 뒤 onPush를 호출하세요.
  // 4. 현재 스텝이 없으면 null을 반환하세요.
  return null;
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
    // renderFn을 받아 { type: 'overlay', render: renderFn } 을 반환합니다.
    overlay: (_renderFn: OverlayDescriptor['render']): OverlayDescriptor => {
      throw new Error('구현하세요');
    },
    // TODO: with 팩토리 메서드를 구현하세요.
    // config를 받아 { type: 'render', ...config } 를 반환합니다.
    with: (_config: Omit<WithDescriptor, 'type'>): WithDescriptor => {
      throw new Error('구현하세요');
    },
  },
);
