# 05. CompareMergeContext 완성

## 왜 필요한가?

04단계에서 만든 `RequiredCompareKeys`와 `OptionalCompareKeys`를 조합해서,
"스텝 전환 시 개발자가 넘겨야 하는 최소한의 객체 타입"을 만든다.

```ts
type CurrentStep = { foo: string; bar?: number };
type TargetStep  = { foo: string; bar: number; address: string };

type Input = CompareMergeContext<CurrentStep, TargetStep>;
// 결과: { bar: number; address: string; foo?: string }
// → bar: optional→required 변경 → required
// → address: 새 필드 → required
// → foo: 이미 있고 타입 동일 → optional (안 넘겨도 현재 값 유지)
```

이 타입 덕분에 use-funnel에서 `history.push('TargetStep', { bar: 1, address: '서울' })`처럼
꼭 필요한 것만 넘기면 되고, 이미 있는 필드는 생략할 수 있다.

## 문제

`index.ts`에 `CompareMergeContext<TBase, TResult>`를 구현하라.

04단계에서 만든 `RequiredCompareKeys`와 `OptionalCompareKeys`를 **직접 import해서 사용**하면 된다.

```ts
import type { OptionalCompareKeys, RequiredCompareKeys } from '../04-compare-keys/index';
```

### 완성된 타입의 구조

```ts
type CompareMergeContext<TBase, TResult> = Prettify<
  // RequiredCompareKeys에 해당하는 키들은 required
  { [K in RequiredCompareKeys<TBase, TResult>]: TResult[K] } &
  // OptionalCompareKeys에 해당하는 키들은 optional
  { [K in OptionalCompareKeys<TBase, TResult>]?: TBase[K] }
>;
```

## 핵심 개념 상세 설명

### 1. 왜 두 개의 Mapped Type을 `&` 교차로 합치나?

```ts
type CompareMergeContext<TBase, TResult> = Prettify<
  { [K in RequiredCompareKeys<...>]: ... }  // required 속성들
  &
  { [K in OptionalCompareKeys<...>]?: ... } // optional 속성들
>;
```

TypeScript에서 **required 속성**과 **optional 속성(`?:`)** 을 하나의 Mapped Type 안에서 동시에 표현할 수 없다.
키마다 `required`/`optional`을 다르게 줄 방법이 없기 때문에, 두 그룹을 별도 Mapped Type으로 만든 뒤 `&`로 합치는 것이다.

```ts
// 이렇게는 불가능 (키마다 조건부로 ?를 붙일 수 없음)
type X = { [K in Keys]: K extends RequiredKeys ? Value : Value? }  // ❌ 문법 오류
```

### 2. Required 키에 왜 `TResult[K]`를 쓰고, Optional 키에는 `TBase[K]`를 쓰나?

**Required 키** = "현재 스텝에 없거나, 타입이 바뀐" 필드 → 개발자가 **새 값을 직접 넘겨야** 함
→ 넘겨야 할 타입은 `TResult`(목표 스텝)의 타입

```ts
// bar: number | undefined → number 로 좁혀짐 → 개발자가 number를 줘야 함
// address: 아예 없던 필드 → 개발자가 string을 줘야 함
{ bar: number; address: string }  // TResult[K] 사용
```

**Optional 키** = "이미 현재 스텝에 있고 타입도 호환되는" 필드 → **기존 값을 그대로 유지해도** 됨
→ 생략하면 현재 값을 그대로 쓰므로, 타입 힌트는 `TBase`(현재 스텝)의 타입을 제공

```ts
// foo: 이미 string이고 Target도 string → 안 넘겨도 현재 'hello'가 유지됨
{ foo?: string }  // TBase[K] 사용
```

### 3. `K extends keyof TResult ? TResult[K] : ...` — 왜 이런 조건식이 필요한가?

`RequiredCompareKeys<TBase, TResult>`가 반환하는 키들은 논리적으로 `keyof TResult`의 부분집합이다.
하지만 TypeScript 컴파일러는 이를 **보장하지 못한다** (타입 추론의 한계).

