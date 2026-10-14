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
  // 10 mm bore
  { id: "6000", series: "6000 Deep Groove", type: "ball", d: 10, D: 26, B: 8, C: 4.55, C0: 1.96 },
  { id: "6200", series: "6200 Deep Groove", type: "ball", d: 10, D: 30, B: 9, C: 5.1, C0: 2.39 },
  { id: "6300", series: "6300 Deep Groove", type: "ball", d: 10, D: 35, B: 11, C: 8.1, C0: 3.45 },
  // 12 mm bore
  { id: "6001", series: "6000 Deep Groove", type: "ball", d: 12, D: 28, B: 8, C: 5.1, C0: 2.37 },
  { id: "6201", series: "6200 Deep Groove", type: "ball", d: 12, D: 32, B: 10, C: 6.89, C0: 3.05 },
  { id: "6301", series: "6300 Deep Groove", type: "ball", d: 12, D: 37, B: 12, C: 9.75, C0: 4.2 },
  // 15 mm bore
  { id: "6002", series: "6000 Deep Groove", type: "ball", d: 15, D: 32, B: 9, C: 5.6, C0: 2.84 },
  { id: "6202", series: "6200 Deep Groove", type: "ball", d: 15, D: 35, B: 11, C: 7.8, C0: 3.75 },
  { id: "6302", series: "6300 Deep Groove", type: "ball", d: 15, D: 42, B: 13, C: 11.4, C0: 5.4 },
  { id: "HK1512", series: "HK Needle Roller", type: "roller", d: 15, D: 21, B: 12, C: 8.42, C0: 9.8 },
  // 17 mm bore
  { id: "6003", series: "6000 Deep Groove", type: "ball", d: 17, D: 35, B: 10, C: 6.37, C0: 3.25 },
  { id: "6203", series: "6200 Deep Groove", type: "ball", d: 17, D: 40, B: 12, C: 9.95, C0: 4.75 },
  { id: "6303", series: "6300 Deep Groove", type: "ball", d: 17, D: 47, B: 14, C: 14.3, C0: 6.55 },
  { id: "6403", series: "6400 Deep Groove", type: "ball", d: 17, D: 62, B: 17, C: 22.9, C0: 10.8 },
  // 20 mm bore
  { id: "6004", series: "6000 Deep Groove", type: "ball", d: 20, D: 42, B: 12, C: 9.95, C0: 5.0 },
  { id: "6204", series: "6200 Deep Groove", type: "ball", d: 20, D: 47, B: 14, C: 13.5, C0: 6.55 },
  { id: "6304", series: "6300 Deep Groove", type: "ball", d: 20, D: 52, B: 15, C: 16.8, C0: 7.8 },
  { id: "6404", series: "6400 Deep Groove", type: "ball", d: 20, D: 72, B: 19, C: 30.7, C0: 15.0 },
  { id: "7204-B", series: "7200 Angular Contact 40°", type: "ball", d: 20, D: 47, B: 14, C: 14.0, C0: 8.5 },
  { id: "NU204", series: "NU200 Cylindrical Roller", type: "roller", d: 20, D: 47, B: 14, C: 25.1, C0: 22.0 },
  { id: "30204", series: "30200 Tapered Roller", type: "roller", d: 20, D: 47, B: 15.25, C: 26.9, C0: 26.5 },
  { id: "HK2016", series: "HK Needle Roller", type: "roller", d: 20, D: 26, B: 16, C: 13.2, C0: 19.3 },
  // 25 mm bore
  { id: "6005", series: "6000 Deep Groove", type: "ball", d: 25, D: 47, B: 12, C: 11.9, C0: 6.55 },
  { id: "6205", series: "6200 Deep Groove", type: "ball", d: 25, D: 52, B: 15, C: 14.8, C0: 7.8 },
  { id: "6305", series: "6300 Deep Groove", type: "ball", d: 25, D: 62, B: 17, C: 23.4, C0: 11.6 },
  { id: "7205-B", series: "7200 Angular Contact 40°", type: "ball", d: 25, D: 52, B: 15, C: 16.5, C0: 10.8 },
  { id: "NU205", series: "NU200 Cylindrical Roller", type: "roller", d: 25, D: 52, B: 15, C: 28.6, C0: 27.0 },
  { id: "NU305", series: "NU300 Cylindrical Roller", type: "roller", d: 25, D: 62, B: 17, C: 46.5, C0: 36.5 },
  { id: "30205", series: "30200 Tapered Roller", type: "roller", d: 25, D: 52, B: 16.25, C: 32.5, C0: 33.5 },
  { id: "HK2520", series: "HK Needle Roller", type: "roller", d: 25, D: 32, B: 20, C: 18.7, C0: 29.0 },
  // 30 mm bore
  { id: "6006", series: "6000 Deep Groove", type: "ball", d: 30, D: 55, B: 13, C: 13.8, C0: 8.3 },
  { id: "6206", series: "6200 Deep Groove", type: "ball", d: 30, D: 62, B: 16, C: 20.3, C0: 11.2 },
  { id: "6306", series: "6300 Deep Groove", type: "ball", d: 30, D: 72, B: 19, C: 29.6, C0: 16.0 },
  { id: "7206-B", series: "7200 Angular Contact 40°", type: "ball", d: 30, D: 62, B: 16, C: 22.5, C0: 15.0 },
  { id: "NU206", series: "NU200 Cylindrical Roller", type: "roller", d: 30, D: 62, B: 16, C: 39.0, C0: 37.5 },
  { id: "30206", series: "30200 Tapered Roller", type: "roller", d: 30, D: 62, B: 17.25, C: 43.0, C0: 45.0 },
  // 35 mm bore
  { id: "6007", series: "6000 Deep Groove", type: "ball", d: 35, D: 62, B: 14, C: 16.8, C0: 10.2 },
  { id: "6207", series: "6200 Deep Groove", type: "ball", d: 35, D: 72, B: 17, C: 27.0, C0: 15.3 },
  { id: "6307", series: "6300 Deep Groove", type: "ball", d: 35, D: 80, B: 21, C: 35.1, C0: 19.0 },
  { id: "NU207", series: "NU200 Cylindrical Roller", type: "roller", d: 35, D: 72, B: 17, C: 50.0, C0: 49.0 },
  // 40 mm bore
  { id: "6008", series: "6000 Deep Groove", type: "ball", d: 40, D: 68, B: 15, C: 17.8, C0: 11.6 },
  { id: "6208", series: "6200 Deep Groove", type: "ball", d: 40, D: 80, B: 18, C: 32.5, C0: 19.0 },
  { id: "6308", series: "6300 Deep Groove", type: "ball", d: 40, D: 90, B: 23, C: 42.3, C0: 24.0 },
  { id: "NU208", series: "NU200 Cylindrical Roller", type: "roller", d: 40, D: 80, B: 18, C: 56.0, C0: 55.0 },
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

export function staticEquivalentLoad(
  Fr_N: number,
  Fa_N: number,
  type: "ball" | "roller" = "ball",
): number {
  if (!(Fa_N > 0)) return Fr_N;
  if (type === "ball") {
    return Math.max(0.6 * Fr_N + 0.5 * Fa_N, Fr_N);
  }
  return Math.max(0.5 * Fr_N + 0.22 * Fa_N, Fr_N);
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

  const P0 = staticEquivalentLoad(Fr_N, Fa_N, bearing.type);
  const staticSafety =
    P0 > 0 ? (bearing.C0 * 1000) / P0 : Number.POSITIVE_INFINITY;
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
  customBearings: BearingCatalogItem[] = [],
): BearingLifeResult[] {
  const all = [...customBearings, ...BEARING_CATALOG];
  return all
    .filter((b) => b.d === bore_mm)
    .map((b) => bearingLife(b, Fr_N, Fa_N, rpm, reliability))
    .sort((a, b) => b.L10h - a.L10h);
}

export function availableBores(customBearings: BearingCatalogItem[] = []): number[] {
  const all = [...customBearings, ...BEARING_CATALOG];
  return [...new Set(all.map((b) => b.d))].sort((a, b) => a - b);
}
