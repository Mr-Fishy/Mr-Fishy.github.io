export interface Subsite {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: "Engineering & Systems" | "Interactive Tools" | "Simulation & Math";
  route: string;
  badge: string;
  tags: string[];
  features: string[];
  dateAdded: string;
  isNew?: boolean;
}

export const subsitesList: Subsite[] = [
  {
    id: "fr-math",
    title: "Falcon Racing Drivetrain Tool",
    subtitle:
      "AGMA Gear Rating, Shaft Deflection, Bearing Life & Mechanism Kinematics",
    description:
      "A complete race drivetrain sizing suite featuring AGMA 2001-D04 gear stress rating with involute tooth visualizer, two-support biaxial beam solver with synchronized shear/moment/stress/deflection diagrams, ISO 281 rolling bearing life analysis with catalog ranking, 4-bar crank-rocker kinematic analysis, and multi-stage ratio optimization.",
    category: "Engineering & Systems",
    route: "/interactive/fr-math",
    badge: "Interactive Tool",
    tags: [
      "TypeScript",
      "HTML5 Canvas",
      "AGMA 2001-D04",
      "ISO 281",
      "Mechanical Systems",
      "Kinematics",
    ],
    features: [
      "Involute tooth contact & bending stress visualizer with safety heat-map",
      "Two-support beam solver with synchronized 4-panel scrubber diagrams",
      "ISO 281 L10 life curves comparing candidate bearings against target redline",
      "Kinematic simulation of 4-bar crank-rocker mechanism with transmission angles",
      "Multi-stage gear ratio optimizer with safety factor pruning",
      "Seamless Metric <-> Imperial universal unit toggling",
    ],
    dateAdded: "October 2026",
    isNew: true,
  },
];
