import { describe, expectTypeOf, it } from 'vitest';
import type { MakeOptional, MakeRequired, Prettify } from './index';

describe('01. Mapped Types', () => {
  describe('Prettify<T>', () => {
    it('교차 타입을 단일 객체 타입으로 펼친다', () => {
      type Input = { a: string } & { b: number };
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{ a: string; b: number }>();
    });

    it('세 개 이상의 교차 타입도 펼친다', () => {
      type Input = { a: string } & { b: number } & { c: boolean };
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{ a: string; b: number; c: boolean }>();
    });

    it('이미 단일 객체 타입이면 그대로 반환한다', () => {
      type Input = { a: string; b: number };
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{ a: string; b: number }>();
    });

    it('옵셔널 키도 보존한다', () => {
      type Input = { a: string } & { b?: number };
      type Result = Prettify<Input>;

      expectTypeOf<Result>().toEqualTypeOf<{ a: string; b?: number }>();
    });
  });

  describe('MakeRequired<T, K>', () => {
    it('지정한 키만 필수로 바꾼다', () => {
      type Base = { name?: string; age?: number; address?: string };
      type Result = MakeRequired<Base, 'name'>;

      expectTypeOf<Result>().toEqualTypeOf<{
        name: string;
        age?: number;
        address?: string;
      }>();
    });

    it('여러 키를 동시에 필수로 바꾼다', () => {
      type Base = { name?: string; age?: number; address?: string };
      type Result = MakeRequired<Base, 'name' | 'age'>;

      expectTypeOf<Result>().toEqualTypeOf<{
        name: string;
        age: number;
        address?: string;
      }>();
    });

    it('이미 필수인 키에 적용해도 그대로다', () => {
      type Base = { name: string; age?: number };
      type Result = MakeRequired<Base, 'name'>;

      expectTypeOf<Result>().toEqualTypeOf<{
        name: string;
        age?: number;
      }>();
    });
  });

  describe('MakeOptional<T, K>', () => {
    it('지정한 키만 옵셔널로 바꾼다', () => {
      type Base = { name: string; age: number; address: string };
      type Result = MakeOptional<Base, 'address'>;

      expectTypeOf<Result>().toEqualTypeOf<{
        name: string;
        age: number;
        address?: string;
      }>();
    });

    it('여러 키를 동시에 옵셔널로 바꾼다', () => {
      type Base = { name: string; age: number; address: string };
      type Result = MakeOptional<Base, 'age' | 'address'>;

      expectTypeOf<Result>().toEqualTypeOf<{
        name: string;
        age?: number;
        address?: string;
      }>();
    });

    it('이미 옵셔널인 키에 적용해도 그대로다', () => {
      type Base = { name: string; age?: number };
      type Result = MakeOptional<Base, 'age'>;

      expectTypeOf<Result>().toEqualTypeOf<{
        name: string;
        age?: number;
      }>();
    });
  });
});
