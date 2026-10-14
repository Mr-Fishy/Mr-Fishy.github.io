/**
 * ShaftTab.tsx
 *
 * Tab 2: Two-support beam solver for transmission shafts with 4 synchronized diagrams.
 */

import { ArrowDownToLine, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  analyzeShaft,
  gearLoadsFromMesh,
  SHAFT_MATERIALS,
  SURFACE_FINISH,
  sampleAt,
} from "../shaft";
import type {
  CustomShaftMaterial,
  GearMeshResult,
  ShaftInput,
  ShaftLoad,
  ShaftMaterialKey,
  ShaftResult,
  ShaftSegment,
  SurfaceFinishKey,
} from "../types";
import { fmt, Units } from "../unit";
import { safetyVerdict } from "../viz/draw";
import { renderShaft, xFromPointer } from "../viz/shaft-viz";
import { ShaftMathDoc } from "./MathDocs";

interface ShaftTabProps {
  isImperial: boolean;
  meshResult: GearMeshResult | null;
  onShaftUpdated: (result: ShaftResult) => void;
}

export function ShaftTab({
  isImperial,
  meshResult,
  onShaftUpdated,
}: ShaftTabProps) {
  // Dimensions & Material
  const [length, setLength] = useState(220); // mm or in
  const [diameter, setDiameter] = useState(25);
  const [supportA, setSupportA] = useState(20);
  const [supportB, setSupportB] = useState(200);
  const [material, setMaterial] = useState<ShaftMaterialKey>("4140");
  const [customMaterial, setCustomMaterial] = useState<CustomShaftMaterial>({
    label: "Custom Steel / Alloy",
    Sut: 1100,
    Sy: 950,
    E: 207000,
    seRatio: 0.5,
  });
  const [finish, setFinish] = useState<SurfaceFinishKey>("machined");
  const [kf, setKf] = useState(1.6);
  const [kfs, setKfs] = useState(1.4);
  const [reliability, setReliability] = useState(0.99);

  // Applied Loads (stored in metric internally)
  const [loads, setLoads] = useState<ShaftLoad[]>([
    { id: "1", label: "Pinion", x: 110, Fv: 575, Fh: 1580 },
  ]);

  // Torques
  const [torqueIn, setTorqueIn] = useState(40);
  const [torqueOut, setTorqueOut] = useState(180);
  const [torqueVal, setTorqueVal] = useState(39.5); // N-m

  // Stepped Segments
  const [segments, setSegments] = useState<ShaftSegment[]>([]);

  // Hotspot position (mm)
  const [markerX, setMarkerX] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Unit conversions for inputs
  const lengthMetric = Units.lengthToMetric(length, isImperial);
  const diameterMetric = Units.lengthToMetric(diameter, isImperial);
  const supportAMetric = Units.lengthToMetric(supportA, isImperial);
  const supportBMetric = Units.lengthToMetric(supportB, isImperial);
  const torqueInMetric = Units.lengthToMetric(torqueIn, isImperial);
  const torqueOutMetric = Units.lengthToMetric(torqueOut, isImperial);
  const torqueValMetric = Units.torqueToMetric(torqueVal, isImperial);

  const shaftInput: ShaftInput = {
    length_mm: lengthMetric,
    baseDiameter_mm: diameterMetric,
    supports: [supportAMetric, supportBMetric],
    loads: loads.map((l) => ({ ...l })),
    torques: [
      { x: torqueInMetric, T: torqueValMetric },
      { x: torqueOutMetric, T: -torqueValMetric },
    ],
    segments,
    material,
    customMaterial: material === "custom" ? customMaterial : undefined,
    surfaceFinish: finish,
    Kf: kf,
    Kfs: kfs,
    reliability,
  };

  let result: ShaftResult | null = null;
  let errorMsg: string | null = null;

  try {
    result = analyzeShaft(shaftInput);
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  // Publish to parent
  useEffect(() => {
    if (result) {
      onShaftUpdated(result);
    }
  }, [result]);

  // Set default markerX to peak stress point
  useEffect(() => {
    if (result && markerX === null) {
      setMarkerX(result.peaks.vonMises.x);
    }
  }, [result]);

  // Display converters
  const labels = Units.labels(isImperial);
  const disp = {
    len: (v: number) => Units.lengthToDisplay(v, isImperial),
    force: (v: number) => Units.forceToDisplay(v, isImperial),
    stress: (v: number) => Units.stressToDisplay(v, isImperial),
    moment: (v: number) => Units.torqueToDisplay(v, isImperial),
    L: labels.length,
    F: labels.force,
    S: labels.stress,
    M: labels.torque,
  };

  // Canvas paint
  useEffect(() => {
    if (canvasRef.current && result) {
      renderShaft(canvasRef.current, result, { markerX, disp });
    }
  }, [result, markerX, isImperial]);

  const handleImportGear = () => {
    if (!meshResult) return;
    const imported = gearLoadsFromMesh(
      meshResult,
      lengthMetric / 2,
      "Pinion (imported)",
    );
    setLoads((prev) => [...prev, { ...imported, id: String(Date.now()) }]);
    setTorqueVal(Units.torqueToDisplay(meshResult.loads.torque_Nm, isImperial));
  };

  const handleAddLoad = () => {
    setLoads((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        label: `Load ${prev.length + 1}`,
        x: lengthMetric / 2,
        Fv: 500,
        Fh: 0,
      },
    ]);
  };

  const handleRemoveLoad = (idx: number) => {
    setLoads((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddSegment = () => {
    setSegments((prev) => [
      ...prev,
      {
        x0: 0,
        x1: lengthMetric / 3,
        d: diameterMetric * 0.8,
      },
    ]);
  };

  const handleRemoveSegment = (idx: number) => {
    setSegments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Inspect hotspot values at markerX
  const activeX = markerX ?? (result ? result.peaks.vonMises.x : 0);
  const atVM = result ? sampleAt(result.xs, result.vonMises, activeX) : 0;
  const atM = result ? sampleAt(result.xs, result.M, activeX) / 1000 : 0;
  const atV = result ? sampleAt(result.xs, result.V, activeX) : 0;
  const atDefl = result ? sampleAt(result.xs, result.deflection, activeX) : 0;
  const atFatigue = result ? sampleAt(result.xs, result.nFatigue, activeX) : 0;

  return (
    <div className="space-y-6">
      {/* 4-Panel Synchronized Visualizer Card */}
      <Card className="overflow-hidden border border-border shadow-sm">
        <CardHeader className="bg-muted/40 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Shaft Biaxial Diagrams & Deflection
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deflected beam schematic, Shear V, Resultant Bending M, and von
              Mises stress with synchronized cursor scrubber.
            </p>
          </div>
          {meshResult && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportGear}
              className="gap-1.5 text-xs h-8"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              Import Gear Mesh Loads
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0 bg-white dark:bg-slate-950 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            className="w-full h-[520px] block cursor-crosshair"
            onMouseMove={(e) => {
              if (!canvasRef.current || !result) return;
              setMarkerX(xFromPointer(canvasRef.current, result, e.clientX));
            }}
            onMouseLeave={() => {
              if (result) setMarkerX(result.peaks.vonMises.x);
            }}
          />
          {/* Station Scrubber Slider */}
          {result && (
            <div className="w-full px-6 py-3 border-t border-border bg-muted/20 flex items-center gap-4">
              <span className="text-xs font-semibold whitespace-nowrap text-muted-foreground">
                Inspect Station x:
              </span>
              <input
                type="range"
                min="0"
                max={result.length_mm}
                step="0.5"
                value={activeX}
                onChange={(e) => setMarkerX(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <span className="text-xs font-mono font-bold whitespace-nowrap min-w-[70px] text-right">
                {disp.len(activeX).toFixed(1)} {disp.L}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hotspot Inspector Cards */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="p-3.5 bg-card/60">
            <span className="text-xs text-muted-foreground block">
              von Mises Stress
            </span>
            <span className="text-lg font-bold block mt-1">
              {fmt(disp.stress(atVM), 1)} {disp.S}
            </span>
          </Card>
          <Card className="p-3.5 bg-card/60">
            <span className="text-xs text-muted-foreground block">
              Fatigue Safety SF
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold">{fmt(atFatigue, 2)}</span>
              <span
                className={`text-xs ${safetyVerdict(atFatigue, 1.5).className}`}
              >
                {safetyVerdict(atFatigue, 1.5).label}
              </span>
            </div>
          </Card>
          <Card className="p-3.5 bg-card/60">
            <span className="text-xs text-muted-foreground block">
              Resultant Moment
            </span>
            <span className="text-lg font-bold block mt-1">
              {fmt(disp.moment(atM), 1)} {disp.M}
            </span>
          </Card>
          <Card className="p-3.5 bg-card/60">
            <span className="text-xs text-muted-foreground block">
              Shear Force V
            </span>
            <span className="text-lg font-bold block mt-1">
              {fmt(disp.force(atV), 1)} {disp.F}
            </span>
          </Card>
          <Card className="p-3.5 bg-card/60">
            <span className="text-xs text-muted-foreground block">
              Deflection y
            </span>
            <span className="text-lg font-bold block mt-1">
              {fmt(disp.len(atDefl), 4)} {disp.L}
            </span>
          </Card>
        </div>
      )}

      {/* Warnings & Errors */}
      {result && result.warnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 space-y-1 text-xs text-amber-800 dark:text-amber-300">
          <span className="font-semibold block">Shaft Solver Notes:</span>
          {result.warnings.map((w, idx) => (
            <p key={idx}>• {w}</p>
          ))}
        </div>
      )}

      {errorMsg && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-xs text-destructive">
          Error solving shaft: {errorMsg}
        </div>
      )}

      {/* Controls: Geometry & Loads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geometry & Material */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Shaft Geometry & Supports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">
                  <span className="block mb-1">Total Length ({labels.length})</span>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value) || 1)}
                    className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                  />
                </label>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">
                  <span className="block mb-1">Base Diameter ({labels.length})</span>
                  <input
                    type="number"
                    value={diameter}
                    onChange={(e) => setDiameter(parseFloat(e.target.value) || 1)}
                    className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">
                  <span className="block mb-1">Bearing A Position ({labels.length})</span>
                  <input
                    type="number"
                    value={supportA}
                    onChange={(e) => setSupportA(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                  />
                </label>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">
                  <span className="block mb-1">Bearing B Position ({labels.length})</span>
                  <input
                    type="number"
                    value={supportB}
                    onChange={(e) => setSupportB(parseFloat(e.target.value) || 1)}
                    className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">
                  <span className="block mb-1">Material</span>
                  <select
                    value={material}
                    onChange={(e) =>
                      setMaterial(e.target.value as ShaftMaterialKey)
                    }
                    className="w-full px-2 py-1 rounded border border-border bg-background text-xs text-foreground"
                  >
                    {Object.entries(SHAFT_MATERIALS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">
                  <span className="block mb-1">Surface Finish</span>
                  <select
                    value={finish}
                    onChange={(e) =>
                      setFinish(e.target.value as SurfaceFinishKey)
                    }
                    className="w-full px-2 py-1 rounded border border-border bg-background text-xs text-foreground"
                  >
                    {Object.entries(SURFACE_FINISH).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {material === "custom" && (
              <div className="p-3 rounded border border-border bg-muted/20 space-y-2.5">
                <div className="font-semibold text-primary text-[11px] uppercase tracking-wider">
                  Custom Material Properties
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-muted-foreground block mb-1">
                      Material Name
                    </label>
                    <input
                      type="text"
                      value={customMaterial.label}
                      onChange={(e) =>
                        setCustomMaterial((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                      className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground block mb-1">
                      Modulus E ({isImperial ? "Mpsi" : "GPa"})
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={
                        isImperial
                          ? (customMaterial.E / 6894.757).toFixed(1)
                          : (customMaterial.E / 1000).toFixed(0)
                      }
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        setCustomMaterial((prev) => ({
                          ...prev,
                          E: isImperial ? v * 6894.757 : v * 1000,
                        }));
                      }}
                      className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground block mb-1">
                      Tensile Sut ({disp.S})
                    </label>
                    <input
                      type="number"
                      value={
                        isImperial
                          ? Math.round(customMaterial.Sut * 145.038)
                          : customMaterial.Sut
                      }
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        setCustomMaterial((prev) => ({
                          ...prev,
                          Sut: isImperial ? v / 145.038 : v,
                        }));
                      }}
                      className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground block mb-1">
                      Yield Sy ({disp.S})
                    </label>
                    <input
                      type="number"
                      value={
                        isImperial
                          ? Math.round(customMaterial.Sy * 145.038)
                          : customMaterial.Sy
                      }
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        setCustomMaterial((prev) => ({
                          ...prev,
                          Sy: isImperial ? v / 145.038 : v,
                        }));
                      }}
                      className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-muted-foreground block mb-1">
                      Endurance Limit Ratio Se' / Sut (0.50 steel, 0.35 Al, 0.45 Ti)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="0.8"
                      value={customMaterial.seRatio ?? 0.5}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0.5;
                        setCustomMaterial((prev) => ({
                          ...prev,
                          seRatio: v,
                        }));
                      }}
                      className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">
                  <span className="block mb-1">Kf (Bending)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={kf}
                    onChange={(e) => setKf(parseFloat(e.target.value) || 1)}
                    className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                  />
                </label>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">
                  <span className="block mb-1">Kfs (Torsion)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={kfs}
                    onChange={(e) => setKfs(parseFloat(e.target.value) || 1)}
                    className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                  />
                </label>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">
                  <span className="block mb-1">Torque ({labels.torque})</span>
                  <input
                    type="number"
                    step="1"
                    value={torqueVal}
                    onChange={(e) =>
                      setTorqueVal(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applied Loads Table */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Transverse Loads
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddLoad}
              className="gap-1 text-xs h-7 px-2"
            >
              <Plus className="w-3.5 h-3.5" /> Add Load
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {loads.length === 0 ? (
              <p className="text-muted-foreground italic">
                No applied loads added.
              </p>
            ) : (
              <div className="space-y-2">
                {loads.map((L, idx) => (
                  <div
                    key={L.id || idx}
                    className="flex items-center gap-2 p-2 bg-muted/40 rounded-md"
                  >
                    <input
                      type="text"
                      value={L.label}
                      onChange={(e) => {
                        const copy = [...loads];
                        copy[idx].label = e.target.value;
                        setLoads(copy);
                      }}
                      className="w-24 px-1.5 py-1 rounded border border-border bg-background text-xs"
                      placeholder="Label"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-[10px]">
                        x:
                      </span>
                      <input
                        type="number"
                        value={Units.lengthToDisplay(L.x, isImperial)}
                        onChange={(e) => {
                          const copy = [...loads];
                          copy[idx].x = Units.lengthToMetric(
                            parseFloat(e.target.value) || 0,
                            isImperial,
                          );
                          setLoads(copy);
                        }}
                        className="w-16 px-1.5 py-1 rounded border border-border bg-background text-right"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-[10px]">
                        Fv:
                      </span>
                      <input
                        type="number"
                        value={Units.forceToDisplay(L.Fv, isImperial)}
                        onChange={(e) => {
                          const copy = [...loads];
                          copy[idx].Fv = Units.forceToMetric(
                            parseFloat(e.target.value) || 0,
                            isImperial,
                          );
                          setLoads(copy);
                        }}
                        className="w-16 px-1.5 py-1 rounded border border-border bg-background text-right"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-[10px]">
                        Fh:
                      </span>
                      <input
                        type="number"
                        value={Units.forceToDisplay(L.Fh, isImperial)}
                        onChange={(e) => {
                          const copy = [...loads];
                          copy[idx].Fh = Units.forceToMetric(
                            parseFloat(e.target.value) || 0,
                            isImperial,
                          );
                          setLoads(copy);
                        }}
                        className="w-16 px-1.5 py-1 rounded border border-border bg-background text-right"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLoad(idx)}
                      className="text-destructive h-7 w-7 p-0 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mathematical Theory & Governing Equations */}
      <ShaftMathDoc />
    </div>
  );
}
