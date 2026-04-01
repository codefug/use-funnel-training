# 19. Guard/Parse 런타임 검증

## 왜 필요한가?

URL 파라미터나 외부 데이터에서 퍼널 상태를 복원할 때,
잘못된 데이터가 들어올 수 있다.

예를 들어 사용자가 URL을 직접 수정해서 BStep에 접근했는데,
BStep에 필요한 `name` 필드가 없다면 앱이 깨질 수 있다.

이를 방지하기 위해 각 스텝에 `guard` 또는 `parse` 함수를 등록하고,
상태 전환 시 검증을 거쳐 실패하면 초기 상태로 폴백한다.

```ts
const funnel = useFunnel({
  steps: {
    AStep: { guard: (ctx) => true },  // 항상 통과
    BStep: { guard: (ctx) => 'name' in ctx },  // name이 있어야 통과
    CStep: { parse: (ctx) => CStepSchema.parse(ctx) },  // Zod 파싱
  },
  initial: { step: 'AStep', context: {} },
});
```

## 문제

`index.ts`에 `parseStepContext` 함수를 구현하라.

### 시그니처

```ts
function parseStepContext(
  step: string,
  context: unknown,
  stepOptions: Record<string, StepOption>,
  initialState: FunnelState,
): FunnelState
```

### StepOption

```ts
type StepOption = {
  guard?: (context: unknown) => boolean;
  parse?: (context: unknown) => Record<string, unknown>;
};
```

### 동작

1. `stepOptions[step]`이 없으면 `{ step, context }`를 그대로 반환
2. `guard`가 있으면 `guard(context)`를 실행:
   - `true` → `{ step, context }` 반환
   - `false` → `initialState` 반환 (폴백)
3. `parse`가 있으면 `parse(context)`를 실행:
   - 성공 → `{ step, parsedContext }` 반환
   - 에러 throw → `initialState` 반환 (폴백)

## 힌트

```ts
function parseStepContext(step, context, stepOptions, initialState) {
  const option = stepOptions[step];
  if (!option) return { step, context };

  if (option.guard) {
    return option.guard(context) ? { step, context } : initialState;
  }

  if (option.parse) {
    try {
      const parsed = option.parse(context);
      return { step, context: parsed };
    } catch {
      return initialState;
    }
  }

  return { step, context };
}
```

## use-funnel 연결

```ts
// use-funnel의 useFunnel.tsx
const parseStepContext = (step, context) => {
  const stepOption = steps?.[step];
  if (stepOption == null) return { step, context };

  if ('guard' in stepOption) {
    return stepOption.guard(context) ? { step, context } : null; // null = 폴백
  }
  if ('parse' in stepOption) {
    try {
      return { step, context: stepOption.parse(context) };
    } catch {
      return null;
    }
  }
};
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```ts
export function parseStepContext(
  step: string,
  context: unknown,
  stepOptions: Record<string, StepOption>,
  initialState: FunnelState,
): FunnelState {
  const option = stepOptions[step];

  if (!option) {
    return { step, context: context as Record<string, unknown> };
  }

  if (option.guard) {
    return option.guard(context)
      ? { step, context: context as Record<string, unknown> }
      : initialState;
  }

  if (option.parse) {
    try {
      const parsed = option.parse(context);
      return { step, context: parsed };
    } catch {
      return initialState;
    }
  }

  return { step, context: context as Record<string, unknown> };
}
```

- `guard`: boolean을 반환하므로 `false`면 즉시 `initialState`로 폴백
- `parse`: 예외를 던질 수 있으므로 `try/catch`로 감싸고 실패 시 `initialState`로 폴백
- 옵션이 없으면 검증 없이 그대로 통과

</details>
