/**
 * 10. useHistory + transition 조합
 *
 * useHistory와 computeNextContext를 조합해서
 * 퍼널 상태를 전환하는 useFunnelHistory 훅을 구현하세요.
 *
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

import { computeNextContext } from '@challenges/09-functional-update';
import { useHistory } from '../07-use-history/index';

export type FunnelState = {
  step: string;
  context: Record<string, unknown>;
};

export type UseFunnelHistoryReturn = {
  step: string;
  context: Record<string, unknown>;
  historySteps: FunnelState[];
  currentIndex: number;
  push: (step: string, contextOrFn?: Partial<Record<string, unknown>> | ((prev: Record<string, unknown>) => Record<string, unknown>)) => void;
  replace: (step: string, contextOrFn?: Partial<Record<string, unknown>> | ((prev: Record<string, unknown>) => Record<string, unknown>)) => void;
  go: (delta: number) => void;
  back: () => void;
};

/**
 * 퍼널 상태(step + context)를 히스토리로 관리하는 훅입니다.
 *
 * @param initialState - 초기 퍼널 상태 { step, context }
 */
export function useFunnelHistory(initialState: FunnelState): UseFunnelHistoryReturn {
  const history = useHistory<FunnelState>(initialState);
  return {
    context: history.currentState.context,
    step: history.currentState.step,
    currentIndex: history.currentIndex,
    historySteps: history.history,
    push: (step, contextOrFn) => {
      history.push({step, context: computeNextContext(history.currentState.context, contextOrFn ?? {})})
    },
    replace: (step, contextOrFn) => {
      history.replace({step, context: computeNextContext(history.currentState.context, contextOrFn ?? {})})
    },
    go: history.go,
    back: history.back,
  }
  // TODO: 구현하세요
  // useHistory<FunnelState>를 사용하고,
  // push/replace 시 computeNextContext로 context를 계산하세요.
}
