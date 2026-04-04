/**
 * 07. useHistory 훅 구현
 *
 * 06단계의 historyReducer를 useReducer로 감싸서
 * 편리한 API를 제공하는 useHistory 훅을 구현하세요.
 *
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

import { useReducer } from 'react';
import { historyReducer } from '../06-use-reducer/index';

export type UseHistoryReturn<T> = {
  history: T[];
  currentIndex: number;
  currentState: T;
  push: (state: T) => void;
  replace: (state: T) => void;
  go: (delta: number) => void;
  back: () => void;
};

/**
 * 히스토리 기반 상태 관리 훅입니다.
 *
 * @param initialState - 초기 상태값
 */
export function useHistory<T>(initialState: T): UseHistoryReturn<T> {
  const [state, dispatch] = useReducer(historyReducer, {
    history: [initialState],
    currentIndex: 0,
  })

  return {
    currentIndex: state.currentIndex,
    currentState: state.history[state.currentIndex],
    history: state.history,
    push: (state: T) => dispatch({ type: 'PUSH', payload: state }),
    replace: (state: T) => dispatch({ type: 'REPLACE', payload: state }),
    go: (delta: number) => dispatch({ type: 'GO', payload: delta }),
    back: () => dispatch({ type: 'BACK' }),
  }
}
