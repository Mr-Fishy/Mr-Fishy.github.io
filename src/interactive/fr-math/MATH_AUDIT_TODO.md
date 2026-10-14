# Falcon Racing Math (`fr-math`) Mathematical Audit & TODO Roadmap

This document summarizes the mathematical investigation of the equations implemented across the five core modules of `fr-math` (AGMA Gear Mesh, Two-Support Stepped Shaft, ISO 281 Rolling Bearings, 4-Bar Crank-Rocker Kinematics, and Gear Ratio Optimizer). It identifies theoretical validity, approximations, edge-case limitations, and prioritized recommendations for accuracy improvements.

---

## 1. AGMA 2001-D04 Spur Gear Mesh (`gear.ts`)

### Current State & Validity

- **Transmitted Tangential Load ($W_t$):** $\frac{60 \times 10^6 \cdot P}{\pi d_p n}$ is exact from power equilibrium.
- **Dynamic Factor ($K_v$):** Implements AGMA metric polynomial $K_v = \left(\frac{A + \sqrt{200 v_t}}{A}\right)^B$. Valid for $v_t \le v_{t,\max}$.
- **Load Distribution Factor ($K_m$):** Follows empirical analytical approach $K_m = 1 + C_{mc}(C_{pf}C_{pm} + C_{ma}C_e)$.
- **Bending Stress ($\sigma_b$) & Contact Stress ($\sigma_c$):** Metric forms match AGMA 2001-D04 / ISO 6336 equivalents.

### Identified Approximations & Gaps

1. **Pitch-Point Approximation for Pitting Geometry Factor ($I$):**
   - Current: $I = \frac{\cos\phi \sin\phi}{2} \frac{m_G}{m_G + 1}$.
   - *Limitation:* Assumes contact radius of curvature at the pitch point. Under standard AGMA 2001-D04, external spur gears evaluate curvature at the Lowest Point of Single Tooth Contact (LPSTC) of the pinion, factoring in contact ratio $m_p$:
     $$m_p = \frac{\sqrt{r_{a,p}^2 - r_{b,p}^2} + \sqrt{r_{a,g}^2 - r_{b,g}^2} - C \sin\phi}{p_b}$$
     Using the pitch point is moderately optimistic for small pinions ($N_p < 20$).
2. **Elastic Coefficient ($Z_E$ / $C_p$):**
   - Previously hardcoded steel-on-steel ($191 \sqrt{\text{MPa}}$).
   - *Resolved:* Dynamically computed from material $E$ and $\nu$.
3. **Hardness Ratio Factor ($C_H$):**
   - Currently hardcoded to $1.0$.
   - When a hardened pinion mates with a softer gear, cold working enhances gear pitting allowable:
     $$C_H = 1.0 + A'(m_G - 1), \quad A' = 8.98\times 10^{-3}(H_{Bp}/H_{Bg}) - 8.29\times 10^{-3}$$
4. **Reverse Bending / Idler Factor:**
   - Standard AGMA requires allowable bending stress $S_t$ to be multiplied by $0.70$ (or a $1.42$ reverse stress multiplier) when a tooth experiences two-way alternating bending (e.g., intermediate idler gears or reverse stages).
5. **Profile Shift (Addendum Modification $x$):**
   - Pinions with $N_p < 17$ at $20^\circ$ pressure angle experience undercutting with standard rack cutters. The tool warns about this, but adding an explicit profile shift slider $x \in [-0.5, +0.8]$ would allow modeling non-undercut compact pinions.

---

## 2. Shaft Stress & Deflection Solver (`shaft.ts`)

### Current State & Validity

- **Reactions & Internal Diagrams ($V$, $M$, $T$):** Exact statics via singularity integration over biaxial horizontal and vertical planes.
- **Deflection & Slope:** Euler-Bernoulli integration $\frac{d^2 y}{dx^2} = \frac{M}{EI}$ using double trapezoidal integration with support boundary condition reconciliation ($y(x_A) = 0, y(x_B) = 0$).
- **DE-Goodman Multiaxial Fatigue:** Correctly integrates alternating bending with steady torsion:
  $$\frac{1}{n_f} = \frac{16}{\pi d^3}\left[\frac{2 K_f M}{S_e} + \frac{\sqrt{3} K_{fs} T}{S_{ut}}\right]$$

### Identified Approximations & Gaps

