/**
 * 16. Render Props: 함수형 렌더
 *
 * 현재 step에 맞는 렌더 함수를 호출하고
 * step/context/history를 올바르게 전달하는 FunnelRender 컴포넌트를 구현하세요.
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
