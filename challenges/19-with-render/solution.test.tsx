import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FunnelRenderWithEvents } from './index';
import type { WithDescriptor } from './index';

describe('18. With Render', () => {
  describe('일반 스텝 (함수형)', () => {
    it('현재 step에 해당하는 함수를 호출한다', () => {
      render(
        <FunnelRenderWithEvents
          currentStep="AStep"
          context={{}}
          historySteps={[{ step: 'AStep', context: {} }]}
          currentIndex={0}
          onPush={vi.fn()}
          onReplace={vi.fn()}
          onGo={vi.fn()}
          steps={{
            AStep: () => <div>A Step</div>,
          }}
        />,
      );

      expect(screen.getByText('A Step')).toBeTruthy();
    });
  });

  describe('with 스텝', () => {
    it('render 함수에 dispatch가 전달된다', () => {
      let capturedDispatch: ((name: string) => void) | null = null;

      const withDescriptor: WithDescriptor = {
        type: 'render',
        events: {},
        render: ({ dispatch }) => {
          capturedDispatch = dispatch;
          return <div>With Step</div>;
        },
      };

      render(
        <FunnelRenderWithEvents
          currentStep="AStep"
          context={{}}
          historySteps={[{ step: 'AStep', context: {} }]}
          currentIndex={0}
          onPush={vi.fn()}
          onReplace={vi.fn()}
          onGo={vi.fn()}
          steps={{ AStep: withDescriptor }}
        />,
      );

      expect(typeof capturedDispatch).toBe('function');
    });

    it('dispatch 호출 시 해당 이벤트 핸들러가 실행된다', async () => {
      const eventHandler = vi.fn();
      const user = userEvent.setup();

      const withDescriptor: WithDescriptor = {
        type: 'render',
        events: {
          next: eventHandler,
        },
        render: ({ dispatch }) => (
          <button onClick={() => dispatch('next', 'payload')}>다음</button>
        ),
      };

      render(
        <FunnelRenderWithEvents
          currentStep="AStep"
          context={{}}
          historySteps={[{ step: 'AStep', context: {} }]}
          currentIndex={0}
          onPush={vi.fn()}
          onReplace={vi.fn()}
          onGo={vi.fn()}
          steps={{ AStep: withDescriptor }}
        />,
      );

      await user.click(screen.getByText('다음'));

      expect(eventHandler).toHaveBeenCalledWith('payload', expect.objectContaining({
        step: 'AStep',
        context: {},
      }));
    });

    it('이벤트 핸들러에서 history.push를 호출할 수 있다', async () => {
      const onPush = vi.fn();
      const user = userEvent.setup();

      const withDescriptor: WithDescriptor = {
        type: 'render',
        events: {
          goB: (_payload, { history }) => history.push('BStep', { foo: '1' }),
        },
        render: ({ dispatch }) => (
          <button onClick={() => dispatch('goB')}>B로 이동</button>
        ),
      };

      render(
        <FunnelRenderWithEvents
          currentStep="AStep"
          context={{ existing: 'value' }}
          historySteps={[{ step: 'AStep', context: { existing: 'value' } }]}
          currentIndex={0}
          onPush={onPush}
          onReplace={vi.fn()}
          onGo={vi.fn()}
          steps={{ AStep: withDescriptor }}
        />,
      );

      await user.click(screen.getByText('B로 이동'));

      expect(onPush).toHaveBeenCalledWith('BStep', { existing: 'value', foo: '1' });
    });

    it('존재하지 않는 이벤트를 dispatch하면 에러가 발생한다', async () => {
      const user = userEvent.setup();
      let caughtError: Error | null = null;

      const withDescriptor: WithDescriptor = {
        type: 'render',
        events: {},
        render: ({ dispatch }) => (
          <button
            onClick={() => {
              try {
                dispatch('nonExistent');
              } catch (e) {
                caughtError = e as Error;
              }
            }}
          >
            없는 이벤트
          </button>
        ),
      };

      render(
        <FunnelRenderWithEvents
          currentStep="AStep"
          context={{}}
          historySteps={[{ step: 'AStep', context: {} }]}
          currentIndex={0}
          onPush={vi.fn()}
          onReplace={vi.fn()}
          onGo={vi.fn()}
          steps={{ AStep: withDescriptor }}
        />,
      );

      await user.click(screen.getByText('없는 이벤트'));

      expect(caughtError).not.toBeNull();
    });
  });
});
