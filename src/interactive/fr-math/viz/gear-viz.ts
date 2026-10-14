/**
 * gear-viz.ts
 *
 * Involute gear mesh canvas renderer in TypeScript.
 */

import type { GearMeshResult } from "../types";
import {
  drawArrow,
  drawLabel,
  heatColor,
  safetyToHeat,
  setupCanvas,
} from "./draw";

const REF_LOAD_N = 4000;
const MAX_ARROW_PX = 105;

export interface InvoluteTooth {
  path: { rho: number; delta: number }[];
  rootRight: { rho: number; delta: number };
  rootLeft: { rho: number; delta: number };
  r: number;
  rb: number;
  ra: number;
  rf: number;
  psiP: number;
}

export function buildTooth(
  teeth: number,
  module_mm: number,
  pressureAngle_deg: number,
  res = 26,
): InvoluteTooth {
  const phi = (pressureAngle_deg * Math.PI) / 180;
  const r = (teeth * module_mm) / 2;
  const rb = r * Math.cos(phi);
  const ra = r + module_mm;
  const rf = Math.max(r - 1.25 * module_mm, 0.15 * r);

  const psiP = Math.PI / (2 * teeth);
  const invPhi = Math.tan(phi) - phi;
  const rStart = Math.max(rb, rf);

  const flank: { rho: number; delta: number }[] = [];
  for (let i = 0; i <= res; i++) {
    const rho = rStart + ((ra - rStart) * i) / res;
    const alpha = Math.acos(Math.min(rb / rho, 1));
    const inv = Math.tan(alpha) - alpha;
    flank.push({ rho, delta: psiP + invPhi - inv });
  }

  const root: { rho: number; delta: number }[] = [];
  if (rStart > rf + 1e-9) {
    const filletAngle = (0.32 * module_mm) / rf;
    const rootRes = 10;
    for (let i = 1; i <= rootRes; i++) {
      const t = i / rootRes;
      root.push({
        rho: rStart + (rf - rStart) * t,
        delta: flank[0].delta + filletAngle * t * t,
      });
    }
  }

  const right = [...root].reverse().concat(flank);
  const left = right.map((p) => ({ rho: p.rho, delta: -p.delta })).reverse();

  return {
    path: right.concat(left),
    rootRight: right[0],
    rootLeft: left[left.length - 1],
    r,
    rb,
    ra,
    rf,
    psiP,
  };
}

export function project(
  p: { rho: number; delta: number },
  {
    cx,
    cy,
    scale,
    rotate,
    flip,
  }: {
    cx: number;
    cy: number;
    scale: number;
    rotate: number;
    flip: boolean;
  },
): [number, number] {
  const delta = p.delta + rotate;
  const lx = p.rho * Math.sin(delta);
  const ly = p.rho * Math.cos(delta);
  return flip
    ? [cx - lx * scale, cy + ly * scale]
    : [cx + lx * scale, cy - ly * scale];
}

