# 03. Discriminated Union과 타입 좁히기

## 왜 필요한가?

use-funnel의 가장 핵심적인 타입 기법이다.
퍼널의 각 스텝마다 허용되는 context 타입이 다른데,
`funnel.step === 'AStep'`으로 switch하면 `funnel.context`가 자동으로 AStep의 타입으로 좁혀진다.

```ts
const funnel = useFunnel<{
  AStep: { foo?: string };
  BStep: { foo: string; bar?: string };
  CStep: { foo: string; bar: string };
}>({ initial: { step: 'AStep', context: {} } });

switch (funnel.step) {
  case 'AStep':
    funnel.context; // { foo?: string } — 자동으로 좁혀짐!
    break;
  case 'BStep':
    funnel.context; // { foo: string; bar?: string }
    break;
}
```

## 문제

`index.ts`에 다음 타입 유틸리티를 구현하라.

### `StepMapToUnion<TStepMap>`

스텝 맵 객체 타입을 Discriminated Union으로 변환한다.

```ts
type StepMap = {
  AStep: { foo?: string };
  BStep: { foo: string; bar?: string };
  CStep: { foo: string; bar: string };
};

type Result = StepMapToUnion<StepMap>;
// 결과:
// | { step: 'AStep'; context: { foo?: string } }
// | { step: 'BStep'; context: { foo: string; bar?: string } }
// | { step: 'CStep'; context: { foo: string; bar: string } }
```

### `FunnelState<TStepMap>`

`StepMapToUnion`을 사용해서 퍼널 상태 타입을 만든다.
(실제로는 `StepMapToUnion`과 동일하지만, 이름을 명확히 하기 위해 별도로 정의)

## 핵심 문법: Mapped Type + 유니온 분배

```ts
// keyof T를 순회하며 각 키에 대한 객체 타입을 만들고, 전체를 유니온으로 합치는 패턴
type MapToUnion<T> = {
  [K in keyof T]: { key: K; value: T[K] }
}[keyof T];
//               ^^^^^^^^^ 이 부분이 핵심: 모든 키로 인덱싱하면 유니온이 됨
```

## 힌트

- `{ [K in keyof T]: ... }[keyof T]` 패턴으로 유니온을 만들 수 있다
- `K`를 discriminant(구별자)로, `T[K]`를 해당 케이스의 데이터로 사용한다

## use-funnel 연결

```ts
// use-funnel의 실제 FunnelState 타입 (단순화)
type AnyFunnelState = {
  step: string;
  context: Record<string, unknown>;
};

// 타입 안전한 버전
type FunnelState<TStepMap> = StepMapToUnion<TStepMap>;
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

### `StepMapToUnion<TStepMap>`

```ts
export type StepMapToUnion<TStepMap extends Record<string, unknown>> = {
  [K in keyof TStepMap]: { step: K; context: TStepMap[K] };
}[keyof TStepMap];
```

핵심은 `{ [K in keyof T]: ... }[keyof T]` 패턴이다.
Mapped Type으로 각 키에 대한 객체 타입을 만든 뒤, `[keyof T]`로 인덱싱하면 모든 값 타입의 유니온이 된다.

### `FunnelState<TStepMap>`

```ts
export type FunnelState<TStepMap extends Record<string, unknown>> =
  StepMapToUnion<TStepMap>;
```

</details>
