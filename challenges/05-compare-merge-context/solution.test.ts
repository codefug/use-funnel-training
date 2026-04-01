import { describe, expectTypeOf, it } from 'vitest';
import type { CompareMergeContext } from './index';

describe('05. CompareMergeContext', () => {
  it('새로 생긴 required 필드는 required로 요구한다', () => {
    type Base = { foo: string };
    type Target = { foo: string; bar: string };

    type Result = CompareMergeContext<Base, Target>;
    // bar가 새로 생겼고 required → required
    // foo는 이미 있고 타입 동일 → optional
    expectTypeOf<Result>().toEqualTypeOf<{ bar: string; foo?: string }>();
  });

  it('optional에서 required로 바뀐 필드는 required로 요구한다', () => {
    type Base = { foo: string; bar?: number };
    type Target = { foo: string; bar: number };

    type Result = CompareMergeContext<Base, Target>;
    // bar가 optional → required로 바뀜 → required
    // foo는 그대로 → optional
    expectTypeOf<Result>().toEqualTypeOf<{ bar: number; foo?: string }>();
  });

  it('use-funnel 문서의 핵심 예시를 통과한다', () => {
    // use-funnel 분석 문서의 실제 예시
    type CurrentStep = { foo: string; bar?: string };
    type TargetStep = { foo: string; bar: string };

    type Result = CompareMergeContext<CurrentStep, TargetStep>;
    // foo: 이미 있고 타입 동일 → optional
    // bar: optional → required → required
    expectTypeOf<Result>().toEqualTypeOf<{ bar: string; foo?: string }>();
  });

  it('모든 필드가 이미 있으면 모두 optional이다', () => {
    type Base = { foo: string; bar: number };
    type Target = { foo: string; bar: number };

    type Result = CompareMergeContext<Base, Target>;
    expectTypeOf<Result>().toEqualTypeOf<{ foo?: string; bar?: number }>();
  });

  it('여러 새 필드가 동시에 required인 경우', () => {
    type Base = { name?: string };
    type Target = { name: string; age: number; address: string };

    type Result = CompareMergeContext<Base, Target>;
    // name: optional → required
    // age, address: 새로 생김 → required
    expectTypeOf<Result>().toEqualTypeOf<{
      name: string;
      age: number;
      address: string;
    }>();
  });

  it('새로 생겼지만 optional인 필드는 optional이다', () => {
    type Base = { foo: string };
    type Target = { foo: string; bar?: string };

    type Result = CompareMergeContext<Base, Target>;
    // bar는 새로 생겼지만 optional → optional
    // foo는 이미 있음 → optional
    expectTypeOf<Result>().toEqualTypeOf<{ foo?: string; bar?: string }>();
  });
});
