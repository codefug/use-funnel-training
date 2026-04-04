/**
 * 21. Final: Mini useFunnel 조립
 *
 * 1~20단계에서 만든 모든 조각을 조합해서 완전한 useFunnel 훅을 구현하세요.
 * solution.test.tsx의 모든 테스트를 통과해야 합니다.
 */

import { Fragment } from 'react';
import type { ReactNode } from 'react';

// ── 타입 (01~05단계 유산) ────────────────────────────────────
// 16단계에서 정의한 AnyFunnelState (런타임 untyped 버전)
import type { AnyFunnelState, PushArgs } from '../16-typed-funnel-state/index';

// ── 런타임 유틸 ──────────────────────────────────────────────
// 08단계: stale closure 방지
import { useLatestRef } from '../08-use-latest-ref/index';

// 09단계: context 업데이트 (객체 스프레드 | 함수형 업데이트)
import { computeNextContext } from '../09-functional-update/index';

// 11단계: 라우터 인터페이스 + 메모리 라우터 구현체
import { useMemoryRouter } from '../11-router-interface/index';
import type { FunnelRouterResult } from '../11-router-interface/index';

// 17단계: 디스크립터 타입 (overlay, with 모드에서 사용)
import type { OverlayDescriptor, WithDescriptor, StepDef, StepProps } from '../17-render-props/index';

// 20단계: Guard/Parse 런타임 검증 + 15단계의 StepOption re-export
import { parseStepContext } from '../20-runtime-validation/index';
import type { StepOption } from '../20-runtime-validation/index';

// --- 타입 정의 ---

type ContextOrFn =
  | Partial<Record<string, unknown>>
  | ((prev: Record<string, unknown>) => Record<string, unknown>);

type StepRenderFn = (props: StepProps) => ReactNode;

type RenderProps = Record<string, StepDef>;

type FunnelHistoryAPI = {
  push(step: string, contextOrFn?: ContextOrFn): void;
  replace(step: string, contextOrFn?: ContextOrFn): void;
  go(delta: number): void;
  back(): void;
};

type RenderComponent = React.FC<RenderProps> & {
  overlay: (renderFn: OverlayDescriptor['render']) => OverlayDescriptor;
  with: (config: Omit<WithDescriptor, 'type'>) => WithDescriptor;
};

export type UseFunnelOptions = {
  initial: AnyFunnelState;
  steps?: Record<string, StepOption>;
};

export type UseFunnelReturn = {
  step: string;
  context: Record<string, unknown>;
  historySteps: AnyFunnelState[];
  currentIndex: number;
  history: FunnelHistoryAPI;
  Render: RenderComponent;
};

/**
 * 완전한 useFunnel 훅입니다.
 *
 * 조립하는 요소:
 * - 08: useLatestRef — stale closure 방지
 * - 09: computeNextContext — context 업데이트
 * - 11: useMemoryRouter — 히스토리 상태 관리
 * - 15+20: StepOption + parseStepContext — 런타임 guard/parse 검증
 * - 16: AnyFunnelState, PushArgs — 타입 안전성 (타입 레벨)
 * - 17: StepDef, OverlayDescriptor, WithDescriptor — Render 모드 타입
 * - Object.assign — Render 컴포넌트에 overlay/with 정적 메서드 부착
 */
export function useFunnel(options: UseFunnelOptions): UseFunnelReturn {
  // TODO: 구현하세요
  //
  // 1. useMemoryRouter(options.initial)로 라우터 생성
  // 2. useLatestRef(router)로 stale closure 방지
  // 3. 현재 상태 = router.history[router.currentIndex] ?? options.initial
  //
  // 4. transition 헬퍼:
  //    - computeNextContext로 새 context 계산
  //    - options.steps가 있으면 parseStepContext로 guard/parse 검증
  //    - 결과: { step, context }
  //
  // 5. history API: push/replace는 transition 후 routerRef.current.push/replace
  //
  // 6. Render 컴포넌트 (Object.assign 패턴):
  //    - 함수 모드: stepDef가 함수 → stepDef({ step, context, index, history }) 호출
  //    - overlay 모드: type === 'overlay' → 배경 렌더 + overlay 렌더
  //    - with 모드: type === 'render' → dispatch 함수 생성 후 render({ ...stepProps, dispatch })
  //    - Object.assign으로 overlay/with 정적 메서드 부착
  //
  // 힌트: overlay 배경을 찾을 때는 historySteps를 역순으로 탐색하고,
  //       배경의 history는 모두 에러를 throw하도록 비활성화한다.

  throw new Error('구현하세요');
}
