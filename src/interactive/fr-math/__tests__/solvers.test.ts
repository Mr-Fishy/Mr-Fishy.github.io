import { describe, expect, it } from "vitest";
import { BEARING_CATALOG, bearingLife, requiredRating } from "../bearing";
import { CrankMath } from "../crank";
import { AGMA, AGMAGear, analyzeMesh } from "../gear";
import optimize from "../optimize";
import { analyzeShaft } from "../shaft";
import { buildTooth, project } from "../viz/gear-viz";

describe("Gear (AGMA 2001-D04)", () => {
  it("Wt from power balances P = Wt * Vt", () => {
    const d = 50;
    const rpm = 3000;
    const kW = 10;
    const Wt = AGMAGear.getTransmittedLoad(kW, d, rpm);
    const Vt = AGMA.pitchLineVelocity(d, rpm);
    expect(Math.abs(Wt * Vt - kW * 1000)).toBeLessThanOrEqual(1e-6);
    expect(Math.abs(Wt - 1273.24)).toBeLessThanOrEqual(0.1);
  });

  it("Torque matches P = T * omega", () => {
    const T = AGMAGear.getTorque(10, 3000);
    expect(Math.abs(T - 31.831)).toBeLessThanOrEqual(0.005);
  });

  it("Kv rises with speed and falls with quality", () => {
    expect(Math.abs(AGMA.Kv(10, 6) - 1.5858)).toBeLessThanOrEqual(0.002);
    expect(AGMA.Kv(20, 9)).toBeGreaterThan(AGMA.Kv(5, 9));
    expect(AGMA.Kv(10, 11)).toBeLessThan(AGMA.Kv(10, 7));
    expect(Math.abs(AGMA.Kv(0, 9) - 1.0)).toBeLessThanOrEqual(1e-9);
  });

  it("Ks is unity below module 5 and grows above it", () => {
    expect(Math.abs(AGMA.Ks(3, 25) - 1.0)).toBeLessThanOrEqual(1e-12);
    expect(AGMA.Ks(8, 60)).toBeGreaterThan(1.0);
  });

  it("Km grows with face width", () => {
    const narrow = AGMA.Km({ faceWidth_mm: 20, pitchDia_mm: 50 }).Km;
    const wide = AGMA.Km({ faceWidth_mm: 80, pitchDia_mm: 50 }).Km;
    expect(wide).toBeGreaterThan(narrow);
    expect(Math.abs(narrow - 1.1643)).toBeLessThanOrEqual(0.001);
    expect(
      Math.abs(
        AGMA.Km({ faceWidth_mm: 20, pitchDia_mm: 50, mounting: "precision" })
          .Km - 1.1025,
      ),
    ).toBeLessThanOrEqual(0.001);
    const crowned = AGMA.Km({
      faceWidth_mm: 80,
      pitchDia_mm: 50,
      crowned: true,
    }).Km;
    expect(crowned).toBeLessThan(wide);
  });

  it("KB penalises thin rims only", () => {
    expect(Math.abs(AGMA.KB(20, 5) - 1.0)).toBeLessThanOrEqual(1e-12);
    expect(AGMA.KB(2, 5)).toBeGreaterThan(1.0);
  });

  it("I factor matches the closed form", () => {
    expect(Math.abs(AGMA.I(20, 2.6) - 0.116059)).toBeLessThanOrEqual(1e-5);
  });

  it("ZE for steel on steel is ~191 sqrt(MPa)", () => {
    expect(Math.abs(AGMA.ZE() - 191)).toBeLessThanOrEqual(2);
  });

  it("Stress cycle factors are continuous at 1e7 and below 1 above it", () => {
    expect(Math.abs(AGMA.YN(1e7) - 1.0)).toBeLessThanOrEqual(0.03);
    expect(Math.abs(AGMA.ZN(1e7) - 1.0)).toBeLessThanOrEqual(0.02);
    expect(AGMA.YN(1e9)).toBeLessThan(1.0);
    expect(AGMA.YN(1e5)).toBeGreaterThan(1.0);
  });

  it("KR matches the AGMA table", () => {
    expect(Math.abs(AGMA.KR(0.99) - 1.0)).toBeLessThanOrEqual(0.01);
    expect(Math.abs(AGMA.KR(0.999) - 1.25)).toBeLessThanOrEqual(0.01);
  });

  it("Bending stress matches a hand calculation", () => {
    const s = AGMAGear.getBendingStress(1000, 3, 25, 0.35, {
      Ko: 1.5,
      Kv: 1.2,
      Ks: 1,
      Km: 1.3,
      KB: 1,
    });
    expect(Math.abs(s - 89.143)).toBeLessThanOrEqual(0.01);
  });

  it("Contact stress matches a hand calculation", () => {
    const s = AGMAGear.getContactStress(
      1000,
      60,
      25,
      0.115,
      { Ko: 1.5, Kv: 1.2, Ks: 1, Km: 1.3 },
      191,
    );
    expect(Math.abs(s - 703.47)).toBeLessThanOrEqual(0.1);
  });

  it("Doubling power doubles Wt and raises contact stress by sqrt(2)", () => {
    const base = {
      power_kW: 10,
      pinionRPM: 3000,
      module_mm: 2.5,
      faceWidth_mm: 20,
      pinionTeeth: 20,
      gearTeeth: 52,
      pressureAngle_deg: 20,
      Qv: 9,
      overload: "moderate" as const,
      mounting: "commercial" as const,
      crowned: false,
      material: "carburized" as const,
      grade: 1 as const,
      hardness_HB: 600,
      reliability: 0.99,
      tempC: 90,
      designLife_h: 30,
    };
    const a = analyzeMesh(base);
    const b = analyzeMesh({ ...base, power_kW: 20 });
    expect(Math.abs(b.loads.Wt / a.loads.Wt - 2)).toBeLessThanOrEqual(1e-9);
    expect(
      Math.abs(b.stress.bending_p / a.stress.bending_p - 2),
    ).toBeLessThanOrEqual(1e-9);
    expect(
      Math.abs(b.stress.contact / a.stress.contact - Math.SQRT2),
    ).toBeLessThanOrEqual(1e-6);
    expect(
      Math.abs(a.safety.SH_p_load / a.safety.SH_p ** 2 - 1),
    ).toBeLessThanOrEqual(1e-9);
  });

  it("Full mesh analysis lands in a physical range", () => {
    const r = analyzeMesh({
      power_kW: 12,
      pinionRPM: 2900,
      module_mm: 2.5,
      faceWidth_mm: 20,
      pinionTeeth: 20,
      gearTeeth: 52,
      pressureAngle_deg: 20,
      Qv: 9,
      overload: "moderate",
      mounting: "commercial",
      crowned: false,
      material: "carburized",
      grade: 1,
      hardness_HB: 600,
      reliability: 0.99,
      tempC: 90,
      designLife_h: 30,
    });
    expect(Math.abs(r.geometry.d_p - 50)).toBeLessThanOrEqual(1e-9);
    expect(
      Math.abs(r.loads.Vt - (Math.PI * 50 * 2900) / 60000),
    ).toBeLessThanOrEqual(1e-9);
    expect(
      Math.abs(r.loads.Wr / r.loads.Wt - Math.tan((20 * Math.PI) / 180)),
    ).toBeLessThanOrEqual(1e-9);
    expect(r.loads.Wt).toBeGreaterThan(1000);
    expect(r.loads.Wt).toBeLessThan(2000);
    expect(r.stress.bending_p).toBeGreaterThan(100);
    expect(r.stress.bending_p).toBeLessThan(600);
    expect(r.safety.SF_p).toBeGreaterThan(0.5);
    expect(r.safety.SF_p).toBeLessThan(10);
    expect(["bending", "pitting"]).toContain(r.safety.governing);
  });
});

