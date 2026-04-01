/**
 * 01. Mapped Type으로 객체 타입 변환하기
 *
 * 아래 세 가지 타입 유틸리티를 구현하세요.
 * solution.test.ts의 모든 테스트를 통과해야 합니다.
 */

/**
 * 교차 타입을 단일 객체 타입으로 펼칩니다.
 *
 * @example
 * type Result = Prettify<{ a: string } & { b: number }>;
 * // { a: string; b: number }
 */
export type Prettify<T> = never; // TODO: 구현하세요

/**
 * T에서 K에 해당하는 키만 필수(required)로 바꿉니다.
 *
 * @example
 * type Result = MakeRequired<{ name?: string; age?: number }, 'name'>;
 * // { name: string; age?: number }
 */
export type MakeRequired<T, K extends keyof T> = never; // TODO: 구현하세요

/**
 * T에서 K에 해당하는 키만 옵셔널로 바꿉니다.
 *
 * @example
 * type Result = MakeOptional<{ name: string; age: number }, 'age'>;
 * // { name: string; age?: number }
 */
export type MakeOptional<T, K extends keyof T> = never; // TODO: 구현하세요