1. **Fatigue Endurance Ratio ($S_e' / S_{ut}$) for Non-Ferrous Alloys:**
   - Previously assumed steel behavior ($S_e' = 0.5 S_{ut}$ capped at 700 MPa) across all metals.
   - For aluminium (e.g. 7075-T6, 6061-T6), there is no true endurance limit; fatigue strength at $5\times 10^8$ cycles is only $\approx 0.32 - 0.35 S_{ut}$. For titanium (Ti-6Al-4V), $S_e' \approx 0.45 S_{ut}$.
   - *Resolved:* Added per-material and custom `seRatio`.
2. **Alternative Multiaxial Fatigue Criteria (ASME-Elliptic / DE-Gerber):**
   - Modified Goodman is notoriously conservative for ductile shafting steels. Implementing the ASME-Elliptic criterion:
     $$\left(\frac{n \sigma'_a}{S_e}\right)^2 + \left(\frac{n \sigma'_m}{S_y}\right)^2 = 1$$
     yields more accurate predictions for racing drivetrains where weight optimization is paramount.
3. **Alternating Torque Component ($T_a$):**
   - In racing drivetrains (engine torque pulses, gear shifts, launch clutch slip, regenerative braking), torque is not purely steady; it possesses an alternating amplitude $T_a$. Adding an alternating torque input improves realism.
4. **Timoshenko Shear Deflection:**
   - Short, thick transmission countershafts ($L/d < 8$) undergo significant transverse shear deformation:
     $$\frac{dy_s}{dx} = \frac{k_s V}{G A}$$
     For steel ($G \approx 79\,\text{GPa}$), neglecting shear deflection underestimates deflection by 10%–20%.
5. **Location-Dependent Stress Concentrations ($K_t$ & Notch Sensitivity $q$):**
   - Currently applies global $K_f = 1.6, K_{fs} = 1.4$ everywhere. Shaft transitions have distinct shoulder fillet radii $r/d$ and step ratios $D/d$. Peterson/Neuber empirical equations should calculate local $K_t$ and $K_f = 1 + q(K_t - 1)$ per step.

---

## 3. Rolling Bearing Life Analysis (`bearing.ts`)

### Current State & Validity

- **Dynamic Rated Life ($L_{10h}$):** Matches ISO 281 basic life formula $L_{10} = (C/P)^p$ with $p=3$ for ball and $p=10/3$ for roller.
- **Equivalent Dynamic Load ($P$):** Implements ISO 281 radial ($X$) and axial ($Y$) factors based on $F_a / C_0$ ratio interpolation.
- **Reliability Factor ($a_1$):** Matches ISO 281 table up to $99.9\%$.

### Identified Approximations & Gaps

1. **Static Safety Factor ($s_0$) Bug / Oversimplification:**
   - Previous formula used $\frac{C_0}{\max(F_r, F_a)}$, which underestimated static equivalent load under combined loading.
   - *Resolved:* Implemented ISO 76 standard static equivalent load:
     $$P_0 = \max(0.6 F_r + 0.5 F_a, F_r) \quad \text{(Ball)}$$
     $$P_0 = \max(0.5 F_r + 0.22 F_a, F_r) \quad \text{(Roller)}$$
     $$s_0 = \frac{C_0}{P_0}$$
2. **ISO 281:2007 Modified Life ($a_{\text{ISO}}$):**
   - Full ISO 281 modified rating life is:
     $$L_{nmh} = a_1 a_{\text{ISO}} L_{10h}$$
     where $a_{\text{ISO}} = f\left(\frac{e_C C_u}{P}, \kappa\right)$ depends on oil/grease viscosity ratio $\kappa = \nu / \nu_1$ and contamination factor $e_C$. Adding an oil viscosity selection (e.g. 75W-90, ISO VG 68, ATF) would unlock true modified life modeling.
3. **Thrust & Preload Effects in Angular Contact and Tapered Bearings:**
   - When using pairs of angular contact bearings (72xx) or tapered rollers (302xx) on a pinion shaft, internal axial induced forces $F_{a,\text{ind}} = \frac{0.5 F_r}{Y}$ occur. A dual-bearing mounting solver (back-to-back / face-to-face) would accurately divide thrust and moment loads.

---

## 4. Crank-Rocker Kinematics & Sizing (`crank.ts`)

### Current State & Validity

- **Grashof Condition:** Correctly enforces $s + l \le p + q$ with $s = r_2$ (crank as shortest link).
- **Transmission Angles:** Exact law-of-cosines evaluations at $\theta_2 = 0$ and $\theta_2 = \pi$.
- **Mechanical Advantage:** Exact loop closure trigonometric ratio $\left|\frac{r_4 \sin(\theta_4 - \theta_3)}{r_2 \sin(\theta_2 - \theta_3)}\right|$.

### Identified Approximations & Gaps

1. **Numerical Second Derivative for Accelerations:**
   - Dynamics currently computes link accelerations using central finite differences with fixed $\Delta t = 0.001\,\text{s}$:
     $$a \approx \frac{p(t+\Delta t) - 2p(t) + p(t-\Delta t)}{\Delta t^2}$$
   - *Recommendation:* Replace with analytical loop-closure acceleration equations:
     $$\begin{pmatrix} -r_3 \sin\theta_3 & r_4 \sin\theta_4 \\ r_3 \cos\theta_3 & -r_4 \cos\theta_4 \end{pmatrix} \begin{pmatrix} \alpha_3 \\ \alpha_4 \end{pmatrix} = \begin{pmatrix} r_2 \omega_2^2 \cos\theta_2 + r_3 \omega_3^2 \cos\theta_3 - r_4 \omega_4^2 \cos\theta_4 \\ r_2 \omega_2^2 \sin\theta_2 + r_3 \omega_3^2 \sin\theta_3 - r_4 \omega_4^2 \sin\theta_4 \end{pmatrix}$$
     This eliminates discretization noise and handles near-toggle configurations without numerical singularity.
2. **Link Inertia Modeling:**
   - Links currently assume uniform rectangular bars with mass centered at midpoint. Allowing custom link mass $m_i$ and moment of inertia $I_{G,i}$ will make shaking force predictions realistic for custom CNC billet arms.

---

## 5. Gear Ratio Optimizer (`optimize.ts`)

### Current State & Validity

- Branch-and-bound stage DFS successfully matches overall gear ratios within user tolerance ($\pm 5\%$).
- Evaluates AGMA safety factor pruning at each intermediate stage.

### Identified Approximations & Gaps

1. **Odd Tooth Count Filtering:**
   - Previous code had `if (p % 2 !== 0) continue; if (g % 2 !== 0) continue;`, which artificially excluded all odd tooth counts (e.g. 17, 19, 21, 23, 29).
   - In motorsports and industrial gearing, odd/prime tooth counts are specifically sought to create **hunting tooth ratios** (where $\gcd(N_p, N_g) = 1$), ensuring even tooth-on-tooth wear distribution.
   - *Resolved:* Removed the even-only restriction; all valid tooth counts are now explored.

---

## Prioritized Implementation TODO List

| Priority | Module | Feature / Change | Status |
| :--- | :--- | :--- | :--- |
| **P0** | **Bearing** | Fix ISO 76 static equivalent load $P_0 = \max(0.6 F_r + 0.5 F_a, F_r)$ | **Done** |
| **P0** | **Shaft** | Non-ferrous fatigue endurance limit ratios ($S_e'/S_{ut} = 0.35$ Al, $0.45$ Ti) | **Done** |
| **P0** | **Gear** | Dynamic $Z_E$ elastic coefficient computation from material $E$ & $\nu$ | **Done** |
| **P0** | **Optimizer** | Allow odd tooth counts and hunting teeth | **Done** |
| **P0** | **Materials** | Expanded preset catalog (Maraging 300, 7075-T6, Bronze, 300M, 17-4PH, 52100) | **Done** |
| **P0** | **Custom** | Allow custom material input across Gears ($S_t, S_c, E, \nu, HB$) and Shafts ($S_{ut}, S_y, E, seRatio$) | **Done** |
| **P0** | **Bearings** | Expanded catalog (40+ bearings) & Custom bearing builder with live plotting | **Done** |
| **P1** | **Gear** | Implement full LPSTC geometry factor $I$ with contact ratio $m_p$ | Open |
| **P1** | **Gear** | Add Hardness Ratio Factor $C_H$ for through-hardened gear work-hardening | Open |
| **P1** | **Gear** | Add Reverse Bending / Idler factor toggle ($K_B' = 1.42$) | Open |
| **P1** | **Shaft** | Add ASME-Elliptic and DE-Gerber fatigue criteria toggle | Open |
| **P1** | **Shaft** | Add alternating torque component ($T_a$) | Open |
| **P2** | **Shaft** | Add Timoshenko shear deflection ($k_s V / GA$) for stubby shafts ($L/d < 8$) | Open |
| **P2** | **Shaft** | Shoulder fillet notch factor solver ($r/d, D/d \to K_t \to K_f$) | Open |
| **P2** | **Bearing** | ISO 281:2007 modified life factor $a_{\text{ISO}}$ based on lubricant viscosity ($\kappa$) | Open |
| **P2** | **Crank** | Analytical acceleration loop solver replacing numerical finite differences | Open |
| **P2** | **Crank** | Custom link mass and moment of inertia ($I_G$) input | Open |
