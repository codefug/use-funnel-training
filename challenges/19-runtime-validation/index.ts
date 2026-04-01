/**
 * 19. Guard/Parse 런타임 검증
 *
 * 상태 전환 시 guard/parse로 검증하고,
 * 실패 시 초기 상태로 폴백하는 parseStepContext 함수를 구현하세요.
 *
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

export type FunnelState = {
  step: string;
  context: Record<string, unknown>;
};

export type StepOption = {
  guard?: (context: unknown) => boolean;
  parse?: (context: unknown) => Record<string, unknown>;
};

/**
 * 스텝 전환 시 context를 검증하고 유효한 FunnelState를 반환합니다.
 *
 * - stepOptions[step]이 없으면 그대로 반환
 * - guard가 있으면: guard(context) === true → 통과, false → initialState 반환
 * - parse가 있으면: parse 성공 → 파싱된 context 사용, 에러 → initialState 반환
 *
 * @param step - 이동할 스텝 이름
 * @param context - 검증할 context
 * @param stepOptions - 각 스텝의 guard/parse 옵션
 * @param initialState - 검증 실패 시 폴백할 초기 상태
 */
export function parseStepContext(
  step: string,
  context: unknown,
  stepOptions: Record<string, StepOption>,
  initialState: FunnelState,
): FunnelState {
  // TODO: 구현하세요
  throw new Error('구현하세요');
}