describe("Gear tooth geometry (mesh visualiser)", () => {
  it("Involute flank hits the pitch circle at the half tooth angle", () => {
    const m = 2.5;
    const N = 20;
    const phi = 20;
    const t = buildTooth(N, m, phi);

    expect(Math.abs(t.r - 25)).toBeLessThanOrEqual(1e-12);
    expect(
      Math.abs(t.rb - 25 * Math.cos((phi * Math.PI) / 180)),
    ).toBeLessThanOrEqual(1e-12);
    expect(Math.abs(t.ra - 27.5)).toBeLessThanOrEqual(1e-12);
    expect(Math.abs(t.rf - 21.875)).toBeLessThanOrEqual(1e-12);
    expect(Math.abs(t.psiP - Math.PI / (2 * N))).toBeLessThanOrEqual(1e-12);
  });

  it("Meshing teeth touch at the pitch point and sit on opposite sides", () => {
    const m = 2.5;
    const phi = 20;
    const scale = 16;
    const cx = 300;
    const cy = 190;
    const pinion = buildTooth(20, m, phi);
    const gear = buildTooth(52, m, phi);

    const pinionFrame = {
      cx,
      cy: cy + pinion.r * scale,
      scale,
      rotate: -pinion.psiP,
      flip: false,
    };
    const gearFrame = {
      cx,
      cy: cy - gear.r * scale,
      scale,
      rotate: -gear.psiP,
      flip: true,
    };

    const pContact = project(
      { rho: pinion.r, delta: pinion.psiP },
      pinionFrame,
    );
    const gContact = project({ rho: gear.r, delta: gear.psiP }, gearFrame);
    expect(Math.abs(pContact[0] - cx)).toBeLessThanOrEqual(1e-9);
    expect(Math.abs(pContact[1] - cy)).toBeLessThanOrEqual(1e-9);
    expect(Math.abs(gContact[0] - cx)).toBeLessThanOrEqual(1e-9);
    expect(Math.abs(gContact[1] - cy)).toBeLessThanOrEqual(1e-9);

    const pTip = project({ rho: pinion.ra, delta: 0 }, pinionFrame);
    const gTip = project({ rho: gear.ra, delta: 0 }, gearFrame);
    expect(pTip[0] < cx && pTip[1] < cy).toBe(true);
    expect(gTip[0] > cx && gTip[1] > cy).toBe(true);
  });
});

