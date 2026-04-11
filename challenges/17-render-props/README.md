# 17. Render Props + Object.assign 컴포넌트 합성

## 이 챌린지가 어려운 이유

두 가지 낯선 개념이 동시에 등장하기 때문이다.

1. **Render Props 패턴** — JSX가 아닌 함수를 prop으로 넘겨 렌더링을 위임한다
2. **Object.assign 정적 메서드 부착** — 함수(컴포넌트)에 메서드를 직접 붙인다

각 개념을 먼저 이해하고 나면, 구현은 짧고 단순하다.

---

## 개념 1: Render Props 패턴

일반적인 컴포넌트는 JSX를 prop으로 받는다.

```tsx
// 일반적인 방법: JSX를 직접 넘김
<Layout header={<h1>제목</h1>} />
```

Render Props는 **JSX 대신 함수를 넘긴다.** 컴포넌트가 그 함수를 호출하면서 데이터를 주입한다.

```tsx
// Render Props: 함수를 넘김
<FunnelRender
  steps={{
    AStep: ({ context, history }) => <div>{context.name}</div>,
    //      ↑ 컴포넌트가 호출할 때 이 인자들을 채워준다
  }}
/>
```

**왜 이렇게 하는가?**

스텝마다 어떤 UI를 그릴지는 컴포넌트 바깥(사용자)이 알고, 스텝 전환/context/index 같은 내부 상태는 컴포넌트 안이 알고 있다. Render Props는 이 두 책임을 깔끔하게 분리한다.

```
사용자 코드          FunnelRender
─────────────        ─────────────────────
"AStep 화면은        currentStep이 'AStep'일 때
 이 함수로 그려줘" → 그 함수를 호출하면서
                     { step, context, index, history }를 채워 넣는다
```

---

## 개념 2: FunnelRender 구현 상세

### 전체 흐름

```
props.steps = {
  AStep: (stepProps) => <div>...</div>,
  BStep: (stepProps) => <div>...</div>,
}

현재 step = 'AStep'
                    ↓
steps['AStep'] 함수를 꺼낸다
                    ↓
그 함수를 { step, context, index, history } 와 함께 호출한다
                    ↓
반환된 ReactNode를 렌더한다
```

### 구현 코드 분해

```tsx
export function FunnelRender({
  currentStep,   // 현재 어떤 스텝인지
  context,       // 현재 funnel의 공유 데이터
  currentIndex,  // 히스토리 배열에서 몇 번째인지
  onPush,        // 새 스텝을 히스토리에 추가하는 콜백
  onReplace,     // 현재 스텝을 다른 스텝으로 교체하는 콜백
  onGo,          // 히스토리를 delta만큼 이동하는 콜백
  steps,         // { AStep: fn, BStep: fn, ... }
}: FunnelRenderProps) {

  // ① 현재 스텝에 해당하는 렌더 함수를 꺼낸다
  const currentRender = steps[currentStep];

  // ② 없으면 null (등록되지 않은 스텝)
  if (!currentRender) return null;

  // ③ 렌더 함수에 넘길 history 객체를 만든다
  const history = {
    push: (step, contextOrFn) => {
      // context를 머지한 뒤 onPush를 호출한다
      // (computeNextContext는 챌린지 09에서 구현한 함수)
      const newContext = computeNextContext(context, contextOrFn ?? {});
      onPush(step, newContext);
    },
    replace: (step, contextOrFn) => {
      const newContext = computeNextContext(context, contextOrFn ?? {});
      onReplace(step, newContext);
    },
    go: (delta) => onGo(delta),
    back: () => onGo(-1),   // back은 go(-1)의 단축형
  };

  // ④ 렌더 함수를 호출해 ReactNode를 반환한다
  return currentRender({
    step: currentStep,
    context,
    index: currentIndex,
    history,
  });
}
```

### history.push가 context를 머지하는 이유

```tsx
// 현재 context
{ name: 'Alice' }

// 사용자가 호출
history.push('BStep', { age: 20 })

// computeNextContext 결과 → 기존 + 신규 머지
{ name: 'Alice', age: 20 }

// onPush('BStep', { name: 'Alice', age: 20 }) 호출됨
```

직접 onPush를 호출하면 이전 context가 사라지므로, 반드시 머지 과정이 필요하다.

---

## 개념 3: Object.assign으로 정적 메서드 부착

### JavaScript 함수는 객체다

JavaScript에서 함수는 일급 객체다. 즉, 일반 객체처럼 프로퍼티를 붙일 수 있다.

