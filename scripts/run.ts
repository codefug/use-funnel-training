#!/usr/bin/env tsx
/**
 * Hook 설계 트레이닝 CLI 러너
 *
 * 사용법:
 *   pnpm challenge          # 현재 단계 실행 (이전 단계가 모두 통과된 경우)
 *   pnpm challenge 5        # 5번 단계만 실행
 *   pnpm challenge --all    # 전체 진행률 확인
 */

import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const CHALLENGES_DIR = join(ROOT, 'challenges');

const STAGES = [
  { num: 1, dir: '01-mapped-types', name: 'Mapped Type으로 객체 타입 변환하기' },
  { num: 2, dir: '02-conditional-types', name: 'Conditional Type + infer로 타입 추출하기' },
  { num: 3, dir: '03-discriminated-union', name: 'Discriminated Union과 타입 좁히기' },
  { num: 4, dir: '04-compare-keys', name: '두 타입 비교해서 diff 계산하기' },
  { num: 5, dir: '05-compare-merge-context', name: 'CompareMergeContext 완성' },
  { num: 6, dir: '06-use-reducer', name: 'useReducer로 복잡한 상태 관리하기' },
  { num: 7, dir: '07-use-history', name: 'useHistory 훅 구현' },
  { num: 8, dir: '08-use-latest-ref', name: 'useRef로 최신 상태 참조 유지하기' },
  { num: 9, dir: '09-functional-update', name: '함수형 업데이트와 스프레드 머지' },
  { num: 10, dir: '10-funnel-history', name: 'useHistory + transition 조합' },
  { num: 11, dir: '11-router-interface', name: '인터페이스 설계: Router 계약 정의' },
  { num: 12, dir: '12-factory-pattern', name: 'Factory 패턴: createUseFunnel' },
  { num: 13, dir: '13-generic-options', name: '제네릭으로 라우터별 옵션 확장하기' },
  { num: 14, dir: '14-builder-pattern', name: 'Builder 패턴: createFunnelSteps' },
  { num: 15, dir: '15-component-composition', name: 'Object.assign 컴포넌트 합성' },
  { num: 16, dir: '16-render-props', name: 'Render Props: 함수형 렌더' },
  { num: 17, dir: '17-overlay-render', name: 'Render 확장: overlay 모드' },
  { num: 18, dir: '18-with-render', name: 'Render 확장: with 모드 (이벤트 디스패치)' },
  { num: 19, dir: '19-runtime-validation', name: 'Guard/Parse 런타임 검증' },
  { num: 20, dir: '20-final-usefunnel', name: 'Final: Mini useFunnel 조립' },
];

function runTest(stageDir: string): boolean {
  const result = spawnSync(
    'npx',
    ['vitest', 'run', '--reporter=verbose', `challenges/${stageDir}/`],
    { cwd: ROOT, stdio: 'inherit', encoding: 'utf-8' },
  );
  return result.status === 0;
}

function printProgress(passedCount: number, total: number) {
  const pct = Math.round((passedCount / total) * 100);
  const filled = Math.round((passedCount / total) * 20);
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
  console.log(`\n진행률: [${bar}] ${passedCount}/${total} (${pct}%)\n`);
}

async function main() {
  const args = process.argv.slice(2);

  // --all 모드: 전체 진행률 확인
  if (args.includes('--all')) {
    console.log('\n전체 진행률 확인\n');
    let passedCount = 0;

    for (const stage of STAGES) {
      const stageDir = join(CHALLENGES_DIR, stage.dir);
      if (!existsSync(stageDir)) {
        console.log(`  Stage ${String(stage.num).padStart(2, '0')}: 디렉토리 없음`);
        continue;
      }

      console.log(`\n--- Stage ${String(stage.num).padStart(2, '0')}: ${stage.name} ---`);
      const passed = runTest(stage.dir);

      if (passed) {
        passedCount++;
        console.log(`PASS`);
      } else {
        console.log(`FAIL`);
      }
    }

    printProgress(passedCount, STAGES.length);

    if (passedCount === STAGES.length) {
      console.log('모든 단계를 통과했습니다! use-funnel 수준의 훅을 설계할 수 있는 개발자가 되었습니다!\n');
    } else {
      const nextStage = STAGES[passedCount];
      if (nextStage) {
        console.log(`다음 단계: Stage ${String(nextStage.num).padStart(2, '0')} - ${nextStage.name}`);
        console.log(`  challenges/${nextStage.dir}/README.md 를 읽고 시작하세요.\n`);
      }
    }
    return;
  }

  // 특정 단계 실행: pnpm challenge 5
  const stageNum = parseInt(args[0] ?? '', 10);
  if (!isNaN(stageNum)) {
    const stage = STAGES.find((s) => s.num === stageNum);
    if (!stage) {
      console.error(`Stage ${stageNum}은 존재하지 않습니다. (1~20)`);
      process.exit(1);
    }

    console.log(`\nStage ${String(stage.num).padStart(2, '0')}: ${stage.name}\n`);
    const passed = runTest(stage.dir);

    if (passed) {
      console.log(`\nStage ${String(stage.num).padStart(2, '0')} 통과!\n`);
    } else {
      console.log(`\nStage ${String(stage.num).padStart(2, '0')} 실패. 위 에러를 확인하세요.\n`);
      process.exit(1);
    }
    return;
  }

  // 기본 모드: 현재 단계 실행 (이전 단계 게이트)
  console.log('\nHook 설계 트레이닝\n');

  let currentStageIndex = 0;

  // 이전 단계들이 모두 통과됐는지 조용히 확인
  for (let i = 0; i < STAGES.length; i++) {
    const stage = STAGES[i]!;
    // 조용히 실행 (stdout 숨김)
    const result = spawnSync(
      'npx',
      ['vitest', 'run', '--reporter=dot', `challenges/${stage.dir}/`],
      { cwd: ROOT, stdio: 'pipe', encoding: 'utf-8' },
    );

    if (result.status === 0) {
      currentStageIndex = i + 1;
    } else {
      break;
    }
  }

  if (currentStageIndex >= STAGES.length) {
    printProgress(STAGES.length, STAGES.length);
    console.log('모든 단계를 통과했습니다!\n');
    return;
  }

  const currentStage = STAGES[currentStageIndex]!;
  printProgress(currentStageIndex, STAGES.length);
  console.log(`현재 단계: Stage ${String(currentStage.num).padStart(2, '0')} - ${currentStage.name}`);
  const indexFile = currentStage.num >= 15 && currentStage.num !== 19 ? 'index.tsx' : 'index.ts';
  console.log(`  challenges/${currentStage.dir}/README.md 를 읽고 시작하세요.`);
  console.log(`  challenges/${currentStage.dir}/${indexFile} 를 수정해서 테스트를 통과시키세요.\n`);

  console.log(`테스트 실행 중...\n`);
  const passed = runTest(currentStage.dir);

  if (passed) {
    const next = STAGES[currentStageIndex + 1];
    console.log(`\nStage ${String(currentStage.num).padStart(2, '0')} 통과! (${currentStageIndex + 1}/${STAGES.length})`);
    if (next) {
      console.log(`다음: Stage ${String(next.num).padStart(2, '0')} - ${next.name}\n`);
    } else {
      console.log('모든 단계 완료!\n');
    }
  } else {
    console.log(`\nStage ${String(currentStage.num).padStart(2, '0')} 실패. 위 에러를 확인하고 다시 시도하세요.\n`);
    process.exit(1);
  }
}

main().catch(console.error);
