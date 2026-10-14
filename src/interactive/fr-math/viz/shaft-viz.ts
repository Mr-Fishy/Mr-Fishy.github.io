/**
 * shaft-viz.ts
 *
 * Shaft loading 4-panel visualizer in TypeScript.
 */

import { sampleAt } from "../shaft";
import type { ShaftResult } from "../types";
import {
  drawArrow,
  drawLabel,
  extent,
  heatColor,
  Plot,
  padExtent,
  safetyToHeat,
  setupCanvas,
} from "./draw";

const MARGIN = { left: 58, right: 18, top: 14, bottom: 26 };
const GAP = 30;
const PANEL_WEIGHTS = [0.28, 0.2, 0.2, 0.32];

function panelBoxes(w: number, h: number) {
  const usable =
    h - MARGIN.top - MARGIN.bottom - GAP * (PANEL_WEIGHTS.length - 1);
  const boxes: { x: number; y: number; w: number; h: number }[] = [];
  let y = MARGIN.top;
  for (const weight of PANEL_WEIGHTS) {
    const ph = usable * weight;
    boxes.push({ x: MARGIN.left, y, w: w - MARGIN.left - MARGIN.right, h: ph });
    y += ph + GAP;
  }
  return boxes;
}

export function xFromPointer(
  canvas: HTMLCanvasElement,
  result: ShaftResult,
  clientX: number,
): number {
  const rect = canvas.getBoundingClientRect();
  const px = clientX - rect.left;
  const plotW = rect.width - MARGIN.left - MARGIN.right;
  const t = (px - MARGIN.left) / plotW;
  return Math.min(Math.max(t, 0), 1) * result.length_mm;
}

export interface ShaftDisplayConverters {
  len: (v: number) => number;
  force: (v: number) => number;
  stress: (v: number) => number;
  moment: (v: number) => number;
  L: string;
  F: string;
  S: string;
  M: string;
}

function drawSchematic(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  result: ShaftResult,
  markerX: number | null,
  disp: ShaftDisplayConverters,
) {
  const { xs, d, length_mm, supports, loads, deflection } = result;
  const plot = new Plot(ctx, {
    ...box,
    xMin: 0,
    xMax: length_mm,
    yMin: -1,
    yMax: 1,
  });

  const maxD = Math.max(...Array.from(d));
  const axisY = box.y + box.h * 0.58;
  const pxPerMm = box.w / length_mm;
  const dScale = Math.min((box.h * 0.3) / maxD, pxPerMm * 2.2);

  ctx.save();

  // Shaft body
  ctx.beginPath();
  ctx.moveTo(plot.px(xs[0]), axisY - (d[0] / 2) * dScale);
  for (let i = 1; i < xs.length; i++)
    ctx.lineTo(plot.px(xs[i]), axisY - (d[i] / 2) * dScale);
  for (let i = xs.length - 1; i >= 0; i--)
    ctx.lineTo(plot.px(xs[i]), axisY + (d[i] / 2) * dScale);
  ctx.closePath();

  const grad = ctx.createLinearGradient(
    0,
    axisY - maxD * dScale * 0.5,
    0,
    axisY + maxD * dScale * 0.5,
  );
  grad.addColorStop(0, "#cbd5e1");
  grad.addColorStop(0.5, "#94a3b8");
  grad.addColorStop(1, "#64748b");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Centreline
  ctx.setLineDash([8, 4, 2, 4]);
  ctx.strokeStyle = "#94a3b8";
  ctx.beginPath();
  ctx.moveTo(plot.px(0), axisY);
  ctx.lineTo(plot.px(length_mm), axisY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Deflected shape
  const maxDefl = Math.max(...Array.from(deflection));
  if (maxDefl > 1e-9) {
    const amp = (box.h * 0.16) / maxDefl;
    ctx.beginPath();
    for (let i = 0; i < xs.length; i++) {
      const y = axisY + deflection[i] * amp;
      if (i === 0) ctx.moveTo(plot.px(xs[i]), y);
      else ctx.lineTo(plot.px(xs[i]), y);
    }
    ctx.strokeStyle = "rgba(147, 51, 234, 0.85)";
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    drawLabel(
      ctx,
      `deflected shape (max ${disp.len(maxDefl).toFixed(4)} ${disp.L}, exaggerated)`,
      plot.px(length_mm),
      box.y + box.h + 2,
      {
        align: "right",
        baseline: "top",
        color: "#9333ea",
        font: '10px "Manrope", sans-serif',
      },
    );
  }

  // Bearings
  for (let i = 0; i < supports.length; i++) {
    const sx = plot.px(supports[i]);
    const sy = axisY + (sampleAt(xs, d, supports[i]) / 2) * dScale;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - 11, sy + 16);
    ctx.lineTo(sx + 11, sy + 16);
    ctx.closePath();
    ctx.fillStyle = "#334155";
    ctx.fill();
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.moveTo(sx + k * 5, sy + 16);
      ctx.lineTo(sx + k * 5 - 4, sy + 22);
      ctx.strokeStyle = "#334155";
      ctx.stroke();
    }
    const R =
      i === 0 ? result.reactions.A.resultant : result.reactions.B.resultant;
    drawLabel(
      ctx,
      `${i === 0 ? "A" : "B"}: ${disp.force(R).toFixed(0)} ${disp.F}`,
      sx,
      sy + 30,
      { align: "center", color: "#334155", font: '10px "Manrope", sans-serif' },
    );
  }

  // Load arrows
  const maxLoad = Math.max(
    ...loads.map((l) => Math.hypot(l.Fv || 0, l.Fh || 0)),
    1,
  );
  for (const L of loads) {
    const lx = plot.px(L.x);
    const mag = Math.hypot(L.Fv || 0, L.Fh || 0);
    const len = 16 + (mag / maxLoad) * (box.h * 0.3);
    const top = axisY - (sampleAt(xs, d, L.x) / 2) * dScale;
    drawArrow(ctx, lx, top - len, lx, top - 3, {
      color: "#ef4444",
      width: 2.5,
      head: 9,
    });
    drawLabel(
      ctx,
      `${L.label} ${disp.force(mag).toFixed(0)} ${disp.F}`,
      lx,
      top - len - 9,
      { align: "center", color: "#dc2626", font: '10px "Manrope", sans-serif' },
    );
  }

  if (markerX != null) {
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plot.px(markerX), box.y);
    ctx.lineTo(plot.px(markerX), box.y + box.h);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
  return plot;
}

