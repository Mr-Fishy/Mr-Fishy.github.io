/**
 * bearing.ts
 *
 * ISO 281 rolling bearing life in TypeScript.
 */

import type {
  BearingCatalogItem,
  BearingLifeCurvePoint,
  BearingLifeResult,
} from "./types";

export const BEARING_TYPES: Record<
  "ball" | "roller",
  { label: string; p: number }
> = {
  ball: { label: "Ball bearing", p: 3 },
  roller: { label: "Roller bearing", p: 10 / 3 },
};

/** d/D/B in mm, C/C0 in kN. */
export const BEARING_CATALOG: BearingCatalogItem[] = [
  { id: "6003", type: "ball", d: 17, D: 35, B: 10, C: 6.37, C0: 3.25 },
  { id: "6203", type: "ball", d: 17, D: 40, B: 12, C: 9.95, C0: 4.75 },
  { id: "6303", type: "ball", d: 17, D: 47, B: 14, C: 14.3, C0: 6.55 },
  { id: "6403", type: "ball", d: 17, D: 62, B: 17, C: 22.9, C0: 10.8 },
  { id: "6004", type: "ball", d: 20, D: 42, B: 12, C: 9.95, C0: 5.0 },
  { id: "6204", type: "ball", d: 20, D: 47, B: 14, C: 13.5, C0: 6.55 },
  { id: "6304", type: "ball", d: 20, D: 52, B: 15, C: 16.8, C0: 7.8 },
  { id: "6404", type: "ball", d: 20, D: 72, B: 19, C: 30.7, C0: 15.0 },
  { id: "6005", type: "ball", d: 25, D: 47, B: 12, C: 11.9, C0: 6.55 },
  { id: "6205", type: "ball", d: 25, D: 52, B: 15, C: 14.8, C0: 7.8 },
  { id: "6305", type: "ball", d: 25, D: 62, B: 17, C: 23.4, C0: 11.6 },
  { id: "6006", type: "ball", d: 30, D: 55, B: 13, C: 13.8, C0: 8.3 },
  { id: "6206", type: "ball", d: 30, D: 62, B: 16, C: 20.3, C0: 11.2 },
  { id: "6306", type: "ball", d: 30, D: 72, B: 19, C: 29.6, C0: 16.0 },
  { id: "NU204", type: "roller", d: 20, D: 47, B: 14, C: 25.1, C0: 22.0 },
  { id: "NU205", type: "roller", d: 25, D: 52, B: 15, C: 28.6, C0: 27.0 },
  { id: "NU305", type: "roller", d: 25, D: 62, B: 17, C: 46.5, C0: 36.5 },
];

/** ISO 281 life adjustment factor a1 for reliabilities above 90%. */
const A1: [number, number][] = [
  [0.9, 1.0],
  [0.95, 0.64],
  [0.96, 0.55],
  [0.97, 0.47],
  [0.98, 0.37],
  [0.99, 0.25],
  [0.995, 0.19],
  [0.999, 0.093],
];

export function a1Factor(reliability: number): number {
  let best = A1[0];
  for (const row of A1) {
    if (Math.abs(row[0] - reliability) < Math.abs(best[0] - reliability))
      best = row;
  }
  return best[1];
}

const EY_TABLE: [number, number, number][] = [
  [0.025, 0.22, 2.0],
  [0.04, 0.24, 1.8],
  [0.07, 0.27, 1.6],
  [0.13, 0.31, 1.4],
  [0.25, 0.37, 1.2],
  [0.5, 0.44, 1.0],
];

function interpEY(ratio: number): { e: number; Y: number } {
  if (ratio <= EY_TABLE[0][0]) return { e: EY_TABLE[0][1], Y: EY_TABLE[0][2] };
  const last = EY_TABLE[EY_TABLE.length - 1];
  if (ratio >= last[0]) return { e: last[1], Y: last[2] };
  for (let i = 0; i < EY_TABLE.length - 1; i++) {
    const [r0, e0, y0] = EY_TABLE[i];
    const [r1, e1, y1] = EY_TABLE[i + 1];
    if (ratio >= r0 && ratio <= r1) {
      const f = (ratio - r0) / (r1 - r0);
      return { e: e0 + (e1 - e0) * f, Y: y0 + (y1 - y0) * f };
    }
  }
  return { e: 0.44, Y: 1.0 };
}