describe("Shaft (beam + DE-Goodman)", () => {
  const beamBase = {
    length_mm: 200,
    baseDiameter_mm: 25,
    supports: [0, 200] as [number, number],
    torques: [],
    material: "4140" as const,
    samples: 800,
  };

  it("Centre point load: reactions, peak moment and deflection match theory", () => {
    const P = 1000;
    const L = 200;
    const r = analyzeShaft({
      ...beamBase,
      loads: [{ x: 100, Fv: P, Fh: 0, label: "P" }],
    });

    expect(Math.abs(r.reactions.A.v - P / 2)).toBeLessThanOrEqual(1e-6);
    expect(Math.abs(r.reactions.B.v - P / 2)).toBeLessThanOrEqual(1e-6);
    expect(Math.abs(r.peaks.moment.value - (P * L) / 4)).toBeLessThanOrEqual(
      1e-3,
    );

    const I = (Math.PI * 25 ** 4) / 64;
    expect(
      Math.abs(r.peaks.deflection.value - (P * L ** 3) / (48 * 207000 * I)),
    ).toBeLessThanOrEqual(1e-4);
  });

  it("Off-centre load matches the standard formula", () => {
    const P = 800;
    const a = 60;
    const b = 140;
    const L = 200;
    const r = analyzeShaft({
      ...beamBase,
      loads: [{ x: a, Fv: P, Fh: 0, label: "P" }],
    });
    expect(Math.abs(r.reactions.A.v - (P * b) / L)).toBeLessThanOrEqual(1e-6);
    expect(Math.abs(r.reactions.B.v - (P * a) / L)).toBeLessThanOrEqual(1e-6);
    expect(
      Math.abs(r.peaks.moment.value - (P * a * b) / L),
    ).toBeLessThanOrEqual(1e-3);
  });

  it("Shear jumps by exactly the applied load and closes to zero", () => {
    const r = analyzeShaft({
      ...beamBase,
      loads: [{ x: 100, Fv: 1000, Fh: 0, label: "P" }],
    });
    const V = r.planes.vertical.V;
    const at = (x: number) => V[r.xs.findIndex((v) => v >= x)];

    expect(Math.abs(V[0] - 500)).toBeLessThanOrEqual(1e-6);
    expect(Math.abs(at(50) - 500)).toBeLessThanOrEqual(1e-6);
    expect(Math.abs(at(150) - -500)).toBeLessThanOrEqual(1e-6);
    expect(Math.abs(at(50) - at(150) - 1000)).toBeLessThanOrEqual(1e-6);
    expect(Math.abs(V[V.length - 1])).toBeLessThanOrEqual(1e-6);
  });

  it("Biaxial loads combine as the resultant moment", () => {
    const r = analyzeShaft({
      ...beamBase,
      loads: [{ x: 100, Fv: 300, Fh: 400, label: "gear" }],
    });
    expect(Math.abs(r.reactions.A.resultant - 250)).toBeLessThanOrEqual(1e-6);
    expect(
      Math.abs(r.peaks.moment.value - (500 * 200) / 4),
    ).toBeLessThanOrEqual(1e-3);
  });

  it("Bending stress equals 32M/(pi d^3) at the peak", () => {
    const r = analyzeShaft({
      ...beamBase,
      loads: [{ x: 100, Fv: 1000, Fh: 0, label: "P" }],
    });
    const M = r.peaks.moment.value;
    expect(
      Math.abs(r.peaks.vonMises.value - (32 * M) / (Math.PI * 25 ** 3)),
    ).toBeLessThanOrEqual(1e-6);
  });

  it("Pure torsion gives von Mises = sqrt(3) * tau", () => {
    const r = analyzeShaft({
      ...beamBase,
      loads: [{ x: 100, Fv: 0, Fh: 0, label: "none" }],
      torques: [
        { x: 20, T: 100 },
        { x: 180, T: -100 },
      ],
    });
    const tau = (16 * 100 * 1000) / (Math.PI * 25 ** 3);
    expect(
      Math.abs(r.vonMises[Math.floor(r.xs.length / 2)] - Math.sqrt(3) * tau),
    ).toBeLessThanOrEqual(1e-6);
  });

  it("Fatigue safety factor is finite, positive and load-sensitive", () => {
    const light = analyzeShaft({
      ...beamBase,
      loads: [{ x: 100, Fv: 500, Fh: 0, label: "P" }],
    });
    const heavy = analyzeShaft({
      ...beamBase,
      loads: [{ x: 100, Fv: 2000, Fh: 0, label: "P" }],
    });
    expect(light.peaks.fatigue.value).toBeGreaterThan(
      heavy.peaks.fatigue.value,
    );
    expect(
      Math.abs(light.peaks.fatigue.value / heavy.peaks.fatigue.value - 4),
    ).toBeLessThanOrEqual(0.01);
  });
});

