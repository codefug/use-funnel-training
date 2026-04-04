# 16. 타입 안전한 스텝 전환

## 왜 필요한가?

지금까지 만든 useFunnel은 `step`이 `string`이고 `context`가 `Record<string, unknown>`이다.
타입 정보가 없으니 실수해도 TypeScript가 잡아주지 못한다.

```ts
// ❌ 타입 없는 버전 — 틀려도 에러가 안 남
funnel.history.push('AgeStep', { naem: 'Alice' }); // 오타! 하지만 에러 없음
```

01~05단계에서 만든 타입 유틸리티(`StepMapToUnion`, `CompareMergeContext`)를 사용하면
스텝 이름과 context가 완전히 타입 안전해진다.

```ts
// ✅ 타입 있는 버전 — 오타는 즉시 컴파일 에러
funnel.history.push('AgeStep', { naem: 'Alice' }); // ❌ 'naem' doesn't exist
funnel.history.push('AgeStep', { name: 'Alice' }); // ✅
```

## 핵심 아이디어

`StepMap`이 다음과 같을 때:

```ts
type StepMap = {
  NameStep: { name?: string };
  AgeStep:  { name: string; age?: number };
};
```

- **현재 스텝이 `NameStep`이면** `context`는 `{ name?: string }`으로 좁혀진다
- **`AgeStep`으로 push할 때** 필요한 최소 입력은 `{ name: string }`
  (name이 optional → required로 바뀌므로 반드시 제공해야 함)

이 "최소 입력 타입"이 바로 05단계에서 만든 `CompareMergeContext<From, To>`다.

```ts
// NameStep → AgeStep: name이 optional→required이므로 { name: string } 필수
type Args = CompareMergeContext<{ name?: string }, { name: string; age?: number }>;
// 결과: { name: string; age?: number } — name 필수, age는 선택
```

## 문제

`index.ts`에 두 가지 타입 유틸리티를 구현하라.

### 1. `AnyFunnelState`

런타임에서 라우터가 주고받는 untyped 퍼널 상태.

```ts
export type AnyFunnelState = {
  step: string;
  context: Record<string, unknown>;
};
```

> **주의:** 03단계의 `FunnelState<TStepMap>`은 컴파일 타임 타입 안전성을 위한 것이고,
> `AnyFunnelState`는 라우터/히스토리 배열 등 런타임에서 실제로 쓰이는 untyped 버전이다.

### 2. `PushArgs<TStepMap, TFrom, TTo>`

현재 스텝 `TFrom`에서 목표 스텝 `TTo`로 push할 때 개발자가 제공해야 하는 최소 context 타입.

```ts
type StepMap = {
  NameStep: { name?: string };
  AgeStep:  { name: string; age?: number };
  CompleteStep: { name: string; age: number };
};

// NameStep → AgeStep: name 필수
type T1 = PushArgs<StepMap, 'NameStep', 'AgeStep'>;
// 결과: { name: string; age?: number }

// AgeStep → CompleteStep: age 필수
type T2 = PushArgs<StepMap, 'AgeStep', 'CompleteStep'>;
// 결과: { age: number; name?: string }
```

### 시그니처

```ts
export type PushArgs<
  TStepMap extends Record<string, Record<string, unknown>>,
  TFrom extends keyof TStepMap,
  TTo extends keyof TStepMap,
> = CompareMergeContext<TStepMap[TFrom], TStepMap[TTo]>;
```

## 힌트

- `CompareMergeContext<A, B>`는 05단계에서 만들었다: `@challenges/05-compare-merge-context`
- `PushArgs`는 단 한 줄의 type alias로 구현 가능하다

## use-funnel 연결

21단계의 최종 useFunnel은 `PushArgs`를 사용해서 `history.push`를 타입 안전하게 만든다.

```ts
// 타입 안전한 push: To 스텝에 필요한 context만 정확히 요구
history.push<'AgeStep'>(
  'AgeStep',
  { name: 'Alice' } // PushArgs<StepMap, CurrentStep, 'AgeStep'>
);
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```ts
import type { CompareMergeContext } from '@challenges/05-compare-merge-context';

export type AnyFunnelState = {
  step: string;
  context: Record<string, unknown>;
};

export type PushArgs<
  TStepMap extends Record<string, Record<string, unknown>>,
  TFrom extends keyof TStepMap,
  TTo extends keyof TStepMap,
> = CompareMergeContext<TStepMap[TFrom], TStepMap[TTo]>;
```

`PushArgs`는 `CompareMergeContext`의 얇은 래퍼다.
중요한 것은 `TFrom`, `TTo`가 `TStepMap`의 key임을 제약해서
존재하지 않는 스텝 이름을 쓰면 컴파일 에러가 나도록 하는 것이다.

</details>
