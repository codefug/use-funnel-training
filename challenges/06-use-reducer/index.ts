/**
 * 06. useReducer로 복잡한 상태 관리하기
 *
 * 히스토리 상태를 관리하는 reducer와 액션 타입을 구현하세요.
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

import { exhaustiveCheck } from "@challenges/utils";


export type HistoryState<T> = {
  history: T[];
  currentIndex: number;
};

export type HistoryAction<T> =
  | { type: 'PUSH'; payload: T }
  | { type: 'REPLACE'; payload: T }
  | { type: 'GO'; payload: number }
  | { type: 'BACK' };

/**
 * 히스토리 상태를 관리하는 reducer입니다.
 *
 * - PUSH: 현재 인덱스 이후 히스토리를 잘라내고 새 상태 추가
 * - REPLACE: 현재 인덱스의 상태를 교체
 * - GO: 인덱스를 delta만큼 이동 (범위 초과 시 경계값으로 클램핑)
 * - BACK: GO(-1)과 동일
 */
export function historyReducer<T>(
  state: HistoryState<T>,
  action: HistoryAction<T>,
): HistoryState<T> {
  switch (action.type){
    case 'GO': {
      return {
        ...state,
        currentIndex: Math.max(0, Math.min(state.currentIndex + action.payload, state.history.length - 1))
      }
    }
    case 'BACK': {
      return {
        ...state,
        currentIndex: Math.max(0, state.currentIndex - 1)
      }
    }
    case 'REPLACE': {
      const newHistory = [...state.history];
      newHistory[state.currentIndex] = action.payload;
      return {
        ...state,
        history: newHistory
      }
    }
    case 'PUSH': {
      const newHistory = [
        ...state.history.slice(0, state.currentIndex + 1),
        action.payload
      ]
      return {
        currentIndex: newHistory.length - 1,
        history: newHistory
      }
    }
    default: {
      exhaustiveCheck(action);
    }
  }
}
