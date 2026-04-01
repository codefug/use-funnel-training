/**
 * 18. Render 확장: with 모드 (이벤트 디스패치)
 *
 * with descriptor를 처리하는 FunnelRenderWithEvents 컴포넌트를 구현하세요.
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

export type WithDescriptor = {
  type: 'render';
  events: Record<string, (payload: unknown, stepProps: StepProps) => void>;
  render: (props: { dispatch: (eventName: string, payload?: unknown) => void } & StepProps) => ReactNode;
};

export type StepRenderFn = (props: StepProps) => ReactNode;
export type StepDef = StepRenderFn | WithDescriptor;

export type FunnelRenderWithEventsProps = {
  currentStep: string;
  context: Record<string, unknown>;
  historySteps: Array<{ step: string; context: Record<string, unknown> }>;
  currentIndex: number;
  onPush: (step: string, context: Record<string, unknown>) => void;
  onReplace: (step: string, context: Record<string, unknown>) => void;
  onGo: (delta: number) => void;
  steps: Record<string, StepDef>;
};

/**
 * with 모드를 지원하는 FunnelRender 컴포넌트입니다.
 *
 * - 현재 스텝이 함수면: 16단계와 동일하게 렌더
 * - 현재 스텝이 with descriptor면:
 *   - dispatch 함수를 만들어서 render에 전달
 *   - dispatch(eventName, payload) 호출 시 events[eventName](payload, stepProps) 실행
 */
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
  // TODO: 구현하세요
  return null;
}
