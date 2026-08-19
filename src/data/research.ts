import type { ResearchItem } from "@/types";

export const researchItems: ResearchItem[] = [
  {
    id: "r1",
    title: "Calibrated Recall: Rethinking Evaluation for Domain-Specific Retrieval",
    authors: ["Alex Morgan", "P. Nakamura", "S. Okafor"],
    venue: "Workshop on Applied Information Retrieval (submitted)",
    date: "2026",
    status: "in-review",
    abstract:
      "Standard IR benchmarks assume query distributions that rarely match production traffic. We propose a calibration procedure that reweights standard recall/MRR metrics using a small sample of real, in-domain queries, and show it better predicts downstream RAG answer quality than uncalibrated benchmarks across four case-study domains.",
    tags: ["information retrieval", "evaluation", "RAG"],
    paperUrl: "#",
    codeUrl: "https://github.com/yourusername/retrieval-eval-harness",
  },
  {
    id: "r2",
    title: "Failure Clustering for Retrieval-Augmented Systems",
    authors: ["Alex Morgan", "L. Fischer"],
    venue: "arXiv preprint",
    date: "2025",
    status: "preprint",
    abstract:
      "We introduce an unsupervised method for grouping RAG failure cases into interpretable clusters (e.g., 'temporal mismatch', 'paraphrase gap', 'multi-hop miss') using embedding-space analysis of query/context pairs, cutting manual error-analysis time by an order of magnitude in our internal deployment.",
    tags: ["RAG", "error analysis", "NLP"],
    paperUrl: "#",
  },
  {
    id: "r3",
    title: "Cost-Aware Scheduling for Heterogeneous Research Compute",
    authors: ["Alex Morgan", "R. Bianchi", "T. Adeyemi", "M. Kowalski"],
    venue: "Systems for ML Workshop, NeurIPS",
    date: "2023",
    status: "published",
    abstract:
      "We present a scheduling policy for small research clusters mixing spot and reserved instances that jointly optimizes for job completion time and dollar cost, evaluated against 14 months of real workload traces from a 40-person research team. Our policy reduces compute spend by 23% at equal median completion time.",
    tags: ["systems", "scheduling", "ML infrastructure"],
    paperUrl: "#",
    codeUrl: "https://github.com/yourusername/fieldnotes-api",
  },
  {
    id: "r4",
    title: "On the Reliability of Self-Reported Confidence in LLM Outputs",
    authors: ["Alex Morgan"],
    venue: "Undergraduate Honors Thesis",
    date: "2021",
    status: "published",
    abstract:
      "An empirical study of whether language models' self-reported confidence scores correlate with actual correctness across question-answering benchmarks, finding systematic overconfidence that worsens with question difficulty and proposing a lightweight recalibration technique.",
    tags: ["NLP", "calibration", "thesis"],
    paperUrl: "#",
  },
];
