# 17. Render 확장: overlay 모드

## 왜 필요한가?

바텀시트나 모달을 퍼널의 한 스텝으로 표현할 때,
배경(이전 스텝)도 함께 렌더해야 한다.

```
히스토리: [AStep, BStep(overlay)]
현재: BStep(overlay)

렌더 결과:
  <AStep />         ← 배경으로 렌더 (history 비활성화)
  <BStepModal />    ← overlay로 렌더 (close = history.back)
```

## 문제

`index.ts`에 overlay 모드를 지원하는 `FunnelRenderWithOverlay` 컴포넌트를 구현하라.

### overlay 스텝 처리 로직

1. 현재 스텝의 descriptor가 `{ type: 'overlay', render }` 형태인지 확인
2. overlay라면 히스토리를 역순으로 탐색해서 가장 가까운 비overlay 스텝을 찾는다
3. 배경 스텝을 렌더하되, 배경의 `history` 메서드는 모두 에러를 throw하도록 비활성화한다
4. 그 위에 overlay 스텝을 렌더한다 (`close = () => onGo(-1)`)

### 배경 history 비활성화

```ts
const disabledHistory = {
  push: () => { throw new Error('overlay 배경에서는 history를 사용할 수 없습니다'); },
  replace: () => { throw new Error('...'); },
  go: () => { throw new Error('...'); },
  back: () => { throw new Error('...'); },
};
```

## 힌트

```ts
// overlay 스텝 처리
if (currentStepDef?.type === 'overlay') {
  // 히스토리를 역순으로 탐색
  const beforeSteps = historySteps.slice(0, currentIndex);
  for (const prevStep of [...beforeSteps].reverse()) {
    const prevDef = steps[prevStep.step];
    if (typeof prevDef === 'function') {
      // 배경 스텝 렌더 (history 비활성화)
      backgroundNode = prevDef({ ..., history: disabledHistory });
      break;
    }
  }
  // overlay 렌더
  overlayNode = currentStepDef.render({ close: () => onGo(-1) });
}
```

## use-funnel 연결

```ts
// use-funnel의 FunnelRender.tsx
} else if (render.type === 'overlay') {
  const beforeSteps = funnelRenderStep.historySteps.slice(0, funnelRenderStep.index);
  for (const step of beforeSteps.slice().reverse()) {
    const stepRender = steps[step.step];
    if (typeof stepRender === 'function') {
      renderEntries.push([step.step, stepRender({ ...step, history: overlayBeforeHistory })]);
      break;
    }
  }
  renderEntries.push([currentStep, render.render({ close: history.back })]);
}
```

## 정답

<details>
<summary>풀기 전에 먼저 시도해보세요!</summary>

```ts
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
    push: (): never => { throw new Error('overlay 배경에서는 history를 사용할 수 없습니다'); },
    replace: (): never => { throw new Error('overlay 배경에서는 history를 사용할 수 없습니다'); },
    go: (): never => { throw new Error('overlay 배경에서는 history를 사용할 수 없습니다'); },
    back: (): never => { throw new Error('overlay 배경에서는 history를 사용할 수 없습니다'); },
  };

  // 일반 스텝
  if (typeof currentStepDef === 'function') {
    return currentStepDef({ step: currentStep, context, index: currentIndex, history });
  }

  // overlay 스텝
  if (currentStepDef.type === 'overlay') {
    const beforeSteps = historySteps.slice(0, currentIndex);
    let backgroundNode: ReactNode = null;

    for (const prevStep of [...beforeSteps].reverse()) {
      const prevDef = steps[prevStep.step];
      if (typeof prevDef === 'function') {
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
        {currentStepDef.render({ close: () => onGo(-1) })}
      </Fragment>
    );
  }

  return null;
}
```

overlay 처리의 핵심은 **히스토리 역순 탐색**이다.
현재 인덱스 이전 스텝들을 뒤에서부터 탐색해서 함수형(비overlay) 스텝을 찾아 배경으로 렌더한다.
배경의 history는 모두 에러를 throw해서 사용을 막는다.

</details>
