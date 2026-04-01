import { describe, expectTypeOf, it } from 'vitest';
import type { OptionalCompareKeys, RequiredCompareKeys } from './index';

describe('04. Compare Keys', () => {
  describe('RequiredCompareKeys<TBase, TResult>', () => {
    it('TResult에 새로 생긴 required 키를 반환한다', () => {
      type Base = { foo: string };
      type Target = { foo: string; bar: string };
      // bar가 새로 생겼고 required → required 키
      expectTypeOf<RequiredCompareKeys<Base, Target>>().toEqualTypeOf<'bar'>();
    });

    it('optional에서 required로 바뀐 키를 반환한다', () => {
      type Base = { foo: string; bar?: number };
      type Target = { foo: string; bar: number };
      // bar가 optional → required로 바뀜
      expectTypeOf<RequiredCompareKeys<Base, Target>>().toEqualTypeOf<'bar'>();
    });

    it('여러 키가 동시에 required인 경우', () => {
      type Base = { foo: string };
      type Target = { foo: string; bar: string; baz: number };
      expectTypeOf<RequiredCompareKeys<Base, Target>>().toEqualTypeOf<'bar' | 'baz'>();
    });

    it('TResult에 새로 생겼지만 optional인 키는 required가 아니다', () => {
      type Base = { foo: string };
      type Target = { foo: string; bar?: string };
      // bar가 새로 생겼지만 optional → required 아님
      expectTypeOf<RequiredCompareKeys<Base, Target>>().toEqualTypeOf<never>();
    });

    it('TBase와 TResult가 동일하면 required 키가 없다', () => {
      type Same = { foo: string; bar?: number };
      expectTypeOf<RequiredCompareKeys<Same, Same>>().toEqualTypeOf<never>();
    });

    it('타입이 달라진 키는 required다', () => {
      type Base = { foo: string };
      type Target = { foo: number }; // string → number로 변경
      expectTypeOf<RequiredCompareKeys<Base, Target>>().toEqualTypeOf<'foo'>();
    });
  });

  describe('OptionalCompareKeys<TBase, TResult>', () => {
    it('TBase와 TResult 모두에 있고 타입이 같은 키는 optional이다', () => {
      type Base = { foo: string; bar?: number };
      type Target = { foo: string; bar: number; address: string };
      // foo는 양쪽에 있고 타입도 같음 → optional
      expectTypeOf<OptionalCompareKeys<Base, Target>>().toEqualTypeOf<'foo'>();
    });

    it('TResult에 있고 optional인 키는 optional이다', () => {
      type Base = { foo: string };
      type Target = { foo: string; bar?: string };
      // bar는 TResult에 있지만 optional → optional
      expectTypeOf<OptionalCompareKeys<Base, Target>>().toEqualTypeOf<'foo' | 'bar'>();
    });

    it('TBase에만 있는 키는 optional이다', () => {
      type Base = { foo: string; extra: boolean };
      type Target = { foo: string };
      // extra는 TBase에만 있음 → optional
      expectTypeOf<OptionalCompareKeys<Base, Target>>().toEqualTypeOf<'foo' | 'extra'>();
    });
  });
});
