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
  requiredKeys?: keyof TContext | (keyof TContext)[];
  guard?: (context: unknown) => boolean;
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
  const result: Record<string, StepOption> = {};
  let prevGuard: ((data: unknown) => boolean) | null = null;

  const baseGuard = (data: unknown) => typeof data === 'object' && data !== null;

  const builder: Builder<TContext> = {
    extends(stepName, option?) {
      const steps = Array.isArray(stepName) ? stepName : [stepName];
      const capturedPrev = prevGuard;

      const requiredKeys = option?.requiredKeys
        ? Array.isArray(option.requiredKeys)
          ? option.requiredKeys
          : [option.requiredKeys]
        : [];

      const currentGuard = (data: unknown) => {
        if (!baseGuard(data)) return false;
        if (capturedPrev && !capturedPrev(data)) return false;
        if (requiredKeys.length > 0 && !requiredKeys.every((key) => key in (data as object)))
          return false;
        if (option?.guard && !option.guard(data)) return false;
        return true;
      };

      for (const name of steps) {
        result[name] = {
          guard: currentGuard,
          ...(option?.parse ? { parse: option.parse } : {}),
        };
      }
      prevGuard = currentGuard;

      return builder;
    },
    build() {
      return result;
    },
  };

  return builder;
}
