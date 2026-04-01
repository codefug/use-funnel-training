/**
 * 15. Object.assign 컴포넌트 합성
 *
 * 컴포넌트이면서 정적 메서드(overlay, with)도 가진 Render를 구현하세요.
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

import type { ReactNode } from 'react';

// --- 타입 정의 ---

export type StepRenderFn = (props: { step: string; context: Record<string, unknown> }) => ReactNode;

export type OverlayDescriptor = {
  type: 'overlay';
  render: (props: { close: () => void }) => ReactNode;
};

export type WithDescriptor = {
  type: 'render';
  events: Record<string, (...args: unknown[]) => void>;
  render: (props: { dispatch: (eventName: string, ...args: unknown[]) => void }) => ReactNode;
};

export type RenderProps = Record<string, StepRenderFn | OverlayDescriptor | WithDescriptor>;

export type RenderComponent = React.FC<RenderProps> & {
  overlay: (renderFn: OverlayDescriptor['render']) => OverlayDescriptor;
  with: (config: Omit<WithDescriptor, 'type'>) => WithDescriptor;
};

// --- 구현 ---

/**
 * 현재 step에 맞는 렌더 함수를 호출하는 Render 컴포넌트를 생성합니다.
 * overlay와 with 정적 메서드도 부착합니다.
 *
 * @param currentStep - 현재 활성화된 스텝 이름
 * @param context - 현재 스텝의 context
 */
export function createRender(
  currentStep: string,
  context: Record<string, unknown>,
): RenderComponent {
  // TODO: 구현하세요
  // 1. currentStep에 해당하는 렌더 함수를 호출하는 Render 컴포넌트를 만드세요.
  // 2. Object.assign으로 overlay, with 정적 메서드를 부착하세요.
  throw new Error('구현하세요');
}
