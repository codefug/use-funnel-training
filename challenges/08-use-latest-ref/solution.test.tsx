import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { useLatestRef } from './index';

describe('08. useLatestRef', () => {
  it('초기값을 ref.current에 저장한다', () => {
    const { result } = renderHook(() => useLatestRef(42));
    expect(result.current.current).toBe(42);
  });

  it('값이 변경되면 ref.current가 최신 값으로 업데이트된다', () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 1 },
    });

    expect(result.current.current).toBe(1);

    rerender({ value: 2 });
    expect(result.current.current).toBe(2);

    rerender({ value: 3 });
    expect(result.current.current).toBe(3);
  });

  it('ref 객체 자체는 렌더 간에 동일한 참조를 유지한다', () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 1 },
    });

    const firstRef = result.current;
    rerender({ value: 2 });
    const secondRef = result.current;

    expect(firstRef).toBe(secondRef); // 같은 ref 객체
  });

  it('state 변경 후 콜백에서 최신 값을 참조한다', () => {
    const { result } = renderHook(() => {
      const [count, setCount] = useState(0);
      const countRef = useLatestRef(count);
      return { count, setCount, countRef };
    });

    act(() => result.current.setCount(5));

    // ref.current는 최신 count를 가리킨다
    expect(result.current.countRef.current).toBe(5);
  });

  it('문자열 값도 추적한다', () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 'hello' },
    });

    rerender({ value: 'world' });
    expect(result.current.current).toBe('world');
  });

  it('객체 값도 추적한다', () => {
    const obj1 = { step: 'A', context: {} };
    const obj2 = { step: 'B', context: { foo: '1' } };

    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: obj1 },
    });

    rerender({ value: obj2 });
    expect(result.current.current).toBe(obj2);
  });
});