export function equivalentLoad(
  Fr_N: number,
  Fa_N: number,
  C0_kN: number,
  type: "ball" | "roller" = "ball",
): { P: number; X: number; Y: number; e: number } {
  if (!(Fa_N > 0)) return { P: Fr_N, X: 1, Y: 0, e: 0 };

  if (type === "roller") {
    return { P: Fr_N, X: 1, Y: 0, e: 0 };
  }

  const { e, Y } = interpEY(Fa_N / (C0_kN * 1000));
  if (Fa_N / Fr_N <= e) return { P: Fr_N, X: 1, Y: 0, e };
  return { P: 0.56 * Fr_N + Y * Fa_N, X: 0.56, Y, e };
}

export function bearingLife(
  bearing: BearingCatalogItem,
  Fr_N: number,
  Fa_N: number,
  rpm: number,
  reliability = 0.9,
): BearingLifeResult {
  const p = BEARING_TYPES[bearing.type].p;
  const { P, X, Y, e } = equivalentLoad(Fr_N, Fa_N, bearing.C0, bearing.type);
  const C = bearing.C * 1000;

  const L10 = P > 0 ? (C / P) ** p : Number.POSITIVE_INFINITY;
  const L10h = rpm > 0 ? (1e6 / (60 * rpm)) * L10 : Number.POSITIVE_INFINITY;
  const a1 = a1Factor(reliability);

  const staticSafety =
    P > 0
      ? (bearing.C0 * 1000) / Math.max(Fr_N, Fa_N, 1e-9)
      : Number.POSITIVE_INFINITY;
  const dm = (bearing.d + bearing.D) / 2;
  const nDm = rpm * dm;

  return {
    bearing,
    P,
    X,
    Y,
    e,
    p,
    L10,
    L10h,
    Lnm: L10 * a1,
    Lnmh: L10h * a1,
    a1,
    staticSafety,
    loadRatio: P / C,
    nDm,
    speedWarning:
      nDm > 500000
        ? `n*dm = ${(nDm / 1000).toFixed(0)}k mm/min exceeds the ~500k grease limit; oil lubrication required.`
        : null,
  };
}

export function requiredRating(
  P_N: number,
  rpm: number,
  targetHours: number,
  type: "ball" | "roller" = "ball",
): number {
  const p = BEARING_TYPES[type].p;
  const L10 = (targetHours * 60 * rpm) / 1e6;
  return (P_N * L10 ** (1 / p)) / 1000;
}

export function lifeCurve(
  bearing: BearingCatalogItem,
  Fr_N: number,
  Fa_N: number,
  rpmRange: [number, number],
  {
    mode = "constantLoad",
    referenceRPM = 3000,
    reliability = 0.9,
  }: {
    mode?: "constantLoad" | "constantPower";
    referenceRPM?: number;
    reliability?: number;
  } = {},
): BearingLifeCurvePoint[] {
  const [minRPM, maxRPM] = rpmRange;
  const points: BearingLifeCurvePoint[] = [];
  const steps = 120;

  for (let i = 0; i <= steps; i++) {
    const rpm = minRPM + ((maxRPM - minRPM) * i) / steps;
    if (rpm <= 0) continue;

    const scale = mode === "constantPower" ? referenceRPM / rpm : 1;
    const life = bearingLife(
      bearing,
      Fr_N * scale,
      Fa_N * scale,
      rpm,
      reliability,
    );
    points.push({ rpm, L10h: life.L10h, Lnmh: life.Lnmh });
  }
  return points;
}

export function rankCandidates(
  bore_mm: number,
  Fr_N: number,
  Fa_N: number,
  rpm: number,
  reliability = 0.9,
): BearingLifeResult[] {
  return BEARING_CATALOG.filter((b) => b.d === bore_mm)
    .map((b) => bearingLife(b, Fr_N, Fa_N, rpm, reliability))
    .sort((a, b) => b.L10h - a.L10h);
}

export function availableBores(): number[] {
  return [...new Set(BEARING_CATALOG.map((b) => b.d))].sort((a, b) => a - b);
}