describe("Bearings (ISO 281)", () => {
  const b6304 = BEARING_CATALOG.find((b) => b.id === "6304")!;
  const b6305 = BEARING_CATALOG.find((b) => b.id === "6305")!;

  it("L10 follows (C/P)^3 for ball bearings", () => {
    const r = bearingLife(b6304, 2000, 0, 3000);
    expect(Math.abs(r.L10 - (16800 / 2000) ** 3)).toBeLessThanOrEqual(1e-6);
    expect(Math.abs(r.L10h - (1e6 / (60 * 3000)) * r.L10)).toBeLessThanOrEqual(
      1e-6,
    );
  });

  it("Halving the load multiplies ball bearing life by 8", () => {
    const a = bearingLife(b6304, 2000, 0, 3000);
    const b = bearingLife(b6304, 1000, 0, 3000);
    expect(Math.abs(b.L10h / a.L10h - 8)).toBeLessThanOrEqual(1e-9);
  });

  it("Doubling speed halves life at constant load", () => {
    const a = bearingLife(b6304, 2000, 0, 3000);
    const b = bearingLife(b6304, 2000, 0, 6000);
    expect(Math.abs(a.L10h / b.L10h - 2)).toBeLessThanOrEqual(1e-9);
  });

  it("6305 outlives 6304 under the same load", () => {
    const a = bearingLife(b6304, 2000, 0, 3000);
    const b = bearingLife(b6305, 2000, 0, 3000);
    expect(b.L10h).toBeGreaterThan(a.L10h);
  });

  it("requiredRating inverts the life equation", () => {
    const C = requiredRating(2000, 3000, 500, "ball");
    const synthetic = { ...b6304, C };
    expect(
      Math.abs(bearingLife(synthetic, 2000, 0, 3000).L10h - 500),
    ).toBeLessThanOrEqual(1e-6);
  });
});

describe("Crank-Rocker Kinematics & Sizing", () => {
  it("CrankMath.checkGrashof identifies a valid crank-rocker", () => {
    const result = CrankMath.checkGrashof(6, 2, 7, 5);
    expect(result.isGrashof).toBe(true);
    expect(result.isCrankRocker).toBe(true);
  });

  it("CrankMath.checkGrashof identifies non-Grashof system", () => {
    const result = CrankMath.checkGrashof(10, 2, 3, 4);
    expect(result.isGrashof).toBe(false);
  });

  it("CrankMath.getTransmissionAngle calculation", () => {
    const gamma = CrankMath.getTransmissionAngle(5, 2, 4, 5, 0);
    expect(Math.abs(gamma! - Math.acos(0.8))).toBeLessThanOrEqual(1e-6);
  });

  it("CrankMath.getWorstTransmissionAngle limits", () => {
    const worst = CrankMath.getWorstTransmissionAngle(5, 2, 4, 5);
    expect(worst).not.toBeNull();
    expect(Math.abs(worst!.minGamma - Math.acos(0.8))).toBeLessThanOrEqual(
      1e-6,
    );
    expect(Math.abs(worst!.maxGamma - Math.acos(-0.2))).toBeLessThanOrEqual(
      1e-6,
    );
  });

  it("CrankMath.getPinStresses outputs correct shear and bearing", () => {
    const stresses = CrankMath.getPinStresses(1000, 10, 5);
    expect(Math.abs(stresses.shearStress - 40 / Math.PI)).toBeLessThanOrEqual(
      1e-6,
    );
    expect(Math.abs(stresses.bearingStress - 20)).toBeLessThanOrEqual(1e-6);
  });
});

describe("Gearbox Optimization", () => {
  it("optimize returns configurations matching target ratio", () => {
    const mockGearModule = {
      getBaseRPM: () => 3000,
      evaluate: () => ({ bending: 1.5, pitting: 1.5 }),
    };
    const configs = optimize(4.0, 2, 12, 100, mockGearModule);
    expect(configs.length).toBeGreaterThan(0);
    for (const c of configs) {
      expect(Math.abs(parseFloat(c.ratio) - 4.0) / 4.0).toBeLessThanOrEqual(
        0.05,
      );
      expect(c.bending).toBe("1.50");
      expect(c.pitting).toBe("1.50");
    }
  });
});
