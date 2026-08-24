import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Eye, EyeOff, GripVertical, Save, Loader2, Camera, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Switch } from "@/components/ui/Switch";
import { useResumeData, type ResumeEducation, type ResumeExperience, type ResumeSkill, type ResumeProject, type ResumeAchievement } from "@/hooks/useResumeData";
import { useAuth } from "@/context/AuthContext";

interface SectionConfig {
  id: string;
  label: string;
  published: boolean;
  includeInResume: boolean;
}

const defaultSections: SectionConfig[] = [
  { id: "personal", label: "Personal Information", published: true, includeInResume: true },
  { id: "education", label: "Education", published: true, includeInResume: true },
  { id: "skills", label: "Skills", published: true, includeInResume: true },
  { id: "projects", label: "Projects", published: true, includeInResume: true },
  { id: "experience", label: "Experience", published: true, includeInResume: true },
  { id: "achievements", label: "Achievements", published: true, includeInResume: false },
];

// ─── Inline form helpers ──────────────────────────────────────────────────────

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-xl border border-[#2A2A3A] bg-[#20202E] p-3 shadow-inner">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9A9AA8]">{label}</p>
      <input
        className="mt-1 w-full bg-transparent text-xs text-[#F4F4F7] outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ─── Section content renderers ────────────────────────────────────────────────

function PersonalSection() {
  const { data, saveProfile, uploadAvatar, isSaving } = useResumeData();
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState(data.profile);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data.profile.full_name || data.profile.role) {
      setForm(data.profile);
    }
  }, [data.profile]);

  async function handleSave() {
    const err = await saveProfile(form);
    if (!err) {
      setSaved(true);
      await refreshProfile();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setAvatarError("");
    const res = await uploadAvatar(file);
    if (res.error) {
      setAvatarError(res.error);
    } else if (res.url) {
      setForm((f) => ({ ...f, avatar_url: res.url }));
      await refreshProfile();
    }
    setUploading(false);
  }

  const currentAvatar = form.avatar_url || data.profile.avatar_url || user?.avatarUrl;

  return (
    <div className="space-y-4">
      {/* Avatar Upload Header */}
      <div className="flex items-center gap-4 rounded-xl border border-[#2A2A3A] bg-[#20202E] p-4">
        <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#2A2A3A] bg-[#171824]">
          {currentAvatar ? (
            <img src={currentAvatar} alt="Profile Avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-xl font-bold text-[#F4F4F7]">{user?.initials || "PK"}</span>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <p className="text-xs font-semibold text-[#F4F4F7]">Profile Photo</p>
          <p className="text-[11px] text-[#9A9AA8]">PNG, JPG or WebP. Saved to Supabase Storage.</p>
          {avatarError && <p className="mt-1 font-mono text-xs text-[#FF5C6C]">{avatarError}</p>}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isSaving}
          className="flex items-center gap-2 rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3.5 py-2 text-xs font-medium text-[#F4F4F7] transition-all hover:border-[#4F7CFF]/40 disabled:opacity-50"
        >
          <Camera className="h-3.5 w-3.5 text-[#4F7CFF]" />
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full Name" value={form.full_name} onChange={(v) => setForm((f) => ({ ...f, full_name: v }))} />
        <Field label="Role" value={form.role} onChange={(v) => setForm((f) => ({ ...f, role: v }))} />
        <Field label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
        <Field label="Location" value={form.location} onChange={(v) => setForm((f) => ({ ...f, location: v }))} />
        <Field label="GitHub URL" value={form.github_url || ""} onChange={(v) => setForm((f) => ({ ...f, github_url: v }))} />
        <Field label="LinkedIn URL" value={form.linkedin_url || ""} onChange={(v) => setForm((f) => ({ ...f, linkedin_url: v }))} />
        <Field label="Website URL" value={form.website_url || ""} onChange={(v) => setForm((f) => ({ ...f, website_url: v }))} />
      </div>

      <div className="rounded-xl border border-[#2A2A3A] bg-[#20202E] p-3 shadow-inner">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9A9AA8]">Bio / Summary</p>
        <textarea
          className="mt-1 w-full resize-none bg-transparent text-xs text-[#F4F4F7] outline-none"
          rows={3}
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || uploading}
        className="flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#3b66e0] disabled:opacity-50"
      >
        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        {saved ? "Saved!" : isSaving ? "Saving..." : "Save Personal Info"}
      </button>
    </div>
  );
}

