/**
 * 14. Builder 패턴: createFunnelSteps
 *
 * 메서드 체이닝으로 각 스텝의 guard를 누적하는 Builder를 구현하세요.
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

type StepOption<TContext> = {
  requiredKeys: (keyof TContext)[];
};

type StepDef = {
  guard: (data: unknown) => boolean;
};

type Builder<TContext> = {
  extends(stepName: string | string[], option?: StepOption<TContext>): Builder<TContext>;
  build(): Record<string, StepDef>;
};

/**
 * 스텝별 guard를 체이닝으로 누적하는 Builder를 생성합니다.
 *
 * @example
 * const steps = createFunnelSteps<{ name?: string; age?: number }>()
 *   .extends('NameStep')
 *   .extends('AgeStep', { requiredKeys: ['name'] })
 *   .build();
 *
 * steps.AgeStep.guard({ name: 'Alice' }); // true
 * steps.AgeStep.guard({});               // false
 */
export function createFunnelSteps<TContext extends Record<string, unknown>>(): Builder<TContext> {
  // TODO: 구현하세요
  throw new Error('구현하세요');
}
