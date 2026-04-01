import { describe, expectTypeOf, it } from 'vitest';
import type { FirstArg, ReturnTypeOf, UnwrapPromise } from './index';

describe('02. Conditional Types + infer', () => {
  describe('ReturnTypeOf<T>', () => {
    it('함수의 반환 타입을 추출한다', () => {
      type Fn = (x: number) => string;
      expectTypeOf<ReturnTypeOf<Fn>>().toEqualTypeOf<string>();
    });

    it('void 반환 함수에서 void를 추출한다', () => {
      type Fn = () => void;
      expectTypeOf<ReturnTypeOf<Fn>>().toEqualTypeOf<void>();
    });

    it('Promise를 반환하는 함수에서 Promise 타입을 추출한다', () => {
      type Fn = () => Promise<number>;
      expectTypeOf<ReturnTypeOf<Fn>>().toEqualTypeOf<Promise<number>>();
    });

    it('인자가 여러 개인 함수에서도 반환 타입을 추출한다', () => {
      type Fn = (a: string, b: number, c: boolean) => { result: string };
      expectTypeOf<ReturnTypeOf<Fn>>().toEqualTypeOf<{ result: string }>();
    });

    it('함수가 아닌 타입에는 never를 반환한다', () => {
      expectTypeOf<ReturnTypeOf<string>>().toEqualTypeOf<never>();
      expectTypeOf<ReturnTypeOf<number>>().toEqualTypeOf<never>();
    });
  });

  describe('FirstArg<T>', () => {
    it('첫 번째 인자 타입을 추출한다', () => {
      type Fn = (name: string, age: number) => void;
      expectTypeOf<FirstArg<Fn>>().toEqualTypeOf<string>();
    });

    it('인자가 하나인 함수에서 추출한다', () => {
      type Fn = (id: number) => boolean;
      expectTypeOf<FirstArg<Fn>>().toEqualTypeOf<number>();
    });

    it('객체 타입 인자도 추출한다', () => {
      type Fn = (options: { id: string; name: string }) => void;
      expectTypeOf<FirstArg<Fn>>().toEqualTypeOf<{ id: string; name: string }>();
    });

    it('인자가 없는 함수에는 never를 반환한다', () => {
      type Fn = () => void;
      expectTypeOf<FirstArg<Fn>>().toEqualTypeOf<never>();
    });

    it('함수가 아닌 타입에는 never를 반환한다', () => {
      expectTypeOf<FirstArg<string>>().toEqualTypeOf<never>();
    });
  });

  describe('UnwrapPromise<T>', () => {
    it('Promise<string>에서 string을 추출한다', () => {
      expectTypeOf<UnwrapPromise<Promise<string>>>().toEqualTypeOf<string>();
    });

    it('Promise<number>에서 number를 추출한다', () => {
      expectTypeOf<UnwrapPromise<Promise<number>>>().toEqualTypeOf<number>();
    });

    it('Promise가 아닌 타입은 그대로 반환한다', () => {
      expectTypeOf<UnwrapPromise<string>>().toEqualTypeOf<string>();
      expectTypeOf<UnwrapPromise<number>>().toEqualTypeOf<number>();
    });

    it('Promise<void>에서 void를 추출한다', () => {
      expectTypeOf<UnwrapPromise<Promise<void>>>().toEqualTypeOf<void>();
    });

    it('중첩 Promise는 한 겹만 벗긴다', () => {
      expectTypeOf<UnwrapPromise<Promise<Promise<number>>>>().toEqualTypeOf<Promise<number>>();
    });
  });
});
