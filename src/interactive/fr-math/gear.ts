/**
 * gear.ts
 *
 * AGMA 2001-D04 spur gear rating (metric form, ISO/AGMA 2101 equivalent).
 * All inputs must be metric. All stresses come out in MPa.
 */

import type {
  GearMeshInput,
  GearMeshResult,
  MaterialKey,
  MountingKey,
  OverloadKey,
} from "./types";

/** Overload factor lookup. Driven-machine shock dominates on a race car. */
export const OVERLOAD: Record<OverloadKey, { label: string; Ko: number }> = {
  uniform: { label: "Uniform (dyno / bench)", Ko: 1.0 },
  light: { label: "Light shock", Ko: 1.25 },
  moderate: { label: "Moderate shock (FSAE / Baja typical)", Ko: 1.5 },
  heavy: { label: "Heavy shock (impact loading)", Ko: 1.75 },
};

// Cma curve-fit constants for F in mm.
// Derived from Imperial constants by B_metric = B_imp / 25.4, C_metric = C_imp / 25.4^2
const CMA_CONSTANTS: Record<
  MountingKey,
  { label: string; A: number; B: number; C: number }
> = {
  open: {
    label: "Open gearing",
    A: 0.247,
    B: 0.0167 / 25.4,
    C: -0.765e-4 / (25.4 * 25.4),
  },
  commercial: {
    label: "Commercial enclosed",
    A: 0.127,
    B: 0.0158 / 25.4,
    C: -1.093e-4 / (25.4 * 25.4),
  },
  precision: {
    label: "Precision enclosed",
    A: 0.0675,
    B: 0.0128 / 25.4,
    C: -0.926e-4 / (25.4 * 25.4),
  },
  extraPrecision: {
    label: "Extra-precision enclosed",
    A: 0.0036,
    B: 0.0102 / 25.4,
    C: -0.822e-4 / (25.4 * 25.4),
  },
};

export const MOUNTING = CMA_CONSTANTS;

/**
 * Allowable stress numbers, MPa.
 * Through-hardened grades are Brinell-dependent; case-hardened grades are flat.
 */
export const MATERIALS: Record<
  MaterialKey,
  {
    label: string;
    hardnessRange: [number, number];
    St: (HB: number, grade: 1 | 2) => number;
    Sc: (HB: number, grade: 1 | 2) => number;
    E: number;
    v: number;
  }
> = {
  throughHardened: {
    label: "Through-hardened steel (4140, 4340)",
    hardnessRange: [180, 400],
    St: (HB, grade) => (grade === 2 ? 0.703 * HB + 113 : 0.533 * HB + 88.3),
    Sc: (HB, grade) => (grade === 2 ? 2.41 * HB + 237 : 2.22 * HB + 200),
    E: 207000,
    v: 0.292,
  },
  carburized: {
    label: "Carburized & hardened (8620, 9310)",
    hardnessRange: [550, 650],
    St: (_HB, grade) => (grade === 2 ? 450 : 380),
    Sc: (_HB, grade) => (grade === 2 ? 1550 : 1240),
    E: 207000,
    v: 0.292,
  },
  nitrided: {
    label: "Nitrided through-hardened (4140, 4340)",
    hardnessRange: [200, 400],
    St: (HB, grade) => (grade === 2 ? 0.7255 * HB + 63.89 : 0.568 * HB + 83.8),
    Sc: (HB, grade) => (grade === 2 ? 1.005 * HB + 850 : 1.005 * HB + 750),
    E: 207000,
    v: 0.292,
  },
  maraging: {
    label: "Maraging 300 steel (aerospace)",
    hardnessRange: [500, 600],
    St: (_HB, grade) => (grade === 2 ? 520 : 440),
    Sc: (_HB, grade) => (grade === 2 ? 1650 : 1400),
    E: 200000,
    v: 0.3,
  },
  al7075: {
    label: "7075-T6 hard-anodized aluminium",
    hardnessRange: [130, 160],
    St: (_HB, _grade) => 210,
    Sc: (_HB, _grade) => 580,
    E: 71700,
    v: 0.33,
  },
  bronze: {
    label: "C95400 aluminium bronze",
    hardnessRange: [150, 200],
    St: (_HB, _grade) => 250,
    Sc: (_HB, _grade) => 700,
    E: 110000,
    v: 0.32,
  },
  custom: {
    label: "Custom material",
    hardnessRange: [50, 750],
    St: (_HB, _grade) => 350,
    Sc: (_HB, _grade) => 1200,
    E: 207000,
    v: 0.292,
  },
};

