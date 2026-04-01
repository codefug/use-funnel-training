/**
 * 12. Factory 패턴: createUseFunnel
 *
 * 라우터 구현체를 받아 useFunnel 훅을 생성하는 Factory 함수를 구현하세요.
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

import { computeNextContext } from '../09-functional-update/index';
import type { FunnelRouterResult, FunnelState } from '../11-router-interface/index';

type ContextOrFn =
  | Partial<Record<string, unknown>>
  | ((prev: Record<string, unknown>) => Record<string, unknown>);

export type UseFunnelReturn = {
  step: string;
  context: Record<string, unknown>;
  historySteps: FunnelState[];
  currentIndex: number;
  history: {
    push(step: string, contextOrFn?: ContextOrFn): void;
    replace(step: string, contextOrFn?: ContextOrFn): void;
    go(delta: number): void;
    back(): void;
  };
};

/**
 * 라우터 훅을 받아 useFunnel 훅을 생성하는 Factory 함수입니다.
 *
 * @param useRouter - FunnelRouterResult를 반환하는 훅
 * @returns useFunnel 훅
 *
 * @example
 * const useFunnel = createUseFunnel(useMemoryRouter);
 * // 컴포넌트 안에서:
 * const funnel = useFunnel({ step: 'AStep', context: {} });
 */
export function createUseFunnel(
  useRouter: (initialState: FunnelState) => FunnelRouterResult,
): (initialState: FunnelState) => UseFunnelReturn {
  // TODO: 구현하세요
  // useRouter를 호출하고, 그 결과를 바탕으로 UseFunnelReturn을 반환하는 훅을 만드세요.
  throw new Error('구현하세요');
}
