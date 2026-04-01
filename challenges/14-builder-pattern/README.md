# 14. Builder 패턴: createFunnelSteps

## 왜 필요한가?

use-funnel에서 각 스텝마다 "이 스텝에 진입하려면 어떤 context 필드가 있어야 하는지"를
런타임에서도 검증하고 싶다.

타입만으로는 런타임 검증이 안 되므로, `guard` 함수를 각 스텝에 등록해야 한다.
그런데 스텝이 많아지면 guard를 일일이 작성하기 번거롭다.

Builder 패턴으로 체이닝하면서 guard를 누적하면 편리하다.

```ts
const steps = createFunnelSteps<{ name?: string; age?: number; address?: string }>()
  .extends('NameStep')                              // guard 없음 (모두 optional)
  .extends('AgeStep', { requiredKeys: ['name'] })   // name이 있어야 진입 가능
  .extends('AddressStep', { requiredKeys: ['age'] }) // age도 있어야 진입 가능
  .build();

steps.AgeStep.guard({ name: 'Alice' });  // true
steps.AgeStep.guard({});                 // false (name 없음)
```

## 문제

`index.ts`에 `createFunnelSteps<TContext>()` Builder를 구현하라.

### 동작

- `extends(stepName)`: guard 없는 스텝 추가
- `extends(stepName, { requiredKeys: [...] })`: 지정한 키가 모두 있어야 통과하는 guard 추가
- `build()`: `{ [stepName]: { guard: (data: unknown) => boolean } }` 형태의 객체 반환

### guard 체인

각 스텝의 guard는 이전 스텝의 guard를 포함한다.

```ts
// AgeStep의 guard: name이 있어야 함
// AddressStep의 guard: name AND age가 있어야 함 (AgeStep guard 포함)
steps.AddressStep.guard({ name: 'Alice' });           // false (age 없음)
steps.AddressStep.guard({ name: 'Alice', age: 20 });  // true
```

## 힌트

```ts
function createFunnelSteps<TContext>() {
  const stepDefs: Record<string, { guard: (data: unknown) => boolean }> = {};
  let prevGuard: ((data: unknown) => boolean) | null = null;

  const builder = {
    extends(stepName, option?) {
      const currentGuard = option
        ? (data: unknown) => {
            if (typeof data !== 'object' || data === null) return false;
            if (prevGuard && !prevGuard(data)) return false; // 이전 guard 체인
            return option.requiredKeys.every((key) => key in data);
          }
        : prevGuard ?? (() => true);

      stepDefs[stepName] = { guard: currentGuard };
      prevGuard = currentGuard;
      return builder; // 체이닝을 위해 자신을 반환
    },
    build() {
      return stepDefs;
    },
  };

  return builder;
}
```

## use-funnel 연결

```ts
// use-funnel의 실제 createFunnelSteps 사용 예시
const steps = createFunnelSteps<FunnelContext>()
  .extends(['NameStep', 'AgeStep'])
  .extends('AddressStep', { requiredKeys: ['name', 'age'] })
  .extends('CompleteStep', { requiredKeys: ['address'] })
  .build();

const funnel = useFunnel({ steps, initial: { step: 'NameStep', context: {} } });
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```ts
export function createFunnelSteps<TContext>() {
  const stepDefs: Record<string, { guard: (data: unknown) => boolean }> = {};
  let prevGuard: ((data: unknown) => boolean) | null = null;

  const builder = {
    extends(
      stepName: string | string[],
      option?: { requiredKeys: (keyof TContext)[] | keyof TContext },
    ) {
      const steps = Array.isArray(stepName) ? stepName : [stepName];
      let currentGuard: (data: unknown) => boolean;

      if (option) {
        const requiredKeys = Array.isArray(option.requiredKeys)
          ? option.requiredKeys
          : [option.requiredKeys];
        const capturedPrevGuard = prevGuard;
        currentGuard = (data: unknown) => {
          if (typeof data !== 'object' || data === null) return false;
          if (capturedPrevGuard && !capturedPrevGuard(data)) return false;
          return requiredKeys.every((key) => key in (data as object));
        };
      } else {
        currentGuard = prevGuard ?? (() => true);
      }

      for (const name of steps) {
        stepDefs[name] = { guard: currentGuard };
      }
      prevGuard = currentGuard;
      return builder;
    },
    build() {
      return stepDefs;
    },
  };

  return builder;
}
```

핵심은 **guard 체인**이다. 각 스텝의 guard는 이전 스텝의 guard를 클로저로 캡처해서 먼저 실행한다.
`prevGuard`를 누적하면서 체이닝하면 자동으로 "이전 스텝 조건 + 현재 스텝 조건"이 된다.

> use-funnel의 `stepBuilder.ts`에서 `SimpleFunnelStepBuilder` 클래스로 동일하게 구현되어 있다.

</details>