```js
function greet() { return 'hello'; }

greet.language = 'ko';    // 프로퍼티 추가 가능
greet.shout = () => 'HELLO';  // 메서드 추가 가능

typeof greet         // 'function'
typeof greet.shout   // 'function'
```

`Object.assign(target, source)`은 source의 속성을 모두 target에 복사하고 target을 반환한다.

```js
Object.assign(greet, { shout: () => 'HELLO' });
// greet.shout 가 생김
// greet 자체는 여전히 함수
```

### use-funnel에서 이걸 왜 쓰는가?

```tsx
// 사용자 입장에서 보면:
<funnel.Render
  AStep={({ history }) => <div>...</div>}
  BStep={funnel.Render.overlay(({ close }) => <Modal />)}
//        ↑ 컴포넌트이면서     ↑ 동시에 메서드도 가짐
/>
```

`funnel.Render`는 **컴포넌트(함수)이면서 동시에 `overlay`, `with` 메서드를 가진 객체**다.
두 역할을 하나의 식별자로 표현하기 위해 Object.assign을 사용한다.

### 구현 코드 분해

```tsx
export const FunnelRenderWithStatics: RenderComponent = Object.assign(
  // 첫 번째 인자: 기반이 되는 함수 (컴포넌트)
  FunnelRender as unknown as React.FC<Record<string, StepDef>>,
  //            ↑ TypeScript 타입 캐스팅. FunnelRender는 내부적으로
  //              StepRenderFn만 처리하지만, 타입상 StepDef(overlay/with 포함)를
  //              받는 것처럼 선언해야 해서 강제 캐스팅한다.

  // 두 번째 인자: 붙일 메서드들
  {
    overlay: (renderFnOrConfig) => {
      // 단축형: 함수를 직접 넘긴 경우
      //   overlay(({ close }) => <Modal />)
      if (typeof renderFnOrConfig === 'function') {
        return { type: 'overlay', render: renderFnOrConfig };
      }
      // 객체형: { render, events? }를 넘긴 경우
      //   overlay({ render: ..., events: { ... } })
      return { type: 'overlay', ...renderFnOrConfig };
    },

    with: (config) => ({
      type: 'render',
      ...config,  // { events, render }를 그대로 펼침
    }),
  }
);
```

---

## 개념 4: Descriptor 패턴

`overlay()`와 `with()`는 컴포넌트를 직접 렌더하지 않는다. 대신 **나중에 처리할 정보(descriptor)**를 담은 객체를 반환한다.

```tsx
// overlay() 반환값 — OverlayDescriptor
{
  type: 'overlay',
  render: (props) => <Modal onClose={props.close} />,
}

// with() 반환값 — WithDescriptor
{
  type: 'render',
  events: { goNext: (payload, stepProps) => stepProps.history.push('Next') },
  render: ({ dispatch }) => <button onClick={() => dispatch('goNext')}>다음</button>,
}
```

`type` 필드로 구분해 **18단계(overlay 처리)**, **19단계(with 처리)**에서 각각 다르게 처리한다.

```tsx
// 미래의 FunnelRender (18, 19단계에서 확장될 모습)
const stepDef = props[currentStep];

if (typeof stepDef === 'function') {
  return stepDef({ step, context, index, history });           // 17단계 ✓
}
if (stepDef?.type === 'overlay') {
  return renderOverlay(stepDef, stepProps);                    // 18단계
}
if (stepDef?.type === 'render') {
  return renderWithDispatch(stepDef, stepProps);               // 19단계
}
```

이 챌린지(17단계)는 그 토대인 descriptor 생성 팩토리만 만든다.

---

## 문제

`index.tsx`에 두 가지를 구현하라.

### 1. `FunnelRender` 컴포넌트

현재 step에 맞는 렌더 함수를 호출하고, 각 함수에 step/context/index/history를 전달한다.

```ts
type FunnelRenderProps = {
  currentStep: string;
  context: Record<string, unknown>;
  historySteps: Array<{ step: string; context: Record<string, unknown> }>;
  currentIndex: number;
  onPush: (step: string, context: Record<string, unknown>) => void;
  onReplace: (step: string, context: Record<string, unknown>) => void;
  onGo: (delta: number) => void;
  steps: Record<string, StepRenderFn>;
};
```

### 2. `FunnelRenderWithStatics` — Object.assign 합성

`FunnelRender`에 `overlay`와 `with` 정적 메서드를 부착한다.

