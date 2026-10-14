/**
 * routes/interactive/index.tsx
 *
 * Interactive Projects & Subsites Showcase Hub.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Subsite, subsitesList } from "@/interactive/data/subsites";
import PrimaryLayout from "@/layouts/primary-layout";

export const Route = createFileRoute("/interactive/")({
  component: InteractiveHubPage,
});

function InteractiveHubPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = subsitesList.filter((site: Subsite) => {
    const q = searchQuery.toLowerCase();
    return (
      site.title.toLowerCase().includes(q) ||
      site.subtitle.toLowerCase().includes(q) ||
      site.description.toLowerCase().includes(q) ||
      site.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <PrimaryLayout>
      <div className="space-y-10 animate-in fade-in-50 duration-500">
        {/* Header */}
        <div className="space-y-2 border-b border-border pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>Interactive Subsites</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Interactive Projects & Tools
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            A dedicated directory of rich, self-contained interactive subsites,
            engineering solvers, and computational tools translated to
            TypeScript and style-matched to the site.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search interactive projects, solvers, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card/60 backdrop-blur-xs text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Subsites Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((site) => (
            <Card
              key={site.id}
              className="flex flex-col justify-between border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-300 group overflow-hidden bg-card/60 backdrop-blur-xs"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {site.category}
                      </span>
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                        {site.title}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {site.isNew && (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                        New
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="border-primary/30 text-primary"
                    >
                      {site.badge}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm font-medium text-foreground/90">
                  {site.subtitle}
                </p>

                <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {site.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Features checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3.5 rounded-lg bg-muted/40 text-xs">
                  {site.features.map((feat) => (
                    <div
                      key={feat}
                      className="flex items-start gap-2 text-foreground/90"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {site.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[11px] font-normal bg-muted/60 text-muted-foreground"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Added {site.dateAdded}
                </span>
                <Button
                  asChild
                  className="gap-2 group-hover:gap-3 transition-all"
                >
                  <Link to={site.route}>
                    Launch Subsite App <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Directory Architecture Note Card */}
        <Card className="border-dashed border-border bg-muted/20 p-6 text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-foreground">
            Interactive Subsites Architecture
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Subsites reside in{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-foreground">
              src/interactive/[name]/
            </code>{" "}
            with full TypeScript engines and React 19 visualizers, registered in{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-foreground">
              src/interactive/data/subsites.ts
            </code>{" "}
            and exposed under{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-foreground">
              /interactive/[name]
            </code>{" "}
            routes.
          </p>
        </Card>
      </div>
    </PrimaryLayout>
  );
}
