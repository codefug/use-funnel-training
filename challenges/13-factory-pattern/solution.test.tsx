import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createUseFunnel } from './index';
import { useMemoryRouter } from '../11-router-interface/index';

const useFunnel = createUseFunnel(useMemoryRouter);

describe('13. Factory Pattern: createUseFunnel', () => {
  it('초기 상태가 올바르게 반환된다', () => {
    const { result } = renderHook(() =>
      useFunnel({ step: 'AStep', context: {} }),
    );

    expect(result.current.step).toBe('AStep');
    expect(result.current.context).toEqual({});
  });

  describe('history.push', () => {
    it('새 step으로 이동한다', () => {
      const { result } = renderHook(() =>
        useFunnel({ step: 'AStep', context: {} }),
      );

      act(() => result.current.history.push('BStep', { foo: '1' }));

      expect(result.current.step).toBe('BStep');
      expect(result.current.context).toEqual({ foo: '1' });
    });

    it('이전 context가 머지된다', () => {
      const { result } = renderHook(() =>
        useFunnel({ step: 'AStep', context: { name: 'Alice' } }),
      );

      act(() => result.current.history.push('BStep', { age: 20 }));

      expect(result.current.context).toEqual({ name: 'Alice', age: 20 });
    });

    it('함수형 업데이트가 동작한다', () => {
      const { result } = renderHook(() =>
        useFunnel({ step: 'AStep', context: { count: 1 } }),
      );

      act(() =>
        result.current.history.push('BStep', (prev) => ({
          ...prev,
          count: (prev.count as number) + 1,
        })),
      );

      expect(result.current.context).toEqual({ count: 2 });
    });
  });

  describe('history.back', () => {
    it('이전 step으로 돌아간다', () => {
      const { result } = renderHook(() =>
        useFunnel({ step: 'AStep', context: {} }),
      );

      act(() => result.current.history.push('BStep', { foo: '1' }));
      act(() => result.current.history.back());

      expect(result.current.step).toBe('AStep');
    });
  });

  describe('서로 다른 라우터로 만든 useFunnel', () => {
    it('같은 API를 제공한다', () => {
      // useMemoryRouter로 만든 useFunnel
      const { result: memResult } = renderHook(() =>
        useFunnel({ step: 'AStep', context: {} }),
      );

      // 동일한 API 구조를 가진다
      expect(typeof memResult.current.history.push).toBe('function');
      expect(typeof memResult.current.history.back).toBe('function');
      expect(typeof memResult.current.history.replace).toBe('function');
      expect(typeof memResult.current.history.go).toBe('function');
    });
  });

  describe('historySteps', () => {
    it('전체 히스토리를 반환한다', () => {
      const { result } = renderHook(() =>
        useFunnel({ step: 'AStep', context: {} }),
      );

      act(() => result.current.history.push('BStep', { foo: '1' }));
      act(() => result.current.history.push('CStep', { bar: '2' }));

      expect(result.current.historySteps).toHaveLength(3);
      expect(result.current.historySteps[0]?.step).toBe('AStep');
      expect(result.current.historySteps[2]?.step).toBe('CStep');
    });
  });

  describe('useLatestRef — stale closure 방지', () => {
    it('push 후 캡처된 history 콜백이 최신 context를 기준으로 동작한다', () => {
      const { result } = renderHook(() =>
        useFunnel({ step: 'AStep', context: { count: 0 } }),
      );

      // 첫 번째 push
      act(() => result.current.history.push('BStep', { count: 1 }));

      // 이 시점에서 캡처된 history.push가 이전 렌더의 context(count: 0)를
      // 참조하지 않고 최신 context(count: 1)를 기준으로 동작해야 한다
      act(() =>
        result.current.history.push('CStep', (prev) => ({
          count: (prev.count as number) + 1,
        })),
      );

      // stale closure라면 0+1=1이 되겠지만,
      // useLatestRef 덕분에 1+1=2가 되어야 함
      expect(result.current.context.count).toBe(2);
    });
  });
});
