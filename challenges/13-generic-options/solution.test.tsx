import { act, renderHook } from '@testing-library/react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createUseFunnel } from './index';
import type { FunnelRouterResultWithOption } from './index';
import type { FunnelState } from '../11-router-interface/index';

// Next.js 스타일 라우터 옵션
type NextRouteOption = { shallow?: boolean };

// Next.js 스타일 mock 라우터 훅
function useNextMockRouter(initialState: FunnelState): FunnelRouterResultWithOption<NextRouteOption> {
  const pushSpy = vi.fn();
  const replaceSpy = vi.fn();

  return {
    history: [initialState],
    currentIndex: 0,
    push: pushSpy,
    replace: replaceSpy,
    go: vi.fn(),
    cleanup: vi.fn(),
  };
}

describe('13. Generic Options', () => {
  describe('타입 안전성', () => {
    it('TRouteOption이 push의 세 번째 인자 타입에 반영된다', () => {
      const useNextFunnel = createUseFunnel<NextRouteOption>(useNextMockRouter);
      const { result } = renderHook(() =>
        useNextFunnel({ step: 'AStep', context: {} }),
      );

      // push의 세 번째 인자가 NextRouteOption 타입이어야 함
      expectTypeOf(result.current.history.push).parameters.toMatchTypeOf<
        [string, (Partial<Record<string, unknown>> | ((prev: Record<string, unknown>) => Record<string, unknown>))?, NextRouteOption?]
      >();
    });

    it('TRouteOption 없이 사용하면 기본값이 적용된다', () => {
      // 제네릭 없이 사용 — 옵션 없는 라우터
      const useFunnel = createUseFunnel((initialState: FunnelState): FunnelRouterResultWithOption => ({
        history: [initialState],
        currentIndex: 0,
        push: vi.fn(),
        replace: vi.fn(),
        go: vi.fn(),
        cleanup: vi.fn(),
      }));

      const { result } = renderHook(() =>
        useFunnel({ step: 'AStep', context: {} }),
      );

      expect(result.current.step).toBe('AStep');
    });
  });

  describe('옵션 전달', () => {
    it('push 시 옵션이 라우터의 push로 전달된다', () => {
      const pushSpy = vi.fn();

      const useRouterWithSpy = (initialState: FunnelState): FunnelRouterResultWithOption<NextRouteOption> => ({
        history: [initialState],
        currentIndex: 0,
        push: pushSpy,
        replace: vi.fn(),
        go: vi.fn(),
        cleanup: vi.fn(),
      });

      const useNextFunnel = createUseFunnel<NextRouteOption>(useRouterWithSpy);
      const { result } = renderHook(() =>
        useNextFunnel({ step: 'AStep', context: {} }),
      );

      act(() => result.current.history.push('BStep', { foo: '1' }, { shallow: true }));

      // 라우터의 push가 옵션과 함께 호출됐는지 확인
      expect(pushSpy).toHaveBeenCalledWith(
        { step: 'BStep', context: { foo: '1' } },
        { shallow: true },
      );
    });

    it('옵션 없이 push해도 동작한다', () => {
      const pushSpy = vi.fn();

      const useRouterWithSpy = (initialState: FunnelState): FunnelRouterResultWithOption<NextRouteOption> => ({
        history: [initialState],
        currentIndex: 0,
        push: pushSpy,
        replace: vi.fn(),
        go: vi.fn(),
        cleanup: vi.fn(),
      });

      const useNextFunnel = createUseFunnel<NextRouteOption>(useRouterWithSpy);
      const { result } = renderHook(() =>
        useNextFunnel({ step: 'AStep', context: {} }),
      );

      act(() => result.current.history.push('BStep', { foo: '1' }));

      expect(pushSpy).toHaveBeenCalledWith(
        { step: 'BStep', context: { foo: '1' } },
        undefined,
      );
    });
  });
});
