import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useHistory } from './index';

describe('07. useHistory', () => {
  it('초기 상태가 올바르게 설정된다', () => {
    const { result } = renderHook(() => useHistory('A'));

    expect(result.current.currentState).toBe('A');
    expect(result.current.history).toEqual(['A']);
    expect(result.current.currentIndex).toBe(0);
  });

  describe('push', () => {
    it('새 상태를 추가하고 currentState가 변경된다', () => {
      const { result } = renderHook(() => useHistory('A'));

      act(() => result.current.push('B'));

      expect(result.current.currentState).toBe('B');
      expect(result.current.history).toEqual(['A', 'B']);
      expect(result.current.currentIndex).toBe(1);
    });

    it('연속 push가 동작한다', () => {
      const { result } = renderHook(() => useHistory('A'));

      act(() => {
        result.current.push('B');
        result.current.push('C');
      });

      expect(result.current.currentState).toBe('C');
      expect(result.current.history).toEqual(['A', 'B', 'C']);
    });
  });

  describe('back', () => {
    it('이전 상태로 돌아간다', () => {
      const { result } = renderHook(() => useHistory('A'));

      act(() => result.current.push('B'));
      act(() => result.current.back());

      expect(result.current.currentState).toBe('A');
      expect(result.current.currentIndex).toBe(0);
    });

    it('첫 번째 상태에서 back해도 0 유지', () => {
      const { result } = renderHook(() => useHistory('A'));

      act(() => result.current.back());

      expect(result.current.currentState).toBe('A');
      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe('replace', () => {
    it('현재 상태를 교체한다', () => {
      const { result } = renderHook(() => useHistory('A'));

      act(() => result.current.push('B'));
      act(() => result.current.replace('X'));

      expect(result.current.currentState).toBe('X');
      expect(result.current.history).toEqual(['A', 'X']);
      expect(result.current.currentIndex).toBe(1);
    });
  });

  describe('go', () => {
    it('delta만큼 이동한다', () => {
      const { result } = renderHook(() => useHistory('A'));

      act(() => {
        result.current.push('B');
        result.current.push('C');
      });
      act(() => result.current.go(-2));

      expect(result.current.currentState).toBe('A');
      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe('push 후 back 후 다시 push', () => {
    it('back 후 push하면 forward 히스토리가 잘린다', () => {
      const { result } = renderHook(() => useHistory('A'));

      act(() => {
        result.current.push('B');
        result.current.push('C');
      });
      act(() => result.current.back()); // B로 돌아감
      act(() => result.current.push('D')); // C는 잘리고 D 추가

      expect(result.current.history).toEqual(['A', 'B', 'D']);
      expect(result.current.currentState).toBe('D');
    });
  });
});
