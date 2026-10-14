/**
 * CrankTab.tsx
 *
 * Tab 4: Crank-Rocker Kinematics & Dynamic Analysis.
 */

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrankMath } from "../crank";
import { fmt, Units } from "../unit";
import { drawLinkage, drawOscillationGraph } from "../viz/crank-viz";
import { safetyVerdict } from "../viz/draw";

interface CrankTabProps {
  isImperial: boolean;
}

export function CrankTab({ isImperial }: CrankTabProps) {
  const [r1, setR1] = useState(6.35); // Ground
  const [r2, setR2] = useState(2.0); // Crank
  const [r3, setR3] = useState(6.73); // Coupler
  const [r4, setR4] = useState(4.5); // Rocker

  const [loadForce, setLoadForce] = useState(1500);
  const [pinDia, setPinDia] = useState(12);
  const [armThk, setArmThk] = useState(8);
  const [yieldStress, setYieldStress] = useState(400);
  const [rpm, setRpm] = useState(1800);

  const [isPlaying, setIsPlaying] = useState(true);
  const [crankAngle, setCrankAngle] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const graphCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Convert inputs to metric internally
  const r1Metric = Units.lengthToMetric(r1, isImperial);
  const r2Metric = Units.lengthToMetric(r2, isImperial);
  const r3Metric = Units.lengthToMetric(r3, isImperial);
  const r4Metric = Units.lengthToMetric(r4, isImperial);
  const loadN = Units.forceToMetric(loadForce, isImperial);
  const pinDiaMM = Units.lengthToMetric(pinDia, isImperial);
  const armThkMM = Units.lengthToMetric(armThk, isImperial);
  const yieldMPa = Units.stressToMetric(yieldStress, isImperial);

  // Grashof check
  const { isGrashof, isCrankRocker } = CrankMath.checkGrashof(
    r1Metric,
    r2Metric,
    r3Metric,
    r4Metric,
  );

  // Extreme transmission angles
  const worstTA = CrankMath.getWorstTransmissionAngle(
    r1Metric,
    r2Metric,
    r3Metric,
    r4Metric,
  );

  // Pin stresses & safety factors
  const stresses = CrankMath.getPinStresses(loadN, pinDiaMM, armThkMM);
  const shearYield = yieldMPa * 0.5;
  const sfShear =
    stresses.shearStress > 0
      ? shearYield / stresses.shearStress
      : Number.POSITIVE_INFINITY;
  const sfBearing =
    stresses.bearingStress > 0
      ? yieldMPa / stresses.bearingStress
      : Number.POSITIVE_INFINITY;

  // Dynamics analysis
  const dyn =
    isGrashof && isCrankRocker
      ? CrankMath.analyzeDynamics(
          r1Metric,
          r2Metric,
          r3Metric,
          r4Metric,
          rpm,
          pinDiaMM,
          armThkMM,
        )
      : null;

  // Animation render loop
  useEffect(() => {
    let angle = crankAngle;

    const render = () => {
      if (isPlaying && isGrashof && isCrankRocker) {
        angle += 0.04;
        if (angle > Math.PI * 2) angle -= Math.PI * 2;
        setCrankAngle(angle);
      }

      if (canvasRef.current) {
        drawLinkage(
          canvasRef.current,
          r1Metric,
          r2Metric,
          r3Metric,
          r4Metric,
          angle,
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    isPlaying,
    isGrashof,
    isCrankRocker,
    r1Metric,
    r2Metric,
    r3Metric,
    r4Metric,
  ]);

  // Oscillation curve
  useEffect(() => {
    if (graphCanvasRef.current && dyn) {
      drawOscillationGraph(graphCanvasRef.current, dyn.history);
    }
  }, [dyn]);

  // Live transmission angle at current crank position
  const liveGamma = CrankMath.getTransmissionAngle(
    r1Metric,
    r2Metric,
    r3Metric,
    r4Metric,
    crankAngle,
  );

  const labels = Units.labels(isImperial);

  return (
    <div className="space-y-6">
      {/* Visualizer Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Animated 4-Bar Mechanism */}
        <Card className="overflow-hidden border border-border shadow-sm">
          <CardHeader className="bg-muted/40 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                4-Bar Kinematic Linkage
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Crank (red), Coupler (blue), Rocker (green), Ground (slate).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="gap-1.5 text-xs h-8"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Play
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-white dark:bg-slate-950 flex flex-col items-center">
            <canvas
              ref={canvasRef}
              className="w-full h-72 sm:h-80 block"
              style={{ touchAction: "none" }}
            />
            <div className="w-full px-4 py-2 border-t border-border bg-muted/20 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Live Transmission Angle γ:
              </span>
              <span className="font-mono font-bold text-foreground">
                {liveGamma !== null
                  ? `${((liveGamma * 180) / Math.PI).toFixed(1)}°`
                  : "--"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Oscillation Profile Graph */}
        <Card className="overflow-hidden border border-border shadow-sm">
          <CardHeader className="bg-muted/40 pb-3">
            <CardTitle className="text-base font-semibold">
              Rocker Angular Oscillation & Shaking Force
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rocker displacement profile across 360° crank rotation showing
              peak torque toggle position.
            </p>
          </CardHeader>
          <CardContent className="p-0 bg-white dark:bg-slate-950 flex flex-col items-center">
            <canvas
              ref={graphCanvasRef}
              className="w-full h-72 sm:h-80 block"
              style={{ touchAction: "none" }}
            />
            <div className="w-full px-4 py-2 border-t border-border bg-muted/20 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Sweep Angle:</span>
              <span className="font-mono font-bold text-foreground">
                {dyn ? `${dyn.sweepAngle.toFixed(1)}°` : "--"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status & Verdicts Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 bg-card/60">
          <span className="text-xs text-muted-foreground block">
            Grashof Status
          </span>
          <div className="mt-1">
            {!isGrashof ? (
              <Badge variant="destructive">Fails (Binds)</Badge>
            ) : !isCrankRocker ? (
              <Badge variant="secondary">Grashof (Non-Crank)</Badge>
            ) : (
              <Badge className="bg-emerald-600 text-white">
                Valid Crank-Rocker
              </Badge>
            )}
          </div>
        </Card>
        <Card className="p-3.5 bg-card/60">
          <span className="text-xs text-muted-foreground block">
            Min Transmission γ
          </span>
          <span className="text-lg font-bold block mt-1">
            {worstTA
              ? `${((worstTA.minGamma * 180) / Math.PI).toFixed(1)}°`
              : "--"}
          </span>
        </Card>
        <Card className="p-3.5 bg-card/60">
          <span className="text-xs text-muted-foreground block">
            Pin Shear SF
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold">{fmt(sfShear, 2)}</span>
            <span
              className={`text-xs ${safetyVerdict(sfShear, 1.5).className}`}
            >
              {safetyVerdict(sfShear, 1.5).label}
            </span>
          </div>
        </Card>
        <Card className="p-3.5 bg-card/60">
          <span className="text-xs text-muted-foreground block">
            Arm Bearing SF
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold">{fmt(sfBearing, 2)}</span>
            <span
              className={`text-xs ${safetyVerdict(sfBearing, 1.5).className}`}
            >
              {safetyVerdict(sfBearing, 1.5).label}
            </span>
          </div>
        </Card>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Linkage Geometry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Ground Link r1 ({labels.length})</span>
              <input
                type="number"
                step="0.1"
                value={r1}
                onChange={(e) => setR1(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-foreground"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Crank Link r2 ({labels.length})</span>
              <input
                type="number"
                step="0.1"
                value={r2}
                onChange={(e) => setR2(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-foreground"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Coupler Link r3 ({labels.length})</span>
              <input
                type="number"
                step="0.1"
                value={r3}
                onChange={(e) => setR3(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-foreground"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Rocker Link r4 ({labels.length})</span>
              <input
                type="number"
                step="0.1"
                value={r4}
                onChange={(e) => setR4(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-foreground"
              />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Joint & Pin Structural Sizing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Applied Joint Force ({labels.force})</span>
              <input
                type="number"
                step="50"
                value={loadForce}
                onChange={(e) => setLoadForce(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-foreground"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Pin Diameter ({labels.length})</span>
              <input
                type="number"
                step="1"
                value={pinDia}
                onChange={(e) => setPinDia(parseFloat(e.target.value) || 1)}
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-foreground"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Arm Thickness ({labels.length})</span>
              <input
                type="number"
                step="1"
                value={armThk}
                onChange={(e) => setArmThk(parseFloat(e.target.value) || 1)}
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-foreground"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-muted-foreground">
              <span>Material Yield Sy ({labels.stress})</span>
              <input
                type="number"
                step="10"
                value={yieldStress}
                onChange={(e) =>
                  setYieldStress(parseFloat(e.target.value) || 100)
                }
                className="w-28 px-2 py-1 rounded border border-border bg-background text-right text-foreground"
              />
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
