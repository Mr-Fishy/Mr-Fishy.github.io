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

export interface CourseworkMedia {
  type: "image" | "gif" | "video";
  url: string;
  caption?: string;
  alt?: string;
}

export interface CourseworkDeliverable {
  label: string;
  url: string;
  type: "github" | "pdf" | "demo" | "report" | "external";
}

export interface CourseworkProject {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  quarter: string; // e.g. "Winter 2025", "Autumn 2024"
  tagline: string;
  description: string;
  longDescription?: string[];
  category: "Computer Science" | "Interactive Art" | "Mathematics" | "Systems & Engineering";
  featured?: boolean;
  tags: string[];
  deliverables: CourseworkDeliverable[];
  media?: CourseworkMedia[];
  keyOutcomes?: string[];
}

export interface PortfolioData {
  name: string;
  titles: string[];
  tagline: string;
  bio: string;
  location: string;
  email: string;
  phone?: string;
  socials: {
    github: string;
    linkedin: string;
    email: string;
    resumePdf?: string;
  };
  skills: {
    category: string;
    items: string[];
  }[];
  experiences: Experience[];
  leadership: Experience[];
  education: Education[];
  projects: Project[];
  coursework: CourseworkProject[];
}

export const portfolioData: PortfolioData = {
  name: "Evan Fish",
  titles: [
    "Director of IT & Software",
    "System Designer",
    "Developer",
  ],
  tagline:
    "Designing resilient software architectures, streamlining enterprise workflows, and building high-performance systems from embedded devices to the edge.",
  bio: "I'm a computer science researcher, system designer, and IT director based in Seattle, WA. Currently serving as Director of IT & Software at Garrett Integrated Systems, I lead company-wide process modernization across multiple locations, architect custom software integrations, and design secure, scalable digital infrastructure.",
  location: "Seattle, WA 98119",
  email: "fishe1@spu.edu",
  phone: "360-818-1434",
  socials: {
    github: "https://github.com/Mr-Fishy",
    linkedin: "https://linkedin.com/in/evan-fish",
    email: "mailto:fishe1@spu.edu",
    resumePdf: "/Evan_Fish_2026_September.pdf",
  },
  skills: [
    {
      category: "Programming Languages",
      items: [
        "C++",
        "Python",
        "TypeScript",
        "Rust",
        "Go",
        "HTML",
        "JavaScript",
        "CSS",
        "Visual Basic",
      ],
    },
    {
      category: "Systems & Architecture",
      items: [
        "System Design",
        "System Optimization",
        "Technical Documentation",
        "Technical Policy",
        "Cybersecurity Policies",
        "Embedded Systems",
      ],
    },
    {
      category: "Platforms & Enterprise Tools",
      items: [
        "Microsoft 365",
        "Microsoft SharePoint",
        "Microsoft Forms",
        "Salesforce",
        "QuickBooks",
        "Jetbuilt",
      ],
    },
    {
      category: "Web & Edge Technologies",
      items: [
        "React 19",
        "TanStack Start",
        "Cloudflare Workers",
        "Tailwind CSS v4",
        "Vite",
        "REST APIs",
      ],
    },
  ],
  experiences: [
    {
      id: "director-it-gis",
      role: "Director of IT & Software",
      company: "Garrett Integrated Systems",
      location: "Remote, Seattle, WA",
      period: "June 2026 - Present",
      description: [
        "Led company-wide process development across 3 locations.",
        "Designed and implemented software workflows across Salesforce, Jetbuilt, QuickBooks, and Microsoft SharePoint.",
        "Developed cybersecurity policies, training, and enforcement for employees.",
        "Consulted with C-level leadership to drive technological improvements and innovation.",
      ],
      skills: [
        "Salesforce",
        "Jetbuilt",
        "QuickBooks",
        "Microsoft SharePoint",
        "Cybersecurity Policy",
        "System Design",
      ],
    },
    {
      id: "it-intern-gis",
      role: "IT & Software Intern",
      company: "Garrett Integrated Systems",
      location: "Remote, Seattle, WA",
      period: "August 2025 - June 2026",
      description: [
        "Provided software analysis reports to leadership for company workflow alignment, sustainability, and customizability.",
        "Supported and implemented tools to transfer company data across software systems.",
      ],
      skills: [
        "Workflow Optimization",
        "Data Migration",
        "Systems Analysis",
        "Software Integration",
      ],
    },
    {
      id: "spu-leadership-assistant",
      role: "Leadership & Involvement Office Assistant",
      company: "Seattle Pacific University",
      location: "Seattle, WA",
      period: "October 2025 - June 2026",
      description: [
        "Supported building operations and student experience.",
        "Improved financial policy for 35+ student clubs and developed new forms for position applications, event and budget requests, and voting systems in Microsoft Forms.",
      ],
      skills: [
        "Microsoft Forms",
        "Microsoft 365",
        "Financial Policy",
        "Operations",
      ],
    },
    {
      id: "spu-cs-tutor",
      role: "Computer Science Tutor",
      company: "Seattle Pacific University",
      location: "Seattle, WA",
      period: "August 2024 - December 2024",
      description: [
        "Assisted in the learning and development of 100+ students within computer science courses.",
        "Provided code feedback, debugging help, and system design assistance, focusing on student growth over providing direct answers.",
      ],
      skills: [
        "C++",
        "Python",
        "Debugging",
        "System Design",
        "Code Reviews & Mentorship",
      ],
    },
    {
      id: "technical-designer-nsc",
      role: "Technical Designer",
      company: "National Sign Corporation",
      location: "Hybrid, Seattle, WA",
      period: "November 2022 - September 2024",
      description: [
        "Drafted production drawings for in-house and sub-contracted manufacturing.",
        "Assisted in the development of BoM tracking standards and company drawing templates.",
        "Developed tools for Corel Draw to improve designer workflow.",
      ],
      skills: [
        "Visual Basic",
        "CorelDraw Automation",
        "Production Drafting",
        "BoM Tracking Standards",
      ],
    },
  ],
  leadership: [
    {
      id: "assp-officer-finance",
      role: "ASSP Officer of Finance",
      company: "Associated Students of Seattle Pacific [University]",
      location: "Seattle, WA",
      period: "May 2026 - Present",
      description: [
        "Led in financial policy development and improvement, club leadership training, and proposal processes.",
        "Led committees discussing budget requests as well as departmental budget allocations.",
      ],
      skills: [
        "Financial Policy",
        "Budget Allocation",
        "Committee Leadership",
        "Governance",
      ],
    },
    {
      id: "director-business-baja",
      role: "Director of Business",
      company: "Falcon Racing, Seattle Pacific University Baja SAE",
      location: "Seattle, WA",
      period: "May 2025 - June 2026",
      description: [
        "Developed role responsibilities, sponsor relationships, media practices, and university relations.",
      ],
      skills: [
        "Sponsor Relationships",
        "Business Strategy",
        "Media Practices",
        "University Relations",
      ],
    },
  ],
  education: [
    {
      degree: "Bachelor of Science, Computer Science",
      institution: "Seattle Pacific University",
      period: "Expected June 2027",
      details: "Minor in Interactive Computing and Art • Seattle, WA",
    },
  ],
  projects: [
    {
      id: "falcon-racing-baja",
      title: "Falcon Racing SAE Embedded Telemetry",
      tagline:
        "Vehicle telemetry and embedded sensor integration for Baja SAE racing vehicle.",
      description:
        "Designed and led development of an embedded sensor monitoring system on a Baja SAE off-road race car to capture engine RPM, CVT temperature, and vital vehicle electrical interfaces under racing conditions.",
      category: "Systems",
      featured: true,
      tags: ["C++", "Embedded Systems", "Hardware Sensors", "CAN Bus"],
      metrics: "Real-time telemetry on custom racing chassis",
      githubUrl: "https://github.com/uniqueident/Baja-2025",
    },
    {
      id: "fr-math",
      title: "Falcon Racing Drivetrain Tool (fr-math)",
      tagline:
        "High-precision race drivetrain analysis suite with interactive Canvas visualizers.",
      description:
        "Complete interactive mechanical engineering subsite evaluating AGMA 2001-D04 gear ratings with involute mesh rendering, two-support beam solver with synchronized 4-panel scrubber diagrams, ISO 281 rolling bearing life curves, 4-bar crank-rocker kinematics, and multi-stage ratio optimization.",
      category: "Tools",
      featured: true,
      tags: [
        "TypeScript",
        "React 19",
        "HTML5 Canvas",
        "AGMA 2001-D04",
        "ISO 281",
        "Kinematics",
      ],
      metrics: "Live interactive subsite tool",
      liveUrl: "/interactive/fr-math",
    },
    {
      id: "portfolio-worker",
      title: "evanjfish.app Portfolio",
      tagline:
        "Server-rendered edge application deployed on Cloudflare Workers.",
      description:
        "Modern, performant personal portfolio application built with TanStack Start, React 19, and Tailwind CSS v4. Pre-configured and compiled for Cloudflare Workers edge runtime serving evanjfish.app with instant load times.",
      category: "Full-Stack",
      featured: true,
      tags: [
        "TanStack Start",
        "React 19",
        "Cloudflare Workers",
        "TypeScript",
        "Tailwind CSS",
      ],
      metrics: "Edge SSR on Cloudflare Workers",
      githubUrl: "https://github.com/Mr-Fishy/Mr-Fishy.github.io",
      liveUrl: "https://evanjfish.app",
    },
    {
      id: "coreldraw-automation",
      title: "CorelDraw Automation & BoM Tools",
      tagline:
        "Custom workflow acceleration tools and BoM automation for technical manufacturing.",
      description:
        "Developed internal toolsets for Corel Draw utilizing Visual Basic scripts to automate drafting workflows, establish drawing templates, and standardize Bill of Materials (BoM) tracking.",
      category: "Tools",
      featured: true,
      tags: [
        "Visual Basic",
        "CorelDraw",
        "Workflow Automation",
        "BoM Tracking",
      ],
      metrics: "Improved manufacturing drafting turnaround",
    },
    {
      id: "ocean-engine",
      title: "Ocean Game Engine",
      tagline:
        "Exploration of low-level graphics and systems game engine architecture.",
      description:
        "Collaborative systems programming project exploring core game engine architecture concepts, graphics rendering pipelines, entity-component systems, and low-level resource management.",
      category: "Systems",
      featured: false,
      tags: ["C++", "Systems Architecture", "Game Engine", "OpenGL"]
    },
  ],
  coursework: [
    {
      id: "greedy-task-scheduling",
      title: "Unit-Time Greedy Task Scheduling",
      courseCode: "CSC 3430",
      courseName: "Algorithm Design & Analysis",
      quarter: "Autumn 2025",
      tagline:
        "Algorithmic optimization for task scheduling with deadlines and penalties.",
      description:
        "Design and implementation of an optimal greedy algorithm for unit-time task scheduling with deadlines and penalties using disjoint-set (union-find) data structures.",
      longDescription: [
        "Analyzed the matroids property underlying unit-time task scheduling with penalties to prove greedy choice optimality.",
        "Engineered disjoint-set tree structures with path compression to achieve nearly linear time complexity for slot finding.",
        "Validated empirical runtime against asymptotic theoretical bounds across extensive synthetic test workloads.",
      ],
      category: "Computer Science",
      featured: true,
      tags: ["Python", "Algorithms", "Greedy Heuristics", "Disjoint Sets", "Complexity Analysis"],
      deliverables: [
        {
          label: "GitHub Repository",
          url: "https://github.com/Mr-Fishy/greedy-task-scheduling",
          type: "github",
        },
      ],
      keyOutcomes: [
        "Proven greedy matroid optimality proof",
        "Disjoint-set slot allocation in near-linear time",
      ],
    },
    {
      id: "fft-polynomial-mult",
      title: "FFT Divide-and-Conquer Multiplication",
      courseCode: "CSC 3430",
      courseName: "Algorithm Design & Analysis",
      quarter: "Autumn 2025",
      tagline:
        "High-performance polynomial multiplication using Fast Fourier Transform.",
      description:
        "Divide-and-conquer implementation of polynomial multiplication utilizing the Fast Fourier Transform (FFT) algorithm, achieving O(n log n) asymptotic running time.",
      longDescription: [
        "Implemented recursive and iterative Cooley-Tukey Radix-2 Fast Fourier Transform for complex point-value evaluations.",
        "Reduced polynomial convolution from naive O(n²) to optimal O(n log n) asymptotic running time.",
        "Benchmarked numerical accuracy and floating-point stability across large coefficient degrees.",
      ],
      category: "Computer Science",
      featured: true,
      tags: ["C++", "Python", "Algorithms", "FFT", "Signal Processing", "Discrete Math"],
      deliverables: [
        {
          label: "GitHub Repository",
          url: "https://github.com/Mr-Fishy/fft-polynomial-multiplication",
          type: "github",
        },
      ],
      keyOutcomes: [
        "O(n log n) divide-and-conquer implementation",
        "Comparative benchmark against schoolbook multiplication",
      ],
    },
    {
      id: "time-line-motion",
      title: "Expressive Line in Motion",
      courseCode: "ART 1107",
      courseName: "Time",
      quarter: "Fall 2026",
      tagline:
        "Expressing the psychological arc of Catharsis through hand-drawn line weight and digital animation.",
      description:
        "Sequential hand-drawn animation project translated and refined in Adobe Photoshop into black & white and chromatic looped GIFs, exploring how line velocity, weight, and texture can evoke an emotion or state of being.",
      longDescription: [
        "Constructed sequential stages of hand drawings exploring emotional tension, continuity, and kinetic rhythm around the theme of Catharsis.",
        "Digitized, aligned, and cleaned physical drawings in Adobe Photoshop to establish crisp frames.",
        "Assembled and timed looping GIF sequences across both monochromatic and colorized textures.",
      ],
      category: "Interactive Art",
      featured: true,
      tags: ["Digital Animation", "Catharsis", "Photoshop", "Hand Drawing", "Sequential Art"],
      deliverables: [
        {
          label: "View Project & Animations",
          url: "/coursework/time/expressive-line",
          type: "demo",
        },
      ],
      media: [
        {
          type: "gif",
          url: "/Image-Sequence-Color.gif",
          caption: "Colorized & Textured Expressive Line Animation",
          alt: "Color animation sequence",
        },
      ],
      keyOutcomes: [
        "12-30 stage refined sequential hand drawings",
        "High-contrast monochromatic base GIF and colorized GIF",
        "Understanding of line weight, motion pacing, and emotional resonance",
      ],
    },
  ],
};
