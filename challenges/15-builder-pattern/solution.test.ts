import { describe, expect, it, vi } from 'vitest';
import { createFunnelSteps } from './index';

type FunnelContext = {
  name?: string;
  age?: number;
  address?: string;
};

describe('15. Builder Pattern: createFunnelSteps', () => {
  describe('extends + build 기본 동작', () => {
    it('extends한 스텝 이름으로 키가 생성된다', () => {
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .extends('AgeStep')
        .build();

      expect('NameStep' in steps).toBe(true);
      expect('AgeStep' in steps).toBe(true);
    });

    it('각 스텝에 guard 함수가 있다', () => {
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .build();

      expect(typeof steps.NameStep?.guard).toBe('function');
    });
  });

  describe('guard 없는 스텝', () => {
    it('어떤 객체도 통과한다', () => {
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .build();

      expect(steps.NameStep?.guard?.({})).toBe(true);
      expect(steps.NameStep?.guard?.({ name: 'Alice' })).toBe(true);
    });

    it('null/undefined는 통과하지 못한다', () => {
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .build();

      expect(steps.NameStep?.guard?.(null)).toBe(false);
      expect(steps.NameStep?.guard?.(undefined)).toBe(false);
    });
  });

  describe('requiredKeys가 있는 스텝', () => {
    it('필수 키가 있으면 통과한다', () => {
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .extends('AgeStep', { requiredKeys: ['name'] })
        .build();

      expect(steps.AgeStep?.guard?.({ name: 'Alice' })).toBe(true);
      expect(steps.AgeStep?.guard?.({ name: 'Alice', age: 20 })).toBe(true);
    });

    it('필수 키가 없으면 통과하지 못한다', () => {
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .extends('AgeStep', { requiredKeys: ['name'] })
        .build();

      expect(steps.AgeStep?.guard?.({})).toBe(false);
      expect(steps.AgeStep?.guard?.({ age: 20 })).toBe(false);
    });
  });

  describe('guard 체인 누적', () => {
    it('이전 스텝의 guard가 누적된다', () => {
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .extends('AgeStep', { requiredKeys: ['name'] })
        .extends('AddressStep', { requiredKeys: ['age'] })
        .build();

      // AddressStep: name AND age 모두 필요
      expect(steps.AddressStep?.guard?.({ name: 'Alice', age: 20 })).toBe(true);
      expect(steps.AddressStep?.guard?.({ name: 'Alice' })).toBe(false); // age 없음
      expect(steps.AddressStep?.guard?.({ age: 20 })).toBe(false); // name 없음
      expect(steps.AddressStep?.guard?.({})).toBe(false);
    });

    it('세 단계 누적도 동작한다', () => {
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .extends('AgeStep', { requiredKeys: ['name'] })
        .extends('AddressStep', { requiredKeys: ['age'] })
        .extends('CompleteStep', { requiredKeys: ['address'] })
        .build();

      // CompleteStep: name, age, address 모두 필요
      expect(
        steps.CompleteStep?.guard?.({ name: 'Alice', age: 20, address: '서울' }),
      ).toBe(true);
      expect(
        steps.CompleteStep?.guard?.({ name: 'Alice', age: 20 }),
      ).toBe(false);
    });
  });

  describe('parse 옵션', () => {
    it('parse를 지정하면 parse가 StepOption에 포함된다', () => {
      const parseFn = vi.fn((ctx: unknown) => ctx as Record<string, unknown>);
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .extends('BStep', { parse: parseFn })
        .build();

      expect(typeof steps.BStep?.parse).toBe('function');
    });

    it('parse 함수가 반환한 값이 그대로 전달된다', () => {
      const parsed = { name: 'Alice', age: 20 };
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .extends('BStep', { parse: () => parsed })
        .build();

      expect(steps.BStep?.parse?.({})).toEqual(parsed);
    });
  });

  describe('배열로 여러 스텝 한 번에 추가', () => {
    it('배열로 전달하면 같은 guard를 가진 여러 스텝이 생성된다', () => {
      const steps = createFunnelSteps<FunnelContext>()
        .extends(['NameStep', 'AgeStep'])
        .build();

      expect('NameStep' in steps).toBe(true);
      expect('AgeStep' in steps).toBe(true);
    });
  });

  describe('체이닝', () => {
    it('extends는 builder 자신을 반환해서 체이닝이 가능하다', () => {
      const builder = createFunnelSteps<FunnelContext>();
      const result = builder.extends('NameStep');

      expect(typeof result.extends).toBe('function');
      expect(typeof result.build).toBe('function');
    });
  });

  describe('build() 결과 타입', () => {
    it('build() 결과는 Record<string, StepOption> 형태이다', () => {
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .extends('AgeStep', { requiredKeys: ['name'] })
        .build();

      // StepOption = { guard?, parse? }
      // 20단계의 parseStepContext에 바로 전달 가능한 형태
      expect(typeof steps).toBe('object');
      expect(steps.NameStep).toBeDefined();
      expect(steps.AgeStep).toBeDefined();
    });
  });
});