const J_TEETH = [12, 15, 17, 20, 24, 30, 40, 60, 80, 150];
const J_MATE = [17, 25, 35, 50, 85, 170, 1000];
const J_TABLE = [
  [0.24, 0.245, 0.25, 0.25, 0.255, 0.26, 0.265], // 12
  [0.26, 0.27, 0.275, 0.28, 0.285, 0.29, 0.295], // 15
  [0.27, 0.285, 0.29, 0.295, 0.3, 0.305, 0.31], // 17
  [0.29, 0.3, 0.31, 0.315, 0.32, 0.325, 0.33], // 20
  [0.3, 0.315, 0.325, 0.33, 0.335, 0.34, 0.35], // 24
  [0.315, 0.33, 0.34, 0.345, 0.355, 0.36, 0.37], // 30
  [0.33, 0.35, 0.36, 0.365, 0.375, 0.385, 0.39], // 40
  [0.35, 0.37, 0.38, 0.39, 0.4, 0.405, 0.415], // 60
  [0.36, 0.38, 0.39, 0.4, 0.41, 0.42, 0.43], // 80
  [0.375, 0.395, 0.41, 0.42, 0.43, 0.44, 0.45], // 150
];

function interpIndex(axis: number[], value: number): { i: number; f: number } {
  const v = Math.min(Math.max(value, axis[0]), axis[axis.length - 1]);
  let i = axis.length - 2;
  while (i > 0 && v < axis[i]) i--;
  const span = axis[i + 1] - axis[i];
  return { i, f: span === 0 ? 0 : (v - axis[i]) / span };
}

