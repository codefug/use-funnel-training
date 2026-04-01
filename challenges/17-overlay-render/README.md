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
