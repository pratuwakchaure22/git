import type { EducationItem } from "@/types";

export const education: EducationItem[] = [
  {
    id: "e1",
    institution: "Institute of Technology",
    degree: "M.S. Computer Science",
    field: "Machine Learning specialization",
    startDate: "2021",
    endDate: "2023",
    location: "Boston, MA",
    gpa: "3.9 / 4.0",
    description:
      "Focused coursework and thesis work on information retrieval and evaluation methodology. Served as a teaching assistant for the graduate systems course for two semesters.",
    coursework: ["Information Retrieval", "Distributed Systems", "Statistical Learning", "Advanced Algorithms"],
  },
  {
    id: "e2",
    institution: "State University",
    degree: "B.S. Computer Science",
    field: "Minor in Mathematics",
    startDate: "2017",
    endDate: "2021",
    location: "Austin, TX",
    gpa: "3.85 / 4.0",
    description:
      "Graduated with honors. Completed an honors thesis on LLM confidence calibration and spent two summers as a software engineering intern.",
    coursework: ["Data Structures", "Operating Systems", "Linear Algebra", "Probability & Statistics", "Compilers"],
  },
];
