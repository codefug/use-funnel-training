/**
 * 20. Guard/Parse 런타임 검증
 *
 * 상태 전환 시 guard/parse로 검증하고,
 * 실패 시 초기 상태로 폴백하는 parseStepContext 함수를 구현하세요.
 *
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

import type { StepOption } from '../15-builder-pattern/index';

export type FunnelState = {
  step: string;
  context: Record<string, unknown>;
};

// StepOption을 15단계에서 re-export해서 21단계가 하나의 경로에서 가져올 수 있게 한다
export type { StepOption };

/**
 * 스텝 전환 시 context를 검증하고 유효한 FunnelState를 반환합니다.
 *
 * - stepOptions[step]이 없으면 그대로 반환
 * - guard가 있으면: guard(context) === true → 계속, false → initialState 반환
 * - parse가 있으면: parse 성공 → 파싱된 context 사용, 에러 → initialState 반환
 * - guard + parse 둘 다 있으면: guard 먼저 → 통과 시 parse 실행 (실제 @use-funnel과 동일)
 *
 * @param step - 이동할 스텝 이름
 * @param context - 검증할 context
 * @param stepOptions - 각 스텝의 guard/parse 옵션 (15단계의 StepOption과 동일 타입)
 * @param initialState - 검증 실패 시 폴백할 초기 상태
 */
export function parseStepContext(
  step: string,
  context: unknown,
  stepOptions: Record<string, StepOption>,
  initialState: FunnelState,
): FunnelState {
  // TODO: 구현하세요
  //
  // 1. stepOptions[step]이 없으면 { step, context }를 그대로 반환
  // 2. guard가 있으면 guard(context) 실행:
  //    - false → initialState 반환
  //    - true → 계속 진행 (parse가 있으면 실행)
  // 3. parse가 있으면 try/catch로 실행:
  //    - 성공 → { step, parsedContext } 반환
  //    - throw → initialState 반환
  // 4. 아무 옵션도 없으면 { step, context } 그대로 반환
  throw new Error('구현하세요');
}
