/**
 * 15. Builder 패턴: createFunnelSteps
 *
 * 메서드 체이닝으로 각 스텝의 guard/parse를 누적하는 Builder를 구현하세요.
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

/**
 * 각 스텝의 검증 옵션.
 * - guard: context를 받아 boolean을 반환하는 검증 함수
 * - parse: context를 파싱/변환하는 함수 (실패 시 예외를 던져야 함)
 *
 * 20단계의 parseStepContext에서 이 타입을 그대로 사용한다.
 */
export type StepOption = {
  guard?: (context: unknown) => boolean;
  parse?: (context: unknown) => Record<string, unknown>;
};

type BuilderExtendOption<TContext> = {
  requiredKeys?: (keyof TContext)[];
  parse?: (context: unknown) => Record<string, unknown>;
};

type Builder<TContext> = {
  extends(stepName: string | string[], option?: BuilderExtendOption<TContext>): Builder<TContext>;
  build(): Record<string, StepOption>;
};

/**
 * 스텝별 guard/parse를 체이닝으로 누적하는 Builder를 생성합니다.
 *
 * @example
 * const steps = createFunnelSteps<{ name?: string; age?: number }>()
 *   .extends('NameStep')
 *   .extends('AgeStep', { requiredKeys: ['name'] })
 *   .extends('CStep',   { parse: (ctx) => CStepSchema.parse(ctx) })
 *   .build();
 *
 * // build() 결과는 Record<string, StepOption> — 20단계 parseStepContext에 바로 전달 가능
 * steps.AgeStep.guard?.({ name: 'Alice' }); // true
 * steps.AgeStep.guard?.({});               // false
 */
export function createFunnelSteps<TContext extends Record<string, unknown>>(): Builder<TContext> {
  // TODO: 구현하세요
  //
  // prevGuard를 클로저로 유지하면서 각 스텝의 guard를 누적합니다.
  //
  // - option 없음: 베이스 null 체크만 하는 guard (or 이전 guard 그대로 상속)
  // - option.requiredKeys 있음: 이전 guard 체인 + 해당 키 존재 확인
  // - option.parse 있음: parse를 StepOption에 직접 저장 (guard는 누적하지 않음)
  //
  // 모든 guard는 null/undefined를 reject하는 베이스 체크를 포함해야 합니다.
  throw new Error('구현하세요');
}
