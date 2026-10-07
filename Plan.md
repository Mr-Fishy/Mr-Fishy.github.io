# Portfolio Website Plan

This document outlines the architecture and execution plan for Evan Fish's personal portfolio website using **shadcn/ui**, **Tailwind CSS**, and **TanStack Start**.

---

## 1. Objectives & Scope

Build a clean, high-performance portfolio featuring four main pages:

1. **Home (`/`)**: Hero section introducing Evan Fish (Developer, System Designer, Project Manager), core value proposition, featured work, and clear calls to action.
2. **About Me (`/about`)**: Personal narrative, engineering mindset, categorized technical skills, and background.
3. **CV / Resume (`/resume`)**: Career experience timeline, key achievements, education, credentials, and printable/downloadable resume action.
4. **Projects (`/projects`)**: Filterable project showcase with category tabs, tech stack badges, live demo and GitHub repository links.

---

## 2. Technical Stack

- **Framework**: React 19 + TanStack Start (SSR + Vite)
- **Routing**: TanStack Router (File-based routing in `src/routes/`)
- **Styling**: Tailwind CSS v4 + custom design tokens
- **UI Primitives**: shadcn/ui components (`Button`, `Card`, `Badge`, `Tabs`, `Separator`, `Avatar`)
- **Icons**: `lucide-react`
- **Linting & Formatting**: Biome

---

## 3. Key Components & Architecture

### Layout & Navigation

- **Primary Layout (`src/layouts/primary-layout.tsx`)**:
  - Unified layout with SSR-safe header / sticky bar.
  - Responsive navigation header with active route links.
  - Interactive bottom dock / `BubbleMenu` for quick actions and page switching.
  - Consistent footer with social links (GitHub, LinkedIn, Email).
- **Centralized Data Store (`src/data/portfolio-data.ts`)**:
  - Single source of truth for bio, experience, skills, and project list.

### Pages & Routes

- `src/routes/index.tsx` (Home)
- `src/routes/about.tsx` (About Me)
- `src/routes/resume.tsx` (CV / Resume)
- `src/routes/projects.tsx` (Projects)

### shadcn Primitives to Install / Add

- `button.tsx`: Buttons for primary CTAs, links, and icon actions.
- `card.tsx`: Used for project showcases, experience timeline items, and skills categories.
- `badge.tsx`: Used for tech tags (`React`, `TypeScript`, `Node.js`, etc.).
- `tabs.tsx`: Used for project filtering and toggling resume views.
- `separator.tsx`: Subtle division between sections.
- `avatar.tsx`: Display portrait avatar with clean fallbacks.

---

## 4. Implementation Steps

- [x] **Step 1: Setup shadcn/ui Components**
  - Added core shadcn primitives (`button`, `card`, `badge`, `tabs`, `separator`, `avatar`) under `src/components/ui/`.
  - Configured compatibility with Tailwind CSS v4 and project CSS variables.

- [x] **Step 2: Shared Portfolio Data**
  - Created `src/data/portfolio-data.ts` containing Evan Fish's background, roles, projects, skills, and career timeline.

- [x] **Step 3: Refine Layout & Navigation**
  - Updated `src/layouts/primary-layout.tsx` to fix SSR hydration (guarding DOM scroll events) and provide seamless responsive navigation between the 4 pages.
  - Refactored `src/components/bubble-menu.tsx` into a floating navigation dock with active route indicators and quick links.

- [x] **Step 4: Implement Route Pages**
  - **Home (`src/routes/index.tsx`)**: Hero banner, portrait avatar, pillars, featured projects, and CTAs.
  - **About Me (`src/routes/about.tsx`)**: Narrative story, engineering principles, and categorized skills.
  - **CV / Resume (`src/routes/resume.tsx`)**: Interactive timeline, role descriptions, education, and Print / Save PDF action.
  - **Projects (`src/routes/projects.tsx`)**: Interactive category tabs, search filter, project cards with tags, metrics, and repo/demo links.

- [x] **Step 5: Route Generation & Verification**
  - Executed `tsr generate` to register all routes in `src/routeTree.gen.ts`.
  - Formatted and validated code quality with Biome (`npx @biomejs/biome check src/` passing with 0 errors).
  - Validated production client & SSR build (`npx vite build`).

---

## 5. Verification Plan

- **Route generation**: Verified `src/routeTree.gen.ts` detects `/`, `/about`, `/resume`, and `/projects`.
- **Production build**: Verified `npx vite build` generates client assets and server bundle at `.output/server/index.mjs`.
- **Code quality**: Passed `npx @biomejs/biome check src/`.
