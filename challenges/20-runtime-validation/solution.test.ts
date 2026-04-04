import { describe, expect, it } from 'vitest';
import { parseStepContext } from './index';
import type { FunnelState } from './index';
import { createFunnelSteps } from '../15-builder-pattern/index';

const initialState: FunnelState = { step: 'AStep', context: {} };

describe('20. Runtime Validation', () => {
  describe('stepOptions가 없는 경우', () => {
    it('옵션이 없으면 그대로 반환한다', () => {
      const result = parseStepContext('BStep', { name: 'Alice' }, {}, initialState);
      expect(result).toEqual({ step: 'BStep', context: { name: 'Alice' } });
    });

    it('해당 스텝의 옵션이 없으면 그대로 반환한다', () => {
      const result = parseStepContext(
        'BStep',
        { name: 'Alice' },
        { AStep: { guard: () => true } }, // BStep 옵션 없음
        initialState,
      );
      expect(result).toEqual({ step: 'BStep', context: { name: 'Alice' } });
    });
  });

  describe('guard 검증', () => {
    it('guard가 true를 반환하면 통과한다', () => {
      const result = parseStepContext(
        'BStep',
        { name: 'Alice' },
        { BStep: { guard: (ctx) => typeof ctx === 'object' && ctx !== null && 'name' in ctx } },
        initialState,
      );
      expect(result).toEqual({ step: 'BStep', context: { name: 'Alice' } });
    });

    it('guard가 false를 반환하면 initialState로 폴백한다', () => {
      const result = parseStepContext(
        'BStep',
        {}, // name이 없음
        { BStep: { guard: (ctx) => typeof ctx === 'object' && ctx !== null && 'name' in ctx } },
        initialState,
      );
      expect(result).toEqual(initialState);
    });

    it('null context는 guard에서 false 처리된다', () => {
      const result = parseStepContext(
        'BStep',
        null,
        { BStep: { guard: (ctx) => ctx !== null } },
        initialState,
      );
      expect(result).toEqual(initialState);
    });
  });

  describe('parse 검증', () => {
    it('parse가 성공하면 파싱된 context를 사용한다', () => {
      const result = parseStepContext(
        'BStep',
        { name: 'Alice', extra: 'ignored' },
        {
          BStep: {
            parse: (ctx) => {
              const obj = ctx as Record<string, unknown>;
              if (!obj.name) throw new Error('name required');
              return { name: obj.name }; // extra 필드 제거
            },
          },
        },
        initialState,
      );
      expect(result).toEqual({ step: 'BStep', context: { name: 'Alice' } });
    });

    it('parse가 에러를 throw하면 initialState로 폴백한다', () => {
      const result = parseStepContext(
        'BStep',
        {},
        {
          BStep: {
            parse: (ctx) => {
              const obj = ctx as Record<string, unknown>;
              if (!obj.name) throw new Error('name required');
              return obj as Record<string, unknown>;
            },
          },
        },
        initialState,
      );
      expect(result).toEqual(initialState);
    });
  });

  describe('실제 시나리오', () => {
    it('회원가입 퍼널: 각 스텝의 guard가 올바르게 동작한다', () => {
      const stepOptions = {
        NameStep: { guard: () => true },
        AgeStep: { guard: (ctx: unknown) => typeof ctx === 'object' && ctx !== null && 'name' in ctx },
        CompleteStep: {
          guard: (ctx: unknown) =>
            typeof ctx === 'object' &&
            ctx !== null &&
            'name' in ctx &&
            'age' in ctx,
        },
      };

      // 정상 케이스
      expect(
        parseStepContext('AgeStep', { name: 'Alice' }, stepOptions, initialState),
      ).toEqual({ step: 'AgeStep', context: { name: 'Alice' } });

      // 폴백 케이스 (name 없이 AgeStep 접근)
      expect(
        parseStepContext('AgeStep', {}, stepOptions, initialState),
      ).toEqual(initialState);

      // 폴백 케이스 (age 없이 CompleteStep 접근)
      expect(
        parseStepContext('CompleteStep', { name: 'Alice' }, stepOptions, initialState),
      ).toEqual(initialState);
    });
  });

  describe('15단계 Builder 연동', () => {
    it('createFunnelSteps의 build() 결과를 바로 전달할 수 있다', () => {
      // createFunnelSteps가 반환하는 Record<string, StepOption>을
      // parseStepContext에 그대로 전달할 수 있어야 한다
      const steps = createFunnelSteps<{ name?: string; age?: number }>()
        .extends('NameStep')
        .extends('AgeStep', { requiredKeys: ['name'] })
        .build();

      // guard 실패 → 폴백
      expect(
        parseStepContext('AgeStep', {}, steps, initialState),
      ).toEqual(initialState);

      // guard 통과
      expect(
        parseStepContext('AgeStep', { name: 'Alice' }, steps, initialState),
      ).toEqual({ step: 'AgeStep', context: { name: 'Alice' } });
    });

    it('Builder의 guard 체인이 parseStepContext에서 올바르게 동작한다', () => {
      const steps = createFunnelSteps<{ name?: string; age?: number; address?: string }>()
        .extends('NameStep')
        .extends('AgeStep', { requiredKeys: ['name'] })
        .extends('AddressStep', { requiredKeys: ['age'] })
        .build();

      // AddressStep: name AND age 모두 필요
      expect(
        parseStepContext('AddressStep', { name: 'Alice', age: 20 }, steps, initialState),
      ).toEqual({ step: 'AddressStep', context: { name: 'Alice', age: 20 } });

      expect(
        parseStepContext('AddressStep', { name: 'Alice' }, steps, initialState),
      ).toEqual(initialState); // age 없음 → 폴백
    });
  });
});