function EducationSection() {
  const { data, addEducation, updateEducation, deleteEducation } = useResumeData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ResumeEducation, "id">>({
    institution: "",
    degree: "",
    field_of_study: "",
    level: "Bachelor's",
    board_university: "",
    start_date: "",
    end_date: "",
    percentage: "",
    cgpa_gpa: "",
    marks_obtained: "",
    max_marks: "",
    specialization: "",
    relevant_subjects: "",
    description: "",
  });

  const levelOptions = [
    "High School (10th)",
    "Senior Secondary (12th)",
    "Diploma",
    "Bachelor's",
    "Master's",
    "Ph.D.",
    "Certificate",
    "Other",
  ];

  function resetForm() {
    setForm({
      institution: "",
      degree: "",
      field_of_study: "",
      level: "Bachelor's",
      board_university: "",
      start_date: "",
      end_date: "",
      percentage: "",
      cgpa_gpa: "",
      marks_obtained: "",
      max_marks: "",
      specialization: "",
      relevant_subjects: "",
      description: "",
    });
    setEditingId(null);
    setErrorMsg(null);
  }

  function handleStartAdd() {
    resetForm();
    setShowForm(true);
  }

  function handleStartEdit(e: ResumeEducation) {
    setErrorMsg(null);
    setEditingId(e.id);
    setForm({
      institution: e.institution || "",
      degree: e.degree || "",
      field_of_study: e.field_of_study || "",
      level: e.level || "Bachelor's",
      board_university: e.board_university || "",
      start_date: e.start_date || "",
      end_date: e.end_date || "",
      percentage: e.percentage || "",
      cgpa_gpa: e.cgpa_gpa || "",
      marks_obtained: e.marks_obtained || "",
      max_marks: e.max_marks || "",
      specialization: e.specialization || "",
      relevant_subjects: e.relevant_subjects || "",
      description: e.description || "",
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.institution.trim()) {
      setErrorMsg("Institution name is required.");
      return;
    }
    setErrorMsg(null);

    let err: any;
    if (editingId) {
      err = await updateEducation(editingId, form);
    } else {
      err = await addEducation(form);
    }

    if (err) {
      const msg = typeof err === "object" && err.message ? err.message : String(err);
      setErrorMsg(`Failed to save education entry: ${msg}`);
      return;
    }

    resetForm();
    setShowForm(false);
  }

  return (
    <div className="space-y-3">
      {data.education.map((e) => (
        <div key={e.id} className="rounded-xl border border-[#2A2A3A] bg-[#20202E] p-4 transition-all hover:border-[#4F7CFF]/30">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {e.level && (
                  <span className="rounded-md border border-[#4F7CFF]/30 bg-[#4F7CFF]/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#4F7CFF]">
                    {e.level}
                  </span>
                )}
                <h4 className="text-xs font-bold text-[#F4F4F7]">
                  {e.degree || "Qualification"} {e.field_of_study ? `in ${e.field_of_study}` : ""}
                </h4>
              </div>
              <p className="font-mono text-[11px] font-semibold text-[#2a8c82]">{e.institution}</p>
              {e.board_university && (
                <p className="font-mono text-[10px] text-[#9A9AA8]">University/Board: {e.board_university}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-[10px] text-[#9A9AA8]">
                <span>{e.start_date} – {e.end_date || "Present"}</span>
                {e.cgpa_gpa && <span className="text-[#FFC43D] font-semibold">CGPA: {e.cgpa_gpa}</span>}
                {e.percentage && <span className="text-[#48C774] font-semibold">Score: {e.percentage}%</span>}
                {e.marks_obtained && <span>Marks: {e.marks_obtained} {e.max_marks ? `/ ${e.max_marks}` : ""}</span>}
              </div>
              {e.specialization && (
                <p className="text-[11px] text-[#9A9AA8]">Spec: <span className="text-[#F4F4F7]">{e.specialization}</span></p>
              )}
              {e.relevant_subjects && (
                <p className="text-[11px] text-[#9A9AA8]">Subjects: <span className="text-[#F4F4F7]">{e.relevant_subjects}</span></p>
              )}
              {e.description && (
                <p className="mt-1 text-xs text-[#9A9AA8] line-clamp-2">{e.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-lg p-1.5 text-[#9A9AA8] hover:bg-[#4F7CFF]/10 hover:text-[#4F7CFF]"
                onClick={() => handleStartEdit(e)}
                title="Edit entry"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="rounded-lg p-1.5 text-[#FF5C6C] hover:bg-[#FF5C6C]/10"
                onClick={async () => {
                  if (window.confirm("Are you sure you want to delete this education entry?")) {
                    setErrorMsg("");
                    const err = await deleteEducation(e.id);
                    if (err) {
                      setErrorMsg(`Failed to delete education entry: ${err.message || "Unknown error"}`);
                    } else if (editingId === e.id) {
                      resetForm();
                      setShowForm(false);
                    }
                  }
                }}
                title="Delete entry"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {showForm && (
        <div className="rounded-xl border border-[#4F7CFF]/40 bg-[#20202E] p-4 space-y-3 shadow-lg">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4F7CFF]">
            {editingId ? "Edit Education Entry" : "New Education Entry"}
          </p>

          {errorMsg && (
            <div className="rounded-lg border border-[#FF5C6C]/30 bg-[#FF5C6C]/10 p-2 text-xs text-[#FF5C6C]">
              {errorMsg}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Academic Level</p>
              <select
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={form.level}
                onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
              >
                {levelOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Institution Name *</p>
              <input
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={form.institution}
                onChange={(e) => setForm((p) => ({ ...p, institution: e.target.value }))}
                placeholder="e.g. Stanford University or Delhi Public School"
              />
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Degree / Qualification</p>
              <input
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={form.degree}
                onChange={(e) => setForm((p) => ({ ...p, degree: e.target.value }))}
                placeholder="e.g. B.Tech / B.S. / Higher Secondary"
              />
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Course / Field of Study</p>
              <input
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={form.field_of_study}
                onChange={(e) => setForm((p) => ({ ...p, field_of_study: e.target.value }))}
                placeholder="e.g. Computer Science"
              />
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">University / Board</p>
              <input
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={form.board_university}
                onChange={(e) => setForm((p) => ({ ...p, board_university: e.target.value }))}
                placeholder="e.g. CBSE / Autonomous / Anna University"
              />
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Specialization / Track</p>
              <input
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={form.specialization}
                onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                placeholder="e.g. AI/ML, Science Stream"
              />
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Start Year</p>
              <input
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={form.start_date}
                onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                placeholder="e.g. 2021"
              />
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">End Year / Passing Year</p>
              <input
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={form.end_date}
                onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                placeholder="e.g. 2025 or Present"
              />
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">CGPA / GPA</p>
              <input
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={form.cgpa_gpa}
                onChange={(e) => setForm((p) => ({ ...p, cgpa_gpa: e.target.value }))}
                placeholder="e.g. 9.1 / 10"
              />
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Percentage %</p>
              <input
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={form.percentage}
                onChange={(e) => setForm((p) => ({ ...p, percentage: e.target.value }))}
                placeholder="e.g. 88.5"
              />
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Marks Obtained</p>
              <input
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={form.marks_obtained}
                onChange={(e) => setForm((p) => ({ ...p, marks_obtained: e.target.value }))}
                placeholder="e.g. 475"
              />
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Total Marks</p>
              <input
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={form.max_marks}
                onChange={(e) => setForm((p) => ({ ...p, max_marks: e.target.value }))}
                placeholder="e.g. 500"
              />
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Relevant Subjects / Coursework</p>
            <input
              className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
              value={form.relevant_subjects}
              onChange={(e) => setForm((p) => ({ ...p, relevant_subjects: e.target.value }))}
              placeholder="e.g. Data Structures, OS, Machine Learning"
            />
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Description & Achievements</p>
            <textarea
              className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] p-2 text-xs text-[#F4F4F7] outline-none resize-none focus:border-[#4F7CFF]"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Thesis, rank, honors, or key activities..."
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleSave} className="rounded-xl bg-[#4F7CFF] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3b66e0]">
              {editingId ? "Save Changes" : "Add Entry"}
            </button>
            <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-4 py-1.5 text-xs text-[#9A9AA8]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button type="button" onClick={handleStartAdd} className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#2A2A3A] bg-[#20202E] p-3 text-xs text-[#9A9AA8] hover:border-[#4F7CFF]/40 hover:text-[#F4F4F7]">
          <Plus className="h-3.5 w-3.5 text-[#4F7CFF]" />Add education entry
        </button>
      )}
    </div>
  );
}

function ExperienceSection() {
  const { data, addExperience, deleteExperience } = useResumeData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<ResumeExperience, "id">>({
    company: "", position: "", start_date: "", end_date: "", description: "",
  });

  async function handleAdd() {
    if (!form.company.trim() || !form.position.trim()) return;
    await addExperience(form);
    setForm({ company: "", position: "", start_date: "", end_date: "", description: "" });
    setShowForm(false);
  }

  return (
    <div className="space-y-2">
      {data.experience.map((e) => (
        <div key={e.id} className="flex items-start justify-between gap-2 rounded-xl border border-[#2A2A3A] bg-[#20202E] p-3">
          <div>
            <p className="text-xs font-semibold text-[#F4F4F7]">{e.position}</p>
            <p className="font-mono text-[11px] text-[#4F7CFF]">{e.company}</p>
            <p className="font-mono text-[10px] text-[#9A9AA8]">{e.start_date} – {e.end_date}</p>
          </div>
          <button type="button" className="rounded-lg p-1.5 text-[#FF5C6C] hover:bg-[#FF5C6C]/10" onClick={() => deleteExperience(e.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {showForm && (
        <div className="rounded-xl border border-[#4F7CFF]/40 bg-[#20202E] p-4 space-y-3 shadow-lg">
          {(["company", "position", "start_date", "end_date"] as const).map((f) => (
            <div key={f}>
              <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">{f.replace(/_/g, " ")}</p>
              <input className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]" value={form[f]} onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))} />
            </div>
          ))}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Description</p>
            <textarea className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] p-2 text-xs text-[#F4F4F7] outline-none resize-none focus:border-[#4F7CFF]" rows={2} value={form.description || ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleAdd} className="rounded-xl bg-[#4F7CFF] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3b66e0]">Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-4 py-1.5 text-xs text-[#9A9AA8]">Cancel</button>
          </div>
        </div>
      )}
      {!showForm && (
        <button type="button" onClick={() => setShowForm(true)} className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#2A2A3A] bg-[#20202E] p-3 text-xs text-[#9A9AA8] hover:border-[#4F7CFF]/40 hover:text-[#F4F4F7]">
          <Plus className="h-3.5 w-3.5 text-[#4F7CFF]" />Add experience
        </button>
      )}
    </div>
  );
}

function SkillsSection() {
  const { data, addSkill, deleteSkill } = useResumeData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<ResumeSkill, "id">>({ name: "", category: "Programming" });

  async function handleAdd() {
    if (!form.name.trim()) return;
    await addSkill(form);
    setForm({ name: "", category: "Programming" });
    setShowForm(false);
  }

  const byCategory = data.skills.reduce<Record<string, ResumeSkill[]>>((acc, s) => {
    const cat = s.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(byCategory).map(([cat, skills]) => (
        <div key={cat}>
          <p className="mb-1.5 font-mono text-[10px] uppercase font-semibold tracking-wider text-[#9A9AA8]">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s.id} className="group flex items-center gap-1.5 rounded-xl border border-[#2A2A3A] bg-[#20202E] px-3 py-1 font-mono text-xs text-[#F4F4F7]">
                {s.name}
                <button type="button" onClick={() => deleteSkill(s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#FF5C6C]">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      ))}
      {showForm && (
        <div className="flex flex-col sm:flex-row gap-3 items-end rounded-xl border border-[#4F7CFF]/40 bg-[#20202E] p-4 shadow-lg">
          <div className="flex-1 w-full">
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Skill Name</p>
            <input className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. React" />
          </div>
          <div className="flex-1 w-full">
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1 text-[#9A9AA8]">Category</p>
            <input className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]" value={form.category || ""} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. Frontend" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleAdd} className="rounded-xl bg-[#4F7CFF] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3b66e0]">Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-4 py-1.5 text-xs text-[#9A9AA8]">Cancel</button>
          </div>
        </div>
      )}
      {!showForm && (
        <button type="button" onClick={() => setShowForm(true)} className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#2A2A3A] bg-[#20202E] p-3 text-xs text-[#9A9AA8] hover:border-[#4F7CFF]/40 hover:text-[#F4F4F7]">
          <Plus className="h-3.5 w-3.5 text-[#4F7CFF]" />Add skill
        </button>
      )}
    </div>
  );
}

function ProjectsSection() {
  const { data, addProject, updateProject, deleteProject, uploadProjectImage } = useResumeData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [addForm, setAddForm] = useState<Omit<ResumeProject, "id">>({
    title: "", description: "", technologies: [], github_url: "", live_url: "", start_date: "",
  });
  const [editForm, setEditForm] = useState<Omit<ResumeProject, "id">>({
    title: "", description: "", technologies: [], github_url: "", live_url: "", start_date: "",
  });

  async function handleAdd() {
    if (!addForm.title.trim()) return;
    await addProject(addForm);
    setAddForm({ title: "", description: "", technologies: [], github_url: "", live_url: "", start_date: "" });
    setShowAddForm(false);
  }

  function startEdit(p: ResumeProject) {
    setEditingId(p.id);
    setEditForm({
      title: p.title,
      description: p.description || "",
      technologies: p.technologies || [],
      github_url: p.github_url || "",
      live_url: p.live_url || "",
      start_date: p.start_date || "",
      image_url: p.image_url,
    });
  }

  async function handleSaveEdit(id: string) {
    await updateProject(id, {
      title: editForm.title,
      description: editForm.description,
      technologies: editForm.technologies,
      github_url: editForm.github_url,
      live_url: editForm.live_url,
      start_date: editForm.start_date,
    });
    setEditingId(null);
  }

  function triggerImageUpload(projectId: string) {
    setPendingProjectId(projectId);
    if (fileInputRef.current) { fileInputRef.current.value = ""; fileInputRef.current.click(); }
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const pendingId = pendingProjectId;
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file || !pendingId) return;
    if (!file.type.startsWith("image/")) {
      setUploadErrors((p) => ({ ...p, [pendingId]: "Must be JPEG, PNG, or WebP" }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadErrors((p) => ({ ...p, [pendingId]: "Image must be under 10 MB" }));
      return;
    }
    setPendingProjectId(null);
    setUploadingId(pendingId);
    setUploadErrors((p) => ({ ...p, [pendingId]: "" }));
    const res = await uploadProjectImage(file, pendingId);
    if (res.error) setUploadErrors((p) => ({ ...p, [pendingId]: res.error! }));
    setUploadingId(null);
  }

  const techStr = (form: Omit<ResumeProject, "id">) => (form.technologies || []).join(", ");
  const setTechs = (val: string, setter: React.Dispatch<React.SetStateAction<Omit<ResumeProject, "id">>>) =>
    setter((f) => ({ ...f, technologies: val.split(",").map((s) => s.trim()).filter(Boolean) }));

  return (
    <div className="space-y-3">
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageFileChange} />

      {data.projects.map((p) => (
        <div key={p.id} className="overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#20202E]">
          {editingId === p.id ? (
            <div className="space-y-3 p-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4F7CFF]">Editing project</p>
              {(["title", "description", "github_url", "live_url", "start_date"] as const).map((field) => (
                <div key={field}>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[#9A9AA8]">
                    {field === "github_url" ? "GitHub URL" : field === "live_url" ? "Live / Demo URL" : field === "start_date" ? "Year / Start Date" : field}
                  </p>
                  <input
                    className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                    value={(editForm[field] as string) || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[#9A9AA8]">Technologies (comma-separated)</p>
                <input
                  className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                  value={techStr(editForm)}
                  onChange={(e) => setTechs(e.target.value, setEditForm)}
                  placeholder="React, TypeScript, Supabase"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => handleSaveEdit(p.id)} className="flex items-center gap-1.5 rounded-xl bg-[#4F7CFF] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3b66e0]">
                  <Save className="h-3 w-3" /> Save
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-4 py-1.5 text-xs text-[#9A9AA8]">Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              {p.image_url && (
                <img src={p.image_url} alt={p.title} crossOrigin="anonymous" className="h-36 w-full object-cover" />
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[#F4F4F7]">{p.title}</p>
                    {p.start_date && <p className="font-mono text-[10px] text-[#9A9AA8]">{p.start_date}</p>}
                    {p.technologies && p.technologies.length > 0 && (
                      <p className="mt-0.5 truncate font-mono text-[10px] text-[#4F7CFF]">{p.technologies.join(", ")}</p>
                    )}
                    {p.description && <p className="mt-1 line-clamp-2 text-[11px] text-[#9A9AA8]">{p.description}</p>}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <button type="button" title={p.image_url ? "Replace image" : "Upload image"}
                      onClick={() => triggerImageUpload(p.id)} disabled={uploadingId === p.id}
                      className="rounded-lg p-1.5 text-[#9A9AA8] transition-colors hover:bg-[#2A2A3A] hover:text-[#F4F4F7] disabled:opacity-50">
                      {uploadingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                    </button>
                    <button type="button" title="Edit" onClick={() => startEdit(p)}
                      className="rounded-lg p-1.5 text-[#9A9AA8] transition-colors hover:bg-[#2A2A3A] hover:text-[#F4F4F7]">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" title="Delete" onClick={() => deleteProject(p.id)}
                      className="rounded-lg p-1.5 text-[#FF5C6C] transition-colors hover:bg-[#FF5C6C]/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {uploadErrors[p.id] && <p className="mt-1 font-mono text-[10px] text-[#FF5C6C]">{uploadErrors[p.id]}</p>}
                {(p.github_url || p.live_url) && (
                  <div className="mt-2 flex flex-wrap gap-3">
                    {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="font-mono text-[10px] text-[#4F7CFF] hover:underline">GitHub ↗</a>}
                    {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="font-mono text-[10px] text-[#2a8c82] hover:underline">Live Demo ↗</a>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {showAddForm && (
        <div className="space-y-3 rounded-xl border border-[#4F7CFF]/40 bg-[#20202E] p-4 shadow-lg">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4F7CFF]">New Project</p>
          {(["title", "description", "github_url", "live_url", "start_date"] as const).map((field) => (
            <div key={field}>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[#9A9AA8]">
                {field === "github_url" ? "GitHub URL" : field === "live_url" ? "Live / Demo URL" : field === "start_date" ? "Year / Start Date" : field}
              </p>
              <input
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={(addForm[field] as string) || ""}
                onChange={(e) => setAddForm((f) => ({ ...f, [field]: e.target.value }))}
                placeholder={field === "start_date" ? "e.g. 2024" : field === "live_url" ? "https://..." : ""}
              />
            </div>
          ))}
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[#9A9AA8]">Technologies (comma-separated)</p>
            <input
              className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
              value={techStr(addForm)}
              onChange={(e) => setTechs(e.target.value, setAddForm)}
              placeholder="React, TypeScript, Supabase"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleAdd} className="rounded-xl bg-[#4F7CFF] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3b66e0]">Add Project</button>
            <button type="button" onClick={() => { setShowAddForm(false); setAddForm({ title: "", description: "", technologies: [], github_url: "", live_url: "", start_date: "" }); }}
              className="rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-4 py-1.5 text-xs text-[#9A9AA8]">Cancel</button>
          </div>
        </div>
      )}

      {!showAddForm && (
        <button type="button" onClick={() => setShowAddForm(true)}
          className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#2A2A3A] bg-[#20202E] p-3 text-xs text-[#9A9AA8] hover:border-[#4F7CFF]/40 hover:text-[#F4F4F7]">
          <Plus className="h-3.5 w-3.5 text-[#4F7CFF]" /> Add project
        </button>
      )}
    </div>
  );
}

function AchievementsSection() {
  const { data, addAchievement, updateAchievement, deleteAchievement, uploadAchievementImage } = useResumeData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [pendingAchId, setPendingAchId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [addForm, setAddForm] = useState<Omit<ResumeAchievement, "id">>({
    title: "", date: "", description: "", organization: "", position: "",
  });
  const [editForm, setEditForm] = useState<Omit<ResumeAchievement, "id">>({
    title: "", date: "", description: "", organization: "", position: "",
  });

  async function handleAdd() {
    if (!addForm.title.trim()) return;
    await addAchievement(addForm);
    setAddForm({ title: "", date: "", description: "", organization: "", position: "" });
    setShowAddForm(false);
  }

  function startEdit(a: ResumeAchievement) {
    setEditingId(a.id);
    setEditForm({
      title: a.title,
      date: a.date || "",
      description: a.description || "",
      organization: a.organization || "",
      position: a.position || "",
      image_url: a.image_url,
    });
  }

  async function handleSaveEdit(id: string) {
    await updateAchievement(id, {
      title: editForm.title,
      date: editForm.date,
      description: editForm.description,
      organization: editForm.organization,
      position: editForm.position,
    });
    setEditingId(null);
  }

  function triggerImageUpload(achId: string) {
    setPendingAchId(achId);
    if (fileInputRef.current) { fileInputRef.current.value = ""; fileInputRef.current.click(); }
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const pendingId = pendingAchId;
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file || !pendingId) return;
    if (!file.type.startsWith("image/")) {
      setUploadErrors((p) => ({ ...p, [pendingId]: "Must be JPEG, PNG, or WebP" }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadErrors((p) => ({ ...p, [pendingId]: "Image must be under 10 MB" }));
      return;
    }
    setPendingAchId(null);
    setUploadingId(pendingId);
    setUploadErrors((p) => ({ ...p, [pendingId]: "" }));
    const res = await uploadAchievementImage(file, pendingId);
    if (res.error) setUploadErrors((p) => ({ ...p, [pendingId]: res.error! }));
    setUploadingId(null);
  }

  return (
    <div className="space-y-3">
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageFileChange} />

      {data.achievements.map((a) => (
        <div key={a.id} className="overflow-hidden rounded-xl border border-[#2A2A3A] bg-[#20202E]">
          {editingId === a.id ? (
            <div className="space-y-3 p-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4F7CFF]">Editing achievement</p>
              {(["title", "organization", "position", "date"] as const).map((field) => (
                <div key={field}>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[#9A9AA8]">
                    {field === "organization" ? "Organization / Event" : field === "position" ? "Position / Result" : field}
                  </p>
                  <input
                    className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                    value={(editForm[field] as string) || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                    placeholder={field === "date" ? "e.g. 2024" : field === "position" ? "e.g. 1st Place" : ""}
                  />
                </div>
              ))}
              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[#9A9AA8]">Description</p>
                <textarea
                  className="w-full resize-none rounded-xl border border-[#2A2A3A] bg-[#1B1B28] p-2 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                  rows={2}
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => handleSaveEdit(a.id)} className="flex items-center gap-1.5 rounded-xl bg-[#4F7CFF] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3b66e0]">
                  <Save className="h-3 w-3" /> Save
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-4 py-1.5 text-xs text-[#9A9AA8]">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="p-3">
              <div className="flex items-start gap-3">
                {a.image_url && (
                  <img src={a.image_url} alt={a.title} crossOrigin="anonymous"
                    className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#F4F4F7]">{a.title}</p>
                      {a.organization && <p className="font-mono text-[10px] text-[#4F7CFF]">{a.organization}</p>}
                      {a.position && <p className="font-mono text-[10px] text-[#9A9AA8]">{a.position}</p>}
                      {a.date && <p className="font-mono text-[10px] text-[#FFC43D]">{a.date}</p>}
                      {a.description && <p className="mt-1 line-clamp-2 text-[11px] text-[#9A9AA8]">{a.description}</p>}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button type="button" title={a.image_url ? "Replace certificate" : "Upload certificate"}
                        onClick={() => triggerImageUpload(a.id)} disabled={uploadingId === a.id}
                        className="rounded-lg p-1.5 text-[#9A9AA8] transition-colors hover:bg-[#2A2A3A] hover:text-[#F4F4F7] disabled:opacity-50">
                        {uploadingId === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                      </button>
                      <button type="button" title="Edit" onClick={() => startEdit(a)}
                        className="rounded-lg p-1.5 text-[#9A9AA8] transition-colors hover:bg-[#2A2A3A] hover:text-[#F4F4F7]">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" title="Delete" onClick={() => deleteAchievement(a.id)}
                        className="rounded-lg p-1.5 text-[#FF5C6C] transition-colors hover:bg-[#FF5C6C]/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {uploadErrors[a.id] && <p className="mt-1 font-mono text-[10px] text-[#FF5C6C]">{uploadErrors[a.id]}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {showAddForm && (
        <div className="space-y-3 rounded-xl border border-[#4F7CFF]/40 bg-[#20202E] p-4 shadow-lg">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4F7CFF]">New Achievement</p>
          {(["title", "organization", "position", "date"] as const).map((field) => (
            <div key={field}>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[#9A9AA8]">
                {field === "organization" ? "Organization / Event" : field === "position" ? "Position / Result" : field}
              </p>
              <input
                className="w-full rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
                value={(addForm[field] as string) || ""}
                onChange={(e) => setAddForm((f) => ({ ...f, [field]: e.target.value }))}
                placeholder={field === "date" ? "e.g. 2024" : field === "position" ? "e.g. 1st Place" : ""}
              />
            </div>
          ))}
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[#9A9AA8]">Description</p>
            <textarea
              className="w-full resize-none rounded-xl border border-[#2A2A3A] bg-[#1B1B28] p-2 text-xs text-[#F4F4F7] outline-none focus:border-[#4F7CFF]"
              rows={2}
              value={addForm.description || ""}
              onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleAdd} className="rounded-xl bg-[#4F7CFF] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3b66e0]">Add Achievement</button>
            <button type="button" onClick={() => { setShowAddForm(false); setAddForm({ title: "", date: "", description: "", organization: "", position: "" }); }}
              className="rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-4 py-1.5 text-xs text-[#9A9AA8]">Cancel</button>
          </div>
        </div>
      )}

      {!showAddForm && (
        <button type="button" onClick={() => setShowAddForm(true)}
          className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#2A2A3A] bg-[#20202E] p-3 text-xs text-[#9A9AA8] hover:border-[#4F7CFF]/40 hover:text-[#F4F4F7]">
          <Plus className="h-3.5 w-3.5 text-[#4F7CFF]" /> Add achievement
        </button>
      )}
    </div>
  );
}

// ─── Main ProfileSection component ───────────────────────────────────────────

function ProfileSection({
  config,
  onToggle,
}: {
  config: SectionConfig;
  onToggle: (id: string, field: "published" | "includeInResume") => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const sectionContent: Record<string, React.ReactNode> = {
    personal: <PersonalSection />,
    education: <EducationSection />,
    experience: <ExperienceSection />,
    skills: <SkillsSection />,
    projects: <ProjectsSection />,
    achievements: <AchievementsSection />,
  };

  return (
    <div className="rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] overflow-hidden shadow-lg shadow-black/20">
      <div className="flex items-center gap-3 px-5 py-4">
        <GripVertical className="h-4 w-4 cursor-grab flex-shrink-0 text-[#9A9AA8]" />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 text-left"
        >
          <span className="font-display text-sm font-semibold tracking-tight text-[#F4F4F7]">
            {config.label}
          </span>
        </button>
        <div className="flex items-center gap-4">
          <Switch
            checked={config.published}
            onChange={() => onToggle(config.id, "published")}
            label="Published"
            id={`pub-${config.id}`}
          />
          <Switch
            checked={config.includeInResume}
            onChange={() => onToggle(config.id, "includeInResume")}
            label="Resume"
            id={`res-${config.id}`}
          />
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg p-1.5 text-[#9A9AA8] transition-colors hover:bg-[#20202E] hover:text-[#F4F4F7]"
          >
            {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#2A2A3A] bg-[#171824] px-5 py-5">
          {sectionContent[config.id] ?? (
            <div className="text-xs text-[#9A9AA8]">
              Section editor for <strong>{config.label}</strong> — configured.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfileBuilder() {
  const { isLoading } = useResumeData();
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);

  function toggleSection(id: string, field: "published" | "includeInResume") {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: !s[field] } : s))
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title="Profile Builder"
        description="Manage your professional profile. Toggle visibility and resume inclusion per section."
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] px-5 py-3.5 text-xs text-[#9A9AA8] shadow-lg shadow-black/20">
        <span>
          <strong className="text-[#F4F4F7]">Published</strong> — visible on public portfolio
        </span>
        <span>
          <strong className="text-[#F4F4F7]">Resume</strong> — included when generating resume
        </span>
        {isLoading && <span className="text-[#4F7CFF] font-mono">Loading data from Supabase...</span>}
      </div>

      <div className="space-y-3">
        {sections.map((s) => (
          <ProfileSection key={s.id} config={s} onToggle={toggleSection} />
        ))}
      </div>
    </div>
  );
}
