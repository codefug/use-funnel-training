# 02. Conditional Type + infer로 타입 추출하기

## 왜 필요한가?

라이브러리를 설계할 때 "이 함수의 반환 타입이 뭔지", "이 Promise가 풀리면 어떤 타입인지"를
자동으로 추론해야 할 때가 많다. use-funnel도 내부적으로 이런 추론을 자주 사용한다.

```ts
// FunnelRouter가 반환하는 타입에서 push의 옵션 타입을 추출할 때
type RouterPushOption<T extends FunnelRouter> = FirstArg<ReturnType<T>['push']>;
```

## 문제

`index.ts`에 다음 세 가지 타입 유틸리티를 구현하라.

### 1. `ReturnTypeOf<T>`

함수 타입 `T`의 반환 타입을 추출한다. (내장 `ReturnType<T>`을 직접 구현)

```ts
type Fn = (x: number) => string;
type Result = ReturnTypeOf<Fn>;
// 결과: string
```

### 2. `FirstArg<T>`

함수 타입 `T`의 첫 번째 인자 타입을 추출한다.

```ts
type Fn = (name: string, age: number) => void;
type Result = FirstArg<Fn>;
// 결과: string
```

### 3. `UnwrapPromise<T>`

`Promise<T>`에서 `T`를 추출한다. Promise가 아니면 그대로 반환한다.

```ts
type A = UnwrapPromise<Promise<string>>;  // string
type B = UnwrapPromise<string>;           // string (그대로)
type C = UnwrapPromise<Promise<Promise<number>>>; // Promise<number> (한 겹만 벗김)
```

## 핵심 문법: `infer`

조건부 타입 안에서 타입을 "캡처"하는 키워드다.

```ts
// 예시: 배열의 요소 타입 추출
type ElementType<T> = T extends Array<infer Item> ? Item : never;

type A = ElementType<string[]>;  // string
type B = ElementType<number[]>;  // number
type C = ElementType<string>;    // never (배열이 아니므로)
```

## 힌트

- `T extends (...args: any[]) => infer R` — 함수의 반환 타입 캡처
- `T extends (first: infer F, ...rest: any[]) => any` — 첫 번째 인자 캡처
- `T extends Promise<infer U>` — Promise 내부 타입 캡처

## use-funnel 연결

```ts
// use-funnel에서 TransitionFn의 반환 타입을 추론할 때
type TransitionResult<T extends TransitionFn<any, any, any>> =
  ReturnTypeOf<T> extends Promise<infer S> ? S : never;
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

### `ReturnTypeOf<T>`

```ts
export type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;
```

### `FirstArg<T>`

```ts
export type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
```

### `UnwrapPromise<T>`

```ts
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
```

세 가지 모두 `T extends 패턴 ? infer로_캡처 : never` 구조다.
`UnwrapPromise`는 Promise가 아닐 때 `never`가 아닌 `T`를 반환하는 점에 주의한다.

</details>
