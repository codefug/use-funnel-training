/**
 * 04. 두 타입 비교해서 diff 계산하기
 *
 * 아래 두 가지 타입 유틸리티를 구현하세요.
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

export type Test = number;

/**
 * TBase에서 TResult로 전환할 때 반드시 제공해야 하는 키들의 유니온을 반환합니다.
 *
 * Required인 경우:
 * - TResult에 있지만 TBase에 없는 키 (단 TResult[K]가 optional이면 제외)
 * - TBase에도 있지만 TBase[K]가 TResult[K]에 할당 불가능한 경우
 *
 * @example
 * type Base   = { foo: string; bar?: number };
 * type Target = { foo: string; bar: number; address: string };
 * type Result = RequiredCompareKeys<Base, Target>;
 * // 'bar' | 'address'
 */
export type RequiredCompareKeys<TBase, TResult> = keyof TBase | keyof TResult extends infer K
  ? K extends keyof TResult
    ? K extends keyof TBase
      ? TBase[K] extends TResult[K]
        ? never
        : K
      : undefined extends TResult[K]
        ? never
        : K
    : never
  : never;

/**
 * TBase에서 TResult로 전환할 때 생략해도 되는 키들의 유니온을 반환합니다.
 *
 * Optional인 경우:
 * - TBase와 TResult 모두에 있고 TBase[K]가 TResult[K]에 할당 가능한 경우
 * - TResult에 있지만 TResult[K]가 optional인 경우
 * - TBase에만 있는 키
 *
 * @example
 * type Base   = { foo: string; bar?: number };
 * type Target = { foo: string; bar: number; address: string };
 * type Result = OptionalCompareKeys<Base, Target>;
 * // 'foo'
 */
export type OptionalCompareKeys<TBase, TResult> = keyof TBase | keyof TResult extends infer K
  ? K extends keyof TResult
    ? K extends keyof TBase
      ? TBase[K] extends TResult[K]
        ? K  // 양쪽에 있고 타입 호환
        : never  // 양쪽에 있지만 타입 변경
      : undefined extends TResult[K]
          ? K  // TResult에 있지만 optional
          : never  // TResult에 있지만 required
    : K extends keyof TBase
      ? K  // TBase에만 있는 키
      : never
  : never;
