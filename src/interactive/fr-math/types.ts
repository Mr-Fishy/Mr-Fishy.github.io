/**
 * types.ts
 *
 * TypeScript types and interfaces for the Falcon Racing Drivetrain Tool (fr-math).
 */

export interface UnitLabels {
  power: string;
  length: string;
  pitch: string;
  force: string;
  torque: string;
  stress: string;
  velocity: string;
}

export type OverloadKey = "uniform" | "light" | "moderate" | "heavy";
export type MountingKey =
  | "open"
  | "commercial"
  | "precision"
  | "extraPrecision";
export type MaterialKey =
  | "throughHardened"
  | "carburized"
  | "nitrided"
  | "maraging"
  | "al7075"
  | "bronze"
  | "custom";

export interface CustomGearMaterial {
  label: string;
  hardness_HB: number;
  St: number; // Allowable bending stress, MPa
  Sc: number; // Allowable contact stress, MPa
  E: number; // Young's modulus, MPa
  v: number; // Poisson's ratio
}

export interface GearMeshInput {
  power_kW: number;
  pinionRPM: number;
  module_mm: number;
  faceWidth_mm: number;
  pinionTeeth: number;
  gearTeeth: number;
  pressureAngle_deg: number;
  Qv: number;
  overload: OverloadKey;
  mounting: MountingKey;
  crowned: boolean;
  material: MaterialKey;
  customMaterial?: CustomGearMaterial;
  grade: 1 | 2;
  hardness_HB: number;
  reliability: number;
  tempC: number;
  designLife_h: number;
  rimThickness_mm?: number;
  J_override?: number | null;
}

export interface GearMeshResult {
  geometry: {
    mG: number;
    d_p: number;
    d_g: number;
    module_mm: number;
    faceWidth_mm: number;
    wholeDepth: number;
    pinionTeeth: number;
    gearTeeth: number;
    pressureAngle_deg: number;
  };
  loads: {
    Vt: number;
    VtMax: number;
    Wt: number;
    Wr: number;
    Wn: number;
    torque_Nm: number;
  };
  factors: {
    Ko: number;
    Kv: number;
    Ks: number;
    Km: number;
    KB: number;
    Cmc: number;
    Cpf: number;
    Cpm: number;
    Cma: number;
    Ce: number;
    J_p: number;
    J_g: number;
    I: number;
    ZE: number;
    YN_p: number;
    YN_g: number;
    ZN_p: number;
    ZN_g: number;
    KR: number;
    KT: number;
    CH: number;
  };
  allowables: {
    St: number;
    Sc: number;
    allowB_p: number;
    allowB_g: number;
    allowC_p: number;
    allowC_g: number;
    cycles_p: number;
    cycles_g: number;
  };
  stress: {
    bending_p: number;
    bending_g: number;
    contact: number;
  };
  safety: {
    SF_p: number;
    SF_g: number;
    SH_p: number;
    SH_g: number;
    SH_p_load: number;
    SH_g_load: number;
    governing: "bending" | "pitting";
  };
  warnings: string[];
}

export interface ShaftSegment {
  x0: number;
  x1: number;
  d: number;
}

export interface ShaftLoad {
  id?: string;
  x: number;
  Fv: number;
  Fh: number;
  label: string;
}

export interface ShaftTorque {
  x: number;
  T: number;
}

export type ShaftMaterialKey =
  | "4140"
  | "4340"
  | "300M"
  | "1045"
  | "8620"
  | "174PH"
  | "7075"
  | "6061"
  | "Ti64"
  | "52100"
  | "custom";

export interface CustomShaftMaterial {
  label: string;
  Sut: number; // Ultimate tensile strength, MPa
  Sy: number; // Yield strength, MPa
  E: number; // Young's modulus, MPa
  seRatio?: number; // Endurance limit ratio Se' / Sut (0.5 for steel, 0.35 for Al)
}

export type SurfaceFinishKey = "ground" | "machined" | "hotRolled" | "forged";

export interface ShaftInput {
  length_mm: number;
  baseDiameter_mm: number;
  segments?: ShaftSegment[];
  supports: [number, number];
  loads: ShaftLoad[];
  torques: ShaftTorque[];
  material?: ShaftMaterialKey;
  customMaterial?: CustomShaftMaterial;
  surfaceFinish?: SurfaceFinishKey;
  Kf?: number;
  Kfs?: number;
  reliability?: number;
  samples?: number;
}

export interface PeakValue {
  x: number;
  value: number;
  index: number;
}

export interface ShaftResult {
  xs: number[];
  d: Float64Array;
  V: Float64Array;
  M: Float64Array;
  T: Float64Array;
  vonMises: Float64Array;
  sigmaBend: Float64Array;
  tauTorsion: Float64Array;
  nFatigue: Float64Array;
  nYield: Float64Array;
  deflection: Float64Array;
  slope: Float64Array;
  planes: {
    vertical: { RA: number; RB: number; V: Float64Array; M: Float64Array };
    horizontal: { RA: number; RB: number; V: Float64Array; M: Float64Array };
  };
  reactions: {
    A: { v: number; h: number; resultant: number };
    B: { v: number; h: number; resultant: number };
  };
  material: { label: string; Sut: number; Sy: number; E: number; seRatio?: number };
  peaks: {
    moment: PeakValue;
    vonMises: PeakValue;
    fatigue: PeakValue;
    deflection: PeakValue;
  };
  warnings: string[];
  supports: [number, number];
  loads: ShaftLoad[];
  length_mm: number;
}

export interface BearingCatalogItem {
  id: string;
  type: "ball" | "roller";
  series?: string;
  d: number;
  D: number;
  B: number;
  C: number;
  C0: number;
  isCustom?: boolean;
}

export interface BearingLifeResult {
  bearing: BearingCatalogItem;
  P: number;
  X: number;
  Y: number;
  e: number;
  p: number;
  L10: number;
  L10h: number;
  Lnm: number;
  Lnmh: number;
  a1: number;
  staticSafety: number;
  loadRatio: number;
  nDm: number;
  speedWarning: string | null;
}

export interface BearingLifeCurvePoint {
  rpm: number;
  L10h: number;
  Lnmh: number;
}

export interface CrankDynamicHistoryPoint {
  theta2: number;
  theta4: number;
  shakingForce: number;
  gamma: number | null;
  ma: number | null;
}

export interface CrankDynamicsResult {
  sweepAngle: number;
  maxShakingForce: number;
  history: CrankDynamicHistoryPoint[];
}

export interface OptimizationResult {
  stages: string[];
  ratio: string;
  bending: string;
  pitting: string;
  score: number;
}

export interface DrivetrainStore {
  isImperial: boolean;
  mesh: GearMeshResult | null;
  shaft: ShaftResult | null;
}
