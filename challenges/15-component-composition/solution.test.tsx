import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createRender } from './index';

describe('15. Component Composition', () => {
  describe('Render 컴포넌트', () => {
    it('현재 step에 해당하는 함수를 호출한다', () => {
      const Render = createRender('AStep', {});

      render(
        <Render
          AStep={() => <div>A Step Content</div>}
          BStep={() => <div>B Step Content</div>}
        />,
      );

      expect(screen.getByText('A Step Content')).toBeTruthy();
      expect(screen.queryByText('B Step Content')).toBeNull();
    });

    it('현재 step에 step과 context를 전달한다', () => {
      const Render = createRender('AStep', { foo: '1' });

      render(
        <Render
          AStep={({ step, context }) => (
            <div>
              {step}-{context.foo as string}
            </div>
          )}
        />,
      );

      expect(screen.getByText('AStep-1')).toBeTruthy();
    });

    it('현재 step이 없으면 아무것도 렌더하지 않는다', () => {
      const Render = createRender('CStep', {});

      const { container } = render(
        <Render
          AStep={() => <div>A</div>}
          BStep={() => <div>B</div>}
        />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Render.overlay 정적 메서드', () => {
    it('Render.overlay가 함수다', () => {
      const Render = createRender('AStep', {});
      expect(typeof Render.overlay).toBe('function');
    });

    it('overlay descriptor를 반환한다', () => {
      const Render = createRender('AStep', {});
      const renderFn = ({ close }: { close: () => void }) => <div onClick={close}>Modal</div>;

      const descriptor = Render.overlay(renderFn);

      expect(descriptor.type).toBe('overlay');
      expect(descriptor.render).toBe(renderFn);
    });
  });

  describe('Render.with 정적 메서드', () => {
    it('Render.with가 함수다', () => {
      const Render = createRender('AStep', {});
      expect(typeof Render.with).toBe('function');
    });

    it('with descriptor를 반환한다', () => {
      const Render = createRender('AStep', {});
      const events = { next: () => {} };
      const renderFn = ({ dispatch }: { dispatch: (name: string) => void }) => (
        <button onClick={() => dispatch('next')}>다음</button>
      );

      const descriptor = Render.with({ events, render: renderFn });

      expect(descriptor.type).toBe('render');
      expect(descriptor.events).toBe(events);
      expect(descriptor.render).toBe(renderFn);
    });
  });

  describe('Render는 함수이면서 정적 메서드를 가진다', () => {
    it('typeof Render가 function이다', () => {
      const Render = createRender('AStep', {});
      expect(typeof Render).toBe('function');
    });

    it('overlay와 with가 동시에 존재한다', () => {
      const Render = createRender('AStep', {});
      expect(typeof Render.overlay).toBe('function');
      expect(typeof Render.with).toBe('function');
    });
  });
});
