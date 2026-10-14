/**
 * OptimizationTab.tsx
 *
 * Tab 5: Multi-stage gearbox ratio optimization grid search with AGMA safety pruning.
 */

import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeMesh } from "../gear";
import { type GearModuleEvaluator, optimize } from "../optimize";
import type {
  GearMeshInput,
  GearMeshResult,
  OptimizationResult,
} from "../types";
import { OptimizationMathDoc } from "./MathDocs";

interface OptimizationTabProps {
  meshResult: GearMeshResult | null;
  baseInput: GearMeshInput | null;
  onApplyStage: (pinionTeeth: number, gearTeeth: number) => void;
}

export function OptimizationTab({
  meshResult,
  baseInput,
  onApplyStage,
}: OptimizationTabProps) {
  const [targetRatio, setTargetRatio] = useState(4.0);
  const [stages, setStages] = useState(1);
  const [minTooth, setMinTooth] = useState(12);
  const [maxTooth, setMaxTooth] = useState(100);

  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleRunOptimization = () => {
    if (!baseInput) return;

    setIsSearching(true);
    setHasSearched(true);

    const evaluator: GearModuleEvaluator = {
      getBaseRPM: () => baseInput.pinionRPM,
      evaluate: (gear, pin, rpm) => {
        const input: GearMeshInput = {
          ...baseInput,
          pinionTeeth: pin,
          gearTeeth: gear,
          pinionRPM: rpm,
        };
        try {
          const res = analyzeMesh(input);
          return {
            bending: Math.min(res.safety.SF_p, res.safety.SF_g),
            pitting: Math.min(res.safety.SH_p_load, res.safety.SH_g_load),
          };
        } catch {
          return { bending: 0, pitting: 0 };
        }
      },
    };

    try {
      const found = optimize(
        targetRatio,
        stages,
        minTooth,
        maxTooth,
        evaluator,
      );
      setResults(found);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Gearbox Optimization Parameters
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Performs a DFS search across even tooth counts to achieve the target
            ratio within 5% tolerance while ensuring both bending and pitting
            safety factors remain &gt; 1.0.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-muted-foreground block mb-1">
                <span className="block mb-1">Target Total Ratio</span>
                <input
                  type="number"
                  step="0.1"
                  value={targetRatio}
                  onChange={(e) =>
                    setTargetRatio(parseFloat(e.target.value) || 1)
                  }
                  className="w-full px-2 py-1.5 rounded border border-border bg-background text-foreground"
                />
              </label>
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">
                <span className="block mb-1">Number of Stages</span>
                <select
                  value={stages}
                  onChange={(e) => setStages(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs text-foreground"
                >
                  <option value={1}>1 Stage</option>
                  <option value={2}>2 Stages</option>
                  <option value={3}>3 Stages</option>
                  <option value={4}>4 Stages</option>
                </select>
              </label>
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">
                <span className="block mb-1">Min Tooth Count</span>
                <input
                  type="number"
                  step="2"
                  value={minTooth}
                  onChange={(e) =>
                    setMinTooth(parseInt(e.target.value, 10) || 10)
                  }
                  className="w-full px-2 py-1.5 rounded border border-border bg-background text-foreground"
                />
              </label>
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">
                <span className="block mb-1">Max Tooth Count</span>
                <input
                  type="number"
                  step="2"
                  value={maxTooth}
                  onChange={(e) =>
                    setMaxTooth(parseInt(e.target.value, 10) || 100)
                  }
                  className="w-full px-2 py-1.5 rounded border border-border bg-background text-foreground"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {!baseInput && (
              <span className="text-xs text-amber-500 font-medium">
                Note: Configure the Gear Mesh tab first to set operating torque
                and material properties.
              </span>
            )}
            <div className="ml-auto">
              <Button
                onClick={handleRunOptimization}
                disabled={!baseInput || isSearching}
                className="gap-2 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isSearching ? "Optimizing..." : "Run Optimization"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      {hasSearched && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Top Ranked Configurations (Ranked by Governing Safety Factor)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No valid configurations found within 5% ratio tolerance
                satisfying AGMA safety factors &gt; 1.0. Try adjusting tooth
                count bounds or reducing stage count.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="p-2.5">Stages (Np, Ng)</th>
                      <th className="p-2.5">Total Ratio</th>
                      <th className="p-2.5">SF Bending</th>
                      <th className="p-2.5">SF Pitting</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {results.map((r, idx) => (
                      <tr
                        key={`${r.stages.join("-")}-${r.ratio}-${idx}`}
                        className="hover:bg-muted/30"
                      >
                        <td className="p-2.5 font-mono font-medium text-foreground">
                          {r.stages.join(" → ")}
                        </td>
                        <td className="p-2.5 font-bold text-primary">
                          {r.ratio}
                        </td>
                        <td className="p-2.5 text-emerald-600 font-semibold">
                          {r.bending}
                        </td>
                        <td className="p-2.5 text-cyan-600 font-semibold">
                          {r.pitting}
                        </td>
                        <td className="p-2.5 text-right">
                          {r.stages.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Parse first stage (p, g)
                                const match =
                                  r.stages[0].match(/\((\d+),\s*(\d+)\)/);
                                if (match) {
                                  onApplyStage(
                                    parseInt(match[1], 10),
                                    parseInt(match[2], 10),
                                  );
                                }
                              }}
                              className="text-xs h-7 gap-1"
                            >
                              Apply Stage 1 <ArrowRight className="w-3 h-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mathematical Theory & Governing Equations */}
      <OptimizationMathDoc />
    </div>
  );
}
