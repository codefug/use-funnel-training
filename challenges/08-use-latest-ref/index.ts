/**
 * 08. useRef로 최신 상태 참조 유지하기
 *
 * 항상 최신 값을 가리키는 ref를 반환하는 useLatestRef 훅을 구현하세요.
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

import { useRef } from 'react';
import type { RefObject } from 'react';

/**
 * 항상 최신 value를 가리키는 ref를 반환합니다.
 * 비동기 콜백이나 이벤트 핸들러에서 stale closure 문제를 방지합니다.
 *
 * @param value - 추적할 값
 * @returns 항상 최신 value를 가리키는 ref
 */
export function useLatestRef<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
