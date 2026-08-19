import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Sparkles, Star, ArrowRight, Globe, Award, Briefcase, GraduationCap, Code, X } from "lucide-react";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>({
    name: "",
    role: "",
    bio: "",
    email: "",
    phone: "",
    location: "",
    avatarUrl: "",
    initials: "",
    githubUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
  });

  const [educationList, setEducationList] = useState<any[]>([]);
  const [experienceList, setExperienceList] = useState<any[]>([]);
  const [skillList, setSkillList] = useState<any[]>([]);
  const [projectList, setProjectList] = useState<any[]>([]);
  const [achievementList, setAchievementList] = useState<any[]>([]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);


  useEffect(() => {
    async function loadPortfolioData() {
      // 1. Deterministic Canonical Profile Query
      let profQuery = supabase.from("profiles").select("*");
      if (user?.id) {
        profQuery = profQuery.eq("id", user.id);
      } else {
        profQuery = profQuery.order("created_at", { ascending: true });
      }
      const { data: pData } = await profQuery.limit(1).maybeSingle();

      if (pData) {
        const fullName: string = pData.full_name || user?.name || "";
        setProfileData({
          name: fullName,
          role: pData.role_title || "",
          bio: pData.bio || "",
          email: user?.email || "",
          phone: pData.phone || "",
          location: pData.location || "",
          avatarUrl: pData.avatar_url || user?.avatarUrl || "",
          initials: fullName
            ? fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
            : "",
          githubUrl: pData.github_url || "",
          linkedinUrl: pData.linkedin_url || "",
          websiteUrl: pData.website_url || "",
        });
      }

      // 2. Fetch Education
      const { data: eduData } = await supabase
        .from("education")
        .select("*")
        .order("start_date", { ascending: false });

      if (eduData && eduData.length > 0) {
        setEducationList(
          eduData.map((e: any) => ({
            id: e.id,
            institution: e.institution,
            degree: e.degree ? `${e.degree} ${e.field_of_study ? `in ${e.field_of_study}` : ""}` : "Degree",
            start_date: e.start_date ? String(e.start_date).slice(0, 4) : "",
            end_date: e.end_date ? String(e.end_date).slice(0, 4) : "Present",
          }))
        );
      }

      // 3. Fetch Experience
      const { data: expData } = await supabase
        .from("experience")
        .select("*")
        .order("start_date", { ascending: false });

      if (expData && expData.length > 0) {
        setExperienceList(
          expData.map((e: any) => ({
            id: e.id,
            company: e.company,
            position: e.position,
            start_date: e.start_date ? String(e.start_date).slice(0, 4) : "",
            end_date: e.end_date ? String(e.end_date).slice(0, 4) : "Present",
            description: e.description || "",
          }))
        );
      }

      // 4. Fetch Skills
      const { data: skData } = await supabase
        .from("skills")
        .select("*")
        .order("category");

      if (skData && skData.length > 0) {
        setSkillList(
          skData.map((s: any) => ({
            id: s.id,
            name: s.name,
            category: s.category || "General",
            proficiency: s.proficiency || 80,
          }))
        );
      }

      // 5. Fetch Projects
      const { data: prjData } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (prjData && prjData.length > 0) {
        setProjectList(
          prjData.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description || "",
            technologies: p.technologies || [],
            github_url: p.github_url || "",
            live_url: p.live_url || "",
            image_url: p.image_url || "",
          }))
        );
      }

      // 6. Fetch Achievements
      const { data: achData } = await supabase
        .from("achievements")
        .select("*")
        .order("date", { ascending: false });

      if (achData && achData.length > 0) {
        setAchievementList(
          achData.map((a: any) => ({
            id: a.id,
            title: a.title,
            date: a.date ? String(a.date).slice(0, 4) : "",
            description: a.description || "",
            organization: a.organization || "",
            position: a.position || "",
            image_url: a.image_url || "",
          }))
        );
      }
    }

    loadPortfolioData();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#171a20] text-[#e9ebf0]">
      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightboxSrc(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            id="lightbox-close"
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close image preview"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightboxSrc}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            crossOrigin="anonymous"
          />
        </div>
      )}
      <PublicNavbar />

      {/* ─── TOP SECTION: Editorial Grid Paper Header ─── */}
      <section className="relative overflow-hidden bg-[#f4f1ea] pt-24 pb-12 text-[#171a20]">
        {/* Graph Paper Grid Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(#b8b4ac 1px, transparent 1px), linear-gradient(90deg, #b8b4ac 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Floating Accent Sparkles */}
        <div className="pointer-events-none absolute top-16 left-8 text-[#b8763a] opacity-80 animate-pulse">
          <Star className="h-7 w-7 fill-[#b8763a]" />
        </div>
        <div className="pointer-events-none absolute top-28 right-12 text-[#2a8c82] opacity-80">
          <Sparkles className="h-8 w-8" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              {/* Year Pill Tag */}
              <div className="inline-block transform -rotate-3 rounded-full bg-[#171a20] px-4 py-1.5 font-mono text-xs font-bold text-[#f4f1ea] shadow-md">
                2026 Portfolio
              </div>
              {/* Editorial Display Heading */}
              <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-[#171a20] sm:text-5xl lg:text-6xl">
                Welcome to My Portfolio
              </h1>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[#b8763a] font-semibold">
                {profileData.role}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
              <Link
                to="/dashboard/resume"
                className="flex items-center gap-2 rounded-xl bg-[#171a20] px-5 py-2.5 font-mono text-xs font-semibold text-[#f4f1ea] shadow-lg transition-transform hover:-translate-y-0.5"
              >
                View Resume <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RIPPED / TORN PAPER SVG TRANSITION ─── */}
      <div className="relative w-full overflow-hidden leading-none bg-[#f4f1ea]">
        <svg
          className="relative block w-full h-12 md:h-20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,90 350,-40 500,65 C650,170 900,10 1200,55 L1200,120 L0,120 Z"
            fill="#171a20"
          />
        </svg>
      </div>

      {/* ─── MAIN CONTENT: 2-COLUMN DARK EDITORIAL LAYOUT ─── */}
      <section className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">

          {/* LEFT COLUMN (4 cols): Polaroid Photo, Education, Skills */}
          <div className="space-y-10 lg:col-span-4">

            {/* Polaroid Photo Card */}
            <div className="relative transform transition-transform hover:rotate-0 -rotate-1">
              {/* Translucent Masking Tape */}
              <div className="absolute -top-4 left-1/2 z-10 h-8 w-28 -translate-x-1/2 rotate-2 bg-[#e2d5c3]/80 backdrop-blur-xs shadow-xs" />

              <div className="rounded-lg bg-[#f4f1ea] p-4 text-[#171a20] shadow-2xl">
                <div className="relative aspect-4/5 w-full overflow-hidden rounded bg-[#171a20]">
                  {profileData.avatarUrl ? (
                    <img
                      src={profileData.avatarUrl}
                      alt={profileData.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-5xl font-bold text-white/20">
                      {profileData.initials}
                    </div>
                  )}

                  {/* Dev Stickers */}
                  <div className="absolute top-3 left-3 rounded-full bg-[#171a20]/90 px-2.5 py-1 font-mono text-[10px] font-bold text-white backdrop-blur-xs shadow-md">
                    👽 DEV
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-full bg-[#b8763a] px-2.5 py-1 font-mono text-[10px] font-bold text-white shadow-md">
                    ⚡ LIVE
                  </div>
                </div>

                {/* Polaroid Caption */}
                <div className="mt-4 text-center">
                  <p className="font-display text-lg font-bold text-[#171a20]">
                    {profileData.name}
                  </p>
                  <p className="font-mono text-[11px] text-[#5b6472]">
                    {profileData.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Education Section */}
            <div className="space-y-4 rounded-2xl border border-[#2e3540] bg-[#1e232b] p-6 shadow-xl">
              <div className="flex items-center gap-2 text-[#2a8c82]">
                <GraduationCap className="h-5 w-5" />
                <h3 className="font-display text-xl font-bold text-white">Education</h3>
              </div>
              <div className="space-y-4">
                {educationList.length === 0 ? (
                  <p className="text-xs text-[#8f97a5]">No education entries found.</p>
                ) : (
                  educationList.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-[#2a8c82] pl-3 space-y-0.5">
                      <p className="font-display text-sm font-bold text-[#e9ebf0]">{edu.degree}</p>
                      <p className="font-mono text-xs text-[#2a8c82]">{edu.institution}</p>
                      <p className="font-mono text-[10px] text-[#8f97a5]">{edu.start_date} – {edu.end_date}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Skills & Software Stack Section */}
            <div className="space-y-4 rounded-2xl border border-[#2e3540] bg-[#1e232b] p-6 shadow-xl">
              <div className="flex items-center gap-2 text-[#4F7CFF]">
                <Code className="h-5 w-5" />
                <h3 className="font-display text-xl font-bold text-white">Skills Stack</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skillList.length === 0 ? (
                  <p className="text-xs text-[#8f97a5]">No skills added yet.</p>
                ) : (
                  skillList.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#2e3540] bg-[#171a20] px-3 py-1.5 font-mono text-xs font-semibold text-[#e9ebf0]"
                    >
                      <span className="h-2 w-2 rounded-full bg-[#4F7CFF]" />
                      {skill.name}
                    </span>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (8 cols): Bio, Contact, Experience, Featured Projects, Achievements */}
          <div className="space-y-12 lg:col-span-8">

            {/* Bio / Intro Section */}
            <div className="space-y-4">
              <div className="inline-block rounded-full bg-[#2a8c82]/15 px-3 py-1 font-mono text-xs font-bold text-[#2a8c82]">
                ✦ Hello !
              </div>
              <h2 className="font-display text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                {profileData.name}
              </h2>
              <p className="font-body text-base leading-relaxed text-[#8f97a5] sm:text-lg">
                {profileData.bio}
              </p>
            </div>

            {/* Contact Badges Grid */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl font-bold text-white">Contact & Links</h3>
              <div className="grid gap-3 sm:grid-cols-2">

                {/* Email */}
                {profileData.email && (
                  <a
                    href={`mailto:${profileData.email}`}
                    className="flex items-center gap-3 rounded-xl border border-[#2e3540] bg-[#1e232b] p-3.5 text-xs transition-all hover:border-[#2a8c82] hover:-translate-y-0.5"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ea4335] text-white">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="truncate font-mono text-[#e9ebf0]">{profileData.email}</span>
                  </a>
                )}

                {/* GitHub */}
                {profileData.githubUrl && (
                  <a
                    href={profileData.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-[#2e3540] bg-[#1e232b] p-3.5 text-xs transition-all hover:border-[#2a8c82] hover:-translate-y-0.5"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#333] text-white">
                      <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </div>
                    <span className="truncate font-mono text-[#e9ebf0]">GitHub</span>
                  </a>
                )}

                {/* LinkedIn */}
                {profileData.linkedinUrl && (
                  <a
                    href={profileData.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-[#2e3540] bg-[#1e232b] p-3.5 text-xs transition-all hover:border-[#2a8c82] hover:-translate-y-0.5"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a66c2] text-white">
                      <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                    </div>
                    <span className="truncate font-mono text-[#e9ebf0]">LinkedIn</span>
                  </a>
                )}

                {/* Personal Website */}
                {profileData.websiteUrl && (
                  <a
                    href={profileData.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-[#2e3540] bg-[#1e232b] p-3.5 text-xs transition-all hover:border-[#2a8c82] hover:-translate-y-0.5"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4F7CFF] text-white">
                      <Globe className="h-4.5 w-4.5" />
                    </div>
                    <span className="truncate font-mono text-[#e9ebf0]">Website</span>
                  </a>
                )}

                {/* Location */}
                {profileData.location && (
                  <div className="flex items-center gap-3 rounded-xl border border-[#2e3540] bg-[#1e232b] p-3.5 text-xs">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a8c82] text-white">
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    <span className="truncate font-mono text-[#e9ebf0]">{profileData.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Experience Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[#b8763a]">
                <Briefcase className="h-6 w-6" />
                <h3 className="font-display text-3xl font-bold tracking-tight text-white">
                  Experience
                </h3>
              </div>
              <div className="space-y-5">
                {experienceList.length === 0 ? (
                  <p className="text-xs text-[#8f97a5]">No experience listed yet.</p>
                ) : (
                  experienceList.map((exp) => (
                    <div key={exp.id} className="border-l-2 border-[#b8763a] pl-5 space-y-1.5">
                      <p className="font-mono text-xs font-semibold text-[#b8763a]">
                        {exp.start_date} – {exp.end_date}
                      </p>
                      <h4 className="font-display text-lg font-bold text-[#e9ebf0]">
                        {exp.company}
                      </h4>
                      <p className="font-body text-xs font-semibold text-[#2a8c82]">
                        {exp.position}
                      </p>
                      {exp.description && (
                        <p className="font-body text-xs leading-relaxed text-[#8f97a5]">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Featured Projects Section */}
            <div className="pt-6 border-t border-[#2e3540] space-y-5">
              <h3 className="font-display text-3xl font-bold tracking-tight text-white">
                Featured Projects
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {projectList.length === 0 ? (
                  <p className="text-xs text-[#8f97a5] sm:col-span-2">No projects added yet. Add them in the Profile Builder.</p>
                ) : (
                  projectList.slice(0, 4).map((proj) => (
                    <div key={proj.id} className="overflow-hidden rounded-2xl border border-[#2e3540] bg-[#1e232b] hover:border-[#2a8c82] transition-colors shadow-lg">
                      {proj.image_url && (
                        <button
                          type="button"
                          id={`project-img-${proj.id}`}
                          className="w-full overflow-hidden"
                          onClick={() => setLightboxSrc(proj.image_url)}
                          aria-label={`Preview image for ${proj.title}`}
                        >
                          <img
                            src={proj.image_url}
                            alt={proj.title}
                            crossOrigin="anonymous"
                            className="h-40 w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </button>
                      )}
                      <div className="p-5 space-y-2">
                        <span className="rounded-md bg-[#2a8c82]/20 text-[#2a8c82] px-2.5 py-1 font-mono text-[10px] uppercase font-semibold">
                          {proj.technologies?.[0] || "Project"}
                        </span>
                        <h4 className="font-display text-base font-bold text-white">{proj.title}</h4>
                        <p className="text-xs text-[#8f97a5] line-clamp-2">{proj.description}</p>
                        {(proj.github_url || proj.live_url) && (
                          <div className="flex flex-wrap gap-3 pt-1">
                            {proj.github_url && (
                              <a href={proj.github_url} target="_blank" rel="noreferrer" className="font-mono text-[10px] text-[#4F7CFF] hover:underline">GitHub ↗</a>
                            )}
                            {proj.live_url && (
                              <a href={proj.live_url} target="_blank" rel="noreferrer" className="font-mono text-[10px] text-[#2a8c82] hover:underline">Live ↗</a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Achievements Section */}
            <div className="pt-6 border-t border-[#2e3540] space-y-5">
              <div className="flex items-center gap-2 text-[#FFC43D]">
                <Award className="h-6 w-6" />
                <h3 className="font-display text-3xl font-bold tracking-tight text-white">
                  Achievements
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {achievementList.length === 0 ? (
                  <p className="text-xs text-[#8f97a5] sm:col-span-2">No achievements added yet. Add them in the Profile Builder.</p>
                ) : (
                  achievementList.map((ach) => (
                    <div key={ach.id} className="rounded-2xl border border-[#2e3540] bg-[#1e232b] p-5 shadow-lg">
                      <div className="flex items-start gap-3">
                        {ach.image_url && (
                          <button
                            type="button"
                            id={`ach-img-${ach.id}`}
                            onClick={() => setLightboxSrc(ach.image_url)}
                            className="flex-shrink-0"
                            aria-label={`Preview certificate for ${ach.title}`}
                          >
                            <img
                              src={ach.image_url}
                              alt={ach.title}
                              crossOrigin="anonymous"
                              className="h-16 w-16 rounded-xl object-cover transition-opacity hover:opacity-90"
                            />
                          </button>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display text-sm font-bold text-white">{ach.title}</h4>
                            {ach.date && <span className="flex-shrink-0 font-mono text-[10px] text-[#FFC43D]">{ach.date}</span>}
                          </div>
                          {ach.organization && <p className="font-mono text-[10px] text-[#4F7CFF]">{ach.organization}</p>}
                          {ach.position && <p className="font-mono text-[10px] text-[#9A9AA8]">{ach.position}</p>}
                          {ach.description && <p className="mt-1 text-xs text-[#8f97a5]">{ach.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
