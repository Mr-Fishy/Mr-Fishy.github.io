import { createFileRoute } from "@tanstack/react-router";
import {
  Briefcase,
  Calendar,
  GraduationCap,
  Mail,
  MapPin,
  Printer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { portfolioData } from "@/data/portfolio-data";
import PrimaryLayout from "@/layouts/primary-layout";

export const Route = createFileRoute("/resume")({ component: ResumePage });

function ResumePage() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <PrimaryLayout>
      <div className="space-y-12 animate-in fade-in-50 duration-500">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <span>Curriculum Vitae</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Resume & Experience
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Detailed professional history, system architecture leadership, and
              credentials.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2 cursor-pointer print:hidden"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </Button>
            <Button asChild size="sm" className="gap-2">
              <a href={portfolioData.socials.email}>
                <Mail className="w-4 h-4" /> Contact
              </a>
            </Button>
          </div>
        </div>

        {/* Executive Summary Card */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
            <p>
              Results-driven Senior Engineer, System Designer, and Project
              Manager with expertise in high-concurrency distributed backends,
              resilient cloud architecture, and modern full-stack web
              applications. Proven track record of spearheading technical
              roadmaps, reducing cycle latency, and fostering healthy,
              high-performing engineering cultures.
            </p>
          </CardContent>
        </Card>

        {/* Experience Timeline */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">
              Professional Experience
            </h2>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-3 sm:before:left-4 before:w-0.5 before:bg-border/60">
            {portfolioData.experiences.map((exp) => (
              <div key={exp.id} className="relative pl-8 sm:pl-10 space-y-3">
                {/* Timeline node */}
                <div className="absolute left-1.5 sm:left-2.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-primary bg-background ring-4 ring-background" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {exp.role}
                    </h3>
                    <p className="text-sm font-semibold text-primary">
                      {exp.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {exp.period}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {exp.location}
                    </span>
                  </div>
                </div>

                <ul className="list-disc list-outside ml-4 space-y-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {exp.description.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exp.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-[11px] px-2 py-0.5"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Education & Certifications */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">
              Education & Certifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolioData.education.map((edu) => (
              <Card key={edu.degree}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base">{edu.degree}</CardTitle>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {edu.period}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {edu.institution}
                  </p>
                </CardHeader>
                {edu.details && (
                  <CardContent className="text-xs sm:text-sm text-muted-foreground">
                    {edu.details}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Core Competencies Matrix */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">
            Key Competencies Matrix
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <span className="font-bold text-sm block">Architecture</span>
              <span className="text-xs text-muted-foreground">
                Distributed Systems, Event-Driven, Microservices
              </span>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <span className="font-bold text-sm block">Frontend</span>
              <span className="text-xs text-muted-foreground">
                React, TypeScript, TanStack, Tailwind
              </span>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <span className="font-bold text-sm block">Backend</span>
              <span className="text-xs text-muted-foreground">
                Go, Node.js, Python, SQL, Redis
              </span>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <span className="font-bold text-sm block">Leadership</span>
              <span className="text-xs text-muted-foreground">
                Agile Delivery, Roadmap Alignment, Mentorship
              </span>
            </div>
          </div>
        </section>
      </div>
    </PrimaryLayout>
  );
}
