/**
 * bearing-viz.ts
 *
 * Rolling bearing L10 life vs speed log-scale curves in TypeScript.
 */

import type { BearingLifeCurvePoint } from "../types";
import { drawLabel, Plot, setupCanvas } from "./draw";

export const SERIES_COLORS = [
  "#2563eb",
  "#d97706",
  "#16a34a",
  "#9333ea",
  "#dc2626",
  "#0d9488",
];

function formatHours(v: number): string {
  if (!Number.isFinite(v)) return "∞";
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}k`;
  if (v >= 10) return v.toFixed(0);
  return v.toFixed(1);
}

export function renderBearingChart(
  canvas: HTMLCanvasElement,
  opts: {
    curves?: { id: string; points: BearingLifeCurvePoint[] }[];
    currentRPM?: number;
    targetHours?: number;
  },
) {
  const { ctx, w, h } = setupCanvas(canvas);
  const { curves = [], currentRPM = 0, targetHours = 0 } = opts;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const all = curves
    .flatMap((c) => c.points)
    .filter((p) => Number.isFinite(p.L10h) && p.L10h > 0);
  if (!all.length) {
    drawLabel(ctx, "Select at least one bearing to plot.", w / 2, h / 2, {
      align: "center",
      color: "#8a97a4",
    });
    return;
  }

  const rpmMin = Math.min(...all.map((p) => p.rpm));
  const rpmMax = Math.max(...all.map((p) => p.rpm));
  const lives = all.map((p) => Math.log10(p.L10h));
  if (targetHours > 0) lives.push(Math.log10(targetHours));

  const yMin = Math.floor(Math.min(...lives) * 2) / 2 - 0.15;
  const yMax = Math.ceil(Math.max(...lives) * 2) / 2 + 0.15;

  const plot = new Plot(ctx, {
    x: 62,
    y: 16,
    w: w - 62 - 120,
    h: h - 16 - 42,
    xMin: rpmMin,
    xMax: rpmMax,
    yMin,
    yMax,
  });

  plot.frame({
    xLabel: "Operating speed (RPM)",
    yLabel: "L10 life (hours)",
    xTicks: 6,
    yTicks: 5,
    xFormat: (v) => v.toFixed(0),
    yFormat: (v) => formatHours(10 ** v),
  });

  if (targetHours > 0) {
    plot.hline(Math.log10(targetHours), {
      color: "#dc2626",
      dash: [6, 4],
      width: 1.5,
    });
    drawLabel(
      ctx,
      `target ${formatHours(targetHours)} h`,
      plot.box.x + 6,
      plot.py(Math.log10(targetHours)) - 9,
      {
        color: "#dc2626",
        font: '600 10px "Manrope", sans-serif',
        background: "rgba(255,255,255,0.85)",
      },
    );
  }

  if (currentRPM >= rpmMin && currentRPM <= rpmMax) {
    plot.vline(currentRPM, { color: "#334155", dash: [4, 3], width: 1.5 });
    drawLabel(
      ctx,
      `${currentRPM.toFixed(0)} rpm`,
      plot.px(currentRPM) + 5,
      plot.box.y + 10,
      {
        color: "#334155",
        font: '600 10px "Manrope", sans-serif',
        background: "rgba(255,255,255,0.85)",
      },
    );
  }

  curves.forEach((curve, idx) => {
    const color = SERIES_COLORS[idx % SERIES_COLORS.length];
    const pts = curve.points.filter(
      (p) => Number.isFinite(p.L10h) && p.L10h > 0,
    );
    plot.line(
      pts.map((p) => p.rpm),
      pts.map((p) => Math.log10(p.L10h)),
      { color, width: 2.2 },
    );

    const at = pts.reduce(
      (best, p) =>
        Math.abs(p.rpm - currentRPM) < Math.abs(best.rpm - currentRPM)
          ? p
          : best,
      pts[0],
    );
    if (at) plot.dot(at.rpm, Math.log10(at.L10h), { color });

    const ly = plot.box.y + 14 + idx * 18;
    ctx.fillStyle = color;
    ctx.fillRect(w - 108, ly - 5, 14, 3);
    drawLabel(
      ctx,
      `${curve.id}  ${formatHours(at ? at.L10h : Number.NaN)} h`,
      w - 90,
      ly - 3,
      { color: "#334155", font: '11px "Manrope", sans-serif' },
    );
  });
}
