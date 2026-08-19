import type { SkillGroup } from "@/types";

export const skillGroups: SkillGroup[] = [
  {
    id: "languages",
    category: "Languages",
    description: "What I reach for depends on the problem — these are the ones I'm fluent in.",
    skills: [
      { name: "TypeScript", level: 95 },
      { name: "Python", level: 92 },
      { name: "Go", level: 78 },
      { name: "SQL", level: 88 },
      { name: "Rust", level: 45 },
    ],
  },
  {
    id: "frontend",
    category: "Frontend & UI",
    description: "Building interfaces that stay maintainable as products grow.",
    skills: [
      { name: "React", level: 94 },
      { name: "Next.js", level: 85 },
      { name: "Tailwind CSS", level: 92 },
      { name: "Framer Motion", level: 75 },
      { name: "Accessibility (WCAG)", level: 80 },
    ],
  },
  {
    id: "backend",
    category: "Backend & Data",
    description: "APIs, schemas, and the boring infrastructure that makes everything else possible.",
    skills: [
      { name: "Node.js", level: 90 },
      { name: "PostgreSQL", level: 87 },
      { name: "FastAPI", level: 84 },
      { name: "Redis", level: 79 },
      { name: "gRPC", level: 70 },
    ],
  },
  {
    id: "ai-ml",
    category: "AI / ML",
    description: "Applied ML — mostly retrieval, evaluation, and the data work in between.",
    skills: [
      { name: "PyTorch", level: 82 },
      { name: "scikit-learn", level: 85 },
      { name: "Retrieval / RAG systems", level: 90 },
      { name: "LangChain / LlamaIndex", level: 76 },
      { name: "Vector databases", level: 83 },
    ],
  },
  {
    id: "infra",
    category: "Tools & Infrastructure",
    description: "Everything it takes to get code from a laptop to production, reliably.",
    skills: [
      { name: "Docker", level: 88 },
      { name: "AWS", level: 81 },
      { name: "CI/CD (GitHub Actions)", level: 86 },
      { name: "Terraform", level: 68 },
      { name: "Kubernetes", level: 60 },
    ],
  },
  {
    id: "practice",
    category: "Ways of Working",
    description: "The less quantifiable half of the job.",
    skills: [
      { name: "System design", level: 90 },
      { name: "Technical writing", level: 88 },
      { name: "Mentoring", level: 85 },
      { name: "Cross-functional collaboration", level: 87 },
    ],
  },
];
