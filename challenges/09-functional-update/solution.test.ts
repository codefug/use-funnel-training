import { describe, expect, it } from 'vitest';
import { computeNextContext } from './index';

describe('09. computeNextContext', () => {
  describe('객체 전달 (스프레드 머지)', () => {
    it('현재 context에 새 필드를 추가한다', () => {
      const current = { foo: '1' };
      const result = computeNextContext(current, { bar: '2' });
      expect(result).toEqual({ foo: '1', bar: '2' });
    });

    it('기존 필드를 덮어쓴다', () => {
      const current = { foo: '1', bar: '2' };
      const result = computeNextContext(current, { foo: 'updated' });
      expect(result).toEqual({ foo: 'updated', bar: '2' });
    });

    it('빈 객체를 전달하면 현재 context를 그대로 반환한다', () => {
      const current = { foo: '1', bar: '2' };
      const result = computeNextContext(current, {});
      expect(result).toEqual({ foo: '1', bar: '2' });
    });

    it('원본 객체를 변경하지 않는다 (불변성)', () => {
      const current = { foo: '1' };
      computeNextContext(current, { bar: '2' });
      expect(current).toEqual({ foo: '1' }); // 원본 변경 없음
    });
  });

  describe('함수 전달 (함수형 업데이트)', () => {
    it('이전 context를 인자로 받아 새 context를 반환한다', () => {
      const current = { count: 1 };
      const result = computeNextContext(current, (prev) => ({
        ...prev,
        count: prev.count + 1,
      }));
      expect(result).toEqual({ count: 2 });
    });

    it('이전 값을 기반으로 계산할 수 있다', () => {
      const current = { name: 'Alice', greeting: '' };
      const result = computeNextContext(current, (prev) => ({
        ...prev,
        greeting: `Hello, ${prev.name}!`,
      }));
      expect(result).toEqual({ name: 'Alice', greeting: 'Hello, Alice!' });
    });

    it('함수가 반환하는 값이 그대로 사용된다', () => {
      const current = { foo: '1', bar: '2' };
      const result = computeNextContext(current, () => ({ completely: 'new' }));
      expect(result).toEqual({ completely: 'new' });
    });
  });
});
