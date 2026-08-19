import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { useResumeData } from "@/hooks/useResumeData";
import { useAuth } from "@/context/AuthContext";

const settingsSections = [
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "ai", label: "AI Settings" },
  { id: "drive", label: "Google Drive" },
  { id: "resume", label: "Resume" },
  { id: "security", label: "Security" },
  { id: "appearance", label: "Appearance" },
];

function SCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#2A2A3A] bg-[#1B1B28] overflow-hidden shadow-lg shadow-black/20">
      <div className="border-b border-[#2A2A3A] bg-[#171824] px-6 py-4">
        <h3 className="font-display text-sm font-semibold tracking-tight text-[#F4F4F7]">{title}</h3>
      </div>
      <div className="p-6 space-y-6">{children}</div>
    </div>
  );
}

function SRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1">
        <p className="text-xs font-semibold text-[#F4F4F7]">{label}</p>
        {description && <p className="mt-0.5 text-xs text-[#9A9AA8]">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { user, refreshProfile } = useAuth();
  const { data, saveProfile, uploadAvatar, isSaving } = useResumeData();
  const [activeSection, setActiveSection] = useState("account");

  const [accForm, setAccForm] = useState({
    fullName: "",
    phone: "",
    location: "",
    role: "",
  });
  const [savedAcc, setSavedAcc] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarErr, setAvatarErr] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data.profile) {
      setAccForm({
        fullName: data.profile.full_name || user?.name || "",
        phone: data.profile.phone || "",
        location: data.profile.location || "",
        role: data.profile.role || "",
      });
    }
  }, [data.profile, user?.name]);

  const [notifications, setNotifications] = useState({
    taskDue: true, deadlines: true, reminders: true, email: false, browser: true,
  });
  const [ai, setAi] = useState({
    provider: "openai", canReadNotes: true, canReadDocs: true, canCreateTasks: true, canReadDrive: false,
  });
  const [appearance, setAppearance] = useState({ darkMode: true });
  const [resume, setResume] = useState({ autoUpdate: true, publicUrl: true });

  async function handleSaveAccount() {
    const err = await saveProfile({
      full_name: accForm.fullName,
      phone: accForm.phone,
      location: accForm.location,
      role: accForm.role,
    });
    if (!err) {
      setSavedAcc(true);
      await refreshProfile();
      setTimeout(() => setSavedAcc(false), 2000);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setAvatarErr("");
    const res = await uploadAvatar(file);
    if (res.error) {
      setAvatarErr(res.error);
    } else if (res.url) {
      await refreshProfile();
    }
    setUploading(false);
  }

  const currentAvatar = data.profile.avatar_url || user?.avatarUrl;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader title="Settings" description="Manage your account preferences and integrations." />

      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        {/* Sidebar nav */}
        <aside className="md:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {settingsSections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`flex w-full rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-all ${
                  activeSection === s.id
                    ? "bg-[#4F7CFF] text-white font-semibold shadow-md"
                    : "text-[#9A9AA8] hover:bg-[#1B1B28] hover:text-[#F4F4F7]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>


        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeSection === "account" && (
            <SCard title="Account">
              {/* Avatar Upload Box */}
              <div className="flex items-center gap-4 rounded border p-4" style={{ borderColor: "#2e3540", backgroundColor: "#252c36" }}>
                <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#2e3540] bg-[#171a20]">
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="Profile Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display text-lg font-bold text-[#e9ebf0]">{user?.initials || "PK"}</span>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "#e9ebf0" }}>Profile Avatar</p>
                  <p className="text-xs" style={{ color: "#8f97a5" }}>Upload avatar image stored in Supabase Storage.</p>
                  {avatarErr && <p className="mt-1 font-mono text-xs text-red-400">{avatarErr}</p>}
                </div>

                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading || isSaving}
                  className="flex items-center gap-2 rounded border px-3 py-1.5 text-xs font-medium transition-colors hover:border-[#2a8c82]/50 disabled:opacity-50"
                  style={{ borderColor: "#2e3540", color: "#e9ebf0", backgroundColor: "#1e232b" }}
                >
                  <Camera className="h-3.5 w-3.5" style={{ color: "#2a8c82" }} />
                  {uploading ? "Uploading..." : "Change Photo"}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  value={accForm.fullName}
                  onChange={(e) => setAccForm((f) => ({ ...f, fullName: e.target.value }))}
                />
                <Input
                  label="Email"
                  value={user?.email || "pratik@example.com"}
                  disabled
                  type="email"
                />
                <Input
                  label="Phone"
                  value={accForm.phone}
                  onChange={(e) => setAccForm((f) => ({ ...f, phone: e.target.value }))}
                  type="tel"
                />
                <Input
                  label="Location"
                  value={accForm.location}
                  onChange={(e) => setAccForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  label="Professional Role / Tagline"
                  value={accForm.role}
                  onChange={(e) => setAccForm((f) => ({ ...f, role: e.target.value }))}
                />
              </div>
              <button
                type="button"
                onClick={handleSaveAccount}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#3b66e0] disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {savedAcc ? "Saved!" : isSaving ? "Saving..." : "Save Changes"}
              </button>
            </SCard>
          )}

          {activeSection === "notifications" && (
            <SCard title="Notifications">
              <SRow label="Task due reminders" description="Get notified when a task is approaching its due date.">
                <Switch checked={notifications.taskDue} onChange={(v) => setNotifications((n) => ({ ...n, taskDue: v }))} />
              </SRow>
              <SRow label="Deadline alerts" description="Receive alerts for upcoming and overdue deadlines.">
                <Switch checked={notifications.deadlines} onChange={(v) => setNotifications((n) => ({ ...n, deadlines: v }))} />
              </SRow>
              <SRow label="Reminders" description="Enable in-app reminder notifications.">
                <Switch checked={notifications.reminders} onChange={(v) => setNotifications((n) => ({ ...n, reminders: v }))} />
              </SRow>
              <SRow label="Email notifications" description="Send notifications to your email address.">
                <Switch checked={notifications.email} onChange={(v) => setNotifications((n) => ({ ...n, email: v }))} />
              </SRow>
              <SRow label="Browser push" description="Enable browser push notifications.">
                <Switch checked={notifications.browser} onChange={(v) => setNotifications((n) => ({ ...n, browser: v }))} />
              </SRow>
            </SCard>
          )}

          {activeSection === "ai" && (
            <SCard title="AI Settings">
              <SRow label="AI Provider" description="Choose the AI model provider.">
                <select
                  value={ai.provider}
                  onChange={(e) => setAi((a) => ({ ...a, provider: e.target.value }))}
                  className="rounded border px-3 py-1.5 text-sm outline-none"
                  style={{ backgroundColor: "#252c36", borderColor: "#2e3540", color: "#e9ebf0" }}
                >
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="anthropic">Anthropic (Claude 3.5)</option>
                  <option value="google">Google (Gemini)</option>
                </select>
              </SRow>
              <SRow label="Read notes" description="Allow AI to read and reference your notes.">
                <Switch checked={ai.canReadNotes} onChange={(v) => setAi((a) => ({ ...a, canReadNotes: v }))} />
              </SRow>
              <SRow label="Read documents" description="Allow AI to access documents marked for AI access.">
                <Switch checked={ai.canReadDocs} onChange={(v) => setAi((a) => ({ ...a, canReadDocs: v }))} />
              </SRow>
              <SRow label="Create tasks" description="Allow AI to create tasks on your behalf.">
                <Switch checked={ai.canCreateTasks} onChange={(v) => setAi((a) => ({ ...a, canCreateTasks: v }))} />
              </SRow>
              <SRow label="Access Google Drive" description="Allow AI to search your Drive files.">
                <Switch checked={ai.canReadDrive} onChange={(v) => setAi((a) => ({ ...a, canReadDrive: v }))} />
              </SRow>
            </SCard>
          )}

          {activeSection === "drive" && (
            <SCard title="Google Drive">
              <div
                className="flex items-center gap-3 rounded border p-4"
                style={{ borderColor: "#2a8c82", backgroundColor: "#1a302e" }}
              >
                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#2a8c82" }}>
                  <span className="font-bold text-white text-sm">G</span>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#e9ebf0" }}>pratik@gmail.com</p>
                  <p className="font-mono text-xs" style={{ color: "#2a8c82" }}>Connected</p>
                </div>
                <button
                  type="button"
                  className="ml-auto rounded border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
                  style={{ borderColor: "#c0392b", color: "#c0392b" }}
                >
                  Disconnect
                </button>
              </div>
              <p className="text-xs" style={{ color: "#8f97a5" }}>
                OAuth integration will be fully implemented in the Supabase phase.
              </p>
            </SCard>
          )}

          {activeSection === "resume" && (
            <SCard title="Resume Preferences">
              <SRow label="Auto-update resume" description="Automatically update resume when profile changes.">
                <Switch checked={resume.autoUpdate} onChange={(v) => setResume((r) => ({ ...r, autoUpdate: v }))} />
              </SRow>
              <SRow label="Public resume URL" description="Make resume accessible at a public URL.">
                <Switch checked={resume.publicUrl} onChange={(v) => setResume((r) => ({ ...r, publicUrl: v }))} />
              </SRow>
              <Input label="Custom Resume URL" defaultValue="pratik.dev/resume" hint="Public URL for your resume" />
            </SCard>
          )}

          {activeSection === "security" && (
            <SCard title="Security">
              <SRow label="Change Password" description="Update your login password.">
                <button
                  type="button"
                  className="rounded border px-3 py-1.5 text-xs font-medium transition-colors hover:border-[#2a8c82]/50"
                  style={{ borderColor: "#2e3540", color: "#e9ebf0" }}
                >
                  Change Password
                </button>
              </SRow>
              <SRow label="Two-Factor Authentication" description="Add an extra layer of security.">
                <button
                  type="button"
                  className="rounded px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: "#2a8c82" }}
                >
                  Enable 2FA
                </button>
              </SRow>
              <SRow label="Active Sessions" description="View and revoke active login sessions.">
                <button
                  type="button"
                  className="rounded border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
                  style={{ borderColor: "#c0392b", color: "#c0392b" }}
                >
                  View Sessions
                </button>
              </SRow>
            </SCard>
          )}

          {activeSection === "appearance" && (
            <SCard title="Appearance">
              <SRow label="Dark Mode" description="The dashboard always uses dark mode. Toggle light mode for public portfolio.">
                <Switch checked={appearance.darkMode} onChange={(v) => setAppearance((a) => ({ ...a, darkMode: v }))} />
              </SRow>
              <div>
                <p className="mb-2 font-mono text-xs uppercase tracking-wider" style={{ color: "#5b6472" }}>Accent Color</p>
                <div className="flex gap-2">
                  {["#2a8c82", "#4285f4", "#b8763a", "#9c27b0", "#0f9d58"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="h-6 w-6 rounded-full border-2 transition-colors"
                      style={{ backgroundColor: c, borderColor: c === "#2a8c82" ? "#fff" : "transparent" }}
                    />
                  ))}
                </div>
              </div>
            </SCard>
          )}
        </div>
      </div>
    </div>
  );
}
