/**
 * optimize.ts
 *
 * Gearbox optimization: Grid search over Np and Ng to hit a total gear ratio
 * with 1-4 stages, filtered by AGMA bending and pitting safety factors (> 1.0).
 */

import type { OptimizationResult } from "./types";

export interface GearModuleEvaluator {
  getBaseRPM: () => number;
  evaluate: (
    gear: number,
    pin: number,
    rpm: number,
  ) => {
    bending: number;
    pitting: number;
  };
}

export function optimize(
  targetRatio: number,
  numStages: number,
  minTooth: number,
  maxTooth: number,
  gearModule: GearModuleEvaluator,
): OptimizationResult[] {
  const TOLERANCE = 0.05;

  const pairs: { p: number; g: number; r: number }[] = [];
  for (let p = minTooth; p <= maxTooth; p++) {
    for (let g = Math.max(p, minTooth); g <= maxTooth; g++) {
      pairs.push({ p, g, r: g / p });
    }
  }

  const targetStageRatio = targetRatio ** (1 / numStages);
  pairs.sort(
    (a, b) =>
      Math.abs(a.r - targetStageRatio) - Math.abs(b.r - targetStageRatio),
  );

  const validConfigs: OptimizationResult[] = [];

  function evaluateConfig(
    stages: { p: number; g: number; r: number }[],
  ): OptimizationResult | null {
    let totalRatio = 1;
    let minBending = Number.POSITIVE_INFINITY;
    let minPitting = Number.POSITIVE_INFINITY;
    let currentRPM = gearModule.getBaseRPM();

    for (let i = 0; i < stages.length; i++) {
      const { p, g, r } = stages[i];

      const sf = gearModule.evaluate(g, p, currentRPM);
      if (sf.bending < 1.0 || sf.pitting < 1.0) {
        return null;
      }

      minBending = Math.min(minBending, sf.bending);
      minPitting = Math.min(minPitting, sf.pitting);

      totalRatio *= r;
      currentRPM /= r;
    }

    return {
      stages: stages.map((s) => `(${s.p}, ${s.g})`),
      ratio: totalRatio.toFixed(3),
      bending: minBending.toFixed(2),
      pitting: minPitting.toFixed(2),
      score: Math.min(minBending, minPitting),
    };
  }

  function search(
    depth: number,
    currentStages: { p: number; g: number; r: number }[],
    currentRatio: number,
  ) {
    if (depth === numStages) {
      const error = Math.abs(currentRatio - targetRatio) / targetRatio;
      if (error <= TOLERANCE) {
        const result = evaluateConfig(currentStages);
        if (result) {
          validConfigs.push(result);
        }
      }
      return;
    }

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const nextRatio = currentRatio * pair.r;

      const remainingStages = numStages - depth - 1;
      if (remainingStages > 0) {
        const maxPossible =
          nextRatio * (maxTooth / minTooth) ** remainingStages;
        const minPossible =
          nextRatio * (minTooth / maxTooth) ** remainingStages;

        if (maxPossible < targetRatio * (1 - TOLERANCE)) continue;
        if (minPossible > targetRatio * (1 + TOLERANCE)) continue;
      }

      if (validConfigs.length > 20000) return;

      currentStages.push(pair);
      search(depth + 1, currentStages, nextRatio);
      currentStages.pop();
    }
  }

  search(0, [], 1.0);

  return validConfigs.sort((a, b) => b.score - a.score).slice(0, 5);
}

export default optimize;
