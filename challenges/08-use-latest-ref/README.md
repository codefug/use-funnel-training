# 08. useRef로 최신 상태 참조 유지하기

## 왜 필요한가?

React에서 콜백 함수는 생성 시점의 값을 클로저로 캡처한다.
비동기 작업이나 이벤트 핸들러 안에서 state를 참조하면 "오래된(stale) 값"을 볼 수 있다.

```ts
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count); // 항상 0! (stale closure)
    }, 1000);
    return () => clearInterval(timer);
  }, []); // 빈 의존성 배열
}
```

`useRef`로 항상 최신 값을 가리키는 ref를 만들면 이 문제를 해결할 수 있다.

## 문제

`index.ts`에 `useLatestRef<T>(value: T)` 훅을 구현하라.

### 동작

- 매 렌더마다 `ref.current`를 최신 `value`로 업데이트한다
- 반환된 ref는 항상 가장 최신 `value`를 가리킨다
- ref 객체 자체는 렌더 간에 동일한 참조를 유지한다 (안정적인 참조)

```ts
const countRef = useLatestRef(count);

// 비동기 콜백 안에서도 항상 최신 count를 볼 수 있다
setTimeout(() => {
  console.log(countRef.current); // 최신 값!
}, 1000);
```

## 힌트

```ts
import { useRef } from 'react';

export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  // 매 렌더마다 최신 값으로 업데이트
  // (useLayoutEffect나 직접 할당 중 어느 것이 더 안전한지 생각해보자)
  ref.current = value;
  return ref;
}
```

## use-funnel 연결

```ts
// use-funnel의 useFunnel.tsx 내부
// transition 콜백에서 항상 최신 상태를 참조하기 위해 사용
const currentStateRef = useLatestRef(currentState);

const transition = (step, assignContext) => {
  const newContext =
    typeof assignContext === 'function'
      ? assignContext(currentStateRef.current.context) // 항상 최신 context
      : { ...currentStateRef.current.context, ...assignContext };
  // ...
};
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```ts
export function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
```

`useRef`로 ref를 생성하고, 렌더마다 `ref.current`를 최신 값으로 동기화한다.
`useEffect`를 쓰지 않고 렌더 중에 직접 할당하는 것이 포인트다.

> `useEffect`로 업데이트하면 렌더 직후 한 프레임 뒤에 반영되지만,
> 렌더 중 직접 할당하면 렌더와 동시에 최신 값이 보장된다.
>
> use-funnel에서는 `useUpdatableRef`라는 이름으로 동일하게 구현한다.
>
> ```ts
> export function useUpdatableRef<T>(value: T) {
>   const ref = useRef(value);
>   ref.current = value;
>   return ref;
> }
> ```

</details>