export const AGMA = {
  /** Pitch line velocity, m/s. */
  pitchLineVelocity(diameter_mm: number, rpm: number): number {
    return (Math.PI * diameter_mm * rpm) / 60000;
  },

  /** Dynamic factor Kv, metric form. */
  Kv(Vt_ms: number, Qv: number): number {
    const q = Math.min(Math.max(Qv, 3), 12);
    const B = 0.25 * (12 - q) ** (2 / 3);
    const A = 50 + 56 * (1 - B);
    return ((A + Math.sqrt(200 * Math.max(Vt_ms, 0))) / A) ** B;
  },

  /** Highest pitch line velocity the chosen quality number is rated for, m/s. */
  maxVelocity(Qv: number): number {
    const q = Math.min(Math.max(Qv, 3), 12);
    const B = 0.25 * (12 - q) ** (2 / 3);
    const A = 50 + 56 * (1 - B);
    return (A + (q - 3)) ** 2 / 200;
  },

  /** Size factor Ks. */
  Ks(module_mm: number, faceWidth_mm: number): number {
    if (module_mm < 5) return 1.0;
    return 1.18 * ((faceWidth_mm * module_mm) / 25.4) ** 0.0535;
  },

  /** Load distribution factor Km (Cmf). */
  Km({
    faceWidth_mm,
    pitchDia_mm,
    crowned = false,
    mounting = "commercial",
    straddleMounted = true,
    adjustedAtAssembly = false,
  }: {
    faceWidth_mm: number;
    pitchDia_mm: number;
    crowned?: boolean;
    mounting?: MountingKey;
    straddleMounted?: boolean;
    adjustedAtAssembly?: boolean;
  }) {
    const F = faceWidth_mm;
    const d = pitchDia_mm;

    const Cmc = crowned ? 0.8 : 1.0;

    let ratio = F / (10 * d);
    if (ratio < 0.05) ratio = 0.05;

    let Cpf: number;
    if (F <= 25) Cpf = ratio - 0.025;
    else if (F <= 432) Cpf = ratio - 0.0375 + 4.92e-4 * F;
    else Cpf = ratio - 0.1109 + 8.15e-4 * F - 3.53e-7 * F * F;
    Cpf = Math.max(Cpf, 0);

    const Cpm = straddleMounted ? 1.0 : 1.1;

    const k = CMA_CONSTANTS[mounting] || CMA_CONSTANTS.commercial;
    const Cma = k.A + k.B * F + k.C * F * F;

    const Ce = adjustedAtAssembly ? 0.8 : 1.0;

    return {
      Km: 1 + Cmc * (Cpf * Cpm + Cma * Ce),
      Cmc,
      Cpf,
      Cpm,
      Cma,
      Ce,
    };
  },

  /** Rim thickness factor KB. */
  KB(rimThickness_mm: number, wholeDepth_mm: number): number {
    if (!(rimThickness_mm > 0) || !(wholeDepth_mm > 0)) return 1.0;
    const mB = rimThickness_mm / wholeDepth_mm;
    if (mB >= 1.2) return 1.0;
    return 1.6 * Math.log(2.242 / Math.max(mB, 0.05));
  },

  /** Bending geometry factor J. */
  J(teeth: number, mateTeeth: number): number {
    const r = interpIndex(J_TEETH, teeth);
    const c = interpIndex(J_MATE, mateTeeth);
    const a =
      J_TABLE[r.i][c.i] + (J_TABLE[r.i][c.i + 1] - J_TABLE[r.i][c.i]) * c.f;
    const b =
      J_TABLE[r.i + 1][c.i] +
      (J_TABLE[r.i + 1][c.i + 1] - J_TABLE[r.i + 1][c.i]) * c.f;
    return a + (b - a) * r.f;
  },

  /** Surface (pitting) geometry factor I. */
  I(pressureAngle_deg: number, gearRatio: number): number {
    const phi = (pressureAngle_deg * Math.PI) / 180;
    const mG = Math.max(gearRatio, 1e-9);
    return ((Math.cos(phi) * Math.sin(phi)) / 2) * (mG / (mG + 1));
  },

  /** Elastic coefficient ZE (Cp). */
  ZE(E1 = 207000, v1 = 0.292, E2 = 207000, v2 = 0.292): number {
    const denom = (1 - v1 * v1) / E1 + (1 - v2 * v2) / E2;
    return Math.sqrt(1 / (Math.PI * denom));
  },

  /** Bending stress cycle factor YN. */
  YN(cycles: number): number {
    const N = Math.max(cycles, 1e3);
    if (N <= 1e7) return Math.min(Math.max(6.1514 * N ** -0.1192, 1.0), 2.5);
    return 1.3558 * N ** -0.0178;
  },

  /** Pitting resistance stress cycle factor ZN. */
  ZN(cycles: number): number {
    const N = Math.max(cycles, 1e4);
    if (N <= 1e7) return Math.min(Math.max(2.466 * N ** -0.056, 1.0), 1.6);
    return 1.4488 * N ** -0.023;
  },

  /** Reliability factor KR. */
  KR(reliability: number): number {
    const R = Math.min(Math.max(reliability, 0.5), 0.99999);
    if (R < 0.99) return 0.658 - 0.0759 * Math.log(1 - R);
    return 0.5 - 0.109 * Math.log(1 - R);
  },

  /** Temperature factor KT. */
  KT(tempC: number): number {
    if (tempC <= 120) return 1.0;
    return (273 + tempC) / 393;
  },
};

export class AGMAGear {
  static getTransmittedLoad(
    power_kW: number,
    diameter_mm: number,
    rpm: number,
  ): number {
    if (rpm === 0 || diameter_mm === 0) return 0;
    return (60e6 * power_kW) / (Math.PI * diameter_mm * rpm);
  }

  static getTorque(power_kW: number, rpm: number): number {
    if (rpm === 0) return 0;
    return (power_kW * 1000 * 60) / (2 * Math.PI * rpm);
  }

