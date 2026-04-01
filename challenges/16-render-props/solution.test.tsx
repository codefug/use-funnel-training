import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FunnelRender } from './index';

const baseProps = {
  currentStep: 'AStep',
  context: { name: 'Alice' },
  historySteps: [{ step: 'AStep', context: { name: 'Alice' } }],
  currentIndex: 0,
  onPush: vi.fn(),
  onReplace: vi.fn(),
  onGo: vi.fn(),
};

describe('16. FunnelRender', () => {
  describe('기본 렌더링', () => {
    it('현재 step에 해당하는 함수를 호출한다', () => {
      render(
        <FunnelRender
          {...baseProps}
          steps={{
            AStep: () => <div>A Step</div>,
            BStep: () => <div>B Step</div>,
          }}
        />,
      );

      expect(screen.getByText('A Step')).toBeTruthy();
      expect(screen.queryByText('B Step')).toBeNull();
    });

    it('현재 step이 없으면 아무것도 렌더하지 않는다', () => {
      const { container } = render(
        <FunnelRender
          {...baseProps}
          currentStep="CStep"
          steps={{
            AStep: () => <div>A</div>,
          }}
        />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('스텝 함수에 올바른 props 전달', () => {
    it('step 이름을 전달한다', () => {
      render(
        <FunnelRender
          {...baseProps}
          steps={{
            AStep: ({ step }) => <div>{step}</div>,
          }}
        />,
      );

      expect(screen.getByText('AStep')).toBeTruthy();
    });

    it('context를 전달한다', () => {
      render(
        <FunnelRender
          {...baseProps}
          context={{ name: 'Alice', age: 20 }}
          steps={{
            AStep: ({ context }) => (
              <div>
                {context.name as string}-{context.age as number}
              </div>
            ),
          }}
        />,
      );

      expect(screen.getByText('Alice-20')).toBeTruthy();
    });

    it('currentIndex를 전달한다', () => {
      render(
        <FunnelRender
          {...baseProps}
          currentIndex={2}
          steps={{
            AStep: ({ index }) => <div>index:{index}</div>,
          }}
        />,
      );

      expect(screen.getByText('index:2')).toBeTruthy();
    });
  });

  describe('history 메서드', () => {
    it('history.push 호출 시 onPush가 context 머지와 함께 호출된다', async () => {
      const onPush = vi.fn();
      const user = userEvent.setup();

      render(
        <FunnelRender
          {...baseProps}
          context={{ name: 'Alice' }}
          onPush={onPush}
          steps={{
            AStep: ({ history }) => (
              <button onClick={() => history.push('BStep', { age: 20 })}>
                다음
              </button>
            ),
          }}
        />,
      );

      await user.click(screen.getByText('다음'));

      expect(onPush).toHaveBeenCalledWith('BStep', { name: 'Alice', age: 20 });
    });

    it('history.back 호출 시 onGo(-1)이 호출된다', async () => {
      const onGo = vi.fn();
      const user = userEvent.setup();

      render(
        <FunnelRender
          {...baseProps}
          onGo={onGo}
          steps={{
            AStep: ({ history }) => (
              <button onClick={() => history.back()}>뒤로</button>
            ),
          }}
        />,
      );

      await user.click(screen.getByText('뒤로'));

      expect(onGo).toHaveBeenCalledWith(-1);
    });

    it('history.go 호출 시 onGo가 호출된다', async () => {
      const onGo = vi.fn();
      const user = userEvent.setup();

      render(
        <FunnelRender
          {...baseProps}
          onGo={onGo}
          steps={{
            AStep: ({ history }) => (
              <button onClick={() => history.go(-2)}>두 단계 뒤로</button>
            ),
          }}
        />,
      );

      await user.click(screen.getByText('두 단계 뒤로'));

      expect(onGo).toHaveBeenCalledWith(-2);
    });
  });
});
