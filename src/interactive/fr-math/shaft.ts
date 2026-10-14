/**
 * shaft.ts
 *
 * Two-support beam solver for transmission shafts in TypeScript.
 */

import type {
  GearMeshResult,
  PeakValue,
  ShaftInput,
  ShaftMaterialKey,
  ShaftResult,
  ShaftSegment,
  SurfaceFinishKey,
} from "./types";

/** Surface finish constants for ka = a * Sut^b, Sut in MPa. */
export const SURFACE_FINISH: Record<
  SurfaceFinishKey,
  { label: string; a: number; b: number }
> = {
  ground: { label: "Ground", a: 1.58, b: -0.085 },
  machined: { label: "Machined / cold-drawn", a: 4.51, b: -0.265 },
  hotRolled: { label: "Hot-rolled", a: 57.7, b: -0.718 },
  forged: { label: "As-forged", a: 272, b: -0.995 },
};

/** Reliability factor ke for the endurance limit. */
export const RELIABILITY_KE: Record<number, number> = {
  0.5: 1.0,
  0.9: 0.897,
  0.95: 0.868,
  0.99: 0.814,
  0.999: 0.753,
  0.9999: 0.702,
};

export const SHAFT_MATERIALS: Record<
  ShaftMaterialKey,
  { label: string; Sut: number; Sy: number; E: number }
> = {
  "4140": { label: "4140 Q&T (HRC 28)", Sut: 1020, Sy: 900, E: 207000 },
  "4340": { label: "4340 Q&T (HRC 35)", Sut: 1280, Sy: 1180, E: 207000 },
  "1045": { label: "1045 cold-drawn", Sut: 630, Sy: 530, E: 207000 },
  "8620": { label: "8620 carburized core", Sut: 780, Sy: 550, E: 207000 },
  "7075": { label: "7075-T6 aluminium", Sut: 572, Sy: 503, E: 71700 },
  Ti64: { label: "Ti-6Al-4V", Sut: 950, Sy: 880, E: 113800 },
};

const EPS = 1e-6;

function solvePlane(
  loads: { x: number; P: number }[],
  xA: number,
  xB: number,
  xs: number[],
) {
  const span = xB - xA;
  if (Math.abs(span) < EPS)
    throw new Error("Bearings must be at different positions.");

  let sumP = 0;
  let sumMoment = 0;
  for (const L of loads) {
    sumP += L.P;
    sumMoment += L.P * (L.x - xA);
  }

  const RB = sumMoment / span;
  const RA = sumP - RB;

  const stations = [{ x: xA, P: -RA }, { x: xB, P: -RB }, ...loads];

  const V = new Float64Array(xs.length);
  const M = new Float64Array(xs.length);

  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    let v = 0;
    let m = 0;
    for (const s of stations) {
      if (s.x <= x + EPS) {
        v -= s.P;
        m -= s.P * (x - s.x);
      }
    }
    V[i] = v;
    M[i] = m;
  }

  return { RA, RB, V, M };
}

function buildGrid(
  length: number,
  breakpoints: number[],
  samples: number,
): number[] {
  const xs: number[] = [];
  for (let i = 0; i <= samples; i++) xs.push((length * i) / samples);
  for (const bp of breakpoints) {
    if (bp > EPS) xs.push(bp - 1e-4);
    xs.push(bp);
    if (bp < length - EPS) xs.push(bp + 1e-4);
  }
  return Array.from(new Set(xs.filter((x) => x >= 0 && x <= length))).sort(
    (a, b) => a - b,
  );
}

function diameterAt(
  segments: ShaftSegment[],
  x: number,
  fallback: number,
): number {
  for (const s of segments) {
    if (x >= s.x0 - EPS && x <= s.x1 + EPS) return s.d;
  }
  return fallback;
}

function cumTrapz(xs: number[], y: Float64Array): Float64Array {
  const out = new Float64Array(xs.length);
  for (let i = 1; i < xs.length; i++) {
    out[i] = out[i - 1] + 0.5 * (y[i] + y[i - 1]) * (xs[i] - xs[i - 1]);
  }
  return out;
}

export function sampleAt(
  xs: number[] | Float64Array,
  series: Float64Array | number[],
  x: number,
): number {
  if (x <= xs[0]) return series[0];
  if (x >= xs[xs.length - 1]) return series[series.length - 1];
  let lo = 0;
  let hi = xs.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }
  const span = xs[hi] - xs[lo];
  const f = span < EPS ? 0 : (x - xs[lo]) / span;
  return series[lo] + (series[hi] - series[lo]) * f;
}

