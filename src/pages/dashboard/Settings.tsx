import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { useResumeData } from "@/hooks/useResumeData";
import { useAuth } from "@/context/AuthContext";
import { useTheme, accentColors, type ThemeMode } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";

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
  const { data, saveProfile, uploadAvatar, refetch: refetchResume, isSaving } = useResumeData();
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
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

  // Change Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // MFA 2FA state
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaQrCode, setMfaQrCode] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaEnrollFactorId, setMfaEnrollFactorId] = useState("");
  const [totpInput, setTotpInput] = useState("");
  const [isVerifyingTotp, setIsVerifyingTotp] = useState(false);
  const [mfaMsg, setMfaMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Reset Modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState("");

  const fetchMfaStatus = useCallback(async () => {
    if (!user) return;
    try {
      const { data: factorsData, error } = await supabase.auth.mfa.listFactors();
      if (!error && factorsData) {
        const verifiedFactor = factorsData.totp?.find((f) => f.status === "verified");
        if (verifiedFactor) {
          setMfaEnabled(true);
          setMfaFactorId(verifiedFactor.id);
        } else {
          setMfaEnabled(false);
          setMfaFactorId(null);
        }
      }
    } catch (err) {
      console.error("Error fetching MFA factors:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchMfaStatus();
  }, [fetchMfaStatus]);

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
  const [resume, setResume] = useState({ autoUpdate: true, publicUrl: true });

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setIsChangingPassword(true);
    try {
      // 1. Verify current password if user has email credentials
      if (user?.email && currentPassword) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });
        if (signInErr) {
          throw new Error("Current password verification failed. Please check your password.");
        }
      }

      // 2. Update password via Supabase Auth API
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateErr) throw updateErr;

      setPasswordMsg({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err: any) {
      console.error("Password change error:", err);
      setPasswordMsg({ type: "error", text: err?.message || "Failed to update password." });
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleStartMfaEnroll() {
    if (!user) return;
    setMfaMsg(null);
    try {
      const { data: enrollData, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "Personal Hub",
        friendlyName: user.email || "Workspace User",
      });
      if (error) throw error;

      setMfaEnrollFactorId(enrollData.id);
      setMfaQrCode(enrollData.totp.qr_code);
      setMfaSecret(enrollData.totp.secret);
      setTotpInput("");
      setShowMfaModal(true);
    } catch (err: any) {
      console.error("MFA enroll error:", err);
      setMfaMsg({ type: "error", text: err?.message || "Failed to start 2FA enrollment." });
    }
  }

  async function handleVerifyTotpEnrollment(e: React.FormEvent) {
    e.preventDefault();
    if (!totpInput || totpInput.length !== 6) {
      setMfaMsg({ type: "error", text: "Enter a valid 6-digit TOTP code." });
      return;
    }
    setIsVerifyingTotp(true);
    setMfaMsg(null);
    try {
      const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({
        factorId: mfaEnrollFactorId,
      });
      if (challengeErr) throw challengeErr;

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId: mfaEnrollFactorId,
        challengeId: challengeData.id,
        code: totpInput,
      });
      if (verifyErr) throw verifyErr;

      setMfaEnabled(true);
      setMfaFactorId(mfaEnrollFactorId);
      setShowMfaModal(false);
      setMfaMsg({ type: "success", text: "Two-Factor Authentication enabled successfully!" });
    } catch (err: any) {
      console.error("MFA verify error:", err);
      setMfaMsg({ type: "error", text: err?.message || "Invalid code. Please try again." });
    } finally {
      setIsVerifyingTotp(false);
    }
  }

  async function handleDisableMfa() {
    if (!mfaFactorId) return;
    if (!confirm("Are you sure you want to disable Two-Factor Authentication?")) return;
    setMfaMsg(null);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: mfaFactorId,
      });
      if (error) throw error;

      setMfaEnabled(false);
      setMfaFactorId(null);
      setMfaMsg({ type: "success", text: "Two-Factor Authentication disabled." });
    } catch (err: any) {
      console.error("MFA unenroll error:", err);
      setMfaMsg({ type: "error", text: err?.message || "Failed to disable 2FA." });
    }
  }

  async function handleResetAllData() {
    if (resetConfirmText !== "RESET") {
      setResetError("You must type RESET exactly.");
      return;
    }
    if (!user) return;

    setIsResetting(true);
    setResetError("");

    try {
      // 1. Attempt Edge function reset
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

      let edgeSuccess = false;
      if (token && supabaseUrl) {
        try {
          const res = await fetch(`${supabaseUrl}/functions/v1/reset-user-data`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ confirmText: "RESET", password: resetPassword }),
          });
          if (res.ok) {
            edgeSuccess = true;
          }
        } catch {
          // Fallback to client-side scoped DB cleanup if edge function not deployed
        }
      }

      if (!edgeSuccess) {
        // Scoped client-side deletion for authenticated user
        const tables = [
          "notes", "tasks", "reminders", "deadlines", "important",
          "documents", "ai_conversations", "ai_messages", "education",
          "experience", "skills", "projects", "achievements"
        ];
        for (const table of tables) {
          await supabase.from(table).delete().eq("user_id", user.id);
        }
        await supabase
          .from("profiles")
          .update({
            role_title: "",
            bio: "",
            phone: "",
            location: "",
            avatar_url: "",
            github_url: "",
            linkedin_url: "",
            website_url: "",
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      await refreshProfile();
      await refetchResume();
      setShowResetModal(false);
      setResetConfirmText("");
      setResetPassword("");
    } catch (err: any) {
      console.error("Reset error:", err);
      setResetError(err.message || "Reset failed.");
    } finally {
      setIsResetting(false);
    }
  }

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
            <div className="space-y-6">
              <SCard title="Security">
                {mfaMsg && (
                  <div
                    className={`rounded-xl border p-3 text-xs flex items-center gap-2 ${
                      mfaMsg.type === "success"
                        ? "border-[#48C774]/40 bg-[#48C774]/10 text-[#48C774]"
                        : "border-[#FF5C6C]/40 bg-[#FF5C6C]/10 text-[#FF5C6C]"
                    }`}
                  >
                    {mfaMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <span>{mfaMsg.text}</span>
                  </div>
                )}

                <SRow label="Change Password" description="Update your authenticated Supabase login password.">
                  <button
                    type="button"
                    onClick={() => { setShowPasswordModal(true); setPasswordMsg(null); }}
                    className="rounded-xl border border-[#2e3540] bg-[#1e232b] px-4 py-2 text-xs font-semibold text-[#e9ebf0] transition-colors hover:border-[#4F7CFF] hover:text-white cursor-pointer"
                  >
                    Change Password
                  </button>
                </SRow>

                <SRow
                  label="Two-Factor Authentication (MFA)"
                  description={mfaEnabled ? "2FA is active on your account using a TOTP Authenticator app." : "Add an extra layer of security using a TOTP Authenticator app (Google Authenticator, Authy, etc.)."}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-lg px-2.5 py-1 font-mono text-[10px] font-semibold border ${
                        mfaEnabled
                          ? "border-[#48C774]/40 bg-[#48C774]/10 text-[#48C774]"
                          : "border-[#9A9AA8]/30 bg-[#20202E] text-[#9A9AA8]"
                      }`}
                    >
                      {mfaEnabled ? "Active" : "Disabled"}
                    </span>
                    {mfaEnabled ? (
                      <button
                        type="button"
                        onClick={handleDisableMfa}
                        className="rounded-xl border border-[#FF5C6C]/40 bg-[#FF5C6C]/10 px-3.5 py-1.5 text-xs font-medium text-[#FF5C6C] transition-colors hover:bg-[#FF5C6C] hover:text-white cursor-pointer"
                      >
                        Disable 2FA
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartMfaEnroll}
                        className="rounded-xl bg-[#4F7CFF] px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#3b66e0] cursor-pointer"
                      >
                        Enable 2FA
                      </button>
                    )}
                  </div>
                </SRow>
              </SCard>

              {/* Danger Zone */}
              <div className="rounded-2xl border border-[#FF5C6C]/40 bg-[#1B1B28] overflow-hidden shadow-lg">
                <div className="border-b border-[#FF5C6C]/30 bg-[#FF5C6C]/10 px-6 py-4">
                  <h3 className="font-display text-sm font-semibold tracking-tight text-[#FF5C6C]">Danger Zone</h3>
                </div>
                <div className="p-6 space-y-4">
                  <SRow
                    label="Reset All Data"
                    description="Permanently delete all notes, tasks, reminders, deadlines, documents, AI conversations, education, experience, and custom items. Your login account will be preserved."
                  >
                    <button
                      type="button"
                      onClick={() => setShowResetModal(true)}
                      className="rounded-xl border border-[#FF5C6C] bg-[#FF5C6C]/10 px-4 py-2 text-xs font-semibold text-[#FF5C6C] transition-all hover:bg-[#FF5C6C] hover:text-white shadow-md cursor-pointer"
                    >
                      Reset All Data
                    </button>
                  </SRow>
                </div>
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <SCard title="Appearance">
              <SRow label="Theme Mode" description="Choose workspace theme mode (Dark, Light, or System default).">
                <div className="flex rounded-xl border border-[#2A2A3A] bg-[#171824] p-1">
                  {(["dark", "light", "system"] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTheme(mode)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                        theme === mode
                          ? "bg-[#4F7CFF] text-white shadow-xs"
                          : "text-[#9A9AA8] hover:text-white"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </SRow>

              <div>
                <p className="mb-1.5 font-mono text-xs font-semibold text-[#F4F4F7]">Accent Color</p>
                <p className="mb-3 text-xs text-[#9A9AA8]">Select your preferred workspace accent color.</p>
                <div className="flex flex-wrap gap-3">
                  {accentColors.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setAccentColor(c.hex)}
                      className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer"
                      style={{
                        backgroundColor: c.hex === accentColor ? `${c.hex}22` : "#1e232b",
                        borderColor: c.hex === accentColor ? c.hex : "#2e3540",
                        color: "#e9ebf0",
                      }}
                    >
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </SCard>
          )}

          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
              <div className="w-full max-w-md rounded-2xl border border-[#2e3540] bg-[#1e232b] p-6 shadow-2xl space-y-4">
                <div className="border-b border-[#2e3540] pb-3">
                  <h2 className="text-base font-bold text-[#F4F4F7]">Change Password</h2>
                  <p className="mt-1 text-xs text-[#9A9AA8]">
                    Update your Supabase authentication login password.
                  </p>
                </div>

                {passwordMsg && (
                  <div
                    className={`rounded-xl border p-3 text-xs flex items-center gap-2 ${
                      passwordMsg.type === "success"
                        ? "border-[#48C774]/40 bg-[#48C774]/10 text-[#48C774]"
                        : "border-[#FF5C6C]/40 bg-[#FF5C6C]/10 text-[#FF5C6C]"
                    }`}
                  >
                    {passwordMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  {user?.email && (
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-[#9A9AA8] mb-1">Current Password *</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-[#2e3540] bg-[#14181f] px-3 py-2 text-xs text-[#e9ebf0] outline-none focus:border-[#4F7CFF]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#9A9AA8] mb-1">New Password (Min 6 chars) *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#2e3540] bg-[#14181f] px-3 py-2 text-xs text-[#e9ebf0] outline-none focus:border-[#4F7CFF]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#9A9AA8] mb-1">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#2e3540] bg-[#14181f] px-3 py-2 text-xs text-[#e9ebf0] outline-none focus:border-[#4F7CFF]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#2e3540]">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="rounded-xl border border-[#2e3540] bg-[#1b1b28] px-4 py-2 text-xs text-[#9A9AA8] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="rounded-xl bg-[#4F7CFF] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#3b66e0] disabled:opacity-50"
                    >
                      {isChangingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MFA Enroll Modal */}
          {showMfaModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
              <div className="w-full max-w-md rounded-2xl border border-[#4F7CFF]/40 bg-[#1e232b] p-6 shadow-2xl space-y-4">
                <div className="border-b border-[#2e3540] pb-3">
                  <h2 className="text-base font-bold text-[#F4F4F7]">Enable Two-Factor Authentication</h2>
                  <p className="mt-1 text-xs text-[#9A9AA8]">
                    Scan the QR code using Google Authenticator, Authy, or 1Password, then enter the 6-digit code.
                  </p>
                </div>

                {mfaMsg && (
                  <div
                    className={`rounded-xl border p-3 text-xs flex items-center gap-2 ${
                      mfaMsg.type === "success"
                        ? "border-[#48C774]/40 bg-[#48C774]/10 text-[#48C774]"
                        : "border-[#FF5C6C]/40 bg-[#FF5C6C]/10 text-[#FF5C6C]"
                    }`}
                  >
                    {mfaMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <span>{mfaMsg.text}</span>
                  </div>
                )}

                <div className="flex flex-col items-center gap-3 p-4 rounded-xl border border-[#2e3540] bg-[#14181f]">
                  {mfaQrCode ? (
                    <div
                      className="p-2 rounded bg-white"
                      dangerouslySetInnerHTML={{ __html: mfaQrCode }}
                    />
                  ) : (
                    <Loader2 className="h-8 w-8 animate-spin text-[#4F7CFF]" />
                  )}
                  <p className="font-mono text-[10px] text-[#9A9AA8] text-center">
                    Secret Key: <span className="text-[#F4F4F7] select-all font-bold">{mfaSecret}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyTotpEnrollment} className="space-y-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#9A9AA8] mb-1">
                      Enter 6-Digit Code from App *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={totpInput}
                      onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full rounded-xl border border-[#2e3540] bg-[#14181f] px-3 py-2 font-mono text-center text-sm text-[#e9ebf0] tracking-widest outline-none focus:border-[#4F7CFF]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#2e3540]">
                    <button
                      type="button"
                      onClick={() => setShowMfaModal(false)}
                      className="rounded-xl border border-[#2e3540] bg-[#1b1b28] px-4 py-2 text-xs text-[#9A9AA8] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifyingTotp || totpInput.length !== 6}
                      className="rounded-xl bg-[#48C774] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#3db366] disabled:opacity-50"
                    >
                      {isVerifyingTotp ? "Verifying..." : "Verify & Activate 2FA"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Reset All Data Modal */}
          {showResetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
              <div className="w-full max-w-md rounded-2xl border border-[#FF5C6C]/50 bg-[#1e232b] p-6 shadow-2xl space-y-4">
                <div className="border-b border-[#2e3540] pb-3">
                  <h2 className="text-base font-bold text-[#FF5C6C]">⚠️ Reset All Data</h2>
                  <p className="mt-1 text-xs text-[#9A9AA8]">
                    This action will permanently delete all your workspace data (notes, tasks, reminders, deadlines, documents, AI chats, and profile data).
                  </p>
                </div>

                {resetError && (
                  <div className="rounded border border-red-800 bg-red-950/60 p-2.5 text-xs text-red-300">
                    {resetError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#9A9AA8] mb-1">
                      Type RESET to confirm *
                    </label>
                    <input
                      type="text"
                      value={resetConfirmText}
                      onChange={(e) => setResetConfirmText(e.target.value)}
                      placeholder="RESET"
                      className="w-full rounded-xl border border-[#2e3540] bg-[#14181f] px-3 py-2 text-xs text-[#e9ebf0] outline-none focus:border-[#FF5C6C]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#9A9AA8] mb-1">
                      Password (Optional for OAuth users)
                    </label>
                    <input
                      type="password"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#2e3540] bg-[#14181f] px-3 py-2 text-xs text-[#e9ebf0] outline-none focus:border-[#FF5C6C]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#2e3540]">
                  <button
                    type="button"
                    onClick={() => { setShowResetModal(false); setResetConfirmText(""); setResetPassword(""); setResetError(""); }}
                    className="rounded-xl border border-[#2e3540] bg-[#1b1b28] px-4 py-2 text-xs text-[#9A9AA8] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAllData}
                    disabled={isResetting || resetConfirmText !== "RESET"}
                    className="rounded-xl bg-[#FF5C6C] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#e04353] disabled:opacity-50"
                  >
                    {isResetting ? "Resetting..." : "Confirm & Reset All Data"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
