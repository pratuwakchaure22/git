import { useState, useRef } from "react";
import { Download, RefreshCw, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useResumeData } from "@/hooks/useResumeData";
import { downloadResumePdf } from "@/utils/pdfGenerator";

const versions = [
  { id: "v3", label: "v3 — Current", date: "Live Supabase Data", note: "Synchronized with database" },
  { id: "v2", label: "v2", date: "Previous Draft", note: "Archived snapshot" },
];

const resumeSections = [
  { id: "summary", label: "Professional Summary", included: true },
  { id: "education", label: "Education", included: true },
  { id: "skills", label: "Skills", included: true },
  { id: "experience", label: "Experience", included: true },
  { id: "projects", label: "Projects", included: true },
  { id: "achievements", label: "Achievements", included: true },
];

export default function Resume() {
  const { data, isLoading, refetch } = useResumeData();
  const [generating, setGenerating] = useState(false);
  const [activeVersion, setActiveVersion] = useState("v3");
  const [sections, setSections] = useState(resumeSections);
  const previewRef = useRef<HTMLDivElement>(null);

  function toggleSection(id: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, included: !s.included } : s))
    );
  }

  const [pdfError, setPdfError] = useState("");

  async function handleDownloadPDF() {
    if (!previewRef.current) return;
    setGenerating(true);
    setPdfError("");
    try {
      await downloadResumePdf(previewRef.current, "Pratik-Wakchaure-Resume.pdf");
    } catch (err: any) {
      console.error("PDF generation error:", err);
      setPdfError(err?.message || "Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  const isIncluded = (id: string) => sections.find((s) => s.id === id)?.included;

  // Group skills by category
  const skillsByCategory = data.skills.reduce<Record<string, string[]>>((acc, s) => {
    const cat = s.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s.name);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <PageHeader
        title="Resume Builder"
        description="Generate and export your live Supabase resume."
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={refetch}
              className="flex items-center gap-2 rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3.5 py-2 text-xs font-medium text-[#9A9AA8] transition-all hover:border-[#4F7CFF]/40 hover:text-[#F4F4F7]"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#4F7CFF]" />
              Refresh Data
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={generating || isLoading}
              className="flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#3b66e0] disabled:opacity-50"
            >
              <Download className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Generating PDF..." : "Download PDF"}
            </button>
          </div>
        }
      />

      {pdfError && (
        <div className="rounded-xl border border-[#FF5C6C]/40 bg-[#FF5C6C]/10 p-3 text-xs text-[#FF5C6C]">
          {pdfError}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: config */}
        <div className="space-y-3">
          {/* Version history */}
          <div className="rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] p-4 shadow-lg shadow-black/20">
            <h3 className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-wider text-[#F4F4F7] mb-3">
              <Clock className="h-4 w-4 text-[#4F7CFF]" />
              Version History
            </h3>
            <div className="space-y-1.5">
              {versions.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setActiveVersion(v.id)}
                  className={`flex w-full flex-col gap-0.5 rounded-xl px-3.5 py-2.5 text-left transition-all ${
                    activeVersion === v.id
                      ? "bg-[#4F7CFF]/15 text-[#4F7CFF] font-semibold border-l-2 border-[#4F7CFF]"
                      : "text-[#9A9AA8] hover:bg-[#20202E] hover:text-[#F4F4F7]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold">{v.label}</span>
                    <span className="font-mono text-[10px]">{v.date}</span>
                  </div>
                  <span className="text-[10px] opacity-80">{v.note}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section toggles */}
          <div className="rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] p-4 shadow-lg shadow-black/20">
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[#F4F4F7] mb-3">Sections</h3>
            <div className="space-y-1.5">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSection(s.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-[#2A2A3A] bg-[#20202E] px-3.5 py-2 text-xs text-[#F4F4F7] transition-all hover:border-[#4F7CFF]/30"
                >
                  <span>{s.label}</span>
                  <span
                    className={`rounded-lg px-2 py-0.5 font-mono text-[10px] font-semibold ${
                      s.included
                        ? "bg-[#48C774]/15 text-[#48C774]"
                        : "bg-[#20202E] text-[#9A9AA8]"
                    }`}
                  >
                    {s.included ? "Included" : "Excluded"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Resume preview */}
        <div className="lg:col-span-2 rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#2A2A3A] bg-[#171824]">
            <span className="font-mono text-xs text-[#9A9AA8]">Live Document Preview — {data.profile.full_name || "Resume"}</span>
            <span className="rounded-md border border-[#48C774]/30 bg-[#48C774]/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#48C774]">
              {isLoading ? "Loading..." : "Live Supabase Data"}
            </span>
          </div>

          {/* Resume content — captured for PDF */}
          <div className="overflow-y-auto dash-scroll bg-[#171824] p-4" style={{ maxHeight: "calc(100vh - 16rem)" }}>
            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#9A9AA8]">Loading resume data from Supabase...</div>
            ) : (
              <div
                ref={previewRef}
                id="resume-preview"
                className="p-8 rounded-xl shadow-2xl"
                style={{ backgroundColor: "#ffffff", color: "#111111", fontFamily: "IBM Plex Sans, sans-serif", minHeight: "297mm" }}
              >
                {/* Header */}
                <div className="mb-6 border-b border-gray-200 pb-6">
                  <h1 className="text-2xl font-bold text-gray-900">{data.profile.full_name || "Your Name"}</h1>
                  <p className="mt-1 text-sm font-semibold text-gray-600">{data.profile.role || "Your Role"}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 font-mono">
                    {data.profile.email && <span>{data.profile.email}</span>}
                    {data.profile.phone && <span>{data.profile.phone}</span>}
                    {data.profile.location && <span>{data.profile.location}</span>}
                    {data.profile.github_url && <span>{data.profile.github_url}</span>}
                    {data.profile.linkedin_url && <span>{data.profile.linkedin_url}</span>}
                  </div>
                </div>

                {/* Summary */}
                {isIncluded("summary") && data.profile.bio && (
                  <div className="mb-5">
                    <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Summary</h2>
                    <p className="text-xs text-gray-700 leading-relaxed">{data.profile.bio}</p>
                  </div>
                )}

                {/* Education */}
                {isIncluded("education") && data.education.length > 0 && (
                  <div className="mb-5">
                    <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Education</h2>
                    {data.education.map((e) => (
                      <div key={e.id} className="mb-3.5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-gray-900">
                            {e.degree || e.level || "Qualification"}
                            {e.field_of_study ? ` — ${e.field_of_study}` : ""}
                            {e.specialization ? ` (${e.specialization})` : ""}
                          </span>
                          <span className="text-[11px] font-mono text-gray-500">
                            {e.start_date ? `${e.start_date} – ${e.end_date || "Present"}` : e.end_date || ""}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 text-xs font-semibold text-gray-700">
                          <span>{e.institution}</span>
                          {e.board_university && <span className="text-gray-500 font-normal">({e.board_university})</span>}
                          {e.cgpa_gpa && <span className="text-gray-800 font-mono">CGPA: {e.cgpa_gpa}</span>}
                          {e.percentage && <span className="text-gray-800 font-mono">Score: {e.percentage}%</span>}
                          {e.marks_obtained && <span className="text-gray-800 font-mono">Marks: {e.marks_obtained}{e.max_marks ? `/${e.max_marks}` : ""}</span>}
                        </div>
                        {e.relevant_subjects && (
                          <p className="mt-0.5 text-[11px] text-gray-600">
                            <span className="font-semibold text-gray-700">Coursework:</span> {e.relevant_subjects}
                          </p>
                        )}
                        {e.description && <p className="mt-0.5 text-xs text-gray-500">{e.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Experience */}
                {isIncluded("experience") && data.experience.length > 0 && (
                  <div className="mb-5">
                    <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Experience</h2>
                    {data.experience.map((e) => (
                      <div key={e.id} className="mb-3">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-gray-900">{e.position}</span>
                          <span className="text-[11px] font-mono text-gray-400">{e.start_date}–{e.end_date}</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-600">{e.company}</p>
                        {e.description && <p className="mt-0.5 text-xs text-gray-500">{e.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {isIncluded("skills") && data.skills.length > 0 && (
                  <div className="mb-5">
                    <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Skills</h2>
                    {Object.entries(skillsByCategory).map(([cat, names]) => (
                      <div key={cat} className="mb-1.5 flex gap-2 text-xs">
                        <span className="font-semibold text-gray-700 w-28 flex-shrink-0">{cat}:</span>
                        <span className="text-gray-600">{names.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {isIncluded("projects") && data.projects.length > 0 && (
                  <div className="mb-5">
                    <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Projects</h2>
                    {data.projects.slice(0, 4).map((p) => (
                      <div key={p.id} className="mb-3">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-gray-900">{p.title}</span>
                          {p.github_url && <span className="text-[11px] font-mono text-gray-400">{p.github_url}</span>}
                        </div>
                        {p.description && <p className="text-xs text-gray-600">{p.description}</p>}
                        {p.technologies && p.technologies.length > 0 && (
                          <p className="text-[11px] font-mono text-gray-400">{p.technologies.join(", ")}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Achievements */}
                {isIncluded("achievements") && data.achievements.length > 0 && (
                  <div className="mb-5">
                    <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Achievements</h2>
                    {data.achievements.slice(0, 4).map((a) => (
                      <div key={a.id} className="mb-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-gray-900">{a.title}</span>
                          {a.date && <span className="text-[11px] font-mono text-gray-400">— {a.date}</span>}
                        </div>
                        {a.description && <p className="text-xs text-gray-600">{a.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
