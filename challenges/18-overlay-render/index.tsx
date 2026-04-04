/**
 * 18. Render 확장: overlay 모드
 *
 * overlay 스텝일 때 배경 스텝과 overlay를 함께 렌더하는
 * FunnelRenderWithOverlay 컴포넌트를 구현하세요.
 *
 * solution.test.tsx의 모든 테스트를 통과해야 합니다.
 */

import { Fragment } from 'react';
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

export type OverlayDescriptor = {
  type: 'overlay';
  render: (props: { close: () => void }) => ReactNode;
};

export type StepRenderFn = (props: StepProps) => ReactNode;
export type StepDef = StepRenderFn | OverlayDescriptor;

export type FunnelRenderWithOverlayProps = {
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
 * overlay 모드를 지원하는 FunnelRender 컴포넌트입니다.
 *
 * - 현재 스텝이 함수면: 16단계와 동일하게 렌더
 * - 현재 스텝이 overlay descriptor면:
 *   - 히스토리를 역순 탐색해서 가장 가까운 비overlay 스텝을 배경으로 렌더
 *   - 배경의 history는 모두 에러를 throw하도록 비활성화
 *   - 그 위에 overlay를 렌더 (close = () => onGo(-1))
 */
export function FunnelRenderWithOverlay({
  currentStep,
  context,
  historySteps,
  currentIndex,
  onPush,
  onReplace,
  onGo,
  steps,
}: FunnelRenderWithOverlayProps): ReactNode {
  // TODO: 구현하세요
  return null;
}
