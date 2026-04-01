import { act, renderHook } from '@testing-library/react';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { createMockRouter, useMemoryRouter } from './index';
import type { FunnelRouterResult, FunnelState } from './index';

const initialState: FunnelState = { step: 'AStep', context: {} };

describe('11. Router Interface', () => {
  describe('FunnelRouterResult 인터페이스', () => {
    it('useMemoryRouter가 FunnelRouterResult를 만족한다', () => {
      const { result } = renderHook(() => useMemoryRouter(initialState));
      // 타입 호환성 검증
      expectTypeOf(result.current).toMatchTypeOf<FunnelRouterResult>();
    });

    it('createMockRouter가 FunnelRouterResult를 만족한다', () => {
      const mock = createMockRouter(initialState);
      expectTypeOf(mock).toMatchTypeOf<FunnelRouterResult>();
    });
  });

  describe('useMemoryRouter', () => {
    it('초기 상태가 올바르게 설정된다', () => {
      const { result } = renderHook(() => useMemoryRouter(initialState));

      expect(result.current.history).toEqual([initialState]);
      expect(result.current.currentIndex).toBe(0);
    });

    it('push하면 히스토리에 추가된다', () => {
      const { result } = renderHook(() => useMemoryRouter(initialState));
      const nextState: FunnelState = { step: 'BStep', context: { foo: '1' } };

      act(() => result.current.push(nextState));

      expect(result.current.history).toEqual([initialState, nextState]);
      expect(result.current.currentIndex).toBe(1);
    });

    it('replace하면 현재 상태가 교체된다', () => {
      const { result } = renderHook(() => useMemoryRouter(initialState));
      const replaced: FunnelState = { step: 'XStep', context: {} };

      act(() => result.current.replace(replaced));

      expect(result.current.history).toEqual([replaced]);
      expect(result.current.currentIndex).toBe(0);
    });

    it('go로 인덱스를 이동한다', () => {
      const { result } = renderHook(() => useMemoryRouter(initialState));
      const stateB: FunnelState = { step: 'BStep', context: {} };
      const stateC: FunnelState = { step: 'CStep', context: {} };

      act(() => {
        result.current.push(stateB);
        result.current.push(stateC);
      });
      act(() => result.current.go(-2));

      expect(result.current.currentIndex).toBe(0);
    });

    it('cleanup을 호출해도 에러가 발생하지 않는다', () => {
      const { result } = renderHook(() => useMemoryRouter(initialState));
      expect(() => result.current.cleanup()).not.toThrow();
    });
  });

  describe('createMockRouter', () => {
    it('push 호출이 기록된다', () => {
      const mock = createMockRouter(initialState);
      const nextState: FunnelState = { step: 'BStep', context: {} };

      mock.push(nextState);

      const calls = mock.getCalls();
      expect(calls).toContainEqual({ method: 'push', args: [nextState] });
    });

    it('replace 호출이 기록된다', () => {
      const mock = createMockRouter(initialState);
      const replaced: FunnelState = { step: 'XStep', context: {} };

      mock.replace(replaced);

      const calls = mock.getCalls();
      expect(calls).toContainEqual({ method: 'replace', args: [replaced] });
    });

    it('go 호출이 기록된다', () => {
      const mock = createMockRouter(initialState);

      mock.go(-1);

      const calls = mock.getCalls();
      expect(calls).toContainEqual({ method: 'go', args: [-1] });
    });

    it('cleanup 호출이 기록된다', () => {
      const mock = createMockRouter(initialState);

      mock.cleanup();

      const calls = mock.getCalls();
      expect(calls).toContainEqual({ method: 'cleanup', args: [] });
    });
  });
});
