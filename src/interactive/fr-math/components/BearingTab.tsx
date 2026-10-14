/**
 * BearingTab.tsx
 *
 * Tab 3: ISO 281 rolling bearing life analysis & candidate comparison.
 */

import { ArrowDownToLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { availableBores, lifeCurve, rankCandidates } from "../bearing";
import type { ShaftResult } from "../types";
import { fmt, Units } from "../unit";
import { renderBearingChart } from "../viz/bearing-viz";

interface BearingTabProps {
  isImperial: boolean;
  shaftResult: ShaftResult | null;
}

export function BearingTab({ isImperial, shaftResult }: BearingTabProps) {
  const [bore, setBore] = useState(25);
  const [rpm, setRpm] = useState(2900);
  const [radialLoad, setRadialLoad] = useState(1150); // displayed
  const [axialLoad, setAxialLoad] = useState(0);
  const [targetLife, setTargetLife] = useState(500); // hours
  const [reliability, setReliability] = useState(0.9);
  const [rpmMin, setRpmMin] = useState(500);
  const [rpmMax, setRpmMax] = useState(8000);
  const [mode, setMode] = useState<"constantLoad" | "constantPower">(
    "constantLoad",
  );

  // Selection of bearing IDs to plot
  const [plottedIds, setPlottedIds] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Convert inputs
  const FrMetric = Units.forceToMetric(radialLoad, isImperial);
  const FaMetric = Units.forceToMetric(axialLoad, isImperial);

  const candidates = rankCandidates(bore, FrMetric, FaMetric, rpm, reliability);

  // Default to first 3 candidates if none selected
  useEffect(() => {
    if (candidates.length > 0 && plottedIds.length === 0) {
      setPlottedIds(candidates.slice(0, 3).map((c) => c.bearing.id));
    }
  }, [bore, candidates.length]);

  // Compute life curves for plotted candidates
  const curves = candidates
    .filter((c) => plottedIds.includes(c.bearing.id))
    .map((c) => ({
      id: c.bearing.id,
      points: lifeCurve(c.bearing, FrMetric, FaMetric, [rpmMin, rpmMax], {
        mode,
        referenceRPM: rpm,
        reliability,
      }),
    }));

  // Re-render chart
  useEffect(() => {
    if (canvasRef.current) {
      renderBearingChart(canvasRef.current, {
        curves,
        currentRPM: rpm,
        targetHours: targetLife,
      });
    }
  }, [curves, rpm, targetLife, isImperial]);

  const togglePlot = (id: string) => {
    setPlottedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleUseReaction = (reaction: "A" | "B") => {
    if (!shaftResult) return;
    const r =
      reaction === "A"
        ? shaftResult.reactions.A.resultant
        : shaftResult.reactions.B.resultant;
    setRadialLoad(Units.forceToDisplay(Math.abs(r), isImperial));
  };

  const labels = Units.labels(isImperial);

  return (
    <div className="space-y-6">
      {/* Chart Visualizer */}
      <Card className="overflow-hidden border border-border shadow-sm">
        <CardHeader className="bg-muted/40 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              ISO 281 Bearing Life Curve (Log-Hours vs Speed)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Evaluating L10h rating against target life ceiling at operating
              RPM. Select bearings below to overlay curves.
            </p>
          </div>
          {shaftResult && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUseReaction("A")}
                className="gap-1.5 text-xs h-8"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                Use Reaction A (
                {dispForce(shaftResult.reactions.A.resultant, isImperial)}{" "}
                {labels.force})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUseReaction("B")}
                className="gap-1.5 text-xs h-8"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                Use Reaction B (
                {dispForce(shaftResult.reactions.B.resultant, isImperial)}{" "}
                {labels.force})
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0 bg-white dark:bg-slate-950 flex justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-80 sm:h-96 block"
            style={{ touchAction: "none" }}
          />
        </CardContent>
      </Card>

      {/* Controls & Catalog Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operating Point */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Bearing Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Shaft Bore (d)</span>
              <select
                value={bore}
                onChange={(e) => {
                  setBore(parseInt(e.target.value, 10));
                  setPlottedIds([]);
                }}
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-xs text-foreground"
              >
                {availableBores().map((b) => (
                  <option key={b} value={b}>
                    {b} mm
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Operating Speed (RPM)</span>
              <input
                type="number"
                step="50"
                value={rpm}
                onChange={(e) => setRpm(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-foreground"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Radial Load Fr ({labels.force})</span>
              <input
                type="number"
                step="10"
                value={radialLoad}
                onChange={(e) => setRadialLoad(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-foreground"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Axial Load Fa ({labels.force})</span>
              <input
                type="number"
                step="10"
                value={axialLoad}
                onChange={(e) => setAxialLoad(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-foreground"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Target Life (h)</span>
              <input
                type="number"
                step="50"
                value={targetLife}
                onChange={(e) => setTargetLife(parseFloat(e.target.value) || 1)}
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-foreground"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Reliability (a1 factor)</span>
              <select
                value={reliability}
                onChange={(e) => setReliability(parseFloat(e.target.value))}
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-xs text-foreground"
              >
                <option value={0.9}>90% (a1=1.0)</option>
                <option value={0.95}>95% (a1=0.64)</option>
                <option value={0.99}>99% (a1=0.25)</option>
              </select>
            </label>
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Curve Sizing Mode</span>
              <select
                value={mode}
                onChange={(e) =>
                  setMode(e.target.value as "constantLoad" | "constantPower")
                }
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-xs text-foreground"
              >
                <option value="constantLoad">Constant Load</option>
                <option value="constantPower">Constant Power</option>
              </select>
            </label>
          </CardContent>
        </Card>

        {/* Candidate Ranking Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Candidate Bearings ({bore} mm bore)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="p-2 w-8">Plot</th>
                    <th className="p-2">Bearing</th>
                    <th className="p-2">d × D × B (mm)</th>
                    <th className="p-2">C (kN)</th>
                    <th className="p-2">P ({labels.force})</th>
                    <th className="p-2">L10h (h)</th>
                    <th className="p-2">Lnmh (h)</th>
                    <th className="p-2">Static S0</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {candidates.map((c) => (
                    <tr
                      key={c.bearing.id}
                      className={
                        plottedIds.includes(c.bearing.id)
                          ? "bg-primary/5 font-medium"
                          : "hover:bg-muted/30"
                      }
                    >
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={plottedIds.includes(c.bearing.id)}
                          onChange={() => togglePlot(c.bearing.id)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="p-2 font-mono">{c.bearing.id}</td>
                      <td className="p-2 text-muted-foreground">
                        {c.bearing.d} × {c.bearing.D} × {c.bearing.B}
                      </td>
                      <td className="p-2">{c.bearing.C.toFixed(2)}</td>
                      <td className="p-2">
                        {Units.forceToDisplay(c.P, isImperial).toFixed(0)}
                      </td>
                      <td className="p-2 font-semibold">
                        {c.L10h >= 1e5
                          ? c.L10h.toExponential(1)
                          : c.L10h.toFixed(0)}
                      </td>
                      <td className="p-2 text-primary font-bold">
                        {c.Lnmh >= 1e5
                          ? c.Lnmh.toExponential(1)
                          : c.Lnmh.toFixed(0)}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {fmt(c.staticSafety, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function dispForce(val: number, isImperial: boolean): string {
  return fmt(Units.forceToDisplay(val, isImperial), 0);
}
