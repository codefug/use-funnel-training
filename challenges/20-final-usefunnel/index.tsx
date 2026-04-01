/**
 * 20. Final: Mini useFunnel 조립
 *
 * 1~19단계에서 만든 모든 조각을 조합해서 완전한 useFunnel 훅을 구현하세요.
 * solution.test.tsx의 모든 테스트를 통과해야 합니다.
 */

import { Fragment } from 'react';
import type { ReactNode } from 'react';

// 이전 단계에서 만든 것들을 import해서 사용하세요.
import { useMemoryRouter } from '../11-router-interface/index';
import { computeNextContext } from '../09-functional-update/index';
import { parseStepContext } from '../19-runtime-validation/index';
import type { StepOption } from '../19-runtime-validation/index';

// --- 타입 정의 ---

type ContextOrFn =
  | Partial<Record<string, unknown>>
  | ((prev: Record<string, unknown>) => Record<string, unknown>);

export type FunnelState = {
  step: string;
  context: Record<string, unknown>;
};

type StepRenderFn = (props: {
  step: string;
  context: Record<string, unknown>;
  index: number;
  history: FunnelHistoryAPI;
}) => ReactNode;

type OverlayDescriptor = {
  type: 'overlay';
  render: (props: { close: () => void }) => ReactNode;
};

type WithDescriptor = {
  type: 'render';
  events: Record<string, (payload: unknown, stepProps: { step: string; context: Record<string, unknown>; index: number; history: FunnelHistoryAPI }) => void>;
  render: (props: { dispatch: (eventName: string, payload?: unknown) => void; step: string; context: Record<string, unknown>; index: number; history: FunnelHistoryAPI }) => ReactNode;
};

type StepDef = StepRenderFn | OverlayDescriptor | WithDescriptor;

type FunnelHistoryAPI = {
  push(step: string, contextOrFn?: ContextOrFn): void;
  replace(step: string, contextOrFn?: ContextOrFn): void;
  go(delta: number): void;
  back(): void;
};

type RenderProps = Record<string, StepDef>;

type RenderComponent = React.FC<RenderProps> & {
  overlay: (renderFn: OverlayDescriptor['render']) => OverlayDescriptor;
  with: (config: Omit<WithDescriptor, 'type'>) => WithDescriptor;
};

export type UseFunnelOptions = {
  initial: FunnelState;
  steps?: Record<string, StepOption>;
};

export type UseFunnelReturn = {
  step: string;
  context: Record<string, unknown>;
  historySteps: FunnelState[];
  currentIndex: number;
  history: FunnelHistoryAPI;
  Render: RenderComponent;
};

/**
 * 완전한 useFunnel 훅입니다.
 *
 * - Factory + Strategy 패턴 (useMemoryRouter 사용)
 * - history.push/replace/back/go
 * - Render 컴포넌트 (함수/overlay/with 3모드)
 * - Guard/Parse 런타임 검증
 */
export function useFunnel(options: UseFunnelOptions): UseFunnelReturn {
  // TODO: 구현하세요
  // 이전 단계들의 함수를 조합해서 완전한 useFunnel을 만드세요.
  throw new Error('구현하세요');
}
