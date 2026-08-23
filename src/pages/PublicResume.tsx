import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Download, ArrowLeft, Loader2, Mail, MapPin, Globe, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { downloadResumePdf } from "@/utils/pdfGenerator";

export default function PublicResume() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<any>({});
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    async function loadPublicResume() {
      setLoading(true);

      const [pRes, eRes, expRes, sRes, prjRes, achRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: true }).limit(1).maybeSingle(),
        supabase.from("education").select("*").order("start_date", { ascending: false }),
        supabase.from("experience").select("*").order("start_date", { ascending: false }),
        supabase.from("skills").select("*").order("category"),
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("achievements").select("*").order("date", { ascending: false }),
      ]);

      if (pRes.data) {
        setProfile({
          full_name: pRes.data.full_name || "Pratik Wakchaure",
          role: pRes.data.role_title || "Software Engineer & AI/ML Researcher",
          bio: pRes.data.bio || "",
          email: pRes.data.email || "",
          phone: pRes.data.phone || "",
          location: pRes.data.location || "",
          avatar_url: pRes.data.avatar_url || "",
          github_url: pRes.data.github_url || "",
          linkedin_url: pRes.data.linkedin_url || "",
          website_url: pRes.data.website_url || "",
        });
      }

      setEducation(eRes.data || []);
      setExperience(expRes.data || []);
      setSkills(sRes.data || []);
      setProjects(prjRes.data || []);
      setAchievements(achRes.data || []);
      setLoading(false);
    }

    loadPublicResume();
  }, []);

  async function handleDownloadPDF() {
    if (!previewRef.current) return;
    setGenerating(true);
    setPdfError("");
    try {
      await downloadResumePdf(previewRef.current, "Pratik-Wakchaure-Resume.pdf");
    } catch (err: any) {
      console.error("Public PDF generation error:", err);
      setPdfError(err?.message || "Failed to generate PDF. Please check browser file download permissions.");
    } finally {
      setGenerating(false);
    }
  }

  // Group skills by category
  const skillsByCategory = skills.reduce<Record<string, string[]>>((acc, s) => {
    const cat = s.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s.name);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#171a20] text-[#e9ebf0] p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#2e3540] bg-[#1e232b] p-4 shadow-xl">
          <Link
            to="/"
            className="flex items-center gap-2 font-mono text-xs font-semibold text-[#8f97a5] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={generating || loading}
              className="flex items-center gap-2 rounded-xl bg-[#2a8c82] px-5 py-2.5 font-mono text-xs font-semibold text-white shadow-lg transition-all hover:bg-[#23786f] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {generating ? "Generating PDF..." : "Download Resume PDF"}
            </button>
          </div>
        </div>

        {pdfError && (
          <div className="rounded-xl border border-yellow-800/50 bg-yellow-950/40 p-3 text-xs text-yellow-300">
            {pdfError}
          </div>
        )}

        {/* Resume Preview Sheet */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-[#2e3540] bg-[#1e232b]">
            <Loader2 className="h-6 w-6 animate-spin text-[#2a8c82]" />
          </div>
        ) : (
          <div
            ref={previewRef}
            id="public-resume-preview"
            className="mx-auto rounded-xl p-8 sm:p-12 shadow-2xl"
            style={{
              backgroundColor: "#ffffff",
              color: "#111111",
              fontFamily: "'IBM Plex Sans', sans-serif",
              maxWidth: "210mm",
              minHeight: "297mm",
            }}
          >
            {/* Header Area */}
            <div className="border-b-2 border-gray-800 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                    {profile.full_name || "Pratik Wakchaure"}
                  </h1>
                  <p className="mt-1 font-mono text-sm font-semibold text-[#2a8c82]">
                    {profile.role || "Software Engineer"}
                  </p>
                </div>
                {profile.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    crossOrigin="anonymous"
                    className="h-16 w-16 rounded-full object-cover border border-gray-300 shadow-xs"
                  />
                )}
              </div>

              {/* Contact strip */}
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-xs text-gray-600">
                {profile.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-gray-400" /> {profile.email}
                  </span>
                )}
                {profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-gray-400" /> {profile.phone}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" /> {profile.location}
                  </span>
                )}
                {profile.github_url && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-gray-400" /> {profile.github_url}
                  </span>
                )}
                {profile.linkedin_url && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-gray-400" /> {profile.linkedin_url}
                  </span>
                )}
              </div>
            </div>

            {/* Summary */}
            {profile.bio && (
              <div className="mb-6">
                <h2 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-gray-400">
                  Professional Summary
                </h2>
                <p className="text-xs text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-gray-400">
                  Experience
                </h2>
                <div className="space-y-4">
                  {experience.map((e) => (
                    <div key={e.id}>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-gray-900">{e.position}</span>
                        <span className="font-mono text-[11px] text-gray-500">
                          {e.start_date ? `${e.start_date} – ${e.end_date || "Present"}` : ""}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#2a8c82]">{e.company}</p>
                      {e.description && (
                        <p className="mt-1 text-xs text-gray-600 leading-relaxed">{e.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-gray-400">
                  Education
                </h2>
                <div className="space-y-3">
                  {education.map((e) => (
                    <div key={e.id}>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-gray-900">
                          {e.degree || e.level || "Qualification"}
                          {e.field_of_study ? ` — ${e.field_of_study}` : ""}
                          {e.specialization ? ` (${e.specialization})` : ""}
                        </span>
                        <span className="font-mono text-[11px] text-gray-500">
                          {e.start_date ? `${e.start_date} – ${e.end_date || "Present"}` : e.end_date || ""}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 text-xs font-semibold text-gray-700">
                        <span>{e.institution}</span>
                        {e.board_university && <span className="text-gray-500 font-normal">({e.board_university})</span>}
                        {e.cgpa_gpa && <span className="font-mono text-gray-800">CGPA: {e.cgpa_gpa}</span>}
                        {e.percentage && <span className="font-mono text-gray-800">Score: {e.percentage}%</span>}
                        {e.marks_obtained && <span className="font-mono text-gray-800">Marks: {e.marks_obtained}{e.max_marks ? `/${e.max_marks}` : ""}</span>}
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
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-gray-400">
                  Projects
                </h2>
                <div className="space-y-3">
                  {projects.slice(0, 5).map((p) => (
                    <div key={p.id}>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-gray-900">{p.title}</span>
                        {p.github_url && <span className="font-mono text-[10px] text-[#2a8c82]">{p.github_url}</span>}
                      </div>
                      {p.description && <p className="mt-0.5 text-xs text-gray-600">{p.description}</p>}
                      {p.technologies && p.technologies.length > 0 && (
                        <p className="mt-0.5 font-mono text-[11px] text-gray-500">
                          Tech: {p.technologies.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-gray-400">
                  Skills & Technical Proficiencies
                </h2>
                <div className="space-y-1">
                  {Object.entries(skillsByCategory).map(([cat, names]) => (
                    <div key={cat} className="flex gap-2 text-xs">
                      <span className="w-28 flex-shrink-0 font-semibold text-gray-700">{cat}:</span>
                      <span className="text-gray-600">{names.join(", ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <div>
                <h2 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-gray-400">
                  Achievements & Certifications
                </h2>
                <div className="space-y-2">
                  {achievements.slice(0, 4).map((a) => (
                    <div key={a.id} className="text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-gray-900">{a.title}</span>
                        {a.date && <span className="font-mono text-[11px] text-gray-500">{a.date}</span>}
                      </div>
                      {a.organization && <p className="text-[11px] text-[#2a8c82]">{a.organization}</p>}
                      {a.description && <p className="mt-0.5 text-gray-600">{a.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
