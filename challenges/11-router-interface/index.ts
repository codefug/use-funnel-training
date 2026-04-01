/**
 * 11. 인터페이스 설계: Router 계약 정의
 *
 * FunnelRouterResult 인터페이스와 두 가지 구현체를 작성하세요.
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

import { useHistory } from '../07-use-history/index';

export type FunnelState = {
  step: string;
  context: Record<string, unknown>;
};

/**
 * 모든 라우터 어댑터가 구현해야 하는 계약(인터페이스).
 * 이 인터페이스를 구현하면 use-funnel과 연동할 수 있다.
 */
export interface FunnelRouterResult {
  history: FunnelState[];
  currentIndex: number;
  push(state: FunnelState): void;
  replace(state: FunnelState): void;
  go(delta: number): void;
  cleanup(): void;
}

/**
 * 메모리(React state)에 히스토리를 저장하는 라우터 구현체를 반환하는 훅.
 * useHistory를 내부에서 사용한다.
 *
 * @param initialState - 초기 퍼널 상태
 */
export function useMemoryRouter(initialState: FunnelState): FunnelRouterResult {
  // TODO: 구현하세요
  // useHistory를 사용해서 FunnelRouterResult를 구현하세요.
  throw new Error('구현하세요');
}

/**
 * 테스트용 mock 라우터.
 * 각 메서드 호출 여부를 추적한다.
 *
 * @param initialState - 초기 퍼널 상태
 */
export function createMockRouter(initialState: FunnelState) {
  // TODO: 구현하세요
  // 각 메서드가 호출됐을 때 calls 배열에 기록하고,
  // FunnelRouterResult를 만족하는 객체를 반환하세요.
  const calls: Array<{ method: string; args: unknown[] }> = [];

  return {
    history: [initialState],
    currentIndex: 0,
    push: (state: FunnelState) => {
      // TODO
    },
    replace: (state: FunnelState) => {
      // TODO
    },
    go: (delta: number) => {
      // TODO
    },
    cleanup: () => {
      // TODO
    },
    // 테스트에서 호출 여부 확인용
    getCalls: () => calls,
  };
}
