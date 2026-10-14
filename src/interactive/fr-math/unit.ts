/**
 * unit.ts
 *
 * Universal Unit Converter in TypeScript.
 *
 * Every solver in this app works in metric only. The UI converts on the way in
 * and on the way out, so no formula ever has to care which toggle is active.
 *
 * Solver Standard:
 * - Kilowatts (kW)
 * - Millimeters (mm)
 * - Newtons (N)
 * - Newton-meters (Nm)
 * - MegaPascals (MPa)
 * - Meters per second (m/s)
 */

import type { UnitLabels } from "./types";

export class UnitConverter {
  readonly HP_TO_KW = 0.745699872;
  readonly IN_TO_MM = 25.4;
  readonly LBF_TO_N = 4.4482216;
  readonly LB_IN_TO_NM = 0.112984829;
  readonly LB_FT_TO_NM = 1.35581795;
  readonly PSI_TO_MPA = 0.00689475729;
  readonly MS_TO_FT_MIN = 196.850394;

  // To Metric
  powerToMetric(val: number, isImperial: boolean): number {
    return isImperial ? val * this.HP_TO_KW : val;
  }
  lengthToMetric(val: number, isImperial: boolean): number {
    return isImperial ? val * this.IN_TO_MM : val;
  }
  forceToMetric(val: number, isImperial: boolean): number {
    return isImperial ? val * this.LBF_TO_N : val;
  }
  torqueToMetric(val: number, isImperial: boolean): number {
    return isImperial ? val * this.LB_FT_TO_NM : val;
  }
  stressToMetric(val: number, isImperial: boolean): number {
    return isImperial ? val * this.PSI_TO_MPA : val;
  }
  velocityToMetric(val: number, isImperial: boolean): number {
    return isImperial ? val / this.MS_TO_FT_MIN : val;
  }

  // Imperial DP to Metric Module
  pitchToModule(pd: number, isImperial: boolean): number {
    return isImperial ? this.IN_TO_MM / pd : pd;
  }

  // To Imperial
  powerToDisplay(val: number, isImperial: boolean): number {
    return isImperial ? val / this.HP_TO_KW : val;
  }
  lengthToDisplay(val: number, isImperial: boolean): number {
    return isImperial ? val / this.IN_TO_MM : val;
  }
  forceToDisplay(val: number, isImperial: boolean): number {
    return isImperial ? val / this.LBF_TO_N : val;
  }
  torqueToDisplay(val: number, isImperial: boolean): number {
    return isImperial ? val / this.LB_FT_TO_NM : val;
  }
  stressToDisplay(val: number, isImperial: boolean): number {
    return isImperial ? val / this.PSI_TO_MPA : val;
  }
  velocityToDisplay(val: number, isImperial: boolean): number {
    return isImperial ? val * this.MS_TO_FT_MIN : val;
  }

  // Module back to Imperial DP
  moduleToDisplay(m: number, isImperial: boolean): number {
    return isImperial ? this.IN_TO_MM / m : m;
  }

  /** Unit strings for labels. */
  labels(isImperial: boolean): UnitLabels {
    return {
      power: isImperial ? "HP" : "kW",
      length: isImperial ? "in" : "mm",
      pitch: isImperial ? "Diametral Pitch (1/in)" : "Module (mm)",
      force: isImperial ? "lbf" : "N",
      torque: isImperial ? "lb-ft" : "N-m",
      stress: isImperial ? "psi" : "MPa",
      velocity: isImperial ? "ft/min" : "m/s",
    };
  }
}

export const Units = new UnitConverter();

/** Fixed-decimal formatter that degrades gracefully on NaN / Infinity. */
export function fmt(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "--";
  if (Math.abs(value) >= 1e6) return value.toExponential(2);
  return value.toFixed(digits);
}
