/**
 * 16. 타입 안전한 스텝 전환
 *
 * AnyFunnelState와 PushArgs 타입 유틸리티를 구현하세요.
 * solution.test.ts의 모든 타입 테스트를 통과해야 합니다.
 */

import type { CompareMergeContext } from '@challenges/05-compare-merge-context';

/**
 * 런타임에서 라우터가 주고받는 untyped 퍼널 상태.
 *
 * 03단계의 FunnelState<TStepMap>은 컴파일 타임용 제네릭 타입이고,
 * AnyFunnelState는 라우터/히스토리 배열 등 런타임에서 쓰이는 untyped 버전이다.
 */
export type AnyFunnelState = {
  step: string;
  context: Record<string, unknown>;
};

/**
 * 현재 스텝 TFrom에서 목표 스텝 TTo로 push할 때
 * 개발자가 제공해야 하는 최소 context 타입.
 *
 * @example
 * type StepMap = {
 *   NameStep: { name?: string };
 *   AgeStep: { name: string; age?: number };
 * };
 *
 * // NameStep에서 AgeStep으로 push: name이 optional→required이므로 name 필수
 * type Args = PushArgs<StepMap, 'NameStep', 'AgeStep'>;
 * // 결과: { name: string; age?: number }
 */
export type PushArgs<
  TStepMap extends Record<string, Record<string, unknown>>,
  TFrom extends keyof TStepMap,
  TTo extends keyof TStepMap,
> = CompareMergeContext<TStepMap[TFrom], TStepMap[TTo]>;
