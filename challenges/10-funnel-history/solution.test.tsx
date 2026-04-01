import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFunnelHistory } from './index';

describe('10. useFunnelHistory', () => {
  it('초기 상태가 올바르게 설정된다', () => {
    const { result } = renderHook(() =>
      useFunnelHistory({ step: 'AStep', context: {} }),
    );

    expect(result.current.step).toBe('AStep');
    expect(result.current.context).toEqual({});
    expect(result.current.currentIndex).toBe(0);
  });

  describe('push', () => {
    it('새 step으로 이동하고 context를 머지한다', () => {
      const { result } = renderHook(() =>
        useFunnelHistory({ step: 'AStep', context: {} }),
      );

      act(() => result.current.push('BStep', { foo: '1' }));

      expect(result.current.step).toBe('BStep');
      expect(result.current.context).toEqual({ foo: '1' });
    });

    it('이전 context가 새 step의 context에 머지된다', () => {
      const { result } = renderHook(() =>
        useFunnelHistory({ step: 'AStep', context: { name: 'Alice' } }),
      );

      act(() => result.current.push('BStep', { age: 20 }));

      expect(result.current.step).toBe('BStep');
      expect(result.current.context).toEqual({ name: 'Alice', age: 20 });
    });

    it('함수형 업데이트로 이전 context를 기반으로 계산한다', () => {
      const { result } = renderHook(() =>
        useFunnelHistory({ step: 'AStep', context: { count: 1 } }),
      );

      act(() =>
        result.current.push('BStep', (prev) => ({
          ...prev,
          count: (prev.count as number) + 1,
        })),
      );

      expect(result.current.context).toEqual({ count: 2 });
    });

    it('contextOrFn 없이 step만 전달하면 현재 context 유지', () => {
      const { result } = renderHook(() =>
        useFunnelHistory({ step: 'AStep', context: { foo: '1' } }),
      );

      act(() => result.current.push('BStep'));

      expect(result.current.step).toBe('BStep');
      expect(result.current.context).toEqual({ foo: '1' });
    });
  });

  describe('back', () => {
    it('이전 step으로 돌아간다', () => {
      const { result } = renderHook(() =>
        useFunnelHistory({ step: 'AStep', context: {} }),
      );

      act(() => result.current.push('BStep', { foo: '1' }));
      act(() => result.current.back());

      expect(result.current.step).toBe('AStep');
      expect(result.current.context).toEqual({});
    });
  });

  describe('A→B→C 시나리오', () => {
    it('순서대로 이동하고 히스토리가 쌓인다', () => {
      const { result } = renderHook(() =>
        useFunnelHistory({ step: 'AStep', context: {} }),
      );

      act(() => result.current.push('BStep', { name: 'Alice' }));
      act(() => result.current.push('CStep', { age: 20 }));

      expect(result.current.step).toBe('CStep');
      expect(result.current.context).toEqual({ name: 'Alice', age: 20 });
      expect(result.current.historySteps).toHaveLength(3);
    });

    it('뒤로가기 후 다른 분기로 이동하면 forward 히스토리가 잘린다', () => {
      const { result } = renderHook(() =>
        useFunnelHistory({ step: 'AStep', context: {} }),
      );

      act(() => result.current.push('BStep', { name: 'Alice' }));
      act(() => result.current.push('CStep', { age: 20 }));
      act(() => result.current.back()); // BStep으로
      act(() => result.current.push('DStep', { age: 30 })); // 다른 분기

      expect(result.current.step).toBe('DStep');
      expect(result.current.historySteps).toHaveLength(3); // A, B, D (C는 잘림)
    });
  });
});
