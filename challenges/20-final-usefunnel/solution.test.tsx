import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useFunnel } from './index';

describe('20. Final: Mini useFunnel', () => {
  describe('기본 동작', () => {
    it('초기 상태가 올바르게 설정된다', () => {
      const { result } = renderHook(() =>
        useFunnel({ initial: { step: 'NameStep', context: {} } }),
      );

      expect(result.current.step).toBe('NameStep');
      expect(result.current.context).toEqual({});
    });

    it('history.push로 스텝을 이동한다', () => {
      const { result } = renderHook(() =>
        useFunnel({ initial: { step: 'NameStep', context: {} } }),
      );

      act(() => result.current.history.push('AgeStep', { name: 'Alice' }));

      expect(result.current.step).toBe('AgeStep');
      expect(result.current.context).toEqual({ name: 'Alice' });
    });

    it('history.back으로 이전 스텝으로 돌아간다', () => {
      const { result } = renderHook(() =>
        useFunnel({ initial: { step: 'NameStep', context: {} } }),
      );

      act(() => result.current.history.push('AgeStep', { name: 'Alice' }));
      act(() => result.current.history.back());

      expect(result.current.step).toBe('NameStep');
    });
  });

  describe('Render 컴포넌트 — 함수형 모드', () => {
    it('현재 step에 맞는 함수를 렌더한다', () => {
      function TestComponent() {
        const funnel = useFunnel({ initial: { step: 'NameStep', context: {} } });
        return (
          <funnel.Render
            NameStep={() => <div>Name Step</div>}
            AgeStep={() => <div>Age Step</div>}
          />
        );
      }

      render(<TestComponent />);
      expect(screen.getByText('Name Step')).toBeTruthy();
      expect(screen.queryByText('Age Step')).toBeNull();
    });

    it('history.push를 통해 스텝을 이동한다', async () => {
      const user = userEvent.setup();

      function TestComponent() {
        const funnel = useFunnel({ initial: { step: 'NameStep', context: {} } });
        return (
          <funnel.Render
            NameStep={({ history }) => (
              <button onClick={() => history.push('AgeStep', { name: 'Alice' })}>
                다음
              </button>
            )}
            AgeStep={({ context }) => <div>나이 입력: {context.name as string}</div>}
          />
        );
      }

      render(<TestComponent />);
      await user.click(screen.getByText('다음'));

      expect(screen.getByText('나이 입력: Alice')).toBeTruthy();
    });
  });

  describe('Render.overlay 모드', () => {
    it('overlay 스텝 활성화 시 배경과 overlay가 동시에 렌더된다', async () => {
      const user = userEvent.setup();

      function TestComponent() {
        const funnel = useFunnel({ initial: { step: 'NameStep', context: {} } });
        return (
          <funnel.Render
            NameStep={({ history }) => (
              <div>
                <span>배경 화면</span>
                <button onClick={() => history.push('ModalStep', {})}>모달 열기</button>
              </div>
            )}
            ModalStep={funnel.Render.overlay(({ close }) => (
              <div>
                <span>모달 내용</span>
                <button onClick={close}>닫기</button>
              </div>
            ))}
          />
        );
      }

      render(<TestComponent />);
      await user.click(screen.getByText('모달 열기'));

      expect(screen.getByText('배경 화면')).toBeTruthy();
      expect(screen.getByText('모달 내용')).toBeTruthy();
    });

    it('overlay close 시 이전 스텝으로 돌아간다', async () => {
      const user = userEvent.setup();

      function TestComponent() {
        const funnel = useFunnel({ initial: { step: 'NameStep', context: {} } });
        return (
          <funnel.Render
            NameStep={({ history }) => (
              <div>
                <span>배경</span>
                <button onClick={() => history.push('ModalStep', {})}>열기</button>
              </div>
            )}
            ModalStep={funnel.Render.overlay(({ close }) => (
              <button onClick={close}>닫기</button>
            ))}
          />
        );
      }

      render(<TestComponent />);
      await user.click(screen.getByText('열기'));
      await user.click(screen.getByText('닫기'));

      expect(screen.queryByText('닫기')).toBeNull();
      expect(screen.getByText('배경')).toBeTruthy();
    });
  });

  describe('Render.with 모드', () => {
    it('dispatch로 이벤트를 발생시켜 스텝을 이동한다', async () => {
      const user = userEvent.setup();

      function TestComponent() {
        const funnel = useFunnel({ initial: { step: 'AStep', context: {} } });
        return (
          <funnel.Render
            AStep={funnel.Render.with({
              events: {
                goB: (_payload, { history }) => history.push('BStep', { from: 'A' }),
              },
              render: ({ dispatch }) => (
                <button onClick={() => dispatch('goB')}>B로 이동</button>
              ),
            })}
            BStep={({ context }) => <div>B: {context.from as string}</div>}
          />
        );
      }

      render(<TestComponent />);
      await user.click(screen.getByText('B로 이동'));

      expect(screen.getByText('B: A')).toBeTruthy();
    });
  });

  describe('Guard/Parse 런타임 검증', () => {
    it('guard 실패 시 초기 상태로 폴백한다', () => {
      const { result } = renderHook(() =>
        useFunnel({
          initial: { step: 'NameStep', context: {} },
          steps: {
            AgeStep: {
              guard: (ctx) =>
                typeof ctx === 'object' && ctx !== null && 'name' in ctx,
            },
          },
        }),
      );

      // name 없이 AgeStep으로 이동 시도
      act(() => result.current.history.push('AgeStep', {}));

      // guard 실패 → NameStep으로 폴백
      expect(result.current.step).toBe('NameStep');
    });

    it('guard 통과 시 정상적으로 이동한다', () => {
      const { result } = renderHook(() =>
        useFunnel({
          initial: { step: 'NameStep', context: {} },
          steps: {
            AgeStep: {
              guard: (ctx) =>
                typeof ctx === 'object' && ctx !== null && 'name' in ctx,
            },
          },
        }),
      );

      act(() => result.current.history.push('AgeStep', { name: 'Alice' }));

      expect(result.current.step).toBe('AgeStep');
      expect(result.current.context).toEqual({ name: 'Alice' });
    });
  });

  describe('전체 시나리오: 회원가입 퍼널', () => {
    it('NameStep → AgeStep → CompleteStep → 뒤로가기 시나리오', async () => {
      const user = userEvent.setup();

      function SignupFunnel() {
        const funnel = useFunnel({
          initial: { step: 'NameStep', context: {} },
        });

        return (
          <funnel.Render
            NameStep={({ history }) => (
              <button onClick={() => history.push('AgeStep', { name: 'Alice' })}>
                이름 입력 완료
              </button>
            )}
            AgeStep={({ context, history }) => (
              <div>
                <span>이름: {context.name as string}</span>
                <button onClick={() => history.push('CompleteStep', { age: 20 })}>
                  나이 입력 완료
                </button>
              </div>
            )}
            CompleteStep={({ context, history }) => (
              <div>
                <span>
                  완료: {context.name as string}, {context.age as number}세
                </span>
                <button onClick={() => history.back()}>뒤로</button>
              </div>
            )}
          />
        );
      }

      render(<SignupFunnel />);

      // NameStep → AgeStep
      await user.click(screen.getByText('이름 입력 완료'));
      expect(screen.getByText('이름: Alice')).toBeTruthy();

      // AgeStep → CompleteStep
      await user.click(screen.getByText('나이 입력 완료'));
      expect(screen.getByText('완료: Alice, 20세')).toBeTruthy();

      // CompleteStep → AgeStep (뒤로가기)
      await user.click(screen.getByText('뒤로'));
      expect(screen.getByText('이름: Alice')).toBeTruthy();
    });
  });
});
