/**
 * GearTab.tsx
 *
 * Tab 1: AGMA Spur Gear Mesh Analysis and Involute Tooth Visualizer.
 */

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AGMA,
  AGMAGear,
  analyzeMesh,
  MATERIALS,
  MOUNTING,
  OVERLOAD,
} from "../gear";
import type {
  CustomGearMaterial,
  GearMeshInput,
  GearMeshResult,
  MaterialKey,
  MountingKey,
  OverloadKey,
} from "../types";
import { fmt, Units } from "../unit";
import { safetyVerdict } from "../viz/draw";
import { renderGearMesh } from "../viz/gear-viz";
import { GearMathDoc } from "./MathDocs";

interface GearTabProps {
  isImperial: boolean;
  onMeshUpdated: (result: GearMeshResult, input: GearMeshInput) => void;
  externalInput?: Partial<GearMeshInput> | null;
}

export function GearTab({
  isImperial,
  onMeshUpdated,
  externalInput,
}: GearTabProps) {
  // Input state
  const [power, setPower] = useState(12); // displayed value
  const [rpm, setRpm] = useState(2900);
  const [pitch, setPitch] = useState(2.5); // module (mm) or DP (1/in)
  const [faceWidth, setFaceWidth] = useState(20);
  const [pinionTeeth, setPinionTeeth] = useState(20);
  const [gearTeeth, setGearTeeth] = useState(52);
  const [pressureAngle, setPressureAngle] = useState(20);
  const [designLife, setDesignLife] = useState(30);

  const [overload, setOverload] = useState<OverloadKey>("moderate");
  const [qv, setQv] = useState(9);
  const [mounting, setMounting] = useState<MountingKey>("commercial");
  const [crowned, setCrowned] = useState(false);
  const [rimThickness, setRimThickness] = useState(0);
  const [jOverride, setJOverride] = useState<number | null>(null);

  const [material, setMaterial] = useState<MaterialKey>("carburized");
  const [customMaterial, setCustomMaterial] = useState<CustomGearMaterial>({
    label: "Custom Alloy",
    hardness_HB: 500,
    St: 400,
    Sc: 1300,
    E: 207000,
    v: 0.292,
  });
  const [grade, setGrade] = useState<1 | 2>(1);
  const [hardness, setHardness] = useState(600);
  const [reliability, setReliability] = useState(0.99);
  const [tempC, setTempC] = useState(90);
  const [targetSF, setTargetSF] = useState(1.5);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Apply external input changes (e.g. from optimizer)
  useEffect(() => {
    if (externalInput) {
      if (externalInput.pinionTeeth != null)
        setPinionTeeth(externalInput.pinionTeeth);
      if (externalInput.gearTeeth != null)
        setGearTeeth(externalInput.gearTeeth);
      if (externalInput.pinionRPM != null) setRpm(externalInput.pinionRPM);
      if (externalInput.module_mm != null) {
        setPitch(Units.moduleToDisplay(externalInput.module_mm, isImperial));
      }
    }
  }, [externalInput, isImperial]);

  // Adjust default hardness when material changes
  const handleMaterialChange = (newMat: MaterialKey) => {
    setMaterial(newMat);
    if (newMat === "custom") {
      setHardness(customMaterial.hardness_HB);
      return;
    }
    const m = MATERIALS[newMat];
    if (m) {
      setHardness(Math.round((m.hardnessRange[0] + m.hardnessRange[1]) / 2));
    }
  };

  // Convert inputs to metric for solver
  const powerMetric = Units.powerToMetric(power, isImperial);
  const moduleMetric = Units.pitchToModule(pitch, isImperial);
  const faceWidthMetric = Units.lengthToMetric(faceWidth, isImperial);
  const rimThicknessMetric = Units.lengthToMetric(rimThickness, isImperial);

  const currentInput: GearMeshInput = {
    power_kW: powerMetric,
    pinionRPM: rpm,
    module_mm: moduleMetric,
    faceWidth_mm: faceWidthMetric,
    pinionTeeth: Math.max(Math.round(pinionTeeth), 6),
    gearTeeth: Math.max(Math.round(gearTeeth), 6),
    pressureAngle_deg: pressureAngle,
    Qv: qv,
    overload,
    mounting,
    crowned,
    material,
    customMaterial: material === "custom" ? customMaterial : undefined,
    grade,
    hardness_HB: hardness,
    reliability,
    tempC,
    designLife_h: designLife,
    rimThickness_mm: rimThicknessMetric,
    J_override: jOverride,
  };

  let result: GearMeshResult | null = null;
  let calcError: string | null = null;

  try {
    result = analyzeMesh(currentInput);
  } catch (err: unknown) {
    calcError = err instanceof Error ? err.message : String(err);
  }

  // Publish result to parent store
  useEffect(() => {
    if (result) {
      onMeshUpdated(result, currentInput);
    }
  }, [
    power,
    rpm,
    pitch,
    faceWidth,
    pinionTeeth,
    gearTeeth,
    pressureAngle,
    qv,
    overload,
    mounting,
    crowned,
    material,
    grade,
    hardness,
    reliability,
    tempC,
    designLife,
    rimThickness,
    jOverride,
    isImperial,
  ]);

  // Re-render canvas
  useEffect(() => {
    if (canvasRef.current && result) {
      renderGearMesh(canvasRef.current, result, { targetSF });
    }
  }, [result, targetSF]);

  const labels = Units.labels(isImperial);

  return (
    <div className="space-y-6">
      {/* Visualizer Card */}
      <Card className="overflow-hidden border border-border shadow-sm">
        <CardHeader className="bg-muted/40 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Live Involute Mesh Visualizer
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Two true conjugate teeth generated from active module & pressure
              angle with contact vector W<sub>t</sub> and root stress glow.
            </p>
          </div>
          {result && (
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  result.safety.governing === "bending"
                    ? "destructive"
                    : "secondary"
                }
              >
                Governing: {result.safety.governing}
              </Badge>
              <Badge variant="outline">
                Ratio:{" "}
                {(
                  result.geometry.gearTeeth / result.geometry.pinionTeeth
                ).toFixed(2)}
                :1
              </Badge>
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

      {/* Safety Verdicts Summary */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3.5 bg-card/60">
            <span className="text-xs text-muted-foreground block">
              Pinion Root SF
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold">
                {fmt(result.safety.SF_p, 2)}
              </span>
              <span
                className={`text-xs ${safetyVerdict(result.safety.SF_p, targetSF).className}`}
              >
                {safetyVerdict(result.safety.SF_p, targetSF).label}
              </span>
            </div>
          </Card>
          <Card className="p-3.5 bg-card/60">
            <span className="text-xs text-muted-foreground block">
              Gear Root SF
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold">
                {fmt(result.safety.SF_g, 2)}
              </span>
              <span
                className={`text-xs ${safetyVerdict(result.safety.SF_g, targetSF).className}`}
              >
                {safetyVerdict(result.safety.SF_g, targetSF).label}
              </span>
            </div>
          </Card>
          <Card className="p-3.5 bg-card/60">
            <span className="text-xs text-muted-foreground block">
              Pinion Contact SH
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold">
                {fmt(result.safety.SH_p, 2)}
              </span>
              <span
                className={`text-xs ${safetyVerdict(result.safety.SH_p, targetSF).className}`}
              >
                {safetyVerdict(result.safety.SH_p, targetSF).label}
              </span>
            </div>
          </Card>
          <Card className="p-3.5 bg-card/60">
            <span className="text-xs text-muted-foreground block">
              Contact Load SF (SH²)
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold">
                {fmt(result.safety.SH_p_load, 2)}
              </span>
              <span
                className={`text-xs ${safetyVerdict(result.safety.SH_p_load, targetSF).className}`}
              >
                {safetyVerdict(result.safety.SH_p_load, targetSF).label}
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Warnings */}
      {result && result.warnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 space-y-1 text-xs text-amber-800 dark:text-amber-300">
          <span className="font-semibold block">Design Warnings:</span>
          {result.warnings.map((w, idx) => (
            <p key={idx}>• {w}</p>
          ))}
        </div>
      )}

      {calcError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-xs text-destructive">
          Error evaluating mesh: {calcError}
        </div>
      )}

      {/* Parameters Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Operating Point */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              1. Operating Point
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">
                Power ({labels.power})
              </label>
              <input
                type="number"
                step="0.5"
                value={power}
                onChange={(e) => setPower(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">
                Pinion Speed (RPM)
              </label>
              <input
                type="number"
                step="50"
                value={rpm}
                onChange={(e) => setRpm(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">{labels.pitch}</label>
              <input
                type="number"
                step="0.25"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">
                Face Width ({labels.length})
              </label>
              <input
                type="number"
                step="1"
                value={faceWidth}
                onChange={(e) => setFaceWidth(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">Pinion Teeth (Np)</label>
              <input
                type="number"
                step="1"
                min="6"
                value={pinionTeeth}
                onChange={(e) =>
                  setPinionTeeth(parseInt(e.target.value, 10) || 6)
                }
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">Gear Teeth (Ng)</label>
              <input
                type="number"
                step="1"
                min="6"
                value={gearTeeth}
                onChange={(e) =>
                  setGearTeeth(parseInt(e.target.value, 10) || 6)
                }
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">
                Pressure Angle (°)
              </label>
              <select
                value={pressureAngle}
                onChange={(e) => setPressureAngle(parseFloat(e.target.value))}
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right text-xs"
              >
                <option value={14.5}>14.5°</option>
                <option value={20}>20°</option>
                <option value={25}>25°</option>
              </select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">Design Life (h)</label>
              <input
                type="number"
                step="5"
                value={designLife}
                onChange={(e) => setDesignLife(parseFloat(e.target.value) || 1)}
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
              />
            </div>
          </CardContent>
        </Card>

        {/* AGMA Factors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              2. AGMA Empirical Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">Overload (Ko)</label>
              <select
                value={overload}
                onChange={(e) => setOverload(e.target.value as OverloadKey)}
                className="w-36 px-2 py-1 rounded border border-border bg-background text-xs"
              >
                {Object.entries(OVERLOAD).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">
                Quality Number (Qv)
              </label>
              <input
                type="number"
                min="3"
                max="12"
                value={qv}
                onChange={(e) => setQv(parseInt(e.target.value, 10) || 9)}
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">Mounting (Km)</label>
              <select
                value={mounting}
                onChange={(e) => setMounting(e.target.value as MountingKey)}
                className="w-36 px-2 py-1 rounded border border-border bg-background text-xs"
              >
                {Object.entries(MOUNTING).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">Crowned Teeth</label>
              <input
                type="checkbox"
                checked={crowned}
                onChange={(e) => setCrowned(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">
                Rim Thickness ({labels.length})
              </label>
              <input
                type="number"
                step="0.5"
                value={rimThickness}
                onChange={(e) =>
                  setRimThickness(parseFloat(e.target.value) || 0)
                }
                placeholder="0 = solid"
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">Manual J Override</label>
              <input
                type="number"
                step="0.01"
                value={jOverride ?? ""}
                onChange={(e) =>
                  setJOverride(
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                placeholder="Auto chart"
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">
                Target Safety Factor
              </label>
              <input
                type="number"
                step="0.1"
                value={targetSF}
                onChange={(e) => setTargetSF(parseFloat(e.target.value) || 1.5)}
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
              />
            </div>
          </CardContent>
        </Card>

        {/* Material & Allowables */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              3. Materials & Allowables
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">Material Grade</label>
              <select
                value={material}
                onChange={(e) =>
                  handleMaterialChange(e.target.value as MaterialKey)
                }
                className="w-36 px-2 py-1 rounded border border-border bg-background text-xs"
              >
                {Object.entries(MATERIALS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">AGMA Grade</label>
              <select
                value={grade}
                onChange={(e) =>
                  setGrade(parseInt(e.target.value, 10) as 1 | 2)
                }
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right text-xs"
              >
                <option value={1}>Grade 1</option>
                <option value={2}>Grade 2 (High)</option>
              </select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">Hardness (HB)</label>
              <input
                type="number"
                value={hardness}
                onChange={(e) => setHardness(parseFloat(e.target.value) || 300)}
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">Reliability</label>
              <select
                value={reliability}
                onChange={(e) => setReliability(parseFloat(e.target.value))}
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right text-xs"
              >
                <option value={0.9}>90%</option>
                <option value={0.99}>99% (FSAE)</option>
                <option value={0.999}>99.9%</option>
              </select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-muted-foreground">Bulk Temp (°C)</label>
              <input
                type="number"
                value={tempC}
                onChange={(e) => setTempC(parseFloat(e.target.value) || 20)}
                className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
              />
            </div>

            {material === "custom" && (
              <div className="pt-2 border-t border-border/60 space-y-2.5">
                <div className="font-semibold text-primary text-[11px] uppercase tracking-wider">
                  Custom Material Parameters
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-muted-foreground">Name</label>
                  <input
                    type="text"
                    value={customMaterial.label}
                    onChange={(e) =>
                      setCustomMaterial((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    className="w-36 px-2 py-1 rounded border border-border bg-background text-right"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-muted-foreground">
                    Allowable Bending St ({labels.stress})
                  </label>
                  <input
                    type="number"
                    value={
                      isImperial
                        ? Math.round(customMaterial.St * 145.038)
                        : customMaterial.St
                    }
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setCustomMaterial((prev) => ({
                        ...prev,
                        St: isImperial ? v / 145.038 : v,
                      }));
                    }}
                    className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-muted-foreground">
                    Allowable Contact Sc ({labels.stress})
                  </label>
                  <input
                    type="number"
                    value={
                      isImperial
                        ? Math.round(customMaterial.Sc * 145.038)
                        : customMaterial.Sc
                    }
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setCustomMaterial((prev) => ({
                        ...prev,
                        Sc: isImperial ? v / 145.038 : v,
                      }));
                    }}
                    className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-muted-foreground">
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
                    className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-muted-foreground">Poisson's ν</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customMaterial.v}
                    onChange={(e) =>
                      setCustomMaterial((prev) => ({
                        ...prev,
                        v: parseFloat(e.target.value) || 0.3,
                      }))
                    }
                    className="w-24 px-2 py-1 rounded border border-border bg-background text-right"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Output Results Grid */}
      {result && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Calculated Loads & Stresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-2.5 bg-muted/40 rounded-md">
                <span className="text-muted-foreground block">
                  Pitch Line Vt
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {fmt(Units.velocityToDisplay(result.loads.Vt, isImperial), 1)}{" "}
                  {labels.velocity}
                </span>
              </div>
              <div className="p-2.5 bg-muted/40 rounded-md">
                <span className="text-muted-foreground block">
                  Transmitted Wt
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {fmt(Units.forceToDisplay(result.loads.Wt, isImperial), 1)}{" "}
                  {labels.force}
                </span>
              </div>
              <div className="p-2.5 bg-muted/40 rounded-md">
                <span className="text-muted-foreground block">
                  Radial Load Wr
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {fmt(Units.forceToDisplay(result.loads.Wr, isImperial), 1)}{" "}
                  {labels.force}
                </span>
              </div>
              <div className="p-2.5 bg-muted/40 rounded-md">
                <span className="text-muted-foreground block">
                  Normal Load Wn
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {fmt(Units.forceToDisplay(result.loads.Wn, isImperial), 1)}{" "}
                  {labels.force}
                </span>
              </div>
              <div className="p-2.5 bg-muted/40 rounded-md">
                <span className="text-muted-foreground block">
                  Pinion Torque
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {fmt(
                    Units.torqueToDisplay(result.loads.torque_Nm, isImperial),
                    1,
                  )}{" "}
                  {labels.torque}
                </span>
              </div>
              <div className="p-2.5 bg-muted/40 rounded-md">
                <span className="text-muted-foreground block">
                  Contact Stress σc
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {fmt(
                    Units.stressToDisplay(result.stress.contact, isImperial),
                    1,
                  )}{" "}
                  {labels.stress}
                </span>
              </div>
              <div className="p-2.5 bg-muted/40 rounded-md">
                <span className="text-muted-foreground block">
                  Bending σ (Pinion)
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {fmt(
                    Units.stressToDisplay(result.stress.bending_p, isImperial),
                    1,
                  )}{" "}
                  {labels.stress}
                </span>
              </div>
              <div className="p-2.5 bg-muted/40 rounded-md">
                <span className="text-muted-foreground block">
                  Bending σ (Gear)
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {fmt(
                    Units.stressToDisplay(result.stress.bending_g, isImperial),
                    1,
                  )}{" "}
                  {labels.stress}
                </span>
              </div>
              <div className="p-2.5 bg-muted/40 rounded-md">
                <span className="text-muted-foreground block">
                  Allowable Bending
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {fmt(
                    Units.stressToDisplay(
                      result.allowables.allowB_p,
                      isImperial,
                    ),
                    1,
                  )}{" "}
                  {labels.stress}
                </span>
              </div>
              <div className="p-2.5 bg-muted/40 rounded-md">
                <span className="text-muted-foreground block">
                  Allowable Contact
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {fmt(
                    Units.stressToDisplay(
                      result.allowables.allowC_p,
                      isImperial,
                    ),
                    1,
                  )}{" "}
                  {labels.stress}
                </span>
              </div>
              <div className="p-2.5 bg-muted/40 rounded-md">
                <span className="text-muted-foreground block">
                  Pinion Pitch d
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {fmt(
                    Units.lengthToDisplay(result.geometry.d_p, isImperial),
                    1,
                  )}{" "}
                  {labels.length}
                </span>
              </div>
              <div className="p-2.5 bg-muted/40 rounded-md">
                <span className="text-muted-foreground block">
                  Gear Pitch d
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {fmt(
                    Units.lengthToDisplay(result.geometry.d_g, isImperial),
                    1,
                  )}{" "}
                  {labels.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mathematical Theory & Governing Equations */}
      <GearMathDoc />
    </div>
  );
}
