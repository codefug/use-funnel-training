/**
 * 13. Factory 패턴: createUseFunnel
 *
 * 라우터 구현체를 받아 useFunnel 훅을 생성하는 Factory 함수를 구현하세요.
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

import { computeNextContext } from '../09-functional-update/index';
import { useLatestRef } from '../08-use-latest-ref/index';
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
  //
  // 1. useRouter(initialState)를 호출해서 router를 얻는다
  // 2. useLatestRef(router)로 routerRef를 만들어 stale closure를 방지한다
  //    (history 메서드는 렌더 클로저 안에 있으므로, 이전 렌더의 router를 참조할 수 있다)
  // 3. router.history[router.currentIndex]로 현재 상태를 계산한다
  // 4. history.push/replace는 computeNextContext로 context를 계산한 뒤
  //    routerRef.current.push()를 호출한다
  throw new Error('구현하세요');
}
