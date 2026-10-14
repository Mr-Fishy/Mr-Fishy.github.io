import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Layers,
  Maximize2,
  Palette,
  Sparkles,
  Volume2,
  VolumeX,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrimaryLayout from "@/layouts/primary-layout";

export const Route = createFileRoute("/coursework/time/expressive-line")({
  component: ExpressiveLinePage,
});

export default function ExpressiveLinePage() {
  const [activeTab, setActiveTab] = useState<string>("compare");
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);

  return (
    <PrimaryLayout>
      <div className="space-y-12 animate-in fade-in-50 duration-500 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
            <Link to="/coursework">
              <ArrowLeft className="w-4 h-4" />
              Back to Coursework
            </Link>
          </Button>

          <div className="flex items-center gap-2">
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
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creative Motion &amp; Digital Animation</span>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold">
              Emotional State: Catharsis
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Expressive Line: <span className="bg-linear-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">Catharsis</span>
          </h1>
          <p className="text-lg sm:text-xl font-medium text-primary/90 max-w-3xl">
            Translating the release of psychological tension, upheaval, and emotional purification through kinetic line weight and chromatic transition.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            Created for ART 1107 (Time) at Seattle Pacific University. This study explores the concept of <strong className="text-foreground">Catharsis</strong>—the process of releasing, and thereby providing relief from, strong or repressed emotions. Through sequential hand-drawn frames assembled and timed in Photoshop, the animation manifests internal turmoil giving way to expansive release across both high-contrast monochromatic lines and atmospheric chromatic textures.
          </p>
        </div>

        {/* Artist Statement & Emotional State Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/70 bg-card/40 backdrop-blur-xs md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Artist Statement &amp; Approach: Catharsis in Motion
              </CardTitle>
              <CardDescription>
                Expressing emotional rupture, compression, and liberating release
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                In this exploration of <strong className="text-foreground">Expressive Line</strong>, line is treated as an energetic vessel for <strong className="text-foreground">Catharsis</strong>. Rather than depicting static gestures, the drawing stages visualize the full cycle of cathartic experience: starting with tightening constriction and erratic, jagged weight, escalating to a peak breaking threshold, and ultimately unraveling into fluid, expansive trajectories.
              </p>
              <p>
                The digital assembly process in Adobe Photoshop transformed static hand drawings into a rhythmic cycle. In the black and white base sequence, the raw emotional strain is carried entirely by variable stroke pressure, aggressive density, and sudden kinematic dispersal. In the colorized sequence, palette shifts and textured backdrops heighten the emotional arc—moving from compressed distress into radiant, restorative liberation.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/40 backdrop-blur-xs flex flex-col justify-between">
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
                <span className="text-muted-foreground">Emotional State</span>
                <span className="font-semibold text-emerald-500">Catharsis</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Framework</span>
                <span className="font-semibold text-foreground">Sequential 2D Animation</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Tooling</span>
                <span className="font-semibold text-foreground">Hand Drawing, Photoshop</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Outputs</span>
                <span className="font-semibold text-foreground">B&amp;W &amp; Color GIF Sequences</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Institution</span>
                <span className="font-semibold text-foreground">Seattle Pacific Univ.</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gallery / Interactive Animation Showcase */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Final Animation Deliverables</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Inspect each animated sequence or view them side-by-side.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-muted/70">
                <TabsTrigger value="compare" className="text-xs">
                  Side by Side
                </TabsTrigger>
                <TabsTrigger value="bw" className="text-xs">
                  1. B&amp;W Base
                </TabsTrigger>
                <TabsTrigger value="color" className="text-xs">
                  2. Color &amp; Texture
                </TabsTrigger>
                <TabsTrigger value="sound" className="text-xs">
                  3. Extra Credit
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tab 1: Side by Side Comparison */}
          {activeTab === "compare" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* B&W Card */}
              <Card className="overflow-hidden border-border/80 bg-card/50 shadow-md">
                <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                      Part 1: Base Animation
                    </span>
                    <h3 className="text-lg font-bold text-foreground">
                      Black &amp; White Sequence
                    </h3>
                  </div>
                  <Badge variant="secondary" className="text-[11px]">
                    Line &amp; Movement
                  </Badge>
                </div>
                <div className="relative bg-black/90 p-4 sm:p-6 flex items-center justify-center min-h-[340px]">
                  <img
                    src="/Image-Sequence-BW.gif"
                    alt="Black and White Expressive Line Animation Sequence"
                    className="max-h-[380px] w-auto rounded shadow-2xl object-contain mx-auto"
                  />
                </div>
                <CardContent className="p-5 space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Base Line Dynamic:</strong> Raw expression through line weight modulation, acceleration, and anatomical deformation without the assistance of chromatic contrast.
                  </p>
                </CardContent>
              </Card>

              {/* Color Card */}
              <Card className="overflow-hidden border-border/80 bg-card/50 shadow-md">
                <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                      Part 2: Chromatic Expansion
                    </span>
                    <h3 className="text-lg font-bold text-foreground">
                      Colorized &amp; Textured Sequence
                    </h3>
                  </div>
                  <Badge variant="default" className="text-[11px]">
                    Color &amp; Atmosphere
                  </Badge>
                </div>
                <div className="relative bg-black/90 p-4 sm:p-6 flex items-center justify-center min-h-[340px]">
                  <img
                    src="/Image-Sequence-Color.gif"
                    alt="Color and Textured Expressive Line Animation Sequence"
                    className="max-h-[380px] w-auto rounded shadow-2xl object-contain mx-auto"
                  />
                </div>
                <CardContent className="p-5 space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Chromatic Resonance:</strong> Color and ambient texture applied to the line form, intensifying the psychological undertones and amplifying focal shifts.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab 2: B&W Solo Focus */}
          {activeTab === "bw" && (
            <Card className="overflow-hidden border-border/80 bg-card/50 shadow-lg max-w-3xl mx-auto">
              <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
                <div>
                  <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                    Deliverable 01
                  </Badge>
                  <h3 className="text-xl font-bold text-foreground mt-1">
                    B&amp;W Base Animation: Form &amp; Tension
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground font-mono">12–30 Frame Cycle</span>
              </div>
              <div className="bg-black/95 p-6 sm:p-10 flex items-center justify-center">
                <img
                  src="/Image-Sequence-BW.gif"
                  alt="Black and White Expressive Line Animation Sequence"
                  className="max-h-[440px] w-auto rounded-lg shadow-2xl object-contain"
                />
              </div>
              <CardContent className="p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    Approach to Monochromatic Form
                  </h4>
                  <p>
                    Without color to direct attention, visual hierarchy is achieved entirely through stroke density, edge roughness, and timing intervals. Rapid frame progressions build tension, while sustained poses release it.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 3: Color Solo Focus */}
          {activeTab === "color" && (
            <Card className="overflow-hidden border-border/80 bg-card/50 shadow-lg max-w-3xl mx-auto">
              <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
                <div>
                  <Badge variant="default" className="text-[10px] uppercase font-mono">
                    Deliverable 02
                  </Badge>
                  <h3 className="text-xl font-bold text-foreground mt-1">
                    Colorized &amp; Textured Sequence: Psychological Atmosphere
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground font-mono">Photoshop Colorization</span>
              </div>
              <div className="bg-black/95 p-6 sm:p-10 flex items-center justify-center">
                <img
                  src="/Image-Sequence-Color.gif"
                  alt="Color Expressive Line Animation Sequence"
                  className="max-h-[440px] w-auto rounded-lg shadow-2xl object-contain"
                />
              </div>
              <CardContent className="p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    Color Theory &amp; Mood Amplification
                  </h4>
                  <p>
                    The addition of chromatic treatments and atmospheric texturing transforms the emotional landscape. Color is utilized not merely decorative filler, but as a deliberate emotional signifier that works in concert with the kinetic motion.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab 4: Extra Credit / Sound */}
          {activeTab === "sound" && (
            <Card className="overflow-hidden border-border/80 bg-card/50 shadow-lg max-w-3xl mx-auto">
              <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono text-primary border-primary/30">
                    Extra Credit Deliverable
                  </Badge>
                  <h3 className="text-xl font-bold text-foreground mt-1">
                    Kinetic Line with Soundscape
                  </h3>
                </div>
              </div>
              <div className="bg-black/95 p-6 sm:p-10 flex flex-col items-center justify-center space-y-4">
                <img
                  src="/Image-Sequence-Color.gif"
                  alt="Color Expressive Line with Sound"
                  className="max-h-[380px] w-auto rounded-lg shadow-2xl object-contain"
                />
                
                {/* Audio Component / Placeholder */}
                <div className="w-full max-w-md bg-card/80 border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Soundscape Integration</p>
                      <p className="text-[11px] text-muted-foreground">Audio synchronization</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[11px]">
                    Optional Media
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Sound integration builds on the visual kinetics by providing an acoustic pulse that aligns with the rhythm of the lines. Whether utilizing organic foley or atmospheric ambient drone, audio provides an additional sensory dimension to the emotional state.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Process & Methodology Walkthrough */}
        <section className="space-y-4 border-t border-border pt-8">
          <h2 className="text-2xl font-bold tracking-tight">Project Process &amp; Technical Stages</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-border/60 bg-card/30 space-y-2">
              <span className="text-xs font-mono font-bold text-primary">Stage 01</span>
              <h3 className="text-base font-semibold text-foreground">Refined Hand Drawings</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generated sequential drawing stages on paper, refining contour line weight and testing continuity of motion across successive sheets.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card/30 space-y-2">
              <span className="text-xs font-mono font-bold text-primary">Stage 02</span>
              <h3 className="text-base font-semibold text-foreground">Digital Capture &amp; Cleanup</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Digitized physical drawings, standardized frame registration in Photoshop, balanced threshold values, and eliminated scanning artifacts.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card/30 space-y-2">
              <span className="text-xs font-mono font-bold text-primary">Stage 03</span>
              <h3 className="text-base font-semibold text-foreground">Timeline Assembly &amp; Color</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Configured frame timing intervals for fluid kinetic pacing, layered chromatic accents, and exported optimized looped animated GIFs.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PrimaryLayout>
  );
}
