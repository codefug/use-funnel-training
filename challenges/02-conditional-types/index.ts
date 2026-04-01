/**
 * 02. Conditional Type + infer로 타입 추출하기
 *
 * 아래 세 가지 타입 유틸리티를 구현하세요.
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

/**
 * 함수 타입 T의 반환 타입을 추출합니다.
 * (내장 ReturnType<T>을 직접 구현)
 *
 * @example
 * type Result = ReturnTypeOf<(x: number) => string>;
 * // string
 */
export type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

/**
 * 함수 타입 T의 첫 번째 인자 타입을 추출합니다.
 *
 * @example
 * type Result = FirstArg<(name: string, age: number) => void>;
 * // string
 */
export type FirstArg<T> = T extends (...args: infer A) => any
  ? A extends [infer F, ...any[]]
    ? F
    : never
  : never;

/**
 * Promise<T>에서 T를 추출합니다.
 * Promise가 아니면 T를 그대로 반환합니다.
 *
 * @example
 * type A = UnwrapPromise<Promise<string>>;  // string
 * type B = UnwrapPromise<string>;           // string
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
