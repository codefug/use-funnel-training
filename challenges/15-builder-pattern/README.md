# 15. Builder 패턴: createFunnelSteps

## 왜 필요한가?

use-funnel에서 각 스텝마다 "이 스텝에 진입하려면 어떤 context 필드가 있어야 하는지"를
런타임에서도 검증하고 싶다.

타입만으로는 런타임 검증이 안 되므로, `guard` 또는 `parse` 함수를 각 스텝에 등록해야 한다.
그런데 스텝이 많아지면 일일이 작성하기 번거롭다.

Builder 패턴으로 체이닝하면서 옵션을 누적하면 편리하다.

```ts
const steps = createFunnelSteps<{ name?: string; age?: number; address?: string }>()
  .extends('NameStep')                                 // 베이스 null 체크만
  .extends('AgeStep',     { requiredKeys: 'name' })   // name이 있어야 진입 (문자열 하나도 가능)
  .extends('AddressStep', { requiredKeys: ['age'] })  // age도 있어야 진입
  .extends('PayStep',     { parse: PaySchema.parse }) // Zod 파싱으로 검증
  .build();

// build() 결과: Record<string, StepOption>
// → 20단계의 parseStepContext에 바로 전달 가능!
```

## 문제

`index.ts`에 `createFunnelSteps<TContext>()` Builder를 구현하라.

### 출력 타입

```ts
export type StepOption = {
  guard?: (context: unknown) => boolean;
  parse?: (context: unknown) => Record<string, unknown>;
};

build(): Record<string, StepOption>
```

`StepOption`은 20단계의 `parseStepContext`가 받는 타입과 동일하다.

### extends 옵션

```ts
.extends(stepName: string | string[], option?: {
  requiredKeys?: keyof TContext | (keyof TContext)[];  // 문자열 하나 or 배열 모두 허용
  parse?: (context: unknown) => Record<string, unknown>;
  guard?: (context: unknown) => boolean;              // guard를 직접 주입할 수도 있음
})
```

- `requiredKeys` → 해당 키들이 모두 있는지 확인하는 `guard` 생성
- `parse` → `parse` 함수를 등록. guard와 함께 사용 가능
- `guard` → 커스텀 guard 함수를 직접 주입
- 셋 다 없음 → 베이스 null/undefined 체크 guard

### guard와 parse 동시 사용

실제 `@use-funnel` 라이브러리와 동일하게, **guard와 parse를 같은 스텝에 함께 등록할 수 있다.**

둘 다 있을 때 실행 순서: `guard` 먼저 → 통과하면 `parse` 실행.

```ts
.extends('PayStep', {
  requiredKeys: ['name'],
  parse: (ctx) => PaySchema.parse(ctx), // guard + parse 동시 등록
})
```

### guard 체인

각 스텝의 guard는 이전 스텝의 guard를 포함한다.

```ts
// AgeStep의 guard: null 체크 + name 존재 확인
// AddressStep의 guard: AgeStep guard 체인 + age 존재 확인
steps.AddressStep.guard?.({ name: 'Alice' });          // false (age 없음)
steps.AddressStep.guard?.({ name: 'Alice', age: 20 }); // true
```

### 모든 guard에 포함되는 베이스 체크

`null`, `undefined`, 비객체 값은 requiredKeys 지정 여부와 무관하게 항상 실패한다.

```ts
steps.NameStep.guard?.(null);      // false
steps.NameStep.guard?.(undefined); // false
steps.NameStep.guard?.({});        // true (NameStep은 requiredKeys 없음)
```

## 힌트

```ts
export function createFunnelSteps<TContext>() {
  const result: Record<string, StepOption> = {};
  let prevGuard: ((data: unknown) => boolean) | null = null;

  const baseGuard = (data: unknown) =>
    typeof data === 'object' && data !== null;

  const builder = {
    extends(stepName, option?) {
      const steps = Array.isArray(stepName) ? stepName : [stepName];
      const capturedPrev = prevGuard;

      // requiredKeys를 항상 배열로 정규화
      const requiredKeys = option?.requiredKeys
        ? Array.isArray(option.requiredKeys) ? option.requiredKeys : [option.requiredKeys]
        : [];

      // guard는 항상 생성: baseGuard → capturedPrev → requiredKeys → 직접 주입 guard 순으로 체크
      const currentGuard = (data: unknown) => {
        if (!baseGuard(data)) return false;
        if (capturedPrev && !capturedPrev(data)) return false;
        if (requiredKeys.length > 0 && !requiredKeys.every((key) => key in (data as object))) return false;
        if (option?.guard && !option.guard(data)) return false;
        return true;
      };

      for (const name of steps) {
        // guard + parse 동시 등록 가능
        result[name] = {
          guard: currentGuard,
          ...(option?.parse ? { parse: option.parse } : {}),
        };
      }
      prevGuard = currentGuard;
      return builder;
    },
    build() {
      return result;
    },
  };

  return builder;
}
```

## use-funnel 연결

```ts
// build() 결과를 20단계 parseStepContext에 바로 전달
import { createFunnelSteps } from '../15-builder-pattern';
import { parseStepContext } from '../20-runtime-validation';

const steps = createFunnelSteps<{ name?: string; age?: number }>()
  .extends('NameStep')
  .extends('AgeStep', { requiredKeys: 'name' }) // 문자열 하나도 OK
  .build();

// AgeStep 진입 시 name이 없으면 초기 상태로 폴백
parseStepContext('AgeStep', {}, steps, initial);                // → initial
parseStepContext('AgeStep', { name: 'Alice' }, steps, initial); // → { step: 'AgeStep', ... }
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```ts
export function createFunnelSteps<TContext extends Record<string, unknown>>(): Builder<TContext> {
  const result: Record<string, StepOption> = {};
  let prevGuard: ((data: unknown) => boolean) | null = null;

  const baseGuard = (data: unknown): boolean =>
    typeof data === 'object' && data !== null;

  const builder: Builder<TContext> = {
    extends(stepName, option?) {
      const steps = Array.isArray(stepName) ? stepName : [stepName];
      const capturedPrev = prevGuard;

      const requiredKeys: (keyof TContext)[] = option?.requiredKeys
        ? Array.isArray(option.requiredKeys)
          ? option.requiredKeys
          : [option.requiredKeys]
        : [];

      const currentGuard: (data: unknown) => boolean = (data) => {
        if (!baseGuard(data)) return false;
        if (capturedPrev && !capturedPrev(data)) return false;
        if (requiredKeys.length > 0 && !requiredKeys.every((key) => key in (data as object))) return false;
        if (option?.guard && !option.guard(data)) return false;
        return true;
      };

      for (const name of steps) {
        result[name] = {
          guard: currentGuard,
          ...(option?.parse ? { parse: option.parse } : {}),
        };
      }
      prevGuard = currentGuard;

      return builder;
    },
    build() {
      return result;
    },
  };

  return builder;
}
```

핵심은 세 가지다:
1. **guard 체인**: `capturedPrev`를 클로저로 캡처해서 이전 guard를 포함한 새 guard를 만든다
2. **guard + parse 동시 등록**: 실제 `@use-funnel`처럼 둘 다 있으면 함께 저장한다
3. **requiredKeys 정규화**: 문자열 하나를 넘겨도 배열로 통일해서 처리한다

`StepOption`을 export하기 때문에 20단계의 `parseStepContext`가 이 타입을 그대로 import해서 사용한다.

</details>