```ts
export const FunnelRenderWithStatics = Object.assign(
  FunnelRender,
  {
    // 단축형: 함수를 직접 넘기면 render로 사용
    // 객체형: { render, events? }를 넘기면 실제 @use-funnel과 동일
    overlay: (renderFnOrConfig) => {
      if (typeof renderFnOrConfig === 'function') {
        return { type: 'overlay', render: renderFnOrConfig };
      }
      return { type: 'overlay', ...renderFnOrConfig };
    },
    with: (config) => ({ type: 'render', ...config }),
  }
);
```

---

## OverlayDescriptor 시그니처

실제 `@use-funnel`과 동일하게, overlay의 render 함수는 `close`뿐 아니라
`step`, `context`, `history`도 받을 수 있다.

```ts
// 단순 close만 필요할 때
funnel.Render.overlay(({ close }) => <Modal onClose={close} />)

// context/history도 필요할 때 (실제 @use-funnel 패턴)
funnel.Render.overlay({
  render({ context, history, close }) {
    return (
      <BottomSheet
        value={context.date}
        onNext={(date) => history.push('NextStep', { date })}
        onClose={() => close()}
      />
    );
  }
})
```

---

## 힌트

**FunnelRender:**
- `steps[currentStep]`으로 현재 스텝의 렌더 함수를 가져온다
- 현재 스텝이 없으면 `null`을 반환한다
- `history.push`는 `computeNextContext`로 context를 계산한 뒤 `onPush`를 호출한다
- `history.back()`은 `onGo(-1)`과 동일하다

**FunnelRenderWithStatics:**
- `Object.assign(target, source)`은 source의 모든 속성을 target에 복사하고 target을 반환한다
- JavaScript 함수는 객체이므로 속성을 붙일 수 있다
- `overlay`는 함수/객체 두 형태를 구분하려면 `typeof arg === 'function'`으로 분기한다

---

## use-funnel 연결

```tsx
// 실제 @use-funnel의 Render 컴포넌트 패턴 (단순화)
const Render = Object.assign(
  function RenderComponent(props) {
    const stepDef = props[currentStep];
    if (typeof stepDef === 'function') return stepDef({ step, context, history, index });
    if (stepDef?.type === 'overlay') { /* 18단계 */ }
    if (stepDef?.type === 'render') { /* 19단계 */ }
    return null;
  },
  {
    overlay: (renderFnOrConfig) => {
      if (typeof renderFnOrConfig === 'function') {
        return { type: 'overlay', render: renderFnOrConfig };
      }
      return { type: 'overlay', ...renderFnOrConfig };
    },
    with: (config) => ({ type: 'render', ...config }),
  }
);
```

---

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```tsx
export function FunnelRender({
  currentStep, context, historySteps, currentIndex,
  onPush, onReplace, onGo, steps,
}: FunnelRenderProps): ReactNode {
  const renderFn = steps[currentStep];
  if (!renderFn) return null;

  const history = {
    push: (step: string, contextOrFn?: ContextOrFn) => {
      const newContext = computeNextContext(context, contextOrFn ?? {});
      onPush(step, newContext as Record<string, unknown>);
    },
    replace: (step: string, contextOrFn?: ContextOrFn) => {
      const newContext = computeNextContext(context, contextOrFn ?? {});
      onReplace(step, newContext as Record<string, unknown>);
    },
    go: (delta: number) => onGo(delta),
    back: () => onGo(-1),
  };

  return renderFn({ step: currentStep, context, index: currentIndex, history });
}

export const FunnelRenderWithStatics: RenderComponent = Object.assign(
  FunnelRender as unknown as React.FC<Record<string, StepDef>>,
  {
    overlay: (renderFnOrConfig: OverlayDescriptor['render'] | OverlayConfig): OverlayDescriptor => {
      if (typeof renderFnOrConfig === 'function') {
        return { type: 'overlay', render: renderFnOrConfig };
      }
      return { type: 'overlay', ...renderFnOrConfig };
    },
    with: (config: Omit<WithDescriptor, 'type'>): WithDescriptor => ({
      type: 'render',
      ...config,
    }),
  },
);
```

**핵심 포인트:**
1. `FunnelRender`는 순수하게 "함수 스텝 렌더"만 담당
2. `Object.assign`으로 `overlay`/`with` 팩토리를 부착 → 컴포넌트이면서 메서드도 가짐
3. `overlay`는 함수/객체 두 형태를 모두 지원 → 단축형과 실제 `@use-funnel` 패턴 모두 사용 가능
4. 18단계(overlay)와 19단계(with)는 이 디스크립터들을 처리하는 로직을 추가한다

</details>
