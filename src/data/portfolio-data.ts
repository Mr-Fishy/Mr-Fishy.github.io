export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: "Full-Stack" | "Systems" | "Open Source" | "Tools";
  featured: boolean;
  tags: string[];
  metrics?: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  skills: string[];
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  details?: string;
}

export interface PortfolioData {
  name: string;
  titles: string[];
  tagline: string;
  bio: string;
  location: string;
  email: string;
  socials: {
    github: string;
    linkedin: string;
    email: string;
  };
  skills: {
    category: string;
    items: string[];
  }[];
  experiences: Experience[];
  education: Education[];
  projects: Project[];
}

export const portfolioData: PortfolioData = {
  name: "Evan Fish",
  titles: ["Developer", "System Designer", "Project Manager"],
  tagline:
    "Building resilient software systems, crafting performant web applications, and leading technical projects from concept to delivery.",
  bio: "I'm a full-stack engineer, system designer, and technical project manager passionate about elegant architecture, maintainable software, and delightful user experiences. I bridge the gap between low-level system design, scalable web infrastructure, and high-impact product execution.",
  location: "United States",
  email: "contact@mr-fishy.dev",
  socials: {
    github: "https://github.com/Mr-Fishy",
    linkedin: "https://linkedin.com/in/evan-fish",
    email: "mailto:contact@mr-fishy.dev",
  },
  skills: [
    {
      category: "Frontend Development",
      items: [
        "React",
        "TypeScript",
        "Next.js",
        "TanStack Router & Start",
        "Tailwind CSS",
        "shadcn/ui",
        "Vite",
        "Responsive UI/UX",
      ],
    },
    {
      category: "Backend & Systems",
      items: [
        "Node.js",
        "Go",
        "Python",
        "Distributed Systems",
        "REST & GraphQL APIs",
        "PostgreSQL",
        "Redis",
        "Microservices Architecture",
      ],
    },
    {
      category: "DevOps & Infrastructure",
      items: [
        "Docker",
        "Kubernetes",
        "CI/CD Pipelines",
        "Linux Systems",
        "Cloud Deployment (AWS/GCP)",
        "Terraform",
        "Monitoring & Telemetry",
      ],
    },
    {
      category: "System Design & Leadership",
      items: [
        "Technical Project Management",
        "Domain-Driven Design",
        "Agile & Scrum Delivery",
        "Cross-Functional Leadership",
        "Code Reviews & Mentorship",
      ],
    },
  ],
  experiences: [
    {
      id: "lead-sys-designer",
      role: "Lead Systems Designer & Senior Engineer",
      company: "Apex Systems Architecture",
      location: "Remote",
      period: "2023 – Present",
      description: [
        "Spearheaded the redesign and modularization of core microservices, increasing system throughput by 42% and reducing latency across peak traffic hours.",
        "Architected end-to-end data processing pipelines using distributed queues and cache synchronization patterns.",
        "Mentored cross-functional teams of 8+ engineers across frontend, backend, and site reliability disciplines.",
      ],
      skills: ["System Architecture", "Go", "TypeScript", "Distributed Systems", "Docker", "PostgreSQL"],
    },
    {
      id: "fullstack-pm",
      role: "Full-Stack Engineer & Project Manager",
      company: "Horizon Tech Labs",
      location: "Hybrid",
      period: "2021 – 2023",
      description: [
        "Delivered critical enterprise client portals using React, TypeScript, and modern headless APIs, cutting sprint cycle times by 30%.",
        "Managed agile project lifecycles, translating product roadmaps into technical specifications, tickets, and release milestones.",
        "Introduced automated testing frameworks (Vitest, Playwright) that improved test coverage from 45% to over 85%.",
      ],
      skills: ["React", "Node.js", "Agile PM", "REST APIs", "Vitest", "Tailwind CSS"],
    },
    {
      id: "software-engineer",
      role: "Software Engineer",
      company: "Vanguard Digital",
      location: "On-site",
      period: "2019 – 2021",
      description: [
        "Constructed responsive web interfaces and dashboard modules for data visualization and real-time activity feeds.",
        "Refactored legacy monolith endpoints into high-throughput asynchronous services.",
        "Collaborated with UI/UX designers to implement scalable component libraries and design tokens.",
      ],
      skills: ["JavaScript", "React", "Python", "SQL", "Git", "CSS3"],
    },
  ],
  education: [
    {
      degree: "B.S. in Computer Science",
      institution: "State University",
      period: "2015 – 2019",
      details: "Focus on Distributed Systems, Software Engineering, and Database Design.",
    },
    {
      degree: "Project Management Professional (PMP) / Agile Certification",
      institution: "Project Management Institute",
      period: "2022",
      details: "Specialization in Agile Delivery, Lean Portfolio Management, and Technical Leadership.",
    },
  ],
  projects: [
    {
      id: "distributed-task-orchestrator",
      title: "FlowGrid Orchestrator",
      tagline: "High-concurrency distributed job scheduling and workflow engine",
      description:
        "A resilient, fault-tolerant workflow orchestrator designed to coordinate long-running distributed compute tasks with automatic retries, heartbeat health monitoring, and an interactive real-time observability dashboard.",
      category: "Systems",
      featured: true,
      tags: ["Go", "Distributed Systems", "Redis", "Docker", "gRPC"],
      metrics: "Processes 50K+ tasks/min with sub-10ms scheduling latency",
      githubUrl: "https://github.com/Mr-Fishy",
      liveUrl: "https://github.com/Mr-Fishy",
    },
    {
      id: "tanstack-portfolio",
      title: "Personal Portfolio & Digital Garden",
      tagline: "Ultra-fast modern personal site built with TanStack Start and shadcn/ui",
      description:
        "A responsive, accessible personal portfolio showcasing interactive sticky layouts, dynamic bubble docks, fluid typography, dark-mode tokens, and SSR hydration resilience.",
      category: "Full-Stack",
      featured: true,
      tags: ["React 19", "TanStack Start", "Tailwind CSS v4", "TypeScript", "shadcn/ui"],
      metrics: "100/100 Lighthouse Performance & Accessibility",
      githubUrl: "https://github.com/Mr-Fishy/Mr-Fishy.github.io",
      liveUrl: "https://mr-fishy.github.io",
    },
    {
      id: "schema-validator-tool",
      title: "FastType Schema CLI",
      tagline: "Lightweight schema generator and type validation CLI utility",
      description:
        "A CLI developer tool for generating strict TypeScript type definitions and runtime validation schemas directly from OpenAPI and GraphQL endpoints.",
      category: "Tools",
      featured: true,
      tags: ["TypeScript", "Node.js", "AST", "CLI", "OpenAPI"],
      metrics: "Downloaded 15k+ times with zero runtime dependencies",
      githubUrl: "https://github.com/Mr-Fishy",
    },
    {
      id: "cloud-telemetry-dashboard",
      title: "PulseMetrics Telemetry",
      tagline: "Real-time analytics and telemetry collector for microservice clusters",
      description:
        "An observability dashboard tracking p99 latencies, error budget burn rates, and memory saturation profiles across containerized deployments.",
      category: "Systems",
      featured: false,
      tags: ["Python", "React", "WebSockets", "TimescaleDB", "Tailwind CSS"],
      metrics: "Handles 100K metrics/sec streaming ingestion",
      githubUrl: "https://github.com/Mr-Fishy",
    },
    {
      id: "agile-sprint-lens",
      title: "SprintLens Flow Tracker",
      tagline: "Kanban and velocity analytics tool for engineering managers",
      description:
        "An engineering management tool visualizing team cycle times, work-in-progress bottlenecks, and sprint burndown trends using statistical process control charts.",
      category: "Full-Stack",
      featured: false,
      tags: ["TypeScript", "Next.js", "PostgreSQL", "shadcn/ui", "Recharts"],
      metrics: "Adopted by 4 engineering teams for sprint retrospectives",
      githubUrl: "https://github.com/Mr-Fishy",
      liveUrl: "https://github.com/Mr-Fishy",
    },
    {
      id: "async-pubsub-core",
      title: "HyperBus Pub/Sub",
      tagline: "Lightweight in-memory publish-subscribe library with backpressure",
      description:
        "An open-source concurrent message bus implementing reactive backpressure and priority channels for event-driven architectures.",
      category: "Open Source",
      featured: false,
      tags: ["Go", "Concurrency", "Open Source", "Channels"],
      metrics: "Zero allocation hot-path with 10M msg/s throughput",
      githubUrl: "https://github.com/Mr-Fishy",
    },
  ],
};

