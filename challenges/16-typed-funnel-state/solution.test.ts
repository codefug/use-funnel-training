import { describe, expectTypeOf, it } from 'vitest';
import type { AnyFunnelState, PushArgs } from './index';

type StepMap = {
  NameStep: { name?: string };
  AgeStep: { name: string; age?: number };
  CompleteStep: { name: string; age: number };
};

describe('16. 타입 안전한 스텝 전환', () => {
  describe('AnyFunnelState', () => {
    it('step은 string이다', () => {
      expectTypeOf<AnyFunnelState['step']>().toEqualTypeOf<string>();
    });

    it('context는 Record<string, unknown>이다', () => {
      expectTypeOf<AnyFunnelState['context']>().toEqualTypeOf<Record<string, unknown>>();
    });

    it('AnyFunnelState 객체를 만들 수 있다', () => {
      const state: AnyFunnelState = { step: 'NameStep', context: { name: 'Alice' } };
      expectTypeOf(state).toEqualTypeOf<AnyFunnelState>();
    });
  });

  describe('PushArgs — NameStep → AgeStep', () => {
    // name: optional→required → 필수
    // age: 새로 생김(optional) → optional
    it('name이 필수인 타입이 된다', () => {
      type Args = PushArgs<StepMap, 'NameStep', 'AgeStep'>;

      // name은 required
      expectTypeOf<Args>().toHaveProperty('name').toEqualTypeOf<string>();
    });

    it('name 없이는 할당 불가하다', () => {
      type Args = PushArgs<StepMap, 'NameStep', 'AgeStep'>;
      // @ts-expect-error name이 없으면 타입 에러
      const _invalid: Args = {};
    });

    it('name만 있어도 유효하다', () => {
      type Args = PushArgs<StepMap, 'NameStep', 'AgeStep'>;
      const _valid: Args = { name: 'Alice' }; // age는 optional
      expectTypeOf(_valid).toMatchTypeOf<Args>();
    });
  });

  describe('PushArgs — AgeStep → CompleteStep', () => {
    // age: optional→required → 필수
    // name: required→required (동일) → optional (이미 있으니 안 줘도 됨)
    it('age가 필수인 타입이 된다', () => {
      type Args = PushArgs<StepMap, 'AgeStep', 'CompleteStep'>;
      expectTypeOf<Args>().toHaveProperty('age').toEqualTypeOf<number>();
    });

    it('age 없이는 할당 불가하다', () => {
      type Args = PushArgs<StepMap, 'AgeStep', 'CompleteStep'>;
      // @ts-expect-error age가 없으면 타입 에러
      const _invalid: Args = { name: 'Alice' };
    });

    it('age만 있어도 유효하다', () => {
      type Args = PushArgs<StepMap, 'AgeStep', 'CompleteStep'>;
      const _valid: Args = { age: 20 }; // name은 optional
      expectTypeOf(_valid).toMatchTypeOf<Args>();
    });
  });

  describe('PushArgs — 스텝 이름 타입 안전성', () => {
    it('존재하지 않는 스텝 이름은 컴파일 에러이다', () => {
      // @ts-expect-error 'InvalidStep'은 StepMap에 없음
      type _Bad = PushArgs<StepMap, 'NameStep', 'InvalidStep'>;
    });
  });
});
