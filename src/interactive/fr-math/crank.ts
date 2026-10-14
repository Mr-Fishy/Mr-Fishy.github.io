/**
 * crank.ts
 *
 * Kinematics and Safety Factor analysis for the Crank-Rocker mechanism in TypeScript.
 * All inputs assume metric: lengths in mm, forces in N, stresses in MPa.
 */

import type { CrankDynamicsResult } from "./types";

export const CrankMath = {
  /**
   * Checks the Grashof condition: s + l <= p + q.
   * For a crank-rocker, the shortest link MUST be the crank (r2).
   */
  checkGrashof(
    r1: number,
    r2: number,
    r3: number,
    r4: number,
  ): { isGrashof: boolean; isCrankRocker: boolean } {
    const links = [r1, r2, r3, r4].sort((a, b) => a - b);

    const s = links[0];
    const l = links[3];
    const p = links[1];
    const q = links[2];

    const isGrashof = s + l <= p + q;
    const isCrankRocker = isGrashof && s === r2;

    return { isGrashof, isCrankRocker };
  },

  /**
   * Calculates transmission angle (gamma) between coupler (r3) and rocker (r4) in radians.
   */
  getTransmissionAngle(
    r1: number,
    r2: number,
    r3: number,
    r4: number,
    theta2_rad: number,
  ): number | null {
    // Distance from crank pin to rocker ground pin (diagonal "s")
    const s_squared = r1 * r1 + r2 * r2 - 2 * r1 * r2 * Math.cos(theta2_rad);

    // Law of cosines
    const cosGamma = (r3 * r3 + r4 * r4 - s_squared) / (2 * r3 * r4);

    // Protect against domain errors if mechanism locks up
    if (cosGamma > 1 || cosGamma < -1) return null;

    return Math.acos(cosGamma);
  },

  /**
   * Calculates the extreme transmission angles occurring when crank is collinear with ground.
   */
  getWorstTransmissionAngle(
    r1: number,
    r2: number,
    r3: number,
    r4: number,
  ): { minGamma: number; maxGamma: number; maxDeviation: number } | null {
    const gamma1 = this.getTransmissionAngle(r1, r2, r3, r4, 0);
    const gamma2 = this.getTransmissionAngle(r1, r2, r3, r4, Math.PI);

    if (gamma1 === null || gamma2 === null) return null;

    const dev1 = Math.abs(gamma1 - Math.PI / 2);
    const dev2 = Math.abs(gamma2 - Math.PI / 2);

    return {
      minGamma: Math.min(gamma1, gamma2),
      maxGamma: Math.max(gamma1, gamma2),
      maxDeviation: Math.max(dev1, dev2),
    };
  },

  /**
   * Calculates the Mechanical Advantage (MA) for a given crank angle.
   */
  getMechanicalAdvantage(
    r1: number,
    r2: number,
    r3: number,
    r4: number,
    theta2_rad: number,
  ): number | null {
    const p2x = r2 * Math.cos(theta2_rad);
    const p2y = r2 * Math.sin(theta2_rad);

    const p4x = r1;
    const p4y = 0;

    const d = Math.hypot(p4x - p2x, p4y - p2y);
    if (d > r3 + r4 || d < Math.abs(r3 - r4)) return null;

    const a = (r3 * r3 - r4 * r4 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, r3 * r3 - a * a));

    const p3_mid_x = p2x + (a * (p4x - p2x)) / d;
    const p3_mid_y = p2y + (a * (p4y - p2y)) / d;

    // Open configuration
    const p3x = p3_mid_x - (h * (p4y - p2y)) / d;
    const p3y = p3_mid_y + (h * (p4x - p2x)) / d;

    const theta3 = Math.atan2(p3y - p2y, p3x - p2x);
    const theta4 = Math.atan2(p3y - p4y, p3x - p4x);

    const num = r4 * Math.sin(theta4 - theta3);
    const den = r2 * Math.sin(theta2_rad - theta3);

    if (Math.abs(den) < 1e-9) return Number.POSITIVE_INFINITY;

    return Math.abs(num / den);
  },

  /**
   * Structural analysis for the pins (Shear and Bearing / Compressive Stress).
   */
  getPinStresses(
    force_N: number,
    pinDiameter_mm: number,
    armThickness_mm: number,
  ): { shearStress: number; bearingStress: number } {
    const pinArea = (Math.PI / 4) * pinDiameter_mm ** 2;
    const shearStress = force_N / pinArea;
    const bearingStress = force_N / (pinDiameter_mm * armThickness_mm);

    return { shearStress, bearingStress };
  },

  /**
   * Full kinematic and dynamic sweep to find:
   * - Rocker Sweep Angle (deg)
   * - Max Shaking Force (N)
   */
  analyzeDynamics(
    r1: number,
    r2: number,
    r3: number,
    r4: number,
    rpm: number,
    pinDia_mm: number,
    armThk_mm: number,
  ): CrankDynamicsResult | null {
    const density = 7850; // kg/m^3 for steel
    const width_m = (2 * pinDia_mm) / 1000;
    const thk_m = armThk_mm / 1000;

    const m2 = (r2 / 1000) * width_m * thk_m * density;
    const m3 = (r3 / 1000) * width_m * thk_m * density;
    const m4 = (r4 / 1000) * width_m * thk_m * density;

    const omega = (rpm * 2 * Math.PI) / 60;
    const dt = 0.001;
    const dtheta = omega * dt;

    let minTheta4 = Number.POSITIVE_INFINITY;
    let maxTheta4 = Number.NEGATIVE_INFINITY;
    let maxShakingForce = 0;

    const history: CrankDynamicsResult["history"] = [];

    for (let i = 0; i < 360; i++) {
      const theta = (i * Math.PI) / 180;

      const pM = this._getPositions(r1, r2, r3, r4, theta - dtheta);
      const p0 = this._getPositions(r1, r2, r3, r4, theta);
      const pP = this._getPositions(r1, r2, r3, r4, theta + dtheta);

      if (!pM || !p0 || !pP) return null;

      if (p0.theta4 < minTheta4) minTheta4 = p0.theta4;
      if (p0.theta4 > maxTheta4) maxTheta4 = p0.theta4;

      const a2x = (pP.G2.x - 2 * p0.G2.x + pM.G2.x) / (dt * dt) / 1000;
      const a2y = (pP.G2.y - 2 * p0.G2.y + pM.G2.y) / (dt * dt) / 1000;

      const a3x = (pP.G3.x - 2 * p0.G3.x + pM.G3.x) / (dt * dt) / 1000;
      const a3y = (pP.G3.y - 2 * p0.G3.y + pM.G3.y) / (dt * dt) / 1000;

      const a4x = (pP.G4.x - 2 * p0.G4.x + pM.G4.x) / (dt * dt) / 1000;
      const a4y = (pP.G4.y - 2 * p0.G4.y + pM.G4.y) / (dt * dt) / 1000;

      const Fx = m2 * a2x + m3 * a3x + m4 * a4x;
      const Fy = m2 * a2y + m3 * a3y + m4 * a4y;
      const shakingForce = Math.hypot(Fx, Fy);

      if (shakingForce > maxShakingForce) maxShakingForce = shakingForce;

      const gamma = this.getTransmissionAngle(r1, r2, r3, r4, theta);
      const ma = this.getMechanicalAdvantage(r1, r2, r3, r4, theta);

      history.push({
        theta2: theta,
        theta4: p0.theta4,
        shakingForce,
        gamma,
        ma,
      });
    }

    const sweepAngle = ((maxTheta4 - minTheta4) * 180) / Math.PI;

    return {
      sweepAngle,
      maxShakingForce,
      history,
    };
  },

  _getPositions(
    r1: number,
    r2: number,
    r3: number,
    r4: number,
    theta2_rad: number,
  ) {
    const p2x = r2 * Math.cos(theta2_rad);
    const p2y = r2 * Math.sin(theta2_rad);
    const p4x = r1;
    const p4y = 0;

    const d = Math.hypot(p4x - p2x, p4y - p2y);
    if (d > r3 + r4 || d < Math.abs(r3 - r4)) return null;

    const a = (r3 * r3 - r4 * r4 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, r3 * r3 - a * a));

    const p3_mid_x = p2x + (a * (p4x - p2x)) / d;
    const p3_mid_y = p2y + (a * (p4y - p2y)) / d;

    const p3x = p3_mid_x - (h * (p4y - p2y)) / d;
    const p3y = p3_mid_y + (h * (p4x - p2x)) / d;

    return {
      G2: { x: p2x / 2, y: p2y / 2 },
      G3: { x: (p2x + p3x) / 2, y: (p2y + p3y) / 2 },
      G4: { x: (p4x + p3x) / 2, y: (p4y + p3y) / 2 },
      theta4: Math.atan2(p3y - p4y, p3x - p4x),
    };
  },
};
