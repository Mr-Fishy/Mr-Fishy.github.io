import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  Layers,
  Maximize2,
  Palette,
  Sparkles,
  UserCheck,
  ZoomIn,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PrimaryLayout from "@/layouts/primary-layout";

export const Route = createFileRoute("/coursework/time/photo-montage")({
  component: PhotoMontagePage,
});

export default function PhotoMontagePage() {
  const [bgMode, setBgMode] = useState<"dark" | "neutral" | "light">("dark");
  const [activeFocalPoint, setActiveFocalPoint] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const focalPoints: any[] = [
    // {
    //   id: 1,
    //   title: "Ascending Toss & Stance",
    //   zone: "Left Lawn",
    //   emphasis: "Initiation & Direction",
    //   desc: "Captures the preparatory stance and the upward kinetic launch. High-contrast line and figure placement establish the entry point for the viewer's eye.",
    // },
    // {
    //   id: 2,
    //   title: "The Aerial Arc & Canopy",
    //   zone: "Upper Treeline",
    //   emphasis: "Color Dominance & Geometry",
    //   desc: "Vibrant golden autumn leaves and crisp white spherical juggling balls stand in sharp contrast against dark branches, tracking the parabolic trajectory across fragmented rectangular plates.",
    // },
    // {
    //   id: 3,
    //   title: "Subordinated SPU Landmark",
    //   zone: "Center Architecture",
    //   emphasis: "Subordination via Transparency",
    //   desc: "The iconic brick archway of Seattle Pacific University is rendered with ghosted opacity, subordinating the architectural mass beneath the path of human activity.",
    // },
    // {
    //   id: 4,
    //   title: "Temporal Climax & Multiplicity",
    //   zone: "Right Foreground",
    //   emphasis: "Kinetic Multi-Exposure",
    //   desc: "Rapid catches and body shifts superimpose into a dense complex portrait, portraying multiple moments of time and physical rhythm in a single visual cluster.",
    // },
  ];

  return (
    <PrimaryLayout>
      <div className="space-y-12 animate-in fade-in-50 duration-500 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Link to="/coursework" className="flex gap-1.5 items-center">
              <ArrowLeft className="w-4 h-4" />
              Back to Coursework
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground"
            >
              <Link to="/coursework/time/expressive-line">
                View Expressive Line Project →
              </Link>
            </Button>
            <Badge variant="secondary" className="font-mono text-xs">
              ART 1107: Time
            </Badge>
            <Badge variant="outline" className="text-xs">
              Fall 2026
            </Badge>
          </div>
        </div>

        {/* Project Header Banner */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Camera className="w-3.5 h-3.5" />
              <span>Complex Portrait</span>
            </div>
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-semibold">
              <Clock className="w-3 h-3 mr-1 inline" />
              Composition in Time
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Photo Montage:{" "}
            <span className="bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              Catch
            </span>
          </h1>
{/* 
          <p className="text-lg sm:text-xl font-medium text-primary/90 max-w-3xl">
            A complex portrait deconstructing human performance, site, and
            temporal duration into an orchestrated photographic composite.
          </p>

          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            Completed for <strong className="text-foreground">ART 1107: Time</strong> at
            Seattle Pacific University. This study synthesizes multiple distinct
            moments of time into a single unified <em>"super moment"</em>—a
            photographic composite combining person, site, and activity through
            the principles of <strong className="text-foreground">emphasis and subordination</strong>.
            Using juggling as an active metaphor for dynamic equilibrium and temporal
            flow, the composition coordinates fragmented perspectives, tonal corrections,
            and geometric overlaps onto an expansive canvas.
          </p> */}
        </div>

        {/* Three Core Assignment Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* <Card className="border-border/70 bg-card/40 backdrop-blur-xs space-y-2">
            <CardHeader className="pb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-1">
                <Layers className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-bold">
                1. Technical Goals
              </CardTitle>
              <CardDescription className="text-xs">
                Photoshop Assembly &amp; Exposure Cohesion
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>
                Assembled on an oversized digital canvas exceeding 3,000 pixels
                along the shortest dimension. Coordinated multiple raw captures
                with disciplined exposure balancing, highlight retention, and
                tonal alignment to merge disparate plates into a seamless whole.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/40 backdrop-blur-xs space-y-2">
            <CardHeader className="pb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1">
                <Palette className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-bold">
                2. Aesthetic Goals
              </CardTitle>
              <CardDescription className="text-xs">
                Emphasis &amp; Subordination
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>
                Constructed hierarchy through shape and color. Vibrant autumn
                foliage and crisp white juggling spheres are emphasized with
                maximum contrast and saturation, while the massive brick SPU
                archway is subordinated with lowered opacity to serve as a quiet
                environmental anchor.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/40 backdrop-blur-xs space-y-2">
            <CardHeader className="pb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center mb-1">
                <UserCheck className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-bold">
                3. Creative &amp; Conceptual
              </CardTitle>
              <CardDescription className="text-xs">
                Complex Portrait &amp; Metaphor
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>
                Investigates portraiture across duration rather than an instantaneous
                slice. Juggling acts as a live metaphor for balance, dexterity,
                and holding transient moments in the air—connecting the identity
                of the individual with their physical rhythm in physical space.
              </p>
            </CardContent>
          </Card> */}
        </div>

        {/* Process Reflection & Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* <Card className="border-border/70 bg-card/40 backdrop-blur-xs md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Artist Statement &amp; Process Reflection
              </CardTitle>
              <CardDescription>
                Detailed account of subject, site, activity, and compositional strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Subject, Site, and Activity:</strong>{" "}
                For this complex portrait, I chose to photograph a juggler performing on
                the main lawn of the Seattle Pacific University campus, positioned directly
                in front of the landmark SPU brick entrance gate. Juggling provided both
                dynamic physical movement and a potent symbol: an activity defined entirely
                by maintaining an elusive, continuous equilibrium across time.
              </p>
              <p>
                <strong className="text-foreground">Constructing the "Super Moment":</strong>{" "}
                Rather than accepting the camera's mechanical limitation of freezing a 1/250th-second
                shutter release, I tracked the juggling sequence through sequential exposures
                while varying focal length, distance, and angle. In Photoshop, these exposures
                were assembled into an expansive multi-layer canvas, orchestrating the
                passage of the balls as an unbroken aerial arc that moves fluidly from the
                left windup, ascends across the tree canopy, and culminates in rapid right-side
                catches.
              </p>
              <p>
                <strong className="text-foreground">Emphasis &amp; Subordination through Shape and Color:</strong>{" "}
                To prevent visual cacophony across dozens of overlapping photographic plates,
                I deliberately employed the principles of emphasis and subordination. The stark,
                high-contrast white spheres of the juggling balls and the golden autumn foliage
                are granted primary <em className="text-foreground">emphasis</em> through sharp
                edges, pure geometry, and elevated color saturation. In contrast, the static
                brick architecture and transitional body postures are <em className="text-foreground">subordinated</em> through
                feathered layer masking and lowered opacity, allowing background trees and light
                to bleed through the subject and creating an ethereal, temporal transparency.
              </p>
            </CardContent>
          </Card> */}

          {/* <Card className="border-border/70 bg-card/40 backdrop-blur-xs flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Project Specifications
              </CardTitle>
              <CardDescription>Deliverables and technical criteria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Course</span>
                <span className="font-semibold text-foreground">ART 1107: Time</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Term</span>
                <span className="font-semibold text-foreground">Fall 2026</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Medium</span>
                <span className="font-semibold text-amber-500">
                  Digital Photo Montage
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Canvas Size</span>
                <span className="font-semibold text-foreground">
                  3,000px+ (Shortest Side)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Location</span>
                <span className="font-semibold text-foreground">
                  SPU Campus Lawn
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Activity / Symbol</span>
                <span className="font-semibold text-foreground">
                  Juggling (Temporal Balance)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Core Principle</span>
                <span className="font-semibold text-foreground">
                  Emphasis &amp; Subordination
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Institution</span>
                <span className="font-semibold text-foreground">
                  Seattle Pacific Univ.
                </span>
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Showcase / Image Viewer Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Final Composite Showcase
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Inspect the high-resolution montage. Toggle presentation contrast
                or inspect the full resolution canvas.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Background Theme Selector */}
              <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border/50">
                <span className="text-[11px] font-mono text-muted-foreground px-1.5 hidden sm:inline">
                  Backdrop:
                </span>
                <button
                  type="button"
                  onClick={() => setBgMode("neutral")}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${
                    bgMode === "neutral"
                      ? "bg-background text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Studio
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode("light")}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${
                    bgMode === "light"
                      ? "bg-background text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Light
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsZoomed(!isZoomed)}
                className="gap-1.5 text-xs h-8"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                {isZoomed ? "Reset Scale" : "Enlarge"}
              </Button>
            </div>
          </div>

          {/* Interactive Artwork Display Card */}
          <Card className="overflow-hidden border-border/80 bg-card/50 shadow-xl">
            <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-500">
                  Primary Deliverable
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  Photo Montage
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-[11px]">
                  WebP High-Res
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  3,000px Canvas Composite
                </Badge>
              </div>
            </div>

            {/* Display Area */}
            <div
              className={`relative transition-colors duration-300 p-3 sm:p-8 flex items-center justify-center overflow-hidden ${
                bgMode === "dark"
                  ? "bg-neutral-950"
                  : bgMode === "neutral"
                  ? "bg-neutral-800"
                  : "bg-neutral-100"
              }`}
            >
              <div
                className={`relative transition-all duration-300 w-full flex items-center justify-center ${
                  isZoomed ? "max-w-none scale-105 my-6" : "max-w-5xl"
                }`}
              >
                <img
                  src="/time-montage.webp"
                  alt="Juggling sequence deconstruction across Seattle Pacific University Campus"
                  className="w-full h-auto rounded shadow-2xl object-contain border border-white/10"
                />
              </div>
            </div>

            {/* Artwork Footnote */}
            <CardContent className="p-5 border-t border-border bg-card/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
              {/* <p>
                <strong className="text-foreground">Visual Trajectory &amp; Flow:</strong>{" "}
                Track the continuous arc of the white juggling balls from left to
                right across space and time—ascending through the golden canopy,
                hovering above the ghosted SPU gate, and cascading down into rapid
                catching gestures.
              </p> */}
              <a
                href="/time-montage.webp"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline shrink-0 text-xs font-semibold"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                Open Full Resolution
              </a>
            </CardContent>
          </Card>
        </section>

        {/* Compositional Breakdown & Focal Areas */}
        <section className="space-y-6">
          {/* <div className="border-b border-border pb-3">
            <h2 className="text-2xl font-bold tracking-tight">
              Compositional Anatomy &amp; Hierarchical Zones
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Click any zone to inspect how shape, color, and layer opacity were
              applied to establish emphasis and subordination.
            </p>
          </div> */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {focalPoints.map((point) => {
              const isSelected = activeFocalPoint === point.id;
              return (
                <button
                  type="button"
                  key={point.id}
                  onClick={() =>
                    setActiveFocalPoint(isSelected ? null : point.id)
                  }
                  className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer space-y-2 focus:outline-none focus:ring-2 focus:ring-ring ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500/40"
                      : "border-border/70 bg-card/30 hover:border-border hover:bg-card/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-amber-500 uppercase tracking-wider">
                      Zone 0{point.id}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {point.zone}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {point.title}
                  </h3>
                  <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    {point.emphasis}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {point.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step-by-Step Assignment Workflow */}
        <section className="space-y-4 border-t border-border pt-8">
          {/* <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Assignment Workflow &amp; Execution Stages
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Direct implementation of the curriculum guidelines from field capture
              to the finalized composite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-xl border border-border/60 bg-card/30 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-500">
                  Step 1 &amp; 2
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Capture
                </Badge>
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Subject, Site &amp; Motion Burst
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Selected the juggler and SPU campus lawn. Executed multi-shot photo
                bursts from varied distances and angles, tracking the full trajectory
                of the balls and capturing expressive body shifts across time.
              </p>
              <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Simulated passing time through symbolic activity</span>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card/30 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-500">
                  Step 3 &amp; 4
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Assembly
                </Badge>
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Photoshop Canvas &amp; Hierarchy
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Established a 3,000px+ high-resolution canvas. Layered photographic
                plates into an organized spatial composition, calibrating shape,
                overlap, color balance, and transparency to weave person, site, and
                activity together.
              </p>
              <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Balanced emphasis (balls/leaves) and subordination (gate)</span>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card/30 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-500">
                  Step 5 &amp; 6
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Synthesis
                </Badge>
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Super Moment &amp; Reflection
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Flattened the multi-layered .PSD into a high-fidelity WebP/JPEG
                deliverable. Prepared a comprehensive process documentation explaining
                the choice of subject, site, activity metaphor, and compositional
                principles.
              </p>
              <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Archived for academic review and public showcase</span>
              </div>
            </div>
          </div> */}
        </section>

        {/* Footer Navigation to other Coursework */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link to="/coursework">
              <ArrowLeft className="w-4 h-4" />
              All Academic Projects
            </Link>
          </Button>

          <Button variant="secondary" size="sm" asChild className="gap-2">
            <Link to="/coursework/time/expressive-line">
              <Palette className="w-4 h-4" />
              Next: Expressive Line Animation →
            </Link>
          </Button>
        </div>
      </div>
    </PrimaryLayout>
  );
}
