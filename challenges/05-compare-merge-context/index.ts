/**
 * 05. CompareMergeContext 완성
 *
 * 04단계에서 만든 RequiredCompareKeys, OptionalCompareKeys를 조합해서
 * CompareMergeContext<TBase, TResult>를 완성하세요.
 *
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */
import { OptionalCompareKeys, RequiredCompareKeys } from '@challenges/04-compare-keys';

type Prettify<T> = Omit<T, never>;

/**
 * TBase에서 TResult로 전환할 때 개발자가 제공해야 하는 최소한의 객체 타입.
 *
 * - RequiredCompareKeys에 해당하는 키 → required
 * - OptionalCompareKeys에 해당하는 키 → optional
 *
 * @example
 * type Base   = { foo: string; bar?: number };
 * type Target = { foo: string; bar: number; address: string };
 * type Result = CompareMergeContext<Base, Target>;
 * // { bar: number; address: string; foo?: string }
 */
export type CompareMergeContext<TBase, TResult> = Prettify<
  {
    [K in RequiredCompareKeys<TBase, TResult>]: K extends keyof TResult
      ? TResult[K]
      : K extends keyof TBase
        ? TBase[K]
        : never;
  } & {
    [K in OptionalCompareKeys<TBase, TResult>]?: K extends keyof TBase
      ? TBase[K]
      : K extends keyof TResult
        ? TResult[K]
        : never;
  }
>;