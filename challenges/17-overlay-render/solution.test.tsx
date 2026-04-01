import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FunnelRenderWithOverlay } from './index';
import type { OverlayDescriptor } from './index';

describe('17. Overlay Render', () => {
  describe('일반 스텝 (함수형)', () => {
    it('현재 step에 해당하는 함수를 호출한다', () => {
      render(
        <FunnelRenderWithOverlay
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

  describe('overlay 스텝', () => {
    const overlayDescriptor: OverlayDescriptor = {
      type: 'overlay',
      render: ({ close }) => (
        <div>
          <span>Overlay Content</span>
          <button onClick={close}>닫기</button>
        </div>
      ),
    };

    it('배경 스텝과 overlay를 동시에 렌더한다', () => {
      render(
        <FunnelRenderWithOverlay
          currentStep="BStep"
          context={{ name: 'Alice' }}
          historySteps={[
            { step: 'AStep', context: {} },
            { step: 'BStep', context: { name: 'Alice' } },
          ]}
          currentIndex={1}
          onPush={vi.fn()}
          onReplace={vi.fn()}
          onGo={vi.fn()}
          steps={{
            AStep: () => <div>Background</div>,
            BStep: overlayDescriptor,
          }}
        />,
      );

      expect(screen.getByText('Background')).toBeTruthy();
      expect(screen.getByText('Overlay Content')).toBeTruthy();
    });

    it('overlay의 close를 호출하면 onGo(-1)이 실행된다', async () => {
      const onGo = vi.fn();
      const user = userEvent.setup();

      render(
        <FunnelRenderWithOverlay
          currentStep="BStep"
          context={{}}
          historySteps={[
            { step: 'AStep', context: {} },
            { step: 'BStep', context: {} },
          ]}
          currentIndex={1}
          onPush={vi.fn()}
          onReplace={vi.fn()}
          onGo={onGo}
          steps={{
            AStep: () => <div>Background</div>,
            BStep: overlayDescriptor,
          }}
        />,
      );

      await user.click(screen.getByText('닫기'));
      expect(onGo).toHaveBeenCalledWith(-1);
    });

    it('배경 스텝의 history 메서드는 비활성화된다', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let capturedHistory: { push: (step?: any, ctx?: any) => void } | null = null;

      render(
        <FunnelRenderWithOverlay
          currentStep="BStep"
          context={{}}
          historySteps={[
            { step: 'AStep', context: {} },
            { step: 'BStep', context: {} },
          ]}
          currentIndex={1}
          onPush={vi.fn()}
          onReplace={vi.fn()}
          onGo={vi.fn()}
          steps={{
            AStep: ({ history }) => {
              capturedHistory = history;
              return <div>Background</div>;
            },
            BStep: overlayDescriptor,
          }}
        />,
      );

      // 배경의 history.push는 에러를 throw해야 함
      expect(() => capturedHistory?.push()).toThrow();
    });

    it('가장 가까운 비overlay 스텝을 배경으로 사용한다', () => {
      render(
        <FunnelRenderWithOverlay
          currentStep="CStep"
          context={{}}
          historySteps={[
            { step: 'AStep', context: {} },
            { step: 'BStep', context: {} },
            { step: 'CStep', context: {} },
          ]}
          currentIndex={2}
          onPush={vi.fn()}
          onReplace={vi.fn()}
          onGo={vi.fn()}
          steps={{
            AStep: () => <div>A Background</div>,
            BStep: () => <div>B Background</div>, // 가장 가까운 비overlay
            CStep: {
              type: 'overlay',
              render: () => <div>C Overlay</div>,
            },
          }}
        />,
      );

      // B가 배경 (A는 렌더되지 않음)
      expect(screen.queryByText('A Background')).toBeNull();
      expect(screen.getByText('B Background')).toBeTruthy();
      expect(screen.getByText('C Overlay')).toBeTruthy();
    });
  });
});
