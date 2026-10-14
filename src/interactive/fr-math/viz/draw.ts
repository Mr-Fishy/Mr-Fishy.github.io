/**
 * draw.ts
 *
 * Shared 2D canvas helpers: DPI-correct setup, stress heat ramp, arrows,
 * and cartesian Plot helper.
 */

export function setupCanvas(canvas: HTMLCanvasElement): {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
} {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(rect.width, 1);
  const h = Math.max(rect.height, 1);

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);

  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  return { ctx, w, h };
}

const HEAT_STOPS: [number, [number, number, number]][] = [
  [0.0, [44, 123, 182]], // cool blue
  [0.35, [120, 198, 121]], // green
  [0.6, [254, 217, 90]], // yellow
  [0.8, [253, 141, 60]], // orange
  [1.0, [214, 35, 40]], // red
];

export function heatColor(t: number, alpha = 1): string {
  const v = Math.min(Math.max(t, 0), 1);
  for (let i = 0; i < HEAT_STOPS.length - 1; i++) {
    const [p0, c0] = HEAT_STOPS[i];
    const [p1, c1] = HEAT_STOPS[i + 1];
    if (v >= p0 && v <= p1) {
      const f = (v - p0) / (p1 - p0);
      const rgb = c0.map((c, k) => Math.round(c + (c1[k] - c) * f));
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    }
  }
  const last = HEAT_STOPS[HEAT_STOPS.length - 1][1];
  return `rgba(${last[0]}, ${last[1]}, ${last[2]}, ${alpha})`;
}

export function safetyToHeat(sf: number, target = 1.5): number {
  if (!Number.isFinite(sf)) return 0;
  if (sf <= target * 0.5) return 1;
  if (sf >= target * 2) return 0;
  if (sf <= target) {
    return 1 - 0.4 * ((sf - target * 0.5) / (target * 0.5));
  }
  return 0.6 * (1 - (sf - target) / target);
}

export function safetyVerdict(
  sf: number,
  target = 1.5,
): { label: string; className: string } {
  if (!Number.isFinite(sf))
    return { label: "--", className: "text-muted-foreground" };
  if (sf < 1.0) return { label: "FAIL", className: "text-red-500 font-bold" };
  if (sf < target)
    return { label: "MARGINAL", className: "text-amber-500 font-bold" };
  if (sf < target * 1.6)
    return { label: "OK", className: "text-emerald-500 font-bold" };
  return { label: "CONSERVATIVE", className: "text-cyan-500 font-bold" };
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  {
    color = "#e74c3c",
    width = 3,
    head = 10,
  }: { color?: string; width?: number; head?: number } = {},
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return;
  const h = Math.min(head, len * 0.45);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(angle) * h * 0.8, y2 - Math.sin(angle) * h * 0.8);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - h * Math.cos(angle - 0.4), y2 - h * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - h * Math.cos(angle + 0.4), y2 - h * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  {
    color = "#2c3e50",
    font = '12px "Manrope", system-ui, sans-serif',
    align = "left",
    baseline = "middle",
    background = null,
  }: {
    color?: string;
    font?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
    background?: string | null;
  } = {},
) {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  if (background) {
    const m = ctx.measureText(text);
    const padX = 4;
    const padY = 3;
    const w = m.width + padX * 2;
    const h = 14 + padY;
    const bx =
      align === "center" ? x - w / 2 : align === "right" ? x - w : x - padX;
    ctx.fillStyle = background;
    ctx.fillRect(bx, y - h / 2, w, h);
  }

  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function niceStep(range: number, targetTicks: number): number {
  if (!(range > 0)) return 1;
  const raw = range / targetTicks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = norm <= 1.5 ? 1 : norm <= 3 ? 2 : norm <= 7 ? 5 : 10;
  return step * mag;
}

export function extent(arr: ArrayLike<number>): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (Number.isFinite(v)) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return min === Number.POSITIVE_INFINITY ? [0, 1] : [min, max];
}

export function padExtent(
  [lo, hi]: [number, number],
  fraction = 0.1,
): [number, number] {
  const span = hi - lo;
  if (span <= 1e-9) return [lo - 1, hi + 1];
  return [lo - span * fraction, hi + span * fraction];
}

