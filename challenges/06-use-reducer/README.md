# 06. useReducer로 복잡한 상태 관리하기

## 왜 필요한가?

use-funnel은 내부적으로 "히스토리 배열 + 현재 인덱스"로 상태를 관리한다.
이 구조는 `useState` 여러 개보다 `useReducer` 하나로 관리하는 것이 훨씬 안전하다.

```
히스토리: [{ step: 'A', context: {} }, { step: 'B', context: { foo: '1' } }]
인덱스:   1  ← 현재 B에 있음
```

- `push`: 인덱스 이후 히스토리를 잘라내고 새 상태 추가
- `replace`: 현재 인덱스의 상태를 교체
- `go(delta)`: 인덱스를 delta만큼 이동
- `back`: go(-1)과 동일

## 문제

`index.ts`에 히스토리 상태를 관리하는 `historyReducer`와 액션 타입들을 구현하라.

### 상태 구조

```ts
type HistoryState<T> = {
  history: T[];       // 전체 히스토리 배열
  currentIndex: number; // 현재 위치
};
```

### 액션 타입

```ts
type HistoryAction<T> =
  | { type: 'PUSH'; payload: T }
  | { type: 'REPLACE'; payload: T }
  | { type: 'GO'; payload: number }  // delta (양수: 앞으로, 음수: 뒤로)
  | { type: 'BACK' };
```

### 각 액션의 동작

**PUSH**: 현재 인덱스 이후 히스토리를 잘라내고 새 상태를 추가한다.
```
before: history=[A,B,C], index=1 (B에 있음)
PUSH(D)
after:  history=[A,B,D], index=2  ← C는 잘려나감
```

**REPLACE**: 현재 인덱스의 상태를 새 상태로 교체한다.
```
before: history=[A,B,C], index=1
REPLACE(X)
after:  history=[A,X,C], index=1
```

**GO**: 인덱스를 delta만큼 이동한다. 범위를 벗어나면 경계값으로 클램핑한다.
```
before: history=[A,B,C], index=1
GO(-1)
after:  history=[A,B,C], index=0
```

**BACK**: GO(-1)과 동일하다.

## 힌트

- `useReducer(reducer, initialState)` 패턴
- PUSH 시 `history.slice(0, currentIndex + 1)`로 이후를 잘라낸다
- GO 시 `Math.max(0, Math.min(history.length - 1, currentIndex + delta))`로 범위 제한

## use-funnel 연결

```ts
// use-funnel 어댑터(browser, react-router 등)의 내부 상태 관리
const [state, dispatch] = useReducer(historyReducer, {
  history: [initialState],
  currentIndex: 0,
});
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```ts
export function historyReducer<T>(
  state: HistoryState<T>,
  action: HistoryAction<T>,
): HistoryState<T> {
  switch (action.type) {
    case 'PUSH': {
      const newHistory = [
        ...state.history.slice(0, state.currentIndex + 1),
        action.payload,
      ];
      return { history: newHistory, currentIndex: newHistory.length - 1 };
    }
    case 'REPLACE': {
      const newHistory = [...state.history];
      newHistory[state.currentIndex] = action.payload;
      return { history: newHistory, currentIndex: state.currentIndex };
    }
    case 'GO': {
      const nextIndex = Math.max(
        0,
        Math.min(state.history.length - 1, state.currentIndex + action.payload),
      );
      return { history: state.history, currentIndex: nextIndex };
    }
    case 'BACK': {
      return historyReducer(state, { type: 'GO', payload: -1 });
    }
  }
}
```

- `PUSH`: `slice(0, currentIndex + 1)`로 현재 이후를 잘라낸 뒤 새 항목 추가
- `REPLACE`: 배열을 복사한 뒤 현재 인덱스만 교체
- `GO`: `Math.max/min`으로 경계 클램핑
- `BACK`: `GO(-1)`을 재사용

</details>
