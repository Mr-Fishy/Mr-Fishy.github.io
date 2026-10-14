/**
 * crank-viz.ts
 *
 * 4-bar crank-rocker mechanism & oscillation graph canvas rendering.
 */

import type { CrankDynamicHistoryPoint } from "../types";
import { setupCanvas } from "./draw";

export function drawLinkage(
  canvas: HTMLCanvasElement,
  r1: number,
  r2: number,
  r3: number,
  r4: number,
  theta2: number,
) {
  const { ctx, w, h } = setupCanvas(canvas);

  const maxReach = r1 + r2 + r3 + r4;
  const scale = Math.min(w, h) / (maxReach * 1.2);
  const cx = w / 2 - (r1 * scale) / 2;
  const cy = h / 2 + (Math.max(r2, r4) * scale) / 2;

  const p1 = { x: cx, y: cy };
  const p4 = { x: cx + r1 * scale, y: cy };

  const p2 = {
    x: p1.x + r2 * scale * Math.cos(theta2),
    y: p1.y - r2 * scale * Math.sin(theta2),
  };

  const d = Math.hypot(p4.x - p2.x, p4.y - p2.y);
  if (d > r3 * scale + r4 * scale || d < Math.abs(r3 * scale - r4 * scale))
    return;

  const a = ((r3 * scale) ** 2 - (r4 * scale) ** 2 + d ** 2) / (2 * d);
  const hDist = Math.sqrt(Math.max(0, (r3 * scale) ** 2 - a ** 2));
  const p3_mid = {
    x: p2.x + (a * (p4.x - p2.x)) / d,
    y: p2.y + (a * (p4.y - p2.y)) / d,
  };

  // Open configuration
  const p3 = {
    x: p3_mid.x - (hDist * (p4.y - p2.y)) / d,
    y: p3_mid.y + (hDist * (p4.x - p2.x)) / d,
  };

  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Ground Link (r1)
  ctx.strokeStyle = "#94a3b8";
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.stroke();

  // Crank (r2)
  ctx.strokeStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  // Coupler (r3)
  ctx.strokeStyle = "#3b82f6";
  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.stroke();

  // Rocker (r4)
  ctx.strokeStyle = "#10b981";
  ctx.beginPath();
  ctx.moveTo(p4.x, p4.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.stroke();

  // Draw Joint Pins
  ctx.fillStyle = "#1e293b";
  [p1, p2, p3, p4].forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function drawOscillationGraph(
  canvas: HTMLCanvasElement,
  history: CrankDynamicHistoryPoint[],
) {
  const { ctx, w, h } = setupCanvas(canvas);

  if (!history || history.length === 0) return;

  let minTheta = Number.POSITIVE_INFINITY;
  let maxTheta = Number.NEGATIVE_INFINITY;
  for (const item of history) {
    if (item.theta4 < minTheta) minTheta = item.theta4;
    if (item.theta4 > maxTheta) maxTheta = item.theta4;
  }

  const padding = 20;
  const graphW = w - 2 * padding;
  const graphH = h - 2 * padding;

  const range = maxTheta - minTheta;
  const scaleY = range === 0 ? 1 : graphH / range;
  const scaleX = graphW / 360;

  // Axes
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding + graphH / 2);
  ctx.lineTo(w - padding, padding + graphH / 2);
  ctx.stroke();

  // Data curve
  ctx.beginPath();
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";

  for (let i = 0; i < history.length; i++) {
    const x = padding + i * scaleX;
    const y = padding + graphH - (history[i].theta4 - minTheta) * scaleY;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Peak torque throughput
  let bestIdx = 0;
  let minDev = Number.POSITIVE_INFINITY;
  for (let i = 0; i < history.length; i++) {
    if (history[i].gamma === null) continue;
    const dev = Math.abs(history[i].gamma! - Math.PI / 2);
    if (dev < minDev) {
      minDev = dev;
      bestIdx = i;
    }
  }

  if (minDev !== Number.POSITIVE_INFINITY) {
    const hBest = history[bestIdx];
    const x = padding + bestIdx * scaleX;
    const y = padding + graphH - (hBest.theta4 - minTheta) * scaleY;

    ctx.beginPath();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(x, padding);
    ctx.lineTo(x, padding + graphH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#f59e0b";
    ctx.fill();

    ctx.fillStyle = "#b45309";
    ctx.font = 'bold 11px "Manrope", sans-serif';
    ctx.textAlign = x > w / 2 ? "right" : "left";
    ctx.textBaseline = "top";
    const displayMA = hBest.ma! > 999 ? "∞" : hBest.ma!.toFixed(2);
    ctx.fillText(
      `Peak Torque (MA: ${displayMA})`,
      x + (x > w / 2 ? -6 : 6),
      padding,
    );
  }

  ctx.fillStyle = "#64748b";
  ctx.font = '12px "Manrope", sans-serif';
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(`${((maxTheta * 180) / Math.PI).toFixed(0)}°`, w - 5, padding);
  ctx.fillText(
    `${((minTheta * 180) / Math.PI).toFixed(0)}°`,
    w - 5,
    padding + graphH,
  );
}
