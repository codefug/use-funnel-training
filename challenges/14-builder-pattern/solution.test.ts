import { describe, expect, it } from 'vitest';
import { createFunnelSteps } from './index';

type FunnelContext = {
  name?: string;
  age?: number;
  address?: string;
};

describe('14. Builder Pattern: createFunnelSteps', () => {
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

      expect(steps.NameStep?.guard({})).toBe(true);
      expect(steps.NameStep?.guard({ name: 'Alice' })).toBe(true);
    });

    it('null/undefined는 통과하지 못한다', () => {
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .build();

      expect(steps.NameStep?.guard(null)).toBe(false);
      expect(steps.NameStep?.guard(undefined)).toBe(false);
    });
  });

  describe('requiredKeys가 있는 스텝', () => {
    it('필수 키가 있으면 통과한다', () => {
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .extends('AgeStep', { requiredKeys: ['name'] })
        .build();

      expect(steps.AgeStep?.guard({ name: 'Alice' })).toBe(true);
      expect(steps.AgeStep?.guard({ name: 'Alice', age: 20 })).toBe(true);
    });

    it('필수 키가 없으면 통과하지 못한다', () => {
      const steps = createFunnelSteps<FunnelContext>()
        .extends('NameStep')
        .extends('AgeStep', { requiredKeys: ['name'] })
        .build();

      expect(steps.AgeStep?.guard({})).toBe(false);
      expect(steps.AgeStep?.guard({ age: 20 })).toBe(false);
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
      expect(steps.AddressStep?.guard({ name: 'Alice', age: 20 })).toBe(true);
      expect(steps.AddressStep?.guard({ name: 'Alice' })).toBe(false); // age 없음
      expect(steps.AddressStep?.guard({ age: 20 })).toBe(false); // name 없음
      expect(steps.AddressStep?.guard({})).toBe(false);
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
        steps.CompleteStep?.guard({ name: 'Alice', age: 20, address: '서울' }),
      ).toBe(true);
      expect(
        steps.CompleteStep?.guard({ name: 'Alice', age: 20 }),
      ).toBe(false);
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

      // 같은 builder 객체이거나 체이닝 가능한 객체여야 함
      expect(typeof result.extends).toBe('function');
      expect(typeof result.build).toBe('function');
    });
  });
});
