/**
 * MathDocs.tsx
 *
 * Dedicated mathematical reference and engineering documentation panels
 * for each sub-page of the Falcon Racing Drivetrain Tool (fr-math).
 */

import { useState } from "react";
import {
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronUp,
  Compass,
  Layers,
  Scale,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MathDocSectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function MathDocContainer({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = true,
}: MathDocSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="border border-border/80 shadow-sm mt-8 bg-card/60 backdrop-blur-sm">
      <CardHeader className="py-3.5 px-4 bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              {title}
              <Badge variant="outline" className="text-[10px] font-normal tracking-wide">
                Theory & Formulas
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </CardHeader>
      {isOpen && (
        <CardContent className="p-4 sm:p-6 space-y-6 text-xs text-muted-foreground leading-relaxed">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

function FormulaCard({
  name,
  formula,
  variables,
  description,
}: {
  name: string;
  formula: string;
  variables: { symbol: string; meaning: string }[];
  description?: string;
}) {
  return (
    <div className="p-3.5 rounded-lg border border-border/70 bg-background/80 space-y-2">
      <div className="font-semibold text-foreground text-xs">{name}</div>
      <div className="py-2 px-3 rounded bg-muted/40 font-mono text-xs font-bold text-primary overflow-x-auto whitespace-pre">
        {formula}
      </div>
      {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      {variables.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1 border-t border-border/40 text-[11px]">
          {variables.map((v) => (
            <div key={v.symbol} className="flex items-baseline gap-1.5">
              <span className="font-mono font-bold text-foreground min-w-8">{v.symbol}:</span>
              <span>{v.meaning}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// 1. Gear Mesh Documentation
// -----------------------------------------------------------------------------

export function GearMathDoc() {
  return (
    <MathDocContainer
      title="AGMA 2001-D04 Spur Gear Rating Formulation"
      subtitle="Fundamental kinematics, Hertzian contact stresses, Lewis bending, and empirical derating factors."
      icon={<Calculator className="w-4 h-4" />}
    >
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">1. Kinematics & Operating Loads</h4>
          <p className="mb-3">
            In standard metric involute gearing, the pitch line velocity and transmitted loads are governed by power equilibrium between torque and pitch line speed:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormulaCard
              name="Pitch Line Velocity (vt)"
              formula="vt = (π · d · n) / 60,000  [m/s]"
              variables={[
                { symbol: "d", meaning: "Pitch diameter (mm), d = module · teeth" },
                { symbol: "n", meaning: "Rotational speed (RPM)" },
              ]}
              description="Evaluates whether the gear operates within the allowable quality threshold (Qv)."
            />
            <FormulaCard
              name="Transmitted Tangential Load (Wt)"
              formula="Wt = (60 × 10^6 · P) / (π · d · n)  [N]"
              variables={[
                { symbol: "P", meaning: "Transmitted input mechanical power (kW)" },
                { symbol: "Wt", meaning: "Tangential tooth load driving rotation (N)" },
              ]}
              description="Also drives radial separating load Wr = Wt · tan(φ) and normal load Wn = Wt / cos(φ)."
            />
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">2. Tooth Root Bending Stress (AGMA 2001-D04)</h4>
          <p className="mb-3">
            Bending stress at the root fillet is evaluated using the modified Lewis cantilever beam formulation, adjusted for stress concentrations and load distribution:
          </p>
          <FormulaCard
            name="Tooth Root Bending Stress (σb)"
            formula="σb = Wt · Ko · Kv · Ks · [1 / (F · m)] · [(Km · KB) / J]  [MPa]"
            variables={[
              { symbol: "Ko", meaning: "Overload factor (1.0 uniform to 1.75 heavy racing shock)" },
              { symbol: "Kv", meaning: "Dynamic factor = [(A + √(200 vt)) / A]^B for quality Qv" },
              { symbol: "Ks", meaning: "Size factor = 1.18(F·m / 25.4)^0.0535 (1.0 for m < 5 mm)" },
              { symbol: "F, m", meaning: "Face width (mm) and gear module (mm)" },
              { symbol: "Km", meaning: "Load distribution factor accounting for crowning & mounting deflection" },
              { symbol: "KB", meaning: "Rim thickness factor = 1.6 · ln(2.242 / mB) when rim < 1.2 · depth" },
              { symbol: "J", meaning: "AGMA bending geometry factor accounting for fillet radius and load sharing" },
            ]}
          />
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">3. Pitting Resistance / Hertzian Contact Stress</h4>
          <p className="mb-3">
            Surface contact fatigue (pitting) is caused by repetitive Hertzian normal contact stresses along the line of action:
          </p>
          <FormulaCard
            name="Surface Contact Stress (σc)"
            formula="σc = ZE · √[ Wt · Ko · Kv · Ks · (Km / (d_p · F)) · (Cf / I) ]  [MPa]"
            variables={[
              { symbol: "ZE", meaning: "Elastic coefficient = √[ 1 / (π · ((1-v1²)/E1 + (1-v2²)/E2)) ]" },
              { symbol: "d_p", meaning: "Pinion pitch diameter (mm)" },
              { symbol: "Cf", meaning: "Surface condition factor (1.0 for standard ground/shaved gears)" },
              { symbol: "I", meaning: "Surface geometry factor = [cos(φ) · sin(φ) / 2] · [mG / (mG + 1)]" },
            ]}
            description="Notice that contact stress scales with the square root of load (√Wt). Therefore, load-equivalent contact safety factor equals SH²."
          />
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">4. Allowable Stresses & Governing Safety Factors</h4>
          <p className="mb-3">
            Allowables are corrected for design life cycles, operating temperature, and required reliability:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormulaCard
              name="Bending Safety Factor (SF)"
              formula="SF = σb,all / σb = [ (St · YN) / (KT · KR) ] / σb"
              variables={[
                { symbol: "St", meaning: "Allowable bending stress number (MPa)" },
                { symbol: "YN", meaning: "Stress cycle factor for bending fatigue" },
                { symbol: "KT, KR", meaning: "Temperature factor (1.0 below 120°C) and reliability factor" },
              ]}
            />
            <FormulaCard
              name="Contact Safety Factor (SH)"
              formula="SH = σc,all / σc = [ (Sc · ZN · CH) / (KT · KR) ] / σc"
              variables={[
                { symbol: "Sc", meaning: "Allowable contact stress number (MPa)" },
                { symbol: "ZN", meaning: "Pitting resistance stress cycle life factor" },
                { symbol: "CH", meaning: "Hardness ratio factor (1.0 standard)" },
              ]}
            />
          </div>
          <div className="p-3 rounded bg-muted/20 border border-border/50 text-[11px] mt-2">
            <span className="font-semibold text-foreground">Governing Failure Mode:</span> Because contact stress scales with √(load), the load-equivalent contact margin is SH². If SF ≤ SH², the design is governed by tooth root bending fatigue; otherwise, it is governed by pitting.
          </div>
        </div>
      </div>
    </MathDocContainer>
  );
}

// -----------------------------------------------------------------------------
// 2. Shaft Stress & Deflection Documentation
// -----------------------------------------------------------------------------

export function ShaftMathDoc() {
  return (
    <MathDocContainer
      title="Shaft Bending, Torsion & DE-Goodman Fatigue Theory"
      subtitle="Biaxial beam singularity statics, von Mises combined stresses, and Marin endurance limits."
      icon={<Layers className="w-4 h-4" />}
    >
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">1. Biaxial Statics & Moment Distribution</h4>
          <p className="mb-3">
            Transverse loads applied across vertical ($F_v$) and horizontal ($F_h$) planes are solved independently using beam statics:
          </p>
          <FormulaCard
            name="Two-Support Reactions & Singularity Integration"
            formula="RB = [ ∑ Pi · (xi - xA) ] / (xB - xA),   RA = ∑ Pi - RB\nV(x) = - ∑_{xi ≤ x} Pi,   M(x) = - ∑_{xi ≤ x} Pi · (x - xi)\nM_total(x) = √( M_v(x)² + M_h(x)² ),   V_total(x) = √( V_v(x)² + V_h(x)² )"
            variables={[
              { symbol: "xA, xB", meaning: "Axial locations of Bearing Support A and B (mm)" },
              { symbol: "Pi, xi", meaning: "Applied transverse point load (N) and location (mm)" },
              { symbol: "M, V", meaning: "Resultant internal bending moment (N·mm) and shear force (N)" },
            ]}
          />
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">2. Cross-Sectional & Combined von Mises Stress</h4>
          <p className="mb-3">
            At any station with outer diameter $d(x)$, bending produces normal tension/compression on the outer fibers, while torque produces torsional shear:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormulaCard
              name="Bending & Torsional Section Moduli"
              formula="Z = (π · d³) / 32,   Zp = 2 · Z = (π · d³) / 16\nσ_bend = M(x) / Z,   τ_torsion = |T(x)| / Zp"
              variables={[
                { symbol: "Z, Zp", meaning: "Elastic bending and polar section moduli (mm³)" },
                { symbol: "T(x)", meaning: "Internal transmitted torque at station x (N·mm)" },
              ]}
            />
            <FormulaCard
              name="von Mises Equivalent Stress (σ')"
              formula="σ' = √( σ_bend² + 3 · τ_torsion² )  [MPa]"
              variables={[
                { symbol: "σ'", meaning: "Effective octahedral shear stress for ductile materials" },
                { symbol: "Sy", meaning: "Material tensile yield strength (MPa)" },
              ]}
              description="Under pure torsion, von Mises stress simplifies exactly to √3 · τ ≈ 1.732 · τ."
            />
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">3. Marin Modified Endurance Limit (Se)</h4>
          <p className="mb-3">
            The rotating beam fatigue limit ($S_e' = \text{ratio} \cdot S_{ut}$) is derated for surface condition, size, and reliability:
          </p>
          <FormulaCard
            name="Marin Factors for Endurance Limit"
            formula="Se = ka · kb · kc · kd · ke · Se'\nka = a · Sut^b  (Surface finish: Ground, Machined, Hot-rolled)\nkb = 1.24 · d^(-0.107)  (Size factor for 2.79 mm ≤ d ≤ 51 mm)\nke = 0.814  (Reliability factor for 99.0% survival)"
            variables={[
              { symbol: "Sut", meaning: "Ultimate tensile strength (MPa)" },
              { symbol: "Se'", meaning: "Uncorrected endurance limit (0.50 Sut steel, 0.35 Al, 0.45 Ti)" },
              { symbol: "ka...ke", meaning: "Marin correction factors for surface, size, load, temp, reliability" },
            ]}
          />
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">4. Distortion Energy - Goodman Fatigue Criterion</h4>
          <p className="mb-3">
            In transmission shafts, rotating bending is fully alternating ($\sigma_a = K_f M / Z, \sigma_m = 0$) while drivetrain torque is predominantly steady ($\tau_m = K_{fs} T / Z_p, \tau_a = 0$):
          </p>
          <FormulaCard
            name="DE-Goodman Fatigue Safety Factor (nf)"
            formula="1 / nf = (16 / (π · d³)) · [ (2 · Kf · M) / Se + (√3 · Kfs · |T|) / Sut ]"
            variables={[
              { symbol: "Kf", meaning: "Fatigue notch factor for bending (e.g. 1.6 for shoulder fillet)" },
              { symbol: "Kfs", meaning: "Fatigue notch factor for torsional shear (e.g. 1.4)" },
              { symbol: "nf", meaning: "Infinite life fatigue factor of safety against Goodman boundary" },
            ]}
          />
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">5. Double Integration for Deflection & Bearing Slopes</h4>
          <p className="mb-3">
            Deflection $y(x)$ and slope $\theta(x)$ are computed across each plane via Euler-Bernoulli integration:
          </p>
          <div className="p-3 rounded bg-muted/20 border border-border/50 text-[11px] font-mono whitespace-pre overflow-x-auto">
            d²y/dx² = κ(x) = M(x) / (E · I(x))
            θ_raw(x) = ∫ κ(x) dx,   y_raw(x) = ∫ θ_raw(x) dx
            y(x) = y_raw(x) + C1 · x + C2,   where y(xA) = 0 and y(xB) = 0
            y_total(x) = √( y_v(x)² + y_h(x)² ),   θ_total(x) = √( θ_v(x)² + θ_h(x)² )
          </div>
          <p className="text-[11px] mt-2">
            <strong>Engineering Limits:</strong> Deep-groove ball bearings tolerate slopes up to ~1.7 mrad (6 arcmin), while cylindrical rollers want under 1.0 mrad. Gear meshes require slope under 0.5 mrad to avoid edge loading.
          </p>
        </div>
      </div>
    </MathDocContainer>
  );
}

// -----------------------------------------------------------------------------
// 3. Bearing Life Documentation
// -----------------------------------------------------------------------------

export function BearingMathDoc() {
  return (
    <MathDocContainer
      title="ISO 281 & ISO 76 Rolling Bearing Life Formulation"
      subtitle="Basic rated life L10, reliability adjustment a1, dynamic equivalent load P, and static safety s0."
      icon={<ShieldCheck className="w-4 h-4" />}
    >
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">1. ISO 281 Basic Rated Life (L10 & L10h)</h4>
          <p className="mb-3">
            The basic rating life $L_{10}$ represents the number of revolutions that 90% of a group of apparently identical bearings will endure before initial signs of fatigue spalling:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormulaCard
              name="Basic Rated Life in Millions of Revs (L10)"
              formula="L10 = (C / P)^p  [10^6 revolutions]\np = 3.0  (Ball bearings)\np = 10/3 ≈ 3.333  (Roller bearings)"
              variables={[
                { symbol: "C", meaning: "Dynamic basic load rating from manufacturer catalog (N)" },
                { symbol: "P", meaning: "Dynamic equivalent radial load (N)" },
                { symbol: "p", meaning: "Life equation exponent governed by contact geometry" },
              ]}
            />
            <FormulaCard
              name="Life in Operating Hours (L10h)"
              formula="L10h = (10^6 / (60 · n)) · L10 = (10^6 / (60 · n)) · (C / P)^p  [hours]"
              variables={[
                { symbol: "n", meaning: "Shaft rotational speed (RPM)" },
                { symbol: "L10h", meaning: "90% survival operating duration under constant speed" },
              ]}
              description="Doubling the rotational speed cuts hours in half; halving the load increases ball bearing life by 8x (2³)."
            />
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">2. Equivalent Dynamic Radial Load (P)</h4>
          <p className="mb-3">
            When a bearing is subjected to combined radial load $F_r$ and axial thrust $F_a$, the load is converted into an equivalent radial load $P$:
          </p>
          <FormulaCard
            name="Combined Load Factor Transformation"
            formula="If Fa / Fr ≤ e :   P = Fr\nIf Fa / Fr > e :   P = 0.56 · Fr + Y · Fa\nwhere e, Y = f( Fa / C0 ) via ISO 281 interpolation"
            variables={[
              { symbol: "Fr", meaning: "Applied radial force (N)" },
              { symbol: "Fa", meaning: "Applied axial thrust force (N)" },
              { symbol: "C0", meaning: "Basic static load rating (N)" },
              { symbol: "e, Y", meaning: "Limiting thrust threshold and axial load multiplier" },
            ]}
          />
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">3. ISO 76 Static Safety Factor (s0)</h4>
          <p className="mb-3">
            To prevent permanent plastic brinelling indentation of the raceway at standstill or peak shock loads:
          </p>
          <FormulaCard
            name="Static Equivalent Load (P0) & Static Safety (s0)"
            formula="P0 = max( 0.6 · Fr + 0.5 · Fa,  Fr )  [Ball]\nP0 = max( 0.5 · Fr + 0.22 · Fa,  Fr )  [Roller]\ns0 = C0 / P0"
            variables={[
              { symbol: "P0", meaning: "Static equivalent load representing maximum Hertzian contact" },
              { symbol: "s0", meaning: "Static safety factor (s0 ≥ 1.5 recommended for racing shock)" },
            ]}
          />
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">4. Reliability Factor (a1) & Speed Limit (n · dm)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormulaCard
              name="Modified Rating Life (Lnmh)"
              formula="Lnmh = a1 · L10h  [hours]\na1 = 1.00 (90%),  0.64 (95%),  0.25 (99%)"
              variables={[
                { symbol: "a1", meaning: "ISO 281 life adjustment factor for higher reliability" },
              ]}
            />
            <FormulaCard
              name="Mean Diameter Speed Factor (n · dm)"
              formula="dm = (d + D) / 2  [mm]\nn · dm = n · dm  [mm/min]"
              variables={[
                { symbol: "dm", meaning: "Mean pitch diameter of bearing (mm)" },
                { symbol: "Limit", meaning: "~500,000 for standard grease; oil lubrication required above" },
              ]}
            />
          </div>
        </div>
      </div>
    </MathDocContainer>
  );
}

// -----------------------------------------------------------------------------
// 4. Crank-Rocker Kinematics Documentation
// -----------------------------------------------------------------------------

export function CrankMathDoc() {
  return (
    <MathDocContainer
      title="4-Bar Planar Linkage Kinematics & Sizing"
      subtitle="Grashof mobility criterion, Freudenstein loop-closure, transmission angles, and shaking dynamics."
      icon={<Compass className="w-4 h-4" />}
    >
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">1. Grashof Mobility Condition</h4>
          <p className="mb-3">
            For a four-bar planar linkage with link lengths $r_1$ (ground), $r_2$ (crank), $r_3$ (coupler), and $r_4$ (rocker), continuous rotation of at least one link requires:
          </p>
          <FormulaCard
            name="Grashof Condition & Crank-Rocker Classification"
            formula="s + l ≤ p + q   (Grashof Condition)\nFor Crank-Rocker:  s == r2  (Crank must be shortest link)"
            variables={[
              { symbol: "s", meaning: "Length of shortest link" },
              { symbol: "l", meaning: "Length of longest link" },
              { symbol: "p, q", meaning: "Lengths of the remaining two intermediate links" },
            ]}
            description="If s + l > p + q, the mechanism is non-Grashof (triple-rocker; no link can complete a full 360° rotation)."
          />
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">2. Analytical Loop-Closure Position Formulation</h4>
          <p className="mb-3">
            Position analysis is solved using vector loop closure $\mathbf{r}_2 + \mathbf{r}_3 = \mathbf{r}_1 + \mathbf{r}_4$. For any crank angle $\theta_2$, the distance $d$ between crank pin $(p_2)$ and ground pivot $(p_4)$ is:
          </p>
          <FormulaCard
            name="Coupler & Rocker Intersection Geometry"
            formula="p2 = ( r2 · cos θ2,  r2 · sin θ2 ),   p4 = ( r1,  0 )\nd = ||p4 - p2|| = √[ (r1 - r2·cos θ2)² + (r2·sin θ2)² ]\na = (r3² - r4² + d²) / (2 · d),   h = √( r3² - a² )"
            variables={[
              { symbol: "p2", meaning: "Crank pin position vector" },
              { symbol: "p4", meaning: "Rocker grounded pivot at (r1, 0)" },
              { symbol: "h", meaning: "Normal offset from diagonal chord to joint pin p3" },
            ]}
            description="If d > r3 + r4 or d < |r3 - r4|, the mechanism binds and cannot reach the specified crank angle."
          />
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">3. Transmission Angle (γ) & Mechanical Advantage (MA)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormulaCard
              name="Transmission Angle (γ)"
              formula="cos γ = (r3² + r4² - s²) / (2 · r3 · r4)\ns² = r1² + r2² - 2 · r1 · r2 · cos θ2"
              variables={[
                { symbol: "γ", meaning: "Angle between coupler (r3) and rocker (r4)" },
                { symbol: "Limits", meaning: "Extrema occur at θ2 = 0° and θ2 = 180°" },
              ]}
              description="Best practice keeps 45° ≤ γ ≤ 135° to ensure efficient force transmission without joint jam."
            />
            <FormulaCard
              name="Mechanical Advantage (MA)"
              formula="MA = | (r4 · sin(θ4 - θ3)) / (r2 · sin(θ2 - θ3)) |"
              variables={[
                { symbol: "MA", meaning: "Instantaneous torque multiplication Tout / Tin" },
                { symbol: "Toggle", meaning: "MA → ∞ when crank & coupler become collinear (sin(θ2 - θ3) → 0)" },
              ]}
            />
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">4. Structural Pin Stresses & Inertia Shaking</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormulaCard
              name="Pin Shear & Bearing Stresses"
              formula="τ_shear = F / [ (π / 4) · d_pin² ]  [MPa]\nσ_bearing = F / [ d_pin · t_arm ]  [MPa]"
              variables={[
                { symbol: "d_pin", meaning: "Pin diameter (mm)" },
                { symbol: "t_arm", meaning: "Link clevis / arm thickness (mm)" },
              ]}
            />
            <FormulaCard
              name="D'Alembert Shaking Force"
              formula="F_shake = || ∑_{i=2}^4 m_i · a_Gi ||  [N]"
              variables={[
                { symbol: "m_i", meaning: "Mass of link i (kg)" },
                { symbol: "a_Gi", meaning: "Centroid acceleration vector (m/s²)" },
              ]}
            />
          </div>
        </div>
      </div>
    </MathDocContainer>
  );
}

// -----------------------------------------------------------------------------
// 5. Gearbox Optimization Documentation
// -----------------------------------------------------------------------------

export function OptimizationMathDoc() {
  return (
    <MathDocContainer
      title="Gearbox Multi-Stage Ratio & Tooth Optimization"
      subtitle="Combinatorial branch-and-bound search, speed-torque propagation, and AGMA structural pruning."
      icon={<Scale className="w-4 h-4" />}
    >
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">1. Multi-Stage Ratio Decomposition</h4>
          <p className="mb-3">
            A gearbox total target ratio R_target is factored across k reduction stages:
          </p>
          <FormulaCard
            name="Overall Gearbox Ratio"
            formula="R_total = ∏_{i=1}^k R_i = ∏_{i=1}^k ( N_g,i / N_p,i )\nTarget Stage Ratio:   R_stage ≈ ( R_total )^(1 / k)"
            variables={[
              { symbol: "k", meaning: "Number of reduction stages (1 to 3 stages typical)" },
              { symbol: "Np,i, Ng,i", meaning: "Pinion and gear tooth counts for stage i" },
              { symbol: "Tolerance", meaning: "Matched within user target ratio tolerance (default ±5%)" },
            ]}
          />
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">2. Speed & Torque Propagation</h4>
          <p className="mb-3">
            At each intermediate stage, speed decreases and torque increases inversely proportional to the stage reduction:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormulaCard
              name="Speed Propagation"
              formula="n_{i+1} = n_i / R_i  [RPM]"
              variables={[
                { symbol: "n1", meaning: "Input motor or prime mover speed (RPM)" },
                { symbol: "ni", meaning: "Pinion speed entering stage i" },
              ]}
            />
            <FormulaCard
              name="Torque Propagation"
              formula="T_{i+1} = T_i · R_i · η_stage  [N·m]"
              variables={[
                { symbol: "T1", meaning: "Input prime mover torque (N·m)" },
                { symbol: "η_stage", meaning: "Stage mesh efficiency (~98% spur gears)" },
              ]}
            />
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">3. Structural Pruning via AGMA Safety Factors</h4>
          <p className="mb-3">
            During tree exploration, candidates are evaluated against AGMA bending (SF) and pitting (SH) criteria:
          </p>
          <div className="p-3 rounded bg-muted/20 border border-border/50 text-[11px] font-mono whitespace-pre overflow-x-auto">
            Evaluate Stage i (Ng,i, Np,i, ni):
            if (SF_bending &lt; 1.0 or SH_pitting &lt; 1.0) prune branch
            Score = min( SF_bending, SF_pitting )
          </div>
          <p className="text-[11px] mt-2">
            Candidates are ranked by their worst-case governing safety factor min(SF, SH) across all stages.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1.5">4. The Hunting Tooth Principle</h4>
          <p className="mb-3">
            In racing and high-durability transmissions, it is desirable that tooth counts Np and Ng share no common factors:
          </p>
          <div className="p-3 rounded-lg border border-border/70 bg-background/80 space-y-1.5 text-xs">
            <div className="font-semibold text-foreground">Hunting Tooth Condition: gcd(Np, Ng) = 1</div>
            <p className="text-[11px] text-muted-foreground">
              When the greatest common divisor gcd(Np, Ng) = 1, each tooth on the pinion contacts every single tooth on the gear before identical tooth pairs re-engage. This distributes contact wear evenly across the entire circumference, prevents cyclic resonance vibrations, and significantly extends gear mesh life.
            </p>
          </div>
        </div>
      </div>
    </MathDocContainer>
  );
}
