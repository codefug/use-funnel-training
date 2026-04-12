/**
 * 18. Render 확장: overlay 모드
 *
 * overlay 스텝일 때 배경 스텝과 overlay를 함께 렌더하는
 * FunnelRenderWithOverlay 컴포넌트를 구현하세요.
 *
 * solution.test.tsx의 모든 테스트를 통과해야 합니다.
 */

import { computeNextContext } from "@challenges/09-functional-update";
import { Fragment, type ReactNode } from "react";

type ContextOrFn =
  | Partial<Record<string, unknown>>
  | ((prev: Record<string, unknown>) => Record<string, unknown>);

export type StepProps = {
  step: string;
  context: Record<string, unknown>;
  index: number;
  history: {
    push(step: string, contextOrFn?: ContextOrFn): void;
    replace(step: string, contextOrFn?: ContextOrFn): void;
    go(delta: number): void;
    back(): void;
  };
};

/**
 * overlay render 함수가 받는 props.
 * StepProps(step/context/index/history) + close 함수.
 * 실제 @use-funnel과 동일하게 overlay 안에서도 context/history에 접근할 수 있다.
 */
export type OverlayRenderProps = StepProps & { close: () => void };

export type OverlayDescriptor = {
  type: "overlay";
  events?: Record<string, (payload: unknown, stepProps: StepProps) => void>;
  render: (props: OverlayRenderProps) => ReactNode;
};

export type StepRenderFn = (props: StepProps) => ReactNode;
export type StepDef = StepRenderFn | OverlayDescriptor;

export type FunnelRenderWithOverlayProps = {
  currentStep: string;
  context: Record<string, unknown>;
  historySteps: Array<{ step: string; context: Record<string, unknown> }>;
  currentIndex: number;
  onPush: (step: string, context: Record<string, unknown>) => void;
  onReplace: (step: string, context: Record<string, unknown>) => void;
  onGo: (delta: number) => void;
  steps: Record<string, StepDef>;
};

/**
 * overlay 모드를 지원하는 FunnelRender 컴포넌트입니다.
 *
 * - 현재 스텝이 함수면: 16단계와 동일하게 렌더
 * - 현재 스텝이 overlay descriptor면:
 *   - 히스토리를 역순 탐색해서 가장 가까운 비overlay 스텝을 배경으로 렌더
 *   - 배경의 history는 모두 에러를 throw하도록 비활성화
 *   - 그 위에 overlay를 렌더 (close = () => onGo(-1))
 */
export function FunnelRenderWithOverlay({
  currentStep,
  context,
  historySteps,
  currentIndex,
  onPush,
  onReplace,
  onGo,
  steps,
}: FunnelRenderWithOverlayProps): ReactNode {
  const currentStepDef = steps[currentStep];
  if (!currentStepDef) return null;

  const history = {
    push: (step: string, contextOrFn?: ContextOrFn) => {
      const newContext = computeNextContext(context, contextOrFn ?? {});
      onPush(step, newContext as Record<string, unknown>);
    },
    replace: (step: string, contextOrFn?: ContextOrFn) => {
      const newContext = computeNextContext(context, contextOrFn ?? {});
      onReplace(step, newContext as Record<string, unknown>);
    },
    go: (delta: number) => onGo(delta),
    back: () => onGo(-1),
  };

  const disabledHistory = {
    push: (): never => {
      throw new Error("overlay 배경에서는 history를 사용할 수 없습니다");
    },
    replace: (): never => {
      throw new Error("overlay 배경에서는 history를 사용할 수 없습니다");
    },
    go: (): never => {
      throw new Error("overlay 배경에서는 history를 사용할 수 없습니다");
    },
    back: (): never => {
      throw new Error("overlay 배경에서는 history를 사용할 수 없습니다");
    },
  };

  if (typeof currentStepDef === "function") {
    return currentStepDef({
      step: currentStep,
      context,
      index: currentIndex,
      history,
    });
  }

  if (currentStepDef.type === "overlay") {
    const beforeSteps = historySteps.slice(0, currentIndex);
    let backgroundNode: ReactNode = null;

    for (const prevStep of [...beforeSteps].reverse()) {
      const prevDef = steps[prevStep.step];
      if (typeof prevDef === "function") {
        backgroundNode = prevDef({
          step: prevStep.step,
          context: prevStep.context,
          index: currentIndex,
          history: disabledHistory,
        });
        break;
      }
    }

    return (
      <Fragment>
        {backgroundNode}
        {currentStepDef.render({
          step: currentStep,
          context,
          index: currentIndex,
          history,
          close: () => onGo(-1),
        })}
      </Fragment>
    );
  }

  return null;
}