  static getBendingStress(
    Wt: number,
    module_mm: number,
    faceWidth_mm: number,
    J: number,
    factors: {
      Ko?: number;
      Kv?: number;
      Ks?: number;
      Km?: number;
      KB?: number;
    },
  ): number {
    const { Ko = 1, Kv = 1, Ks = 1, Km = 1, KB = 1 } = factors;
    if (!(faceWidth_mm > 0) || !(module_mm > 0) || !(J > 0)) return 0;

    const sizeComponent = 1 / (faceWidth_mm * module_mm);
    const geometryComponent = (Km * KB) / J;

    return Wt * Ko * Kv * Ks * sizeComponent * geometryComponent;
  }

  static getContactStress(
    Wt: number,
    diameter_mm: number,
    faceWidth_mm: number,
    I: number,
    factors: { Ko?: number; Kv?: number; Ks?: number; Km?: number },
    Ze = 191,
    Cf = 1.0,
  ): number {
    const { Ko = 1, Kv = 1, Ks = 1, Km = 1 } = factors;
    if (!(diameter_mm > 0) || !(faceWidth_mm > 0) || !(I > 0)) return 0;

    const loadComponent = Wt * Ko * Kv * Ks;
    const geometryComponent = (Km / (diameter_mm * faceWidth_mm)) * (Cf / I);

    return Ze * Math.sqrt(loadComponent * geometryComponent);
  }

  static getPitchDiameter(teeth: number, module_mm: number): number {
    return teeth * module_mm;
  }
}

