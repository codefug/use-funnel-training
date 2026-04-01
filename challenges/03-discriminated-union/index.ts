/**
 * 03. Discriminated Union과 타입 좁히기
 *
 * 아래 타입 유틸리티를 구현하세요.
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

/**
 * 스텝 맵 객체 타입을 Discriminated Union으로 변환합니다.
 *
 * @example
 * type StepMap = { AStep: { foo?: string }; BStep: { foo: string } };
 * type Result = StepMapToUnion<StepMap>;
 * // { step: 'AStep'; context: { foo?: string } } | { step: 'BStep'; context: { foo: string } }
 */
export type StepMapToUnion<TStepMap extends Record<string, unknown>> = {
  [K in keyof TStepMap]: { step: K; context: TStepMap[K]}
}[keyof TStepMap];

/**
 * StepMapToUnion을 사용해 퍼널 상태 타입을 만듭니다.
 * (StepMapToUnion과 동일하지만 이름을 명확히 하기 위해 별도 정의)
 */
export type FunnelState<TStepMap extends Record<string, unknown>> =
  StepMapToUnion<TStepMap>;