function drawSeriesPanel(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  result: ShaftResult,
  markerX: number | null,
  {
    values,
    label,
    color,
    fill,
    format,
    heatBy = null,
  }: {
    values: Float64Array | number[];
    label: string;
    color: string;
    fill: string | null;
    format: (v: number) => string;
    heatBy?: Float64Array | null;
  },
) {
  const { xs, length_mm } = result;
  const [lo, hi] = padExtent(extent(values), 0.12);
  const yMin = Math.min(lo, 0);
  const yMax = Math.max(hi, 0);

  const plot = new Plot(ctx, {
    ...box,
    xMin: 0,
    xMax: length_mm,
    yMin,
    yMax,
  });
  plot.frame({ yLabel: label, xTicks: 8, yTicks: 3, format });

  if (heatBy) {
    ctx.save();
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    for (let i = 1; i < xs.length; i++) {
      ctx.beginPath();
      ctx.moveTo(plot.px(xs[i - 1]), plot.py(values[i - 1]));
      ctx.lineTo(plot.px(xs[i]), plot.py(values[i]));
      ctx.strokeStyle = heatColor(safetyToHeat(heatBy[i], 1.5));
      ctx.stroke();
    }
    ctx.restore();
  } else {
    plot.line(Array.from(xs), Array.from(values), { color, width: 2, fill });
  }

  if (markerX != null) {
    plot.vline(markerX, { color: "#f59e0b", dash: [4, 3], width: 1.5 });
    plot.dot(markerX, sampleAt(xs, values, markerX), {
      color: "#f59e0b",
      r: 4,
    });
  }

  return plot;
}

export function renderShaft(
  canvas: HTMLCanvasElement,
  result: ShaftResult,
  opts: {
    markerX?: number | null;
    disp?: ShaftDisplayConverters;
  } = {},
) {
  const { ctx, w, h } = setupCanvas(canvas);
  const markerX = opts.markerX ?? result.peaks.vonMises.x;
  const disp = opts.disp ?? {
    len: (v) => v,
    force: (v) => v,
    stress: (v) => v,
    moment: (v) => v,
    L: "mm",
    F: "N",
    S: "MPa",
    M: "N-m",
  };

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const boxes = panelBoxes(w, h);

  drawSchematic(ctx, boxes[0], result, markerX, disp);

  drawSeriesPanel(ctx, boxes[1], result, markerX, {
    values: result.V,
    label: `Shear V (${disp.F})`,
    color: "#2563eb",
    fill: "rgba(37, 99, 235, 0.16)",
    format: (v) => disp.force(v).toFixed(0),
  });

  const momentDisplay = Float64Array.from(result.M, (v) => v / 1000);
  drawSeriesPanel(ctx, boxes[2], result, markerX, {
    values: momentDisplay,
    label: `Moment M (${disp.M})`,
    color: "#9333ea",
    fill: "rgba(147, 51, 234, 0.16)",
    format: (v) => disp.moment(v).toFixed(0),
  });

  const stressPlot = drawSeriesPanel(ctx, boxes[3], result, markerX, {
    values: result.vonMises,
    label: `von Mises (${disp.S})`,
    color: "#ef4444",
    fill: null,
    format: (v) => disp.stress(v).toFixed(0),
    heatBy: result.nFatigue,
  });

  const peak = result.peaks.vonMises;
  drawLabel(
    ctx,
    `peak ${disp.stress(peak.value).toFixed(0)} ${disp.S} @ ${disp.len(peak.x).toFixed(1)} ${disp.L}`,
    stressPlot.px(peak.x),
    boxes[3].y + 12,
    {
      align: peak.x > result.length_mm * 0.7 ? "right" : "left",
      color: "#dc2626",
      font: '600 11px "Manrope", sans-serif',
      background: "rgba(255,255,255,0.9)",
    },
  );

  drawLabel(
    ctx,
    `station along shaft (${disp.L})`,
    MARGIN.left + (w - MARGIN.left - MARGIN.right) / 2,
    h - 6,
    { align: "center", color: "#64748b", font: '11px "Manrope", sans-serif' },
  );
}
