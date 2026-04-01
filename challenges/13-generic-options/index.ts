/**
 * 13. 제네릭으로 라우터별 옵션 확장하기
 *
 * TRouteOption 제네릭을 추가해서 라우터별 push/replace 옵션을
 * 타입 안전하게 지원하는 createUseFunnel을 구현하세요.
 *
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

import { computeNextContext } from '../09-functional-update/index';
import type { FunnelState } from '../11-router-interface/index';

type ContextOrFn =
  | Partial<Record<string, unknown>>
  | ((prev: Record<string, unknown>) => Record<string, unknown>);

/**
 * 라우터별 옵션을 지원하는 FunnelRouterResult 인터페이스.
 * TRouteOption 제네릭으로 라우터마다 다른 옵션 타입을 지정할 수 있다.
 */
export interface FunnelRouterResultWithOption<TRouteOption = Record<never, never>> {
  history: FunnelState[];
  currentIndex: number;
  push(state: FunnelState, option?: TRouteOption): void;
  replace(state: FunnelState, option?: TRouteOption): void;
  go(delta: number): void;
  cleanup(): void;
}

export type UseFunnelWithOptionReturn<TRouteOption> = {
  step: string;
  context: Record<string, unknown>;
  historySteps: FunnelState[];
  currentIndex: number;
  history: {
    push(step: string, contextOrFn?: ContextOrFn, option?: TRouteOption): void;
    replace(step: string, contextOrFn?: ContextOrFn, option?: TRouteOption): void;
    go(delta: number): void;
    back(): void;
  };
};

/**
 * 라우터별 옵션을 지원하는 createUseFunnel Factory 함수.
 *
 * @example
 * type NextOption = { shallow?: boolean };
 * const useNextFunnel = createUseFunnel<NextOption>(useNextRouter);
 * // funnel.history.push('BStep', { foo: '1' }, { shallow: true })
 */
export function createUseFunnel<TRouteOption = Record<never, never>>(
  useRouter: (initialState: FunnelState) => FunnelRouterResultWithOption<TRouteOption>,
): (initialState: FunnelState) => UseFunnelWithOptionReturn<TRouteOption> {
  // TODO: 구현하세요
  // 12단계와 동일하지만, push/replace에 option 파라미터를 추가하세요.
  throw new Error('구현하세요');
}
