import type { NavItem, SocialLink, Stat } from "@/types";

export const profile = {
  name: "Pratik Wakchaure",
  fullName: "Pratik Wakchaure",
  initials: "PW",
  role: "Software Engineer & AI/ML Researcher",
  tagline:
    "I design and ship intelligent software — from research prototypes to production systems that hold up under real traffic.",
  longBio: [
    "I'm a software engineer with a research habit. Most of my time is split between building product — APIs, interfaces, distributed systems — and working on applied machine learning, mostly around retrieval, reasoning, and evaluation.",
    "I care about software that stays legible as it grows: clear boundaries, tests that mean something, and interfaces that don't make the next person guess. That instinct comes from research as much as engineering — a good experiment and a good system both need a hypothesis you can falsify.",
    "Outside of work I mentor early-career engineers, contribute to open-source tooling, and am slowly working through a personal list of 'systems I want to understand from first principles.' Currently: query planners and transformer internals.",
  ],
  email: "pratik@example.com",
  phone: "+91 98765 43210",
  location: "Bengaluru, India",
  availability: "Open to select freelance & full-time roles",
  yearsExperience: "4",
  resumeUrl: "/resume.pdf",
  avatarUrl: "",
};

export const socialLinks: SocialLink[] = [
  { label: "GitHub", url: "https://github.com/pratik", icon: "github" },
  { label: "LinkedIn", url: "https://linkedin.com/in/pratik", icon: "linkedin" },
  { label: "X / Twitter", url: "https://x.com/pratik", icon: "twitter" },
  { label: "Google Scholar", url: "https://scholar.google.com/citations?user=pratik", icon: "scholar" },
  { label: "Email", url: "mailto:pratik@example.com", icon: "mail" },
];

export const navItems: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "About", path: "/#about" },
  { label: "Projects", path: "/#projects" },
  { label: "Achievements", path: "/#achievements" },
  { label: "Contact", path: "/#contact" },
  { label: "Resume", path: "/#resume" },
];

export const heroStats: Stat[] = [
  { label: "Years building software", value: "4" },
  { label: "Shipped products", value: "12" },
  { label: "Published papers", value: "3" },
  { label: "Open-source stars", value: "1.8", suffix: "k" },
];

export const focusAreas = [
  {
    title: "Product engineering",
    description:
      "Full-stack systems — from schema design to the last 10% of UI polish that makes something feel finished.",
  },
  {
    title: "Applied ML research",
    description:
      "Retrieval, reasoning, and the unglamorous data work that decides whether a model is actually useful.",
  },
  {
    title: "Systems & infrastructure",
    description:
      "APIs and pipelines built to be debugged at 2am by someone who isn't me — logging, boundaries, and clear failure modes.",
  },
];

export const funFacts = [
  { label: "Currently reading", value: "Designing Data-Intensive Applications (again)" },
  { label: "Daily driver", value: "Neovim, tmux, way too many terminal tabs" },
  { label: "Off-screen", value: "Bouldering, filter coffee, long-distance running" },
  { label: "Next to learn", value: "Rust, properly this time" },
];
