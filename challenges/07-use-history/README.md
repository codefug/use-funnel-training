# 07. useHistory 훅 구현

## 왜 필요한가?

06단계에서 만든 `historyReducer`는 순수 함수다.
이제 이 reducer를 React 훅으로 감싸서, 컴포넌트에서 사용할 수 있는 인터페이스를 만든다.

```ts
const history = useHistory('초기값');

history.currentState; // '초기값'
history.push('새값');
history.back();
history.go(-1);
history.replace('교체값');
```

## 문제

`index.ts`에 `useHistory<T>(initialState: T)` 훅을 구현하라.

### 반환 타입

```ts
type UseHistoryReturn<T> = {
  history: T[];         // 전체 히스토리 배열
  currentIndex: number; // 현재 위치
  currentState: T;      // history[currentIndex]
  push: (state: T) => void;
  replace: (state: T) => void;
  go: (delta: number) => void;
  back: () => void;
};
```

### 구현 조건

- 06단계의 `historyReducer`를 `useReducer`로 감싸서 구현한다
- `currentState`는 `history[currentIndex]`다
- 초기 상태는 `{ history: [initialState], currentIndex: 0 }`이다

## 힌트

```ts
import { useReducer } from 'react';
import { historyReducer } from '../06-use-reducer/index';

export function useHistory<T>(initialState: T) {
  const [state, dispatch] = useReducer(historyReducer<T>, {
    history: [initialState],
    currentIndex: 0,
  });

  // dispatch를 감싸서 편한 API를 노출한다
  return {
    history: state.history,
    currentIndex: state.currentIndex,
    currentState: state.history[state.currentIndex],
    push: (next: T) => dispatch({ type: 'PUSH', payload: next }),
    // ...
  };
}
```

## use-funnel 연결

```ts
// use-funnel 어댑터가 반환하는 FunnelRouterResult의 핵심 형태
return {
  history: state.history,
  currentIndex: state.currentIndex,
  push: (state) => dispatch({ type: 'PUSH', payload: state }),
  replace: (state) => dispatch({ type: 'REPLACE', payload: state }),
  go: (delta) => dispatch({ type: 'GO', payload: delta }),
  cleanup: () => { /* URL 정리 */ },
};
```
