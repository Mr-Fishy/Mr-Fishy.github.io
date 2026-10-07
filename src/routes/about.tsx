import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Compass,
  FileText,
  FolderGit2,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { portfolioData } from "@/data/portfolio-data";
import PrimaryLayout from "@/layouts/primary-layout";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  const principles = [
    {
      title: "Pragmatic Architecture",
      desc: "Design for real-world reliability, clean boundaries, and evolvability—avoiding premature over-engineering while anticipating scale.",
      icon: Compass,
    },
    {
      title: "Performance & Ergonomics",
      desc: "Every millisecond counts. High-throughput server systems and snappy 60fps client applications drive user retention.",
      icon: Zap,
    },
    {
      title: "Robustness & Testing",
      desc: "Rigorous automated testing, static typing, and clear contracts create confidence in rapid, continuous production delivery.",
      icon: ShieldCheck,
    },
    {
      title: "Empathetic Collaboration",
      desc: "Great software is created by great teams. Clear technical writing, blameless retrospectives, and active mentorship elevate everyone.",
      icon: Lightbulb,
    },
  ];

  return (
    <PrimaryLayout>
      <div className="space-y-12 animate-in fade-in-50 duration-500">
        {/* Header */}
        <div className="space-y-2 border-b border-border pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>About Me</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Engineering with Purpose & Precision
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            A look into my journey as a developer, systems architect, and project lead.
          </p>
        </div>

        {/* Narrative / Bio */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-4 text-base sm:text-lg leading-relaxed text-foreground/90">
            <p>
              Hello! I'm <strong>{portfolioData.name}</strong>, a developer, system designer, and technical project manager. Over the past several years, I have worked across the stack to build high-scale web platforms, distributed processing systems, and engineering workflows.
            </p>
            <p className="text-muted-foreground text-sm sm:text-base">
              My journey began with a curiosity for how computers coordinate complex tasks across networks. That curiosity evolved into leading architectural initiatives—designing fault-tolerant microservices, optimizing database access patterns, and crafting accessible, responsive web interfaces.
            </p>
            <p className="text-muted-foreground text-sm sm:text-base">
              Beyond pure coding, I thrive at the intersection of product strategy and engineering execution. As a project manager and system designer, I help translate ambiguous requirements into actionable roadmaps, ensuring that engineering decisions directly serve business outcomes and user delight.
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" /> {portfolioData.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Open for opportunities
              </span>
            </div>
          </div>

          <Card className="bg-card/50 border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Quick Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="font-semibold block text-muted-foreground">Focus Areas</span>
                <span>Distributed Systems, React/Next.js/TanStack, Technical PM</span>
              </div>
              <Separator />
              <div>
                <span className="font-semibold block text-muted-foreground">Primary Languages</span>
                <span>TypeScript, JavaScript, Go, Python, SQL</span>
              </div>
              <Separator />
              <div>
                <span className="font-semibold block text-muted-foreground">Location</span>
                <span>{portfolioData.location}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Core Principles */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Core Engineering Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.title} className="p-5 flex gap-4 items-start">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground">{p.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Skills & Technologies Breakdown */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Skills & Technologies</h2>
            <p className="text-muted-foreground text-sm">
              Tools, frameworks, and methodologies I leverage to solve complex problems.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {portfolioData.skills.map((skillGroup) => (
              <Card key={skillGroup.category} className="p-5 space-y-3">
                <h3 className="font-bold text-base text-foreground flex items-center justify-between">
                  <span>{skillGroup.category}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {skillGroup.items.length} tools
                  </Badge>
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {skillGroup.items.map((item) => (
                    <Badge key={item} variant="secondary" className="px-2.5 py-1 text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Navigation CTAs */}
        <section className="pt-4 flex flex-wrap gap-4 items-center justify-between border-t border-border">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/projects">
              <FolderGit2 className="w-4 h-4" /> View Projects
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/resume">
              <FileText className="w-4 h-4" /> View Full Resume / CV
            </Link>
          </Button>
        </section>
      </div>
    </PrimaryLayout>
  );
}

