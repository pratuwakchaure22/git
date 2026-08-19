import type { AIConversation, AIMessage } from "@/types";

export const suggestedPrompts = [
  "What do I have today?",
  "What deadlines are coming up this week?",
  "Find my research documents",
  "Summarize my latest note",
  "Create a task for EMNLP submission",
  "Help me update my resume",
  "What are my overdue items?",
  "Show my upcoming reminders",
];

const makeMsg = (
  id: string,
  role: AIMessage["role"],
  content: string,
  timestamp: string,
  actionCard?: AIMessage["actionCard"]
): AIMessage => ({ id, role, content, timestamp, actionCard });

export const mockConversations: AIConversation[] = [
  {
    id: "c1",
    title: "Today's overview",
    createdAt: "2026-08-16T10:00:00",
    updatedAt: "2026-08-16T10:05:00",
    messages: [
      makeMsg("m1", "user", "What do I have today?", "2026-08-16T10:00:00"),
      makeMsg(
        "m2",
        "assistant",
        `Good morning, Pratik 👋 Here's your overview for **Sunday, August 16**:\n\n**Tasks due today:**\n- 🔴 Fix authentication bug in portfolio API (Critical)\n- 🟠 Review mentor's code PR (Low)\n- 🟡 Set up PostgreSQL + pgvector locally (In Progress)\n\n**Reminders for today:**\n- ⏰ 10:00 AM — Daily standup (research group)\n- ⏰ 6:00 PM — Weekly review & planning\n- ⏰ 9:00 PM — Take medication\n\n**Upcoming deadlines this week:**\n- 📅 Aug 17 — Mentor PR review\n- 📅 Aug 18 — Literature review for NLP paper\n- 📅 Aug 19 — Submit EMNLP abstract reminder\n\nYou have **2 overdue items**. Want me to show them?`,
        "2026-08-16T10:00:05"
      ),
    ],
  },
  {
    id: "c2",
    title: "Create task for paper",
    createdAt: "2026-08-15T14:30:00",
    updatedAt: "2026-08-15T14:35:00",
    messages: [
      makeMsg("m3", "user", "Create a task: write the experiments section of the EMNLP paper", "2026-08-15T14:30:00"),
      makeMsg(
        "m4",
        "assistant",
        "I'll create that task for you. Here are the details:",
        "2026-08-15T14:30:05",
        {
          type: "create-task",
          title: "Create Task",
          description: "Write experiments section of EMNLP paper",
          data: {
            title: "Write experiments section — EMNLP paper",
            priority: "High",
            category: "Research",
            dueDate: "2026-08-28",
            tags: "emnlp, paper, writing",
          },
        }
      ),
    ],
  },
  {
    id: "c3",
    title: "Research documents",
    createdAt: "2026-08-14T09:00:00",
    updatedAt: "2026-08-14T09:10:00",
    messages: [
      makeMsg("m5", "user", "Find my research documents", "2026-08-14T09:00:00"),
      makeMsg(
        "m6",
        "assistant",
        `I found **4 research documents** in your library:\n\n1. 📄 **EMNLP_2026_Draft_v3.docx** — 1.2 MB, updated Aug 14\n2. 📄 **MTech_Thesis_Final.pdf** — 8.4 MB, uploaded Jun 15\n3. 📄 **Project_Proposal_SemanticSearch.pdf** — 512 KB, uploaded Jul 20\n4. 📊 **Research_Reading_List_Q3.xlsx** — 48 KB, updated Aug 10\n\nWould you like me to summarize any of these documents?`,
        "2026-08-14T09:00:08"
      ),
    ],
  },
];

export const initialMessages: AIMessage[] = [
  makeMsg(
    "welcome",
    "assistant",
    "Hello Pratik 👋 I'm your personal AI assistant. I can help you manage tasks, find documents, set reminders, and answer questions about your workspace. What would you like to do today?",
    new Date().toISOString()
  ),
];

export const mockAIResponses: Record<string, string> = {
  default:
    "I understand your request. Let me look into that for you... Based on your workspace data, here's what I found.",
  tasks: "You currently have **3 active tasks** — 1 in progress, 2 to do. The highest priority item is the authentication bug fix due tomorrow.",
  deadlines: "You have **2 overdue deadlines** and **5 upcoming** in the next 30 days. The most critical is the EMNLP abstract submission on August 20.",
  notes: "Your most recently updated note is **'RAG Evaluation Framework — Architecture Notes'** from yesterday. You have 6 active notes and 1 archived.",
  documents: "Found 10 documents. 3 are in the Research category with AI access enabled. Your latest upload is the EMNLP draft.",
  resume: "Your CV was last updated on August 15. I can help you add new projects, update your skills section, or generate a tailored version for a specific role.",
};