function tracePath(
  ctx: CanvasRenderingContext2D,
  pts: { rho: number; delta: number }[],
  frame: {
    cx: number;
    cy: number;
    scale: number;
    rotate: number;
    flip: boolean;
  },
) {
  ctx.beginPath();
  pts.forEach((p, i) => {
    const [x, y] = project(p, frame);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function paintTooth(
  ctx: CanvasRenderingContext2D,
  tooth: InvoluteTooth,
  frame: {
    cx: number;
    cy: number;
    scale: number;
    rotate: number;
    flip: boolean;
  },
  { rootHeat, faded = false }: { rootHeat: number; faded?: boolean },
) {
  tracePath(ctx, tooth.path, frame);

  ctx.save();
  ctx.clip();

  const [tipX, tipY] = project({ rho: tooth.ra, delta: 0 }, frame);
  const [rootX, rootY] = project({ rho: tooth.rf, delta: 0 }, frame);
  const body = ctx.createLinearGradient(tipX, tipY, rootX, rootY);
  body.addColorStop(0, faded ? "#e2e8f0" : "#cbd5e1");
  body.addColorStop(1, faded ? "#f1f5f9" : "#94a3b8");
  ctx.fillStyle = body;
  ctx.fill();

  if (!faded) {
    const spread = Math.abs(tooth.ra - tooth.rf) * frame.scale * 1.15;
    for (const corner of [tooth.rootRight, tooth.rootLeft]) {
      const [hx, hy] = project(corner, frame);
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, spread);
      g.addColorStop(0, heatColor(rootHeat, 0.92));
      g.addColorStop(0.45, heatColor(rootHeat, 0.42));
      g.addColorStop(1, heatColor(rootHeat, 0));
      ctx.fillStyle = g;
      ctx.fill();
    }
  }
  ctx.restore();

  tracePath(ctx, tooth.path, frame);
  ctx.strokeStyle = faded ? "#94a3b8" : "#475569";
  ctx.lineWidth = faded ? 1 : 1.5;
  ctx.stroke();
}

export function renderGearMesh(
  canvas: HTMLCanvasElement,
  result: GearMeshResult,
  opts: { targetSF?: number } = {},
) {
  const { ctx, w, h } = setupCanvas(canvas);
  const targetSF = opts.targetSF ?? 1.5;

  const { geometry, loads, safety } = result;
  const { module_mm, pinionTeeth, gearTeeth, pressureAngle_deg } = geometry;

  const pinion = buildTooth(pinionTeeth, module_mm, pressureAngle_deg);
  const gear = buildTooth(gearTeeth, module_mm, pressureAngle_deg);

  const cx = w * 0.46;
  const cy = h * 0.5;
  const scale = (h * 0.78) / (7 * module_mm);

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

  const rootHeat = safetyToHeat(Math.min(safety.SF_p, safety.SF_g), targetSF);
  const contactHeat = safetyToHeat(
    Math.min(safety.SH_p_load, safety.SH_g_load),
    targetSF,
  );

  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  // Pitch circles
  ctx.setLineDash([6, 5]);
  ctx.lineWidth = 1.25;
  ctx.strokeStyle = "#94a3b8";
  for (const [frame, tooth] of [
    [pinionFrame, pinion],
    [gearFrame, gear],
  ] as const) {
    ctx.beginPath();
    ctx.arc(frame.cx, frame.cy, tooth.r * scale, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Neighbouring teeth
  for (const k of [-1, 1]) {
    paintTooth(
      ctx,
      pinion,
      {
        ...pinionFrame,
        rotate: pinionFrame.rotate + (k * 2 * Math.PI) / pinionTeeth,
      },
      { rootHeat, faded: true },
    );
    paintTooth(
      ctx,
      gear,
      {
        ...gearFrame,
        rotate: gearFrame.rotate + (k * 2 * Math.PI) / gearTeeth,
      },
      { rootHeat, faded: true },
    );
  }

  // Meshing pair
  paintTooth(ctx, gear, gearFrame, { rootHeat });
  paintTooth(ctx, pinion, pinionFrame, { rootHeat });

  // Contact patch
  const patch = Math.max(6, module_mm * scale * 0.42);
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, patch);
  cg.addColorStop(0, heatColor(contactHeat, 0.95));
  cg.addColorStop(0.6, heatColor(contactHeat, 0.4));
  cg.addColorStop(1, heatColor(contactHeat, 0));
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(cx, cy, patch, 0, Math.PI * 2);
  ctx.fill();

  // Line of action
  const phi = (pressureAngle_deg * Math.PI) / 180;
  const loaLen = Math.min(w, h) * 0.42;
  ctx.save();
  ctx.setLineDash([7, 5]);
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - Math.cos(phi) * loaLen, cy + Math.sin(phi) * loaLen);
  ctx.lineTo(cx + Math.cos(phi) * loaLen, cy - Math.sin(phi) * loaLen);
  ctx.stroke();
  ctx.restore();

  // Force vectors
  const mag = Math.min(loads.Wt / REF_LOAD_N, 1.6);
  const arrow = Math.max(18, mag * MAX_ARROW_PX);
  const wtLen = arrow;
  const wrLen = arrow * Math.tan(phi);
  const wnLen = arrow / Math.cos(phi);

  drawArrow(
    ctx,
    cx - Math.cos(phi) * wnLen,
    cy + Math.sin(phi) * wnLen,
    cx,
    cy,
    { color: "#dc2626", width: 3.5, head: 12 },
  );

  ctx.save();
  ctx.globalAlpha = 0.75;
  drawArrow(ctx, cx - wtLen, cy, cx, cy, {
    color: "#2563eb",
    width: 2,
    head: 8,
  });
  drawArrow(ctx, cx, cy + wrLen, cx, cy, {
    color: "#16a34a",
    width: 2,
    head: 8,
  });
  ctx.restore();

  drawLabel(
    ctx,
    `Wn ${loads.Wn.toFixed(0)} N`,
    cx - Math.cos(phi) * wnLen - 6,
    cy + Math.sin(phi) * wnLen,
    {
      align: "right",
      color: "#dc2626",
      font: '600 12px "Manrope", sans-serif',
      background: "rgba(255,255,255,0.85)",
    },
  );
  drawLabel(ctx, `Wt ${loads.Wt.toFixed(0)} N`, cx - wtLen - 6, cy - 12, {
    align: "right",
    color: "#2563eb",
    font: '11px "Manrope", sans-serif',
    background: "rgba(255,255,255,0.85)",
  });
  drawLabel(ctx, `Wr ${loads.Wr.toFixed(0)} N`, cx + 8, cy + wrLen, {
    align: "left",
    color: "#16a34a",
    font: '11px "Manrope", sans-serif',
    background: "rgba(255,255,255,0.85)",
  });

  // Callouts
  const [rrx, rry] = project(pinion.rootRight, pinionFrame);
  drawLabel(ctx, `root SF ${safety.SF_p.toFixed(2)}`, rrx + 14, rry + 10, {
    align: "left",
    color: "#1e293b",
    font: '600 11px "Manrope", sans-serif',
    background: "rgba(255,255,255,0.88)",
  });
  drawLabel(
    ctx,
    `contact SH ${safety.SH_p.toFixed(2)}`,
    cx + patch + 10,
    cy - patch - 4,
    {
      align: "left",
      color: "#1e293b",
      font: '600 11px "Manrope", sans-serif',
      background: "rgba(255,255,255,0.88)",
    },
  );

  drawLabel(
    ctx,
    `Pinion  ${pinionTeeth}T  d=${geometry.d_p.toFixed(1)} mm`,
    10,
    h - 26,
    { color: "#64748b", font: '11px "Manrope", sans-serif' },
  );
  drawLabel(
    ctx,
    `Gear  ${gearTeeth}T  d=${geometry.d_g.toFixed(1)} mm  |  m=${module_mm.toFixed(2)}  F=${geometry.faceWidth_mm.toFixed(1)} mm`,
    10,
    h - 10,
    { color: "#64748b", font: '11px "Manrope", sans-serif' },
  );

  // Heat legend
  const lw = 100;
  const lx = w - lw - 14;
  const ly = 14;
  for (let i = 0; i < lw; i++) {
    ctx.fillStyle = heatColor(i / lw);
    ctx.fillRect(lx + i, ly, 1, 9);
  }
  ctx.strokeStyle = "#cbd5e1";
  ctx.strokeRect(lx + 0.5, ly + 0.5, lw, 9);
  drawLabel(ctx, `SF ${(targetSF * 2).toFixed(1)}+`, lx, ly + 20, {
    color: "#64748b",
    font: '10px "Manrope", sans-serif',
  });
  drawLabel(ctx, `SF ${(targetSF * 0.5).toFixed(2)}`, lx + lw, ly + 20, {
    align: "right",
    color: "#64748b",
    font: '10px "Manrope", sans-serif',
  });

  ctx.restore();
}
