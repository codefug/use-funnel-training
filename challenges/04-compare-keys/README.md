# 04. 두 타입 비교해서 diff 계산하기

## 왜 필요한가?

use-funnel에서 스텝 A → 스텝 B로 이동할 때,
개발자가 `history.push('BStep', { ... })`에 무엇을 넣어야 하는지를 타입으로 알려줘야 한다.

- A에 이미 있는 필드 → 안 넘겨도 됨 (optional)
- B에 새로 필요한 필드 → 반드시 넘겨야 함 (required)

```ts
type CurrentStep = { foo: string; bar?: number };
type TargetStep = { foo: string; bar: number; address: string };

// bar: optional → required로 바뀜 → required 키
// address: 새로 생김 → required 키
// foo: 그대로 → optional 키
type Required = RequiredCompareKeys<CurrentStep, TargetStep>; // 'bar' | 'address'
type Optional = OptionalCompareKeys<CurrentStep, TargetStep>; // 'foo'
```

## 문제

`index.ts`에 `RequiredCompareKeys<TBase, TResult>`와 `OptionalCompareKeys<TBase, TResult>`를 구현하라.

### Required 판별 기준

| 경우                                                           | Required? |
| -------------------------------------------------------------- | --------- |
| TResult에만 있고 required                                      | ✅         |
| TResult에만 있고 optional                                      | ❌         |
| 양쪽에 있고 TBase[K]가 TResult[K]에 할당 불가 (타입 변경)      | ✅         |
| 양쪽에 있고 TBase[K]가 TResult[K]에 할당 가능 (타입 동일/호환) | ❌         |

### Optional 판별 기준

| 경우                      | Optional? |
| ------------------------- | --------- |
| 양쪽에 있고 타입 호환     | ✅         |
| TResult에만 있고 optional | ✅         |
| TBase에만 있는 키         | ✅         |

## 핵심 패턴

```ts
// 모든 키를 순회하며 조건에 따라 never 또는 K를 반환
type SomeKeys<TBase, TResult> = keyof TResult | keyof TBase extends infer K
  ? K extends keyof TResult
    ? K extends keyof TBase
      ? /* 양쪽에 있는 경우 */ TBase[K] extends TResult[K]
        ? never
        : K
      : /* TResult에만 있는 경우 */ undefined extends TResult[K]
        ? never
        : K
    : /* TBase에만 있는 경우 */ K extends keyof TBase
      ? K
      : never
  : never;
```

## 힌트

- `keyof TResult | keyof TBase extends infer K` — 두 타입의 모든 키를 K로 추론
- `undefined extends TResult[K]` — K가 optional인지 확인하는 방법
- `TBase[K] extends TResult[K]` — 타입 호환성 확인

## use-funnel 연결

이 두 유틸리티가 다음 단계(05)의 `CompareMergeContext`를 만드는 재료가 된다.

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

### `RequiredCompareKeys<TBase, TResult>`

```ts
export type RequiredCompareKeys<TBase, TResult> = keyof TResult | keyof TBase extends infer K
  ? K extends keyof TResult
    ? K extends keyof TBase
      ? TBase[K] extends TResult[K]
        ? never // 양쪽에 있고 타입 호환 → optional
        : K // 양쪽에 있지만 타입 변경 → required
      : undefined extends TResult[K]
        ? never // TResult에만 있고 optional → optional
        : K // TResult에만 있고 required → required
    : never // TBase에만 있는 키 → required 아님
  : never;
```

### `OptionalCompareKeys<TBase, TResult>`

```ts
export type OptionalCompareKeys<TBase, TResult> = keyof TBase | keyof TResult extends infer K
  ? K extends keyof TResult
    ? K extends keyof TBase
      ? TBase[K] extends TResult[K]
        ? K // 양쪽에 있고 타입 호환 → optional
        : never // 양쪽에 있지만 타입 변경 → required
      : undefined extends TResult[K]
        ? K // TResult에만 있고 optional → optional
        : never // TResult에만 있고 required → required
    : K extends keyof TBase
      ? K // TBase에만 있는 키 → optional
      : never
  : never;
```

두 타입은 서로 대칭 구조다. `RequiredCompareKeys`에서 `K`를 반환하는 자리가 `OptionalCompareKeys`에서는 `never`가 되고, 그 반대도 마찬가지다.

> use-funnel의 `typeUtil.ts`에서 동일한 구현을 확인할 수 있다.

</details>
