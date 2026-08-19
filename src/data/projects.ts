import type { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "p1",
    slug: "retrieval-eval-harness",
    title: "Retrieval Eval Harness",
    summary: "An open-source framework for benchmarking retrieval pipelines against custom, domain-specific test sets.",
    description:
      "Most retrieval benchmarks don't reflect the messy, domain-specific queries teams actually deal with. This harness lets you define your own gold-answer sets, swap in any retriever or reranker, and get calibrated recall/precision/MRR reports plus qualitative failure clustering — so you can see *why* a pipeline is missing, not just that it is.",
    category: "ai-ml",
    techStack: ["Python", "FastAPI", "PostgreSQL", "pgvector", "Typer"],
    year: "2025",
    role: "Creator & maintainer",
    featured: true,
    githubUrl: "https://github.com/yourusername/retrieval-eval-harness",
    liveUrl: "https://retrieval-eval.example.com",
    highlights: [
      "Adopted by 3 external teams to benchmark internal RAG pipelines",
      "Cut evaluation setup time from ~2 days to under an hour",
      "1.4k+ GitHub stars, 40+ contributors",
    ],
  },
  {
    id: "p2",
    slug: "ledger-personal-finance",
    title: "Ledger",
    summary: "A privacy-first personal finance tracker with local-first storage and plain-text export.",
    description:
      "Built because every finance app wanted bank credentials and a subscription. Ledger runs entirely client-side with an optional end-to-end encrypted sync layer, imports CSV/OFX statements, and auto-categorizes transactions using a small on-device model instead of shipping your data anywhere.",
    category: "web",
    techStack: ["React", "TypeScript", "SQLite (WASM)", "Vite", "Tailwind CSS"],
    year: "2024",
    role: "Solo developer",
    featured: true,
    githubUrl: "https://github.com/yourusername/ledger",
    liveUrl: "https://ledger.example.com",
    highlights: [
      "100% client-side — no account required to use the core app",
      "Auto-categorization model runs in-browser via WASM",
      "Featured in a local-first software newsletter roundup",
    ],
  },
  {
    id: "p3",
    slug: "fieldnotes-api",
    title: "Fieldnotes API",
    summary: "A distributed job-scheduling API for research pipelines, built to survive flaky compute nodes.",
    description:
      "A lightweight orchestration layer for long-running research jobs (data pulls, training runs, eval sweeps) across a small heterogeneous compute cluster. Handles retries, partial-failure recovery, and cost tracking per job without the operational overhead of a full workflow engine.",
    category: "systems",
    techStack: ["Go", "Redis", "PostgreSQL", "Docker", "gRPC"],
    year: "2024",
    role: "Backend lead (team of 3)",
    featured: true,
    githubUrl: "https://github.com/yourusername/fieldnotes-api",
    highlights: [
      "Reduced failed-job recovery time from manual (~hours) to automatic (~seconds)",
      "Processes ~40k jobs/month in production",
      "Designed the retry/backoff and idempotency model from scratch",
    ],
  },
  {
    id: "p4",
    slug: "commute-mobile",
    title: "Commute",
    summary: "A transit companion app that learns your routines instead of asking you to configure them.",
    description:
      "A cross-platform mobile app that quietly learns commute patterns (no manual route setup) and pushes a single relevant notification when your usual route is disrupted — instead of a feed of alerts for routes you don't take.",
    category: "mobile",
    techStack: ["React Native", "Expo", "Node.js", "GraphQL"],
    year: "2023",
    role: "Full-stack developer",
    featured: false,
    githubUrl: "https://github.com/yourusername/commute",
    highlights: [
      "4.7★ average across 900+ ratings before sunset",
      "Reduced notification volume 85% vs. baseline transit apps in user testing",
    ],
  },
  {
    id: "p5",
    slug: "studio-component-kit",
    title: "Studio Component Kit",
    summary: "A themeable, accessible React component library used across three internal product teams.",
    description:
      "A design-token-driven component library built to unify three products that had each grown their own inconsistent UI kit. Focused heavily on accessibility (full keyboard nav, screen-reader tested) and a theming API that lets each product keep its own brand skin.",
    category: "design",
    techStack: ["React", "TypeScript", "Radix UI", "Storybook", "Style Dictionary"],
    year: "2023",
    role: "Design systems engineer",
    featured: false,
    githubUrl: "https://github.com/yourusername/studio-kit",
    liveUrl: "https://studio-kit.example.com",
    highlights: [
      "Adopted across 3 internal products, ~60 components",
      "Cut new-feature UI build time by an estimated 30%",
    ],
  },
  {
    id: "p6",
    slug: "signal-anomaly-detection",
    title: "Signal",
    summary: "Lightweight anomaly detection for time-series infrastructure metrics, tuned to minimize alert fatigue.",
    description:
      "An anomaly detection service that combines seasonal decomposition with a small learned threshold model per metric, designed specifically to reduce false-positive pages compared to static-threshold alerting — the actual problem the on-call team asked me to solve.",
    category: "ai-ml",
    techStack: ["Python", "Kafka", "scikit-learn", "Grafana", "Docker"],
    year: "2022",
    role: "Contributor",
    featured: false,
    githubUrl: "https://github.com/yourusername/signal",
    highlights: [
      "Cut false-positive pages by ~55% in the first month of rollout",
      "Now monitors 200+ production metrics",
    ],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
