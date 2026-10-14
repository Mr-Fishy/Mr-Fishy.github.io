import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  FolderGit2,
  GraduationCap,
  Image as ImageIcon,
  Palette,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type CourseworkDeliverable,
  type CourseworkProject,
  portfolioData,
} from "@/data/portfolio-data";
import PrimaryLayout from "@/layouts/primary-layout";

export const Route = createFileRoute("/coursework/")({
  component: CourseworkPage,
});

function DeliverableIcon({ type }: { type: CourseworkDeliverable["type"] }) {
  switch (type) {
    case "github":
      return <FolderGit2 className="w-3.5 h-3.5" />;
    case "pdf":
    case "report":
      return <FileText className="w-3.5 h-3.5" />;
    case "demo":
      return <ExternalLink className="w-3.5 h-3.5" />;
    default:
      return <ExternalLink className="w-3.5 h-3.5" />;
  }
}

function CourseworkPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    "all",
    "Computer Science",
    "Interactive Art",
    "Mathematics",
    "Systems & Engineering",
  ];

  const courseworkList = portfolioData.coursework || [];

  const filteredWork = courseworkList.filter((item: CourseworkProject) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <PrimaryLayout>
      <div className="space-y-10 animate-in fade-in-50 duration-500">
        {/* Header */}
        <div className="space-y-3 border-b border-border pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Projects & Class Submissions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Academic Coursework & Class Works
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
            Projects, algorithm implementations, creative computing installations,
            and research reports completed for class credit at Seattle Pacific
            University. Published here for public viewing and academic archive.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full sm:w-auto"
          >
            <TabsList className="flex flex-wrap h-auto p-1 bg-muted/60">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="capitalize text-xs sm:text-sm"
                >
                  {cat === "all" ? "All Coursework" : cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by course, tag, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-input bg-background text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Coursework List / Grid */}
        {filteredWork.length === 0 ? (
          <div className="text-center py-16 space-y-3 rounded-xl border border-dashed border-border bg-card/30">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-base font-medium text-foreground">
              No coursework items found
            </p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your category filter or search terms.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredWork.map((project) => (
              <Card
                key={project.id}
                className="flex flex-col justify-between border-border/70 hover:border-border transition-all duration-300 hover:shadow-lg bg-card/40 backdrop-blur-xs"
              >
                <div>
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="font-mono text-[11px] font-semibold tracking-wide"
                        >
                          {project.courseCode}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {project.courseName}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[11px] font-normal text-muted-foreground"
                      >
                        {project.quarter}
                      </Badge>
                    </div>

                    <div>
                      <CardTitle className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm font-medium text-primary/90 mt-1">
                        {project.tagline}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 text-xs sm:text-sm text-muted-foreground">
                    <p className="leading-relaxed">{project.description}</p>

                    {/* Media / Previews (if any) */}
                    {project.media && project.media.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {project.media.map((med, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg overflow-hidden border border-border bg-muted/30"
                          >
                            <img
                              src={med.url}
                              alt={med.alt || project.title}
                              className="w-full h-auto object-cover max-h-56"
                            />
                            {med.caption && (
                              <p className="text-[11px] text-muted-foreground p-2 italic bg-muted/20 border-t border-border/40">
                                {med.caption}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Extended highlights / Key Outcomes */}
                    {project.longDescription && project.longDescription.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border/40">
                        <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                          Technical & Methodological Scope:
                        </span>
                        <ul className="space-y-1 text-xs">
                          {project.longDescription.map((desc, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{desc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {project.keyOutcomes && project.keyOutcomes.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                          Key Deliverables:
                        </span>
                        <ul className="space-y-1 text-xs">
                          {project.keyOutcomes.map((outcome, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] bg-secondary/60 text-secondary-foreground font-normal"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </div>

                {/* Card Footer with Deliverables Links */}
                <CardFooter className="pt-4 border-t border-border/50 flex flex-wrap gap-2 justify-between items-center bg-card/20">
                  <div className="flex flex-wrap items-center gap-2">
                    {project.deliverables.map((deliv, idx) => {
                      const isInternal = deliv.url.startsWith("/");
                      return (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-xs h-8 gap-1.5"
                        >
                          {isInternal ? (
                            <Link to={deliv.url}>
                              <DeliverableIcon type={deliv.type} />
                              {deliv.label}
                            </Link>
                          ) : (
                            <a
                              href={deliv.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <DeliverableIcon type={deliv.type} />
                              {deliv.label}
                            </a>
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  <span className="text-[11px] text-muted-foreground font-mono">
                    {project.category}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PrimaryLayout>
  );
}