export function analyzeMesh(input: GearMeshInput): GearMeshResult {
  const {
    power_kW,
    pinionRPM,
    module_mm,
    faceWidth_mm,
    pinionTeeth,
    gearTeeth,
    pressureAngle_deg = 20,
    Qv = 9,
    overload = "moderate",
    mounting = "commercial",
    crowned = false,
    material = "carburized",
    grade = 1,
    hardness_HB = 600,
    reliability = 0.99,
    tempC = 90,
    designLife_h = 30,
    rimThickness_mm = 0,
    J_override = null,
  } = input;

  const mG = gearTeeth / pinionTeeth;
  const d_p = AGMAGear.getPitchDiameter(pinionTeeth, module_mm);
  const d_g = AGMAGear.getPitchDiameter(gearTeeth, module_mm);
  const wholeDepth = 2.25 * module_mm;

  const Vt = AGMA.pitchLineVelocity(d_p, pinionRPM);
  const Wt = AGMAGear.getTransmittedLoad(power_kW, d_p, pinionRPM);
  const phi = (pressureAngle_deg * Math.PI) / 180;
  const Wr = Wt * Math.tan(phi);
  const Wn = Wt / Math.cos(phi);
  const torque_Nm = AGMAGear.getTorque(power_kW, pinionRPM);

  // --- Rating factors ---
  const Ko = (OVERLOAD[overload] || OVERLOAD.moderate).Ko;
  const Kv = AGMA.Kv(Vt, Qv);
  const Ks = AGMA.Ks(module_mm, faceWidth_mm);
  const kmDetail = AGMA.Km({
    faceWidth_mm,
    pitchDia_mm: d_p,
    crowned,
    mounting,
  });
  const Km = kmDetail.Km;
  const KB = AGMA.KB(rimThickness_mm, wholeDepth);
  const factors = { Ko, Kv, Ks, Km, KB };

  const customMat = input.customMaterial;
  const isCustom = material === "custom" && customMat != null;
  const mat = isCustom
    ? {
        label: customMat.label,
        hardnessRange: [50, 750] as [number, number],
        St: () => customMat.St,
        Sc: () => customMat.Sc,
        E: customMat.E,
        v: customMat.v,
      }
    : MATERIALS[material] || MATERIALS.carburized;

  const J_p = J_override ?? AGMA.J(pinionTeeth, gearTeeth);
  const J_g = J_override ?? AGMA.J(gearTeeth, pinionTeeth);
  const I = AGMA.I(pressureAngle_deg, mG);
  const ZE = AGMA.ZE(mat.E, mat.v, mat.E, mat.v);

  // --- Stresses ---
  const sigma_b_p = AGMAGear.getBendingStress(
    Wt,
    module_mm,
    faceWidth_mm,
    J_p,
    factors,
  );
  const sigma_b_g = AGMAGear.getBendingStress(
    Wt,
    module_mm,
    faceWidth_mm,
    J_g,
    factors,
  );
  const sigma_c = AGMAGear.getContactStress(
    Wt,
    d_p,
    faceWidth_mm,
    I,
    factors,
    ZE,
  );

  // --- Allowables ---
  const St = isCustom ? customMat.St : mat.St(hardness_HB, grade);
  const Sc = isCustom ? customMat.Sc : mat.Sc(hardness_HB, grade);

  const cycles_p = 60 * designLife_h * pinionRPM;
  const cycles_g = cycles_p / mG;
  const YN_p = AGMA.YN(cycles_p);
  const YN_g = AGMA.YN(cycles_g);
  const ZN_p = AGMA.ZN(cycles_p);
  const ZN_g = AGMA.ZN(cycles_g);
  const KR = AGMA.KR(reliability);
  const KT = AGMA.KT(tempC);
  const CH = 1.0;

  const allowB_p = (St * YN_p) / (KT * KR);
  const allowB_g = (St * YN_g) / (KT * KR);
  const allowC_p = (Sc * ZN_p * CH) / (KT * KR);
  const allowC_g = (Sc * ZN_g * CH) / (KT * KR);

  // --- Safety factors ---
  const SF_p = sigma_b_p > 0 ? allowB_p / sigma_b_p : Number.POSITIVE_INFINITY;
  const SF_g = sigma_b_g > 0 ? allowB_g / sigma_b_g : Number.POSITIVE_INFINITY;
  const SH_p = sigma_c > 0 ? allowC_p / sigma_c : Number.POSITIVE_INFINITY;
  const SH_g = sigma_c > 0 ? allowC_g / sigma_c : Number.POSITIVE_INFINITY;

  const SH_p_load = SH_p * SH_p;
  const SH_g_load = SH_g * SH_g;

  const governing =
    Math.min(SF_p, SF_g) <= Math.min(SH_p_load, SH_g_load)
      ? "bending"
      : "pitting";

  const warnings: string[] = [];
  const VtMax = AGMA.maxVelocity(Qv);
  if (Vt > VtMax) {
    warnings.push(
      `Pitch line velocity ${Vt.toFixed(1)} m/s exceeds the ${VtMax.toFixed(1)} m/s ceiling for Qv ${Qv}. Specify a higher quality number.`,
    );
  }
  if (faceWidth_mm < 4 * module_mm || faceWidth_mm > 8 * module_mm) {
    warnings.push(
      `Face width is ${(faceWidth_mm / module_mm).toFixed(1)}x module. Common practice keeps this between 4x and 8x.`,
    );
  }
  if (pinionTeeth < 17 && pressureAngle_deg <= 20) {
    warnings.push(
      `${pinionTeeth} teeth at ${pressureAngle_deg} deg will undercut unless the pinion is profile-shifted. J is optimistic here.`,
    );
  }
  if (rimThickness_mm > 0 && KB > 1.0) {
    warnings.push(
      `Thin rim: KB = ${KB.toFixed(2)} is adding ${((KB - 1) * 100).toFixed(0)}% to root stress.`,
    );
  }

  return {
    geometry: {
      mG,
      d_p,
      d_g,
      module_mm,
      faceWidth_mm,
      wholeDepth,
      pinionTeeth,
      gearTeeth,
      pressureAngle_deg,
    },
    loads: { Vt, VtMax, Wt, Wr, Wn, torque_Nm },
    factors: {
      Ko,
      Kv,
      Ks,
      Km,
      KB,
      ...kmDetail,
      J_p,
      J_g,
      I,
      ZE,
      YN_p,
      YN_g,
      ZN_p,
      ZN_g,
      KR,
      KT,
      CH,
    },
    allowables: {
      St,
      Sc,
      allowB_p,
      allowB_g,
      allowC_p,
      allowC_g,
      cycles_p,
      cycles_g,
    },
    stress: { bending_p: sigma_b_p, bending_g: sigma_b_g, contact: sigma_c },
    safety: { SF_p, SF_g, SH_p, SH_g, SH_p_load, SH_g_load, governing },
    warnings,
  };
}
