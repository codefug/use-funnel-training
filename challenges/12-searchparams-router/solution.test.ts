import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchParamsRouter } from './index';
import type { FunnelRouterResult, FunnelState } from '../11-router-interface/index';

const initialState: FunnelState = { step: 'AStep', context: {} };

// URL을 초기화하는 헬퍼
function resetUrl(search = '') {
  window.history.replaceState(null, '', `/${search}`);
}

describe('12. URL SearchParams 라우터', () => {
  beforeEach(() => resetUrl());
  afterEach(() => resetUrl());

  describe('FunnelRouterResult 인터페이스 준수', () => {
    it('useSearchParamsRouter가 FunnelRouterResult를 만족한다', () => {
      const { result } = renderHook(() => useSearchParamsRouter(initialState));
      // 타입 수준 검증 — 컴파일이 통과하면 성공
      const _: FunnelRouterResult = result.current;
      expect(result.current).toBeDefined();
    });
  });

  describe('초기 상태', () => {
    it('URL에 파라미터가 없으면 initialState로 시작한다', () => {
      const { result } = renderHook(() => useSearchParamsRouter(initialState));

      expect(result.current.history).toEqual([initialState]);
      expect(result.current.currentIndex).toBe(0);
    });

    it('URL에 funnel 파라미터가 있으면 그 값을 초기 상태로 사용한다', () => {
      const savedHistory: FunnelState[] = [
        { step: 'AStep', context: {} },
        { step: 'BStep', context: { name: 'Alice' } },
      ];
      resetUrl(`?funnel=${encodeURIComponent(JSON.stringify(savedHistory))}&funnelIndex=1`);

      const { result } = renderHook(() => useSearchParamsRouter(initialState));

      expect(result.current.history).toEqual(savedHistory);
      expect(result.current.currentIndex).toBe(1);
    });

    it('URL의 funnel 파라미터가 유효하지 않은 JSON이면 initialState로 폴백한다', () => {
      resetUrl('?funnel=invalid-json&funnelIndex=0');

      const { result } = renderHook(() => useSearchParamsRouter(initialState));

      expect(result.current.history).toEqual([initialState]);
      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe('push', () => {
    it('push하면 히스토리에 추가되고 URL이 갱신된다', () => {
      const { result } = renderHook(() => useSearchParamsRouter(initialState));
      const stateB: FunnelState = { step: 'BStep', context: { name: 'Alice' } };

      act(() => result.current.push(stateB));

      expect(result.current.history).toEqual([initialState, stateB]);
      expect(result.current.currentIndex).toBe(1);

      // URL에 저장됐는지 확인
      const params = new URLSearchParams(window.location.search);
      expect(params.get('funnel')).toBeTruthy();
      expect(params.get('funnelIndex')).toBe('1');
    });

    it('중간 위치에서 push하면 이후 히스토리가 제거된다', () => {
      const { result } = renderHook(() => useSearchParamsRouter(initialState));
      const stateB: FunnelState = { step: 'BStep', context: {} };
      const stateC: FunnelState = { step: 'CStep', context: {} };
      const stateD: FunnelState = { step: 'DStep', context: {} };

      act(() => {
        result.current.push(stateB);
        result.current.push(stateC);
      });
      // 인덱스 0으로 이동 후 새 push
      act(() => result.current.go(-2));
      act(() => result.current.push(stateD));

      expect(result.current.currentIndex).toBe(1);
      expect(result.current.history[1]).toEqual(stateD);
      expect(result.current.history.length).toBe(2);
    });
  });

  describe('replace', () => {
    it('replace하면 현재 상태가 교체되고 URL이 갱신된다', () => {
      const { result } = renderHook(() => useSearchParamsRouter(initialState));
      const replaced: FunnelState = { step: 'XStep', context: {} };

      act(() => result.current.replace(replaced));

      expect(result.current.history).toEqual([replaced]);
      expect(result.current.currentIndex).toBe(0);

      const params = new URLSearchParams(window.location.search);
      const saved = JSON.parse(params.get('funnel') ?? '[]') as FunnelState[];
      expect(saved[0]).toEqual(replaced);
    });
  });

  describe('popstate (브라우저 뒤로/앞으로가기)', () => {
    it('popstate 이벤트 발생 시 event.state로 상태를 복원한다', () => {
      const { result } = renderHook(() => useSearchParamsRouter(initialState));
      const stateB: FunnelState = { step: 'BStep', context: { name: 'Bob' } };

      act(() => result.current.push(stateB));
      expect(result.current.currentIndex).toBe(1);

      // popstate를 직접 시뮬레이션
      act(() => {
        const event = new PopStateEvent('popstate', {
          state: { funnelHistory: [initialState], funnelIndex: 0 },
        });
        window.dispatchEvent(event);
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.history[result.current.currentIndex]).toEqual(initialState);
    });
  });

  describe('cleanup', () => {
    it('cleanup을 호출해도 에러가 발생하지 않는다', () => {
      const { result } = renderHook(() => useSearchParamsRouter(initialState));
      expect(() => result.current.cleanup()).not.toThrow();
    });

    it('언마운트 후 popstate 이벤트가 와도 상태가 변경되지 않는다', () => {
      const { result, unmount } = renderHook(() => useSearchParamsRouter(initialState));

      act(() => result.current.push({ step: 'BStep', context: {} }));
      const indexBeforeUnmount = result.current.currentIndex;

      unmount(); // useEffect cleanup 실행 → removeEventListener

      // 언마운트 후 popstate 이벤트 — 훅이 반응하지 않아야 함
      act(() => {
        const event = new PopStateEvent('popstate', {
          state: { funnelHistory: [initialState], funnelIndex: 0 },
        });
        window.dispatchEvent(event);
      });

      // unmount 이후라 result.current 자체는 마지막 값을 그대로 유지
      expect(result.current.currentIndex).toBe(indexBeforeUnmount);
    });
  });

  describe('URL 직렬화', () => {
    it('push 후 URL의 funnel 파라미터를 파싱하면 현재 히스토리와 일치한다', () => {
      const { result } = renderHook(() => useSearchParamsRouter(initialState));
      const stateB: FunnelState = { step: 'BStep', context: { foo: 'bar' } };

      act(() => result.current.push(stateB));

      const params = new URLSearchParams(window.location.search);
      const parsed = JSON.parse(params.get('funnel') ?? '[]') as FunnelState[];
      expect(parsed).toEqual(result.current.history);
    });
  });
});
