// ============================================================
// Core shared types
// ============================================================

export type ProjectCategory = "web" | "ai-ml" | "mobile" | "systems" | "design";

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: ProjectCategory;
  techStack: string[];
  year: string;
  role: string;
  featured: boolean;
  githubUrl?: string;
  liveUrl?: string;
  highlights: string[];
  imageUrl?: string;
}

export type ResearchStatus = "published" | "preprint" | "in-review";

export interface ResearchItem {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  date: string;
  status: ResearchStatus;
  abstract: string;
  tags: string[];
  paperUrl?: string;
  codeUrl?: string;
}

export type AchievementCategory = "award" | "certification" | "competition" | "recognition";

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  date: string;
  category: AchievementCategory;
  description: string;
  credentialUrl?: string;
}

export interface Skill {
  name: string;
  level: number;
}

export interface SkillGroup {
  id: string;
  category: string;
  description: string;
  skills: Skill[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  location: string;
  gpa?: string;
  description: string;
  coursework: string[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  location: string;
  summary: string;
  highlights: string[];
}

export interface SocialLink {
  label: string;
  url: string;
  icon: "github" | "linkedin" | "twitter" | "mail" | "scholar" | "globe";
}

export interface NavItem {
  label: string;
  path: string;
}

export interface Stat {
  label: string;
  value: string;
  suffix?: string;
}

// ============================================================
// Dashboard — Tasks
// ============================================================

export type TaskStatus = "todo" | "in-progress" | "completed";
export type TaskPriority = "critical" | "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  createdAt: string;
}

// ============================================================
// Dashboard — Notes
// ============================================================

export type NoteCategory =
  | "personal"
  | "research"
  | "project"
  | "meeting"
  | "idea"
  | "reference"
  | "other";

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
}

// ============================================================
// Dashboard — Documents
// ============================================================

export type DocumentCategory =
  | "academic"
  | "research"
  | "projects"
  | "certificates"
  | "resume"
  | "personal"
  | "important"
  | "other";

export type DocumentType = "pdf" | "docx" | "xlsx" | "pptx" | "txt" | "md" | "jpg" | "png" | "zip";

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: string; // human-readable e.g. "2.3 MB"
  category: DocumentCategory;
  tags: string[];
  aiAccess: boolean;
  uploadedAt: string;
  updatedAt: string;
  description?: string;
}

// ============================================================
// Dashboard — Reminders
// ============================================================

export type ReminderStatus = "upcoming" | "today" | "completed" | "missed";
export type ReminderRepeat = "none" | "daily" | "weekly" | "monthly";

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  repeat: ReminderRepeat;
  status: ReminderStatus;
  createdAt: string;
}

// ============================================================
// Dashboard — Deadlines
// ============================================================

export type DeadlinePriority = "critical" | "high" | "medium" | "low";
export type DeadlineStatus = "upcoming" | "overdue" | "completed";

export interface Deadline {
  id: string;
  title: string;
  description?: string;
  date: string;
  priority: DeadlinePriority;
  relatedProject?: string;
  status: DeadlineStatus;
  category: string;
  createdAt: string;
}

// ============================================================
// Dashboard — Important Items
// ============================================================

export type ImportantCategory = "document" | "link" | "date" | "contact" | "information";

export interface ImportantItem {
  id: string;
  title: string;
  description?: string;
  category: ImportantCategory;
  value: string; // URL, date string, contact info, etc.
  tags: string[];
  createdAt: string;
  pinned: boolean;
}

// ============================================================
// Dashboard — Google Drive
// ============================================================

export type DriveFileType = "folder" | "document" | "spreadsheet" | "presentation" | "pdf" | "image" | "other";

export interface DriveFile {
  id: string;
  name: string;
  type: DriveFileType;
  size?: string;
  modifiedAt: string;
  owner: string;
  shared: boolean;
  starred: boolean;
  parentId?: string;
  webViewLink?: string;
}

// ============================================================
// Dashboard — AI
// ============================================================

export type AIMessageRole = "user" | "assistant" | "system";

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: string;
  actionCard?: AIActionCard;
}

export interface AIActionCard {
  type: "create-task" | "create-reminder" | "create-note" | "search-documents" | "update-profile";
  title: string;
  description: string;
  data: Record<string, string>;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Dashboard — Admin
// ============================================================

export interface AdminStat {
  label: string;
  value: number;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export interface AdminItem {
  id: string;
  name: string;
  category: string;
  status: "published" | "draft" | "archived";
  published: boolean;
  lastUpdated: string;
}
