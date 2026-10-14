/**
 * FrMathApp.tsx
 *
 * Falcon Racing Drivetrain Tool subsite application component.
 * Fully typed in TypeScript and style matched to the portfolio design system.
 */

import { Link } from "@tanstack/react-router";
import { ArrowLeft, Cog, Compass, Cpu, Disc, Sliders } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GearMeshInput, GearMeshResult, ShaftResult } from "../types";
import { BearingTab } from "./BearingTab";
import { CrankTab } from "./CrankTab";
import { GearTab } from "./GearTab";
import { OptimizationTab } from "./OptimizationTab";
import { ShaftTab } from "./ShaftTab";

export type FrTab = "gear" | "shaft" | "bearing" | "crank" | "optimization";

export function FrMathApp() {
  const [activeTab, setActiveTab] = useState<FrTab>("gear");
  const [isImperial, setIsImperial] = useState(false);

  // Shared reactive state
  const [meshResult, setMeshResult] = useState<GearMeshResult | null>(null);
  const [baseInput, setBaseInput] = useState<GearMeshInput | null>(null);
  const [shaftResult, setShaftResult] = useState<ShaftResult | null>(null);
  const [externalGearInput, setExternalGearInput] =
    useState<Partial<GearMeshInput> | null>(null);

  const handleMeshUpdated = (result: GearMeshResult, input: GearMeshInput) => {
    setMeshResult(result);
    setBaseInput(input);
  };

  const handleApplyOptimizerStage = (
    pinionTeeth: number,
    gearTeeth: number,
  ) => {
    setExternalGearInput({ pinionTeeth, gearTeeth });
    setActiveTab("gear");
  };

  const navTabs: {
    id: FrTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "gear", label: "1 · Gear Mesh", icon: Cog },
    { id: "shaft", label: "2 · Shaft Loading", icon: Sliders },
    { id: "bearing", label: "3 · Bearing Life", icon: Disc },
    { id: "crank", label: "4 · Crank Rocker", icon: Compass },
    { id: "optimization", label: "5 · Gearbox Optimization", icon: Cpu },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Subsite Navigation Breadcrumb / Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <Link to="/interactive">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Subsites
              </Link>
            </Button>
            <Badge
              variant="outline"
              className="text-primary border-primary/20 text-[11px]"
            >
              Subsite Application
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Falcon Racing Drivetrain Tool
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            AGMA gear rating · Two-support beam deflection · ISO 281 bearing
            life · 4-bar crank rocker kinematics
          </p>
        </div>

        {/* Metric / Imperial Universal Switch */}
        <div className="flex items-center gap-3 bg-card/60 backdrop-blur-sm border border-border px-3.5 py-2 rounded-xl self-start sm:self-auto shadow-xs">
          <span
            className={`text-xs font-semibold transition-colors ${
              !isImperial ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            Metric
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isImperial}
            onClick={() => setIsImperial(!isImperial)}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
              isImperial ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                isImperial ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-xs font-semibold transition-colors ${
              isImperial ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            Imperial
          </span>
        </div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-muted/40 rounded-xl border border-border">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div className="transition-opacity duration-200">
        {activeTab === "gear" && (
          <GearTab
            isImperial={isImperial}
            onMeshUpdated={handleMeshUpdated}
            externalInput={externalGearInput}
          />
        )}
        {activeTab === "shaft" && (
          <ShaftTab
            isImperial={isImperial}
            meshResult={meshResult}
            onShaftUpdated={setShaftResult}
          />
        )}
        {activeTab === "bearing" && (
          <BearingTab isImperial={isImperial} shaftResult={shaftResult} />
        )}
        {activeTab === "crank" && <CrankTab isImperial={isImperial} />}
        {activeTab === "optimization" && (
          <OptimizationTab
            meshResult={meshResult}
            baseInput={baseInput}
            onApplyStage={handleApplyOptimizerStage}
          />
        )}
      </div>
    </div>
  );
}
