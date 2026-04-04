/**
 * 09. 함수형 업데이트와 스프레드 머지
 *
 * computeNextContext 함수를 구현하세요.
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

/**
 * 현재 context와 업데이트 인자를 받아 새 context를 계산합니다.
 *
 * - assignOrFn이 함수면: assignOrFn(currentContext) 호출
 * - assignOrFn이 객체면: { ...currentContext, ...assignOrFn } 스프레드 머지
 *
 * @param currentContext - 현재 context 객체
 * @param assignOrFn - 업데이트할 객체 또는 업데이트 함수
 */
export function computeNextContext<T extends Record<string, unknown>>(
  currentContext: T,
  assignOrFn: Partial<Record<string, unknown>> | ((prev: T) => Record<string, unknown>),
): Record<string, unknown> {
  if (typeof assignOrFn === 'function') {
    return assignOrFn(currentContext);
  }
  return { ...currentContext, ...assignOrFn };
}