그래서 직접 `TResult[K]`를 쓰면 에러가 발생한다:

```ts
// ❌ 컴파일러: "K가 keyof TResult라는 보장이 없어요"
{ [K in RequiredCompareKeys<TBase, TResult>]: TResult[K] }
```

`K extends keyof TResult`로 **내로잉(narrowing)** 을 해줘야 컴파일러가 `TResult[K]` 접근을 허용한다:

```ts
// ✅ K가 TResult의 키임을 컴파일러에게 명시적으로 알림
{ [K in RequiredCompareKeys<TBase, TResult>]: K extends keyof TResult ? TResult[K] : never }
```

`never`는 사실상 도달 불가능한 분기 — 로직상 RequiredCompareKeys는 항상 `keyof TResult`에 속하므로.

### 4. `Prettify`가 왜 필요한가?

`&` 교차 타입을 그대로 두면 IDE에서 이렇게 보인다:

```ts
// Prettify 없이: 타입 힌트가 복잡하게 표시됨
{ bar: number; address: string } & { foo?: string }
```

`Prettify`는 교차 타입을 **단일 평면 객체 타입으로 펼쳐준다**:

```ts
type Prettify<T> = { [K in keyof T]: T[K] };

// Prettify 적용 후: IDE에서 깔끔하게 보임
{ bar: number; address: string; foo?: string }
```

기능은 동일하지만, 개발자 경험(DX)을 위한 처리다.

### 5. 전체 흐름 정리

```
TBase  = { foo: string; bar?: number }
TResult = { foo: string; bar: number; address: string }
                                              ↓
RequiredCompareKeys<TBase, TResult> = 'bar' | 'address'
  ├─ bar: TBase엔 bar?: number, TResult엔 bar: number → 타입 호환 안 됨 (optional→required)
  └─ address: TBase에 없음 + TResult에서 required → 필수 제공

OptionalCompareKeys<TBase, TResult> = 'foo'
  └─ foo: 양쪽에 있고 string → string 호환 → 생략 가능
                                              ↓
CompareMergeContext = Prettify<
  { bar: number; address: string }   ← Required 그룹 (TResult[K])
  &
  { foo?: string }                   ← Optional 그룹 (TBase[K])
>
= { bar: number; address: string; foo?: string }
```

## 힌트

- `Prettify`는 01단계에서 만든 것을 import해서 사용하거나 여기서 다시 정의해도 된다
- `K extends keyof TResult ? TResult[K] : ...` 패턴으로 키에 맞는 값 타입을 가져온다

## use-funnel 연결

```ts
// use-funnel의 실제 TransitionFn 타입 (단순화)
type TransitionFn<TCurrentCtx, TTargetCtx> = (
  input: CompareMergeContext<TCurrentCtx, TTargetCtx>
) => void;

// AStep → BStep 전환 시
// TCurrentCtx = { foo?: string }
// TTargetCtx  = { foo: string }
// CompareMergeContext = { foo: string }  ← foo가 required로 바뀌었으므로 반드시 넘겨야 함
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```ts
export type CompareMergeContext<TBase, TResult> = Prettify<
  {
    [K in RequiredCompareKeys<TBase, TResult>]: K extends keyof TResult
      ? TResult[K]
      : K extends keyof TBase
        ? TBase[K]
        : never;
  } & {
    [K in OptionalCompareKeys<TBase, TResult>]?: K extends keyof TBase
      ? TBase[K]
      : K extends keyof TResult
        ? TResult[K]
        : never;
  }
>;
```

- Required 키들은 `TResult[K]`의 타입을 사용한다 (새로 필요한 값이므로)
- Optional 키들은 `TBase[K]`의 타입을 사용한다 (이미 있는 값이므로)
- `Prettify`로 교차 타입을 단일 객체 타입으로 펼친다

> use-funnel의 `typeUtil.ts`에서 `CompareMergeContext`로 동일하게 구현되어 있다.

</details>
