# 01. Mapped Type으로 객체 타입 변환하기

## 왜 필요한가?

use-funnel은 내부에서 교차 타입(`A & B`)을 많이 사용한다.
그런데 TypeScript에서 교차 타입을 그대로 두면 IDE에서 이렇게 보인다:

```ts
// 보기 불편한 교차 타입
type Ugly = { name: string } & { age: number };
// 호버하면: { name: string } & { age: number }

// Prettify로 펼치면
type Pretty = Prettify<Ugly>;
// 호버하면: { name: string; age: number }
```

또한 특정 키만 필수/옵셔널로 바꾸는 유틸리티 타입도 자주 필요하다.
예를 들어 `{ name?: string; age?: number }`에서 `name`만 필수로 만들고 싶을 때.

## 문제

`index.ts`에 다음 세 가지 타입 유틸리티를 구현하라.

### 1. `Prettify<T>`

교차 타입을 단일 객체 타입으로 펼친다.

```ts
type Result = Prettify<{ a: string } & { b: number }>;
// 결과: { a: string; b: number }
```

### 2. `MakeRequired<T, K extends keyof T>`

`T`에서 `K`에 해당하는 키만 필수(required)로 바꾼다.

```ts
type Base = { name?: string; age?: number; address?: string };
type Result = MakeRequired<Base, 'name' | 'age'>;
// 결과: { name: string; age: number; address?: string }
```

### 3. `MakeOptional<T, K extends keyof T>`

`T`에서 `K`에 해당하는 키만 옵셔널로 바꾼다.

```ts
type Base = { name: string; age: number; address: string };
type Result = MakeOptional<Base, 'address'>;
// 결과: { name: string; age: number; address?: string }
```

## 힌트

- Mapped Type: `{ [K in keyof T]: T[K] }`
- `Omit<T, K>` + `Pick<T, K>`를 조합하면 특정 키만 변환할 수 있다
- `Required<T>`, `Partial<T>`는 전체 키에 적용되지만, 특정 키만 적용하려면 직접 만들어야 한다

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

### `Prettify<T>`

```ts
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
```

> use-funnel은 `Omit<T, never>`를 사용한다. `Omit`이 내부적으로 mapped type을 거치기 때문에 교차 타입이 펼쳐지는 동일한 효과가 있다.
>
> ```ts
> export type Prettify<T> = Omit<T, never>;
> ```

---

### `MakeRequired<T, K>`

```ts
export type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
```

- `Omit<T, K>`: K를 제외한 나머지 키를 그대로 유지
- `Required<Pick<T, K>>`: K에 해당하는 키만 꺼내서 필수로 변환
- 두 결과를 교차 타입(`&`)으로 합침

> use-funnel에서는 `PickRequired<T, K>`라는 이름으로 동일한 패턴을 사용한다.
>
> ```ts
> type PickRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
> ```

---

### `MakeOptional<T, K>`

```ts
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

- `Omit<T, K>`: K를 제외한 나머지 키를 그대로 유지
- `Partial<Pick<T, K>>`: K에 해당하는 키만 꺼내서 옵셔널로 변환
- 두 결과를 교차 타입(`&`)으로 합침

</details>

## use-funnel 연결

```ts
// use-funnel의 typeUtil.ts에서 실제로 사용되는 Prettify
export type Prettify<T> = Omit<T, never>;

// PickRequired: MakeRequired와 동일한 패턴
type PickRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// CompareMergeContext의 최종 결과를 읽기 좋게 만들 때 사용
export type CompareMergeContext<TBase, TResult> = Prettify<
  { [K in RequiredCompareKeys<TBase, TResult>]: TResult[K] } &
  { [K in OptionalCompareKeys<TBase, TResult>]?: TBase[K] }
>;
```
