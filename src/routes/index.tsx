import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Code,
  Cpu,
  ExternalLink,
  FileText,
  FolderGit2,
  Layers,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { portfolioData } from "@/data/portfolio-data";
import PrimaryLayout from "@/layouts/primary-layout";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const featuredProjects = portfolioData.projects.filter((p) => p.featured);

  return (
    <PrimaryLayout>
      <div className="space-y-16 animate-in fade-in-50 duration-500">
        {/* Hero Section */}
        <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 pt-4 sm:pt-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Available for engineering & architecture leadership</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
              Hi, I'm{" "}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-emerald-400">
                {portfolioData.name}
              </span>
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-muted-foreground font-medium text-lg sm:text-xl">
              {portfolioData.titles.map((title, i) => (
                <span key={title} className="flex items-center gap-2">
                  {title}
                  {i < portfolioData.titles.length - 1 && <span>•</span>}
                </span>
              ))}
            </div>

            <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
              {portfolioData.tagline}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <Button asChild size="lg" className="rounded-full shadow-md">
                <Link to="/projects">
                  Explore Projects <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full"
              >
                <Link to="/resume">
                  <FileText className="w-4 h-4 mr-1" /> View CV / Resume
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative p-2 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/20 to-transparent border border-border shadow-xl">
              <Avatar className="w-36 h-36 sm:w-48 sm:h-48 rounded-full border-4 border-background">
                <AvatarImage src="/logo512.png" alt={portfolioData.name} />
                <AvatarFallback className="text-3xl font-bold">
                  EF
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </section>

        {/* Core Pillars / Specialties */}
        <section className="space-y-6">
          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              What I Do
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Bringing holistic technical leadership from design through
              execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="transition-all hover:shadow-md hover:-translate-y-1 duration-200">
              <CardHeader className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Code className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl">
                  Full-Stack Development
                </CardTitle>
                <CardDescription>
                  Crafting accessible, reactive web applications with
                  TypeScript, React, and modern full-stack frameworks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">TanStack</Badge>
                  <Badge variant="secondary">Tailwind</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-md hover:-translate-y-1 duration-200">
              <CardHeader className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl">System Design</CardTitle>
                <CardDescription>
                  Architecting resilient distributed microservices, messaging
                  pipelines, and scalable database schemas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">Go</Badge>
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">PostgreSQL</Badge>
                  <Badge variant="secondary">Redis</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-md hover:-translate-y-1 duration-200">
              <CardHeader className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl">Project Management</CardTitle>
                <CardDescription>
                  Directing engineering delivery, aligning technical debt with
                  business velocity, and coaching agile teams.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">Agile & Scrum</Badge>
                  <Badge variant="secondary">Roadmapping</Badge>
                  <Badge variant="secondary">Mentorship</Badge>
                  <Badge variant="secondary">CI/CD</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Featured Work
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Selected systems, full-stack apps, and open-source
                contributions.
              </p>
            </div>
            <Button asChild variant="ghost" className="gap-1 group max-w-fit">
              <Link to="/projects">
                All Projects{" "}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <Card
                key={project.id}
                className="flex flex-col justify-between hover:shadow-lg transition-all duration-200"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{project.category}</Badge>
                    <FolderGit2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.tagline}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px] px-2 py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t flex justify-between items-center text-xs">
                  {project.metrics && (
                    <span className="text-muted-foreground font-medium truncate max-w-[180px]">
                      {project.metrics}
                    </span>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      Code <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Contact Banner */}
        <section className="rounded-2xl border border-border bg-gradient-to-r from-card via-muted/40 to-card p-8 text-center space-y-4 shadow-sm">
          <h3 className="text-2xl font-bold tracking-tight">
            Let's build something extraordinary
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Whether you have a question, want to collaborate on architecture, or
            discuss high-impact opportunities, my inbox is always open.
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="rounded-full shadow">
              <a href={portfolioData.socials.email}>Get In Touch</a>
            </Button>
          </div>
        </section>
      </div>
    </PrimaryLayout>
  );
}
