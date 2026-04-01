# 20. Final: Mini useFunnel 조립

## 드디어 마지막 단계입니다.

1~19단계에서 만든 모든 조각을 조합해서 완전한 `useFunnel` 훅을 구현하라.

## 완성해야 하는 기능

### 1. 타입 안전한 step/context

```ts
const funnel = useFunnel<{
  NameStep: { name?: string };
  AgeStep: { name: string; age?: number };
  CompleteStep: { name: string; age: number };
}>({ initial: { step: 'NameStep', context: {} } });

funnel.step; // 'NameStep' | 'AgeStep' | 'CompleteStep'
// funnel.step === 'NameStep'이면 funnel.context는 { name?: string }
```

### 2. Factory + Strategy 패턴

```ts
// 메모리 라우터로 만든 useFunnel
const useFunnel = createUseFunnel(useMemoryRouter);
```

### 3. history.push/replace/back/go

```ts
funnel.history.push('AgeStep', { name: 'Alice' });
funnel.history.back();
```

### 4. Render 컴포넌트 (함수/overlay/with 3모드)

```tsx
<funnel.Render
  NameStep={({ history }) => (
    <input onChange={(e) => history.push('AgeStep', { name: e.target.value })} />
  )}
  AgeStep={funnel.Render.overlay(({ close }) => (
    <Modal onClose={close} />
  ))}
  CompleteStep={funnel.Render.with({
    events: { finish: (_, { history }) => history.push('NameStep') },
    render: ({ dispatch }) => <button onClick={() => dispatch('finish')}>완료</button>,
  })}
/>
```

### 5. Guard/Parse 런타임 검증

```ts
const funnel = useFunnel({
  steps: {
    AgeStep: { guard: (ctx) => 'name' in ctx },
  },
  initial: { step: 'NameStep', context: {} },
});
```

## 구현 방법

이전 단계들에서 만든 함수들을 import해서 조합하면 된다.

```ts
import { createUseFunnel } from '../12-factory-pattern/index';
import { useMemoryRouter } from '../11-router-interface/index';
import { FunnelRenderWithOverlay } from '../17-overlay-render/index';
import { parseStepContext } from '../19-runtime-validation/index';
// ...
```

## 테스트 시나리오

회원가입 퍼널:
1. NameStep: 이름 입력 → AgeStep으로 이동
2. AgeStep: 나이 입력 (overlay) → CompleteStep으로 이동
3. CompleteStep: 완료 버튼 → 처음으로 돌아가기
4. 뒤로가기: CompleteStep → AgeStep → NameStep
5. 잘못된 URL 접근: guard 실패 → NameStep으로 폴백
