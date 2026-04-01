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

## use-funnel 연결

```ts
// use-funnel의 typeUtil.ts에서 실제로 사용되는 Prettify
export type Prettify<T> = Omit<T, never>;

// CompareMergeContext의 최종 결과를 읽기 좋게 만들 때 사용
export type CompareMergeContext<TBase, TResult> = Prettify<
  { [K in RequiredKeys]: TResult[K] } &
  { [K in OptionalKeys]?: TBase[K] }
>;
```