export class Plot {
  ctx: CanvasRenderingContext2D;
  box: { x: number; y: number; w: number; h: number };
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  padTop: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    {
      x,
      y,
      w,
      h,
      xMin,
      xMax,
      yMin,
      yMax,
      padTop = 0,
    }: {
      x: number;
      y: number;
      w: number;
      h: number;
      xMin: number;
      xMax: number;
      yMin: number;
      yMax: number;
      padTop?: number;
    },
  ) {
    this.ctx = ctx;
    this.box = { x, y, w, h };
    this.xMin = xMin;
    this.xMax = xMax === xMin ? xMin + 1 : xMax;
    this.yMin = yMin;
    this.yMax = yMax === yMin ? yMin + 1 : yMax;
    this.padTop = padTop;
  }

  px(v: number): number {
    return (
      this.box.x + ((v - this.xMin) / (this.xMax - this.xMin)) * this.box.w
    );
  }

  py(v: number): number {
    return (
      this.box.y +
      this.box.h -
      ((v - this.yMin) / (this.yMax - this.yMin)) * this.box.h
    );
  }

  frame({
    xLabel = "",
    yLabel = "",
    xTicks = 6,
    yTicks = 4,
    format = (v: number) => String(Math.round(v * 100) / 100),
    xFormat = null,
    yFormat = null,
    grid = true,
  }: {
    xLabel?: string;
    yLabel?: string;
    xTicks?: number;
    yTicks?: number;
    format?: (v: number) => string;
    xFormat?: ((v: number) => string) | null;
    yFormat?: ((v: number) => string) | null;
    grid?: boolean;
  } = {}) {
    const { ctx, box } = this;
    const fmtX = xFormat || format;
    const fmtY = yFormat || format;
    ctx.save();

    ctx.fillStyle = "#fbfcfd";
    ctx.fillRect(box.x, box.y, box.w, box.h);

    const xStep = niceStep(this.xMax - this.xMin, xTicks);
    const yStep = niceStep(this.yMax - this.yMin, yTicks);

    ctx.font = '10px "Manrope", system-ui, sans-serif';
    ctx.fillStyle = "#8a97a4";
    ctx.strokeStyle = "#e7ecf1";
    ctx.lineWidth = 1;

    for (
      let v = Math.ceil(this.xMin / xStep) * xStep;
      v <= this.xMax + 1e-9;
      v += xStep
    ) {
      const x = Math.round(this.px(v)) + 0.5;
      if (grid) {
        ctx.beginPath();
        ctx.moveTo(x, box.y);
        ctx.lineTo(x, box.y + box.h);
        ctx.stroke();
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(fmtX(v), x, box.y + box.h + 4);
    }

    for (
      let v = Math.ceil(this.yMin / yStep) * yStep;
      v <= this.yMax + 1e-9;
      v += yStep
    ) {
      const y = Math.round(this.py(v)) + 0.5;
      if (grid) {
        ctx.beginPath();
        ctx.moveTo(box.x, y);
        ctx.lineTo(box.x + box.w, y);
        ctx.stroke();
      }
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(fmtY(v), box.x - 5, y);
    }

    if (this.yMin < 0 && this.yMax > 0) {
      ctx.strokeStyle = "#b6c2ce";
      ctx.beginPath();
      const zy = Math.round(this.py(0)) + 0.5;
      ctx.moveTo(box.x, zy);
      ctx.lineTo(box.x + box.w, zy);
      ctx.stroke();
    }

    ctx.strokeStyle = "#ccd5de";
    ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w, box.h);

    if (xLabel) {
      drawLabel(ctx, xLabel, box.x + box.w / 2, box.y + box.h + 20, {
        align: "center",
        color: "#5a6c7d",
        font: '11px "Manrope", system-ui, sans-serif',
      });
    }
    if (yLabel) {
      ctx.save();
      ctx.translate(box.x - 38, box.y + box.h / 2);
      ctx.rotate(-Math.PI / 2);
      drawLabel(ctx, yLabel, 0, 0, {
        align: "center",
        color: "#5a6c7d",
        font: '11px "Manrope", system-ui, sans-serif',
      });
      ctx.restore();
    }

    ctx.restore();
  }

  line(
    xsArr: number[] | Float64Array,
    ysArr: number[] | Float64Array,
    { color = "#3498db", width = 2, fill = null as string | null } = {},
  ) {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < xsArr.length; i++) {
      const px = this.px(xsArr[i]);
      const py = this.py(ysArr[i]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    if (fill) {
      const baseY = this.py(Math.min(Math.max(0, this.yMin), this.yMax));
      ctx.lineTo(this.px(xsArr[xsArr.length - 1]), baseY);
      ctx.lineTo(this.px(xsArr[0]), baseY);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.beginPath();
      for (let i = 0; i < xsArr.length; i++) {
        const px = this.px(xsArr[i]);
        const py = this.py(ysArr[i]);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.restore();
  }

  vline(
    x: number,
    { color = "#8a97a4", dash = [] as number[], width = 1 } = {},
  ) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dash.length) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(this.px(x), this.box.y);
    ctx.lineTo(this.px(x), this.box.y + this.box.h);
    ctx.stroke();
    ctx.restore();
  }

  hline(
    y: number,
    { color = "#8a97a4", dash = [] as number[], width = 1 } = {},
  ) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dash.length) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(this.box.x, this.py(y));
    ctx.lineTo(this.box.x + this.box.w, this.py(y));
    ctx.stroke();
    ctx.restore();
  }

  dot(x: number, y: number, { color = "#e74c3c", r = 4 } = {}) {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.px(x), this.py(y), r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