export function enduranceLimit(
  Sut: number,
  d_mm: number,
  finishKey: SurfaceFinishKey = "machined",
  reliability = 0.99,
  tempC = 20,
) {
  const SePrime = Sut <= 1400 ? 0.5 * Sut : 700;

  const f = SURFACE_FINISH[finishKey] || SURFACE_FINISH.machined;
  const ka = Math.min(f.a * Sut ** f.b, 1);

  let kb: number;
  if (d_mm < 2.79) kb = 1;
  else if (d_mm <= 51) kb = 1.24 * d_mm ** -0.107;
  else kb = 1.51 * Math.min(d_mm, 254) ** -0.157;

  const kc = 1;
  const kd = tempC <= 450 ? 1 : 0.8;
  const ke = RELIABILITY_KE[reliability] ?? 0.814;

  return { Se: ka * kb * kc * kd * ke * SePrime, ka, kb, kd, ke, SePrime };
}

export function analyzeShaft(model: ShaftInput): ShaftResult {
  const {
    length_mm,
    baseDiameter_mm,
    segments = [],
    supports,
    loads = [],
    torques = [],
    material = "4140",
    surfaceFinish = "machined",
    Kf = 1.6,
    Kfs = 1.4,
    reliability = 0.99,
    samples = 400,
  } = model;

  const [xA, xB] = supports;
  const mat = SHAFT_MATERIALS[material] || SHAFT_MATERIALS["4140"];

  const breakpoints = [
    xA,
    xB,
    ...loads.map((l) => l.x),
    ...torques.map((t) => t.x),
    ...segments.flatMap((s) => [s.x0, s.x1]),
  ];
  const xs = buildGrid(length_mm, breakpoints, samples);

  const vertical = solvePlane(
    loads.map((l) => ({ x: l.x, P: l.Fv || 0 })),
    xA,
    xB,
    xs,
  );
  const horizontal = solvePlane(
    loads.map((l) => ({ x: l.x, P: l.Fh || 0 })),
    xA,
    xB,
    xs,
  );

  const T = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    let t = 0;
    for (const tq of torques) if (tq.x <= xs[i] + EPS) t += tq.T * 1000;
    T[i] = t;
  }

  const n = xs.length;
  const d = new Float64Array(n);
  const M = new Float64Array(n);
  const V = new Float64Array(n);
  const sigmaBend = new Float64Array(n);
  const tauTorsion = new Float64Array(n);
  const vonMises = new Float64Array(n);
  const nFatigue = new Float64Array(n);
  const nYield = new Float64Array(n);
  const curvature = new Float64Array(n);

  for (let i = 0; i < n; i++) {
    d[i] = diameterAt(segments, xs[i], baseDiameter_mm);
    M[i] = Math.hypot(vertical.M[i], horizontal.M[i]);
    V[i] = Math.hypot(vertical.V[i], horizontal.V[i]);

    const Z = (Math.PI * d[i] ** 3) / 32;
    const Zp = 2 * Z;

    sigmaBend[i] = M[i] / Z;
    tauTorsion[i] = Math.abs(T[i]) / Zp;
    vonMises[i] = Math.hypot(sigmaBend[i], Math.sqrt(3) * tauTorsion[i]);

    const { Se } = enduranceLimit(mat.Sut, d[i], surfaceFinish, reliability);
    const alternating = (2 * Kf * M[i]) / Se;
    const midrange = (Math.sqrt(3) * Kfs * Math.abs(T[i])) / mat.Sut;
    const inv = (16 / (Math.PI * d[i] ** 3)) * (alternating + midrange);
    nFatigue[i] = inv > 0 ? 1 / inv : Number.POSITIVE_INFINITY;

    const peakVM = Math.hypot(
      (Kf * M[i]) / Z,
      Math.sqrt(3) * ((Kfs * Math.abs(T[i])) / Zp),
    );
    nYield[i] = peakVM > 0 ? mat.Sy / peakVM : Number.POSITIVE_INFINITY;

    const I = (Math.PI * d[i] ** 4) / 64;
    curvature[i] = 1 / (mat.E * I);
  }

  // Deflection: integrate M/(EI) twice
  const deflection: {
    v?: { y: Float64Array; theta: Float64Array };
    h?: { y: Float64Array; theta: Float64Array };
  } = {};

  const planePairs: [
    "v" | "h",
    { RA: number; RB: number; V: Float64Array; M: Float64Array },
  ][] = [
    ["v", vertical],
    ["h", horizontal],
  ];

  for (const [key, plane] of planePairs) {
    const kappa = new Float64Array(n);
    for (let i = 0; i < n; i++) kappa[i] = plane.M[i] * curvature[i];

    const thetaRaw = cumTrapz(xs, kappa);
    const yRaw = cumTrapz(xs, thetaRaw);

    const yA = sampleAt(xs, yRaw, xA);
    const yB = sampleAt(xs, yRaw, xB);
    const C1 = -(yB - yA) / (xB - xA);
    const C2 = -yA - C1 * xA;

    const y = new Float64Array(n);
    const theta = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      y[i] = yRaw[i] + C1 * xs[i] + C2;
      theta[i] = thetaRaw[i] + C1;
    }
    deflection[key] = { y, theta };
  }

  const yTotal = new Float64Array(n);
  const slopeTotal = new Float64Array(n);
  const vPlane = deflection.v;
  const hPlane = deflection.h;
  if (vPlane && hPlane) {
    for (let i = 0; i < n; i++) {
      yTotal[i] = Math.hypot(vPlane.y[i], hPlane.y[i]);
      slopeTotal[i] = Math.hypot(vPlane.theta[i], hPlane.theta[i]);
    }
  }

  // Peaks
  const peakOf = (
    series: Float64Array,
    mode: "max" | "min" = "max",
  ): PeakValue => {
    let idx = 0;
    for (let i = 1; i < n; i++) {
      const better =
        mode === "max" ? series[i] > series[idx] : series[i] < series[idx];
      if (better) idx = i;
    }
    return { x: xs[idx], value: series[idx], index: idx };
  };

  const peaks = {
    moment: peakOf(M),
    vonMises: peakOf(vonMises),
    fatigue: peakOf(nFatigue, "min"),
    deflection: peakOf(yTotal),
  };

  // Warnings
  const warnings: string[] = [];
  const torqueBalance = torques.reduce((s, t) => s + t.T, 0);
  if (Math.abs(torqueBalance) > 1e-3) {
    warnings.push(
      `Applied torques sum to ${torqueBalance.toFixed(2)} N-m instead of zero. Add an equal and opposite reaction torque.`,
    );
  }
  for (const [name, x] of [
    ["A", xA],
    ["B", xB],
  ] as const) {
    const slope = sampleAt(xs, slopeTotal, x);
    if (slope > 0.0017) {
      warnings.push(
        `Slope at bearing ${name} is ${(slope * 1000).toFixed(2)} mrad, past the ~1.7 mrad a deep-groove ball bearing tolerates.`,
      );
    }
  }
  for (const L of loads) {
    const slope = sampleAt(xs, slopeTotal, L.x);
    if (slope > 0.0005) {
      warnings.push(
        `Slope at "${L.label}" is ${(slope * 1000).toFixed(2)} mrad. Gear meshes want under 0.5 mrad, so raise Km in the gear tab.`,
      );
    }
  }
  if (peaks.fatigue.value < 1.5) {
    warnings.push(
      `Minimum fatigue safety factor is ${peaks.fatigue.value.toFixed(2)} at x = ${peaks.fatigue.x.toFixed(1)} mm.`,
    );
  }
  if (
    loads.some(
      (l) => l.x < Math.min(xA, xB) - EPS || l.x > Math.max(xA, xB) + EPS,
    )
  ) {
    warnings.push(
      "One or more loads sit outside the bearing span (overhung). Reactions and deflection account for it, but check bearing capacity carefully.",
    );
  }

  return {
    xs,
    d,
    V,
    M,
    T,
    vonMises,
    sigmaBend,
    tauTorsion,
    nFatigue,
    nYield,
    deflection: yTotal,
    slope: slopeTotal,
    planes: { vertical, horizontal },
    reactions: {
      A: {
        v: vertical.RA,
        h: horizontal.RA,
        resultant: Math.hypot(vertical.RA, horizontal.RA),
      },
      B: {
        v: vertical.RB,
        h: horizontal.RB,
        resultant: Math.hypot(vertical.RB, horizontal.RB),
      },
    },
    material: mat,
    peaks,
    warnings,
    supports: [xA, xB],
    loads,
    length_mm,
  };
}

export function gearLoadsFromMesh(
  mesh: GearMeshResult,
  x_mm: number,
  label = "Pinion",
) {
  return {
    x: x_mm,
    Fv: mesh.loads.Wr,
    Fh: mesh.loads.Wt,
    label,
  };
}
