/**
 * 12. URL SearchParams 라우터 구현
 *
 * useSearchParamsRouter를 구현하세요.
 * - URL query param에 퍼널 히스토리를 직렬화/역직렬화
 * - 브라우저 popstate 이벤트로 뒤로/앞으로가기 지원
 * - cleanup()으로 이벤트 리스너 제거
 *
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

import { useEffect, useState } from 'react';
import type { FunnelRouterResult, FunnelState } from '../11-router-interface/index';

/**
 * URL query params에 히스토리를 저장하는 라우터 구현체.
 *
 * URL 형식:
 *   ?funnel=[{"step":"AStep","context":{}}]&funnelIndex=0
 *
 * @param initialState - URL에 파라미터가 없을 때 사용할 초기 상태
 */
export function useSearchParamsRouter(initialState: FunnelState): FunnelRouterResult {
  const readFromUrl = (): { history: FunnelState[]; currentIndex: number } => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('funnel');
    const indexRaw = params.get('funnelIndex');
    try {
      if (!raw) throw new Error('Invalid funnel');

      const history = JSON.parse(raw) as FunnelState[];
      const currentIndex = indexRaw ? parseInt(indexRaw, 10) : history.length - 1;
      return { history, currentIndex };
    } catch {
      return { history: [initialState], currentIndex: 0 };
    }
  };

  const [state, setState] = useState(readFromUrl);
  // 1. useState로 { history: FunnelState[], currentIndex: number } 관리
  //    - 초기값은 URL에서 읽어오고, 없으면 initialState 사용
  //

  const buildUrl = (history: FunnelState[], currentIndex: number): string => {
    const params = new URLSearchParams(window.location.search);
    params.set('funnel', JSON.stringify(history));
    params.set('funnelIndex', String(currentIndex));
    return `${window.location.pathname}?${params.toString()}`;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: readFromUrl is not a dependency
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      if (event.state?.funnelHistory) {
        setState({
          history: event.state.funnelHistory,
          currentIndex: event.state.funnelIndex,
        });
      } else {
        setState(readFromUrl());
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  // 2. useEffect로 popstate 리스너 등록 / cleanup에서 제거
  //    - event.state에 저장된 값으로 상태 복원
  //

  const push = (newState: FunnelState) => {
    const newHistory = [...state.history.slice(0, state.currentIndex + 1), newState];
    const newIndex = newHistory.length - 1;
    const stateObj = { funnelHistory: newHistory, funnelIndex: newIndex };
    window.history.pushState(stateObj, '', buildUrl(newHistory, newIndex));
    setState({
      history: newHistory,
      currentIndex: newIndex,
    });
  };
  // 3. push: 현재 인덱스 이후를 버리고 새 상태 추가, history.pushState로 URL 갱신

  const replace = (newState: FunnelState) => {
    const newHistory = [...state.history.slice(0, state.currentIndex), newState];
    const stateObj = { funnelHistory: newHistory, funnelIndex: state.currentIndex };
    window.history.replaceState(stateObj, '', buildUrl(newHistory, state.currentIndex));
    setState({ history: newHistory, currentIndex: state.currentIndex });
  };
  // 4. replace: 현재 인덱스 항목을 교체, history.replaceState로 URL 갱신

  const go = (delta: number) => {
    window.history.go(delta);
  };
  // 5. go: window.history.go(delta) 호출

  const cleanup = () => {};
  // 6. cleanup: removeEventListener (useEffect cleanup과 별도로 명시적 노출)
  return {
    cleanup,
    currentIndex: state.currentIndex,
    go,
    history: state.history,
    push,
    replace,
  };
}
