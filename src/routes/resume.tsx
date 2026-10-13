import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  Briefcase,
  Calendar,
  Download,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
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
              Professional history, system design leadership, credentials, and
              achievements.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 print:flex">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />{" "}
                {portfolioData.location}
              </span>
              <a
                href={portfolioData.socials.email}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-primary" />{" "}
                {portfolioData.email}
              </a>
              {portfolioData.phone && (
                <a
                  href={`tel:${portfolioData.phone}`}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-primary" />{" "}
                  {portfolioData.phone}
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print
            </Button>
            {portfolioData.socials.resumePdf && (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a
                  href={portfolioData.socials.resumePdf}
                  download="Evan_Fish_Resume.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </Button>
            )}
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
              Director of IT & Software and Computer Science student at Seattle
              Pacific University with proven leadership across technical
              operations, cross-platform enterprise software workflows
              (Salesforce, QuickBooks, Jetbuilt, Microsoft SharePoint),
              cybersecurity policy, and systems optimization. Strong foundations
              in systems programming (C++, Python, TypeScript, Rust, Go),
              algorithmic analysis, and collaborative student mentorship.
            </p>
          </CardContent>
        </Card>

        {/* Relevant Experience Timeline */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">
              Relevant Experience
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

        {/* Leadership & Involvement */}
        {portfolioData.leadership && portfolioData.leadership.length > 0 && (
          <>
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">
                  Leadership
                </h2>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:left-3 sm:before:left-4 before:w-0.5 before:bg-border/60">
                {portfolioData.leadership.map((lead) => (
                  <div
                    key={lead.id}
                    className="relative pl-8 sm:pl-10 space-y-3"
                  >
                    <div className="absolute left-1.5 sm:left-2.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-primary bg-background ring-4 ring-background" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          {lead.role}
                        </h3>
                        <p className="text-sm font-semibold text-primary">
                          {lead.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {lead.period}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {lead.location}
                        </span>
                      </div>
                    </div>

                    <ul className="list-disc list-outside ml-4 space-y-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {lead.description.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {lead.skills.map((skill) => (
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
          </>
        )}

        {/* Education */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Education</h2>
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

        {/* Qualifications / Competencies Matrix */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">
            Qualifications & Core Competencies
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <span className="font-bold text-sm block">Programming</span>
              <span className="text-xs text-muted-foreground">
                C++, Python, TypeScript, Rust, Go, HTML/CSS, Visual Basic
              </span>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <span className="font-bold text-sm block">Systems Design</span>
              <span className="text-xs text-muted-foreground">
                System Design, Optimization, Embedded Telemetry, Distributed
                APIs
              </span>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <span className="font-bold text-sm block">Platforms</span>
              <span className="text-xs text-muted-foreground">
                Microsoft 365, SharePoint, Salesforce, QuickBooks, Jetbuilt
              </span>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/60">
              <span className="font-bold text-sm block">
                Policy & Leadership
              </span>
              <span className="text-xs text-muted-foreground">
                Cybersecurity Policies, Technical Docs, Financial Governance
              </span>
            </div>
          </div>
        </section>
      </div>
    </PrimaryLayout>
  );
}
