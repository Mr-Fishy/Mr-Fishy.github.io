import { createFileRoute } from "@tanstack/react-router";
import {
  ExternalLink,
  FolderGit2,
  Github,
  Search,
  Sparkles,
  Terminal,
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
import { portfolioData, type Project } from "@/data/portfolio-data";
import PrimaryLayout from "@/layouts/primary-layout";

export const Route = createFileRoute("/projects")({ component: ProjectsPage });

function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["all", "Systems", "Full-Stack", "Tools", "Open Source"];

  const filteredProjects = portfolioData.projects.filter((project: Project) => {
    const matchesCategory =
      selectedCategory === "all" || project.category === selectedCategory;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <PrimaryLayout>
      <div className="space-y-10 animate-in fade-in-50 duration-500">
        {/* Header */}
        <div className="space-y-2 border-b border-border pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>Portfolio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Featured Projects & Engineering Work
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            A curated showcase of distributed architectures, high-performance
            web applications, developer utilities, and open-source packages.
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
                  {cat === "all" ? "All Projects" : cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by tech or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-input bg-background text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 space-y-3 rounded-xl border border-dashed border-border bg-card/30">
            <FolderGit2 className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-base font-medium text-foreground">
              No projects found
            </p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your category filter or search keywords.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project: Project) => (
              <Card
                key={project.id}
                className="flex flex-col justify-between hover:shadow-lg transition-all duration-200 border-border/80"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{project.category}</Badge>
                      {project.featured && (
                        <Badge
                          variant="default"
                          className="gap-1 text-[10px] py-0"
                        >
                          <Sparkles className="w-3 h-3" /> Featured
                        </Badge>
                      )}
                    </div>
                    <Terminal className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm font-medium text-foreground/80">
                    {project.tagline}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>

                  {project.metrics && (
                    <div className="px-3 py-2 rounded-md bg-muted/50 text-xs font-medium text-foreground/90 border border-border/40">
                      ⚡ {project.metrics}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Github className="w-4 h-4" /> Code
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" /> Live Demo
                      </a>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Footer Collaboration Call */}
        <div className="rounded-xl border border-border bg-card/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-lg">Have a project in mind?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              I am open to consulting, architectural review, and select
              engineering leadership roles.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 rounded-full">
            <a href={portfolioData.socials.email}>Start a Conversation</a>
          </Button>
        </div>
      </div>
    </PrimaryLayout>
  );
}
