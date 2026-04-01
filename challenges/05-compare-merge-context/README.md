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
