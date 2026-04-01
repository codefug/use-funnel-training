import { describe, expect, expectTypeOf, it } from 'vitest';
import type { FunnelState, StepMapToUnion } from './index';

type SimpleStepMap = {
  AStep: { foo?: string };
  BStep: { foo: string; bar?: string };
  CStep: { foo: string; bar: string };
};

describe('03. Discriminated Union', () => {
  describe('StepMapToUnion<TStepMap>', () => {
    it('각 스텝을 { step, context } 형태의 유니온으로 변환한다', () => {
      type Result = StepMapToUnion<SimpleStepMap>;

      expectTypeOf<Result>().toEqualTypeOf<
        | { step: 'AStep'; context: { foo?: string } }
        | { step: 'BStep'; context: { foo: string; bar?: string } }
        | { step: 'CStep'; context: { foo: string; bar: string } }
      >();
    });

    it('스텝이 하나인 경우도 동작한다', () => {
      type SingleStep = { OnlyStep: { value: number } };
      type Result = StepMapToUnion<SingleStep>;

      expectTypeOf<Result>().toEqualTypeOf<{
        step: 'OnlyStep';
        context: { value: number };
      }>();
    });
  });

  describe('FunnelState를 switch로 타입 좁히기', () => {
    it('step으로 switch하면 context 타입이 좁혀진다', () => {
      type State = FunnelState<SimpleStepMap>;

      // 타입 좁히기가 올바르게 동작하는지 검증
      function processState(state: State) {
        switch (state.step) {
          case 'AStep':
            // AStep의 context 타입으로 좁혀져야 함
            expectTypeOf(state.context).toEqualTypeOf<{ foo?: string }>();
            break;
          case 'BStep':
            expectTypeOf(state.context).toEqualTypeOf<{ foo: string; bar?: string }>();
            break;
          case 'CStep':
            expectTypeOf(state.context).toEqualTypeOf<{ foo: string; bar: string }>();
            break;
        }
      }

      // 함수가 정의되었는지 확인 (런타임 검증)
      expect(typeof processState).toBe('function');
    });

    it('FunnelState는 StepMapToUnion과 동일한 타입이다', () => {
      type A = StepMapToUnion<SimpleStepMap>;
      type B = FunnelState<SimpleStepMap>;

      expectTypeOf<A>().toEqualTypeOf<B>();
    });
  });
});
