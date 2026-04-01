# 09. 함수형 업데이트와 스프레드 머지

## 왜 필요한가?

use-funnel에서 다음 스텝으로 이동할 때 두 가지 방식으로 context를 업데이트할 수 있다.

```ts
// 방식 1: 객체 직접 전달 (스프레드 머지)
history.push('BStep', { foo: '1' });
// 결과: { ...현재context, foo: '1' }

// 방식 2: 함수형 업데이트 (이전 상태 기반 계산)
history.push('BStep', (prev) => ({ ...prev, foo: prev.bar + '!' }));
// 결과: 함수의 반환값
```

이 두 가지를 하나의 `transition` 함수로 처리해야 한다.

## 문제

`index.ts`에 `computeNextContext` 함수를 구현하라.

### 함수 시그니처

```ts
function computeNextContext<T extends Record<string, unknown>>(
  currentContext: T,
  assignOrFn: Partial<T> | ((prev: T) => T),
): T
```

### 동작

- `assignOrFn`이 **함수**면: `assignOrFn(currentContext)`를 호출해서 반환값을 사용
- `assignOrFn`이 **객체**면: `{ ...currentContext, ...assignOrFn }`으로 스프레드 머지

## 힌트

```ts
// 함수인지 확인하는 방법
if (typeof assignOrFn === 'function') {
  return assignOrFn(currentContext);
}
return { ...currentContext, ...assignOrFn };
```

## use-funnel 연결

```ts
// use-funnel의 useFunnel.tsx 내부 transition 함수
const transition = (step, assignContext) => {
  const newContext =
    typeof assignContext === 'function'
      ? assignContext(currentStateRef.current.context)
      : { ...currentStateRef.current.context, ...assignContext };

  const context = parseStepContext(step, newContext);
  return context == null
    ? normalizedInitialRef.current
    : { step, context };
};
```
