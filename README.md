# Hook 설계 트레이닝

use-funnel 수준의 라이브러리를 직접 설계할 수 있는 개발자가 되기 위한 20단계 트레이닝 프로젝트.

## 시작하기

```bash
pnpm install
pnpm challenge        # 현재 단계 실행
pnpm challenge 3      # 3번 단계만 실행
pnpm challenge --all  # 전체 진행률 확인
```

## 테스트 종류

```bash
pnpm test             # 런타임 테스트 (전체)
pnpm test:types       # 타입 테스트 (01~05 등 타입 유틸리티 단계)
pnpm typecheck        # TypeScript 타입 검사
```

> **Part 1 (01~05)** 은 타입 유틸리티 단계입니다.
> `pnpm test`로 런타임 동작을 확인하고, `pnpm test:types`로 타입 정확성을 검증하세요.

## 로드맵

```
Part 1: TypeScript 타입 무기 장착 (01~05)
  01. Mapped Type으로 객체 타입 변환하기
  02. Conditional Type + infer로 타입 추출하기
  03. Discriminated Union과 타입 좁히기
  04. 두 타입 비교해서 diff 계산하기
  05. CompareMergeContext 완성

Part 2: 커스텀 훅 설계 기초 (06~10)
  06. useReducer로 복잡한 상태 관리하기
  07. useHistory 훅 구현
  08. useRef로 최신 상태 참조 유지하기
  09. 함수형 업데이트와 스프레드 머지
  10. useHistory + transition 조합

Part 3: 설계 패턴 적용 (11~16)
  11. 인터페이스 설계: Router 계약 정의
  12. URL SearchParams 라우터 구현
  13. Factory 패턴: createUseFunnel
  14. 제네릭으로 라우터별 옵션 확장하기
  15. Builder 패턴: createFunnelSteps
  16. 타입 안전한 스텝 전환

Part 4: 렌더링 시스템과 최종 조립 (17~21)
  17. Render Props + Object.assign 컴포넌트 합성
  18. Render 확장: overlay 모드
  19. Render 확장: with 모드 (이벤트 디스패치)
  20. Guard/Parse 런타임 검증
  21. Final: Mini useFunnel 조립
```

## 규칙

- `solution.test.ts` 파일은 **절대 수정하지 말 것** — 정답 검증용
- `index.ts` 파일만 수정해서 테스트를 통과시킬 것
- 각 단계의 `README.md`를 먼저 읽고 시작할 것
- 이전 단계가 통과되지 않으면 다음 단계로 넘어갈 수 없음

## 각 챌린지 구조

```
challenges/
  01-mapped-types/
    README.md          ← 문제 설명 + 힌트 + use-funnel 연결
    solution.test.ts   ← 수정 금지 (정답 검증)
    index.ts           ← 여기만 수정
```
