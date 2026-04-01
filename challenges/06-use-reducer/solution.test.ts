import { describe, expect, it } from 'vitest';
import { historyReducer } from './index';
import type { HistoryState } from './index';

const initial: HistoryState<string> = {
  history: ['A'],
  currentIndex: 0,
};

describe('06. historyReducer', () => {
  describe('PUSH', () => {
    it('새 상태를 히스토리에 추가하고 인덱스를 증가시킨다', () => {
      const next = historyReducer(initial, { type: 'PUSH', payload: 'B' });
      expect(next.history).toEqual(['A', 'B']);
      expect(next.currentIndex).toBe(1);
    });

    it('연속으로 push하면 히스토리가 쌓인다', () => {
      let state = initial;
      state = historyReducer(state, { type: 'PUSH', payload: 'B' });
      state = historyReducer(state, { type: 'PUSH', payload: 'C' });
      expect(state.history).toEqual(['A', 'B', 'C']);
      expect(state.currentIndex).toBe(2);
    });

    it('중간 인덱스에서 push하면 이후 히스토리가 잘린다', () => {
      const state: HistoryState<string> = {
        history: ['A', 'B', 'C'],
        currentIndex: 1, // B에 있음
      };
      const next = historyReducer(state, { type: 'PUSH', payload: 'D' });
      expect(next.history).toEqual(['A', 'B', 'D']); // C는 잘려나감
      expect(next.currentIndex).toBe(2);
    });
  });

  describe('REPLACE', () => {
    it('현재 인덱스의 상태를 교체한다', () => {
      const state: HistoryState<string> = {
        history: ['A', 'B', 'C'],
        currentIndex: 1,
      };
      const next = historyReducer(state, { type: 'REPLACE', payload: 'X' });
      expect(next.history).toEqual(['A', 'X', 'C']);
      expect(next.currentIndex).toBe(1);
    });

    it('첫 번째 상태도 replace할 수 있다', () => {
      const next = historyReducer(initial, { type: 'REPLACE', payload: 'X' });
      expect(next.history).toEqual(['X']);
      expect(next.currentIndex).toBe(0);
    });
  });

  describe('GO', () => {
    it('양수 delta로 앞으로 이동한다', () => {
      const state: HistoryState<string> = {
        history: ['A', 'B', 'C'],
        currentIndex: 0,
      };
      const next = historyReducer(state, { type: 'GO', payload: 2 });
      expect(next.currentIndex).toBe(2);
    });

    it('음수 delta로 뒤로 이동한다', () => {
      const state: HistoryState<string> = {
        history: ['A', 'B', 'C'],
        currentIndex: 2,
      };
      const next = historyReducer(state, { type: 'GO', payload: -1 });
      expect(next.currentIndex).toBe(1);
    });

    it('범위를 초과하면 끝 인덱스로 클램핑된다', () => {
      const state: HistoryState<string> = {
        history: ['A', 'B', 'C'],
        currentIndex: 2,
      };
      const next = historyReducer(state, { type: 'GO', payload: 10 });
      expect(next.currentIndex).toBe(2); // 최대 인덱스
    });

    it('범위 아래로 이동하면 0으로 클램핑된다', () => {
      const state: HistoryState<string> = {
        history: ['A', 'B', 'C'],
        currentIndex: 0,
      };
      const next = historyReducer(state, { type: 'GO', payload: -10 });
      expect(next.currentIndex).toBe(0);
    });
  });

  describe('BACK', () => {
    it('인덱스를 1 감소시킨다', () => {
      const state: HistoryState<string> = {
        history: ['A', 'B', 'C'],
        currentIndex: 2,
      };
      const next = historyReducer(state, { type: 'BACK' });
      expect(next.currentIndex).toBe(1);
    });

    it('이미 첫 번째 인덱스면 0 유지', () => {
      const next = historyReducer(initial, { type: 'BACK' });
      expect(next.currentIndex).toBe(0);
    });
  });

  describe('불변성', () => {
    it('reducer는 새 객체를 반환한다 (원본 변경 없음)', () => {
      const next = historyReducer(initial, { type: 'PUSH', payload: 'B' });
      expect(next).not.toBe(initial);
      expect(next.history).not.toBe(initial.history);
    });
  });
});
