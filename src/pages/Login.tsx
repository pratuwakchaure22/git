import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, AlertCircle, ShieldCheck, KeyRound } from "lucide-react";
import { useAuth, isAuthorizedEmail } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  // MFA login challenge state
  const [showMfaStep, setShowMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    if (!isAuthorizedEmail(form.email)) {
      setError(`Access Denied: Email (${form.email}) is not authorized to access this workspace.`);
      return;
    }
    try {
      await login(form.email, form.password);

      // Check if MFA challenge is required (AAL2)
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData && aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2") {
        setShowMfaStep(true);
        return;
      }

      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please try again.");
    }
  }

  async function handleVerifyMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaCode || mfaCode.length !== 6) {
      setError("Please enter a valid 6-digit TOTP code.");
      return;
    }
    setIsVerifyingMfa(true);
    setError("");
    try {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData?.totp?.[0];
      if (!totpFactor) {
        throw new Error("No TOTP factor enrolled.");
      }

      const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });
      if (challengeErr) throw challengeErr;

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: mfaCode,
      });
      if (verifyErr) throw verifyErr;

      navigate("/dashboard");
    } catch (err: any) {
      console.error("MFA verification error:", err);
      setError(err?.message || "Invalid 2FA code. Please try again.");
    } finally {
      setIsVerifyingMfa(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#171a20" }}
    >
      {/* Card */}
      <div
        className="w-full max-w-sm rounded border p-8"
        style={{
          backgroundColor: "#1e232b",
          borderColor: "#2e3540",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo / monogram */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded"
            style={{ backgroundColor: "#2a8c82" }}
          >
            <span className="font-display text-lg font-semibold text-white">PK</span>
          </div>
          <div className="text-center">
            <h1 className="font-display text-lg font-semibold" style={{ color: "#e9ebf0" }}>
              Pratik Personal Hub
            </h1>
            <p className="mt-0.5 font-mono text-xs" style={{ color: "#8f97a5" }}>
              This is a private personal workspace.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-4 flex items-start gap-2 rounded border p-3 text-xs"
            style={{ borderColor: "#c0392b33", backgroundColor: "#c0392b11", color: "#e57373" }}
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {showMfaStep ? (
          <form onSubmit={handleVerifyMfa} className="space-y-4" noValidate>
            <div className="flex items-center gap-2 rounded-xl border border-[#4F7CFF]/40 bg-[#4F7CFF]/10 p-3 text-xs text-[#4F7CFF]">
              <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              <span>Two-factor authentication is active on your account. Enter your 6-digit TOTP code.</span>
            </div>

            <div>
              <label
                htmlFor="mfa-code"
                className="mb-1.5 block font-mono text-xs uppercase tracking-wider"
                style={{ color: "#8f97a5" }}
              >
                6-Digit Authenticator Code
              </label>
              <div className="relative">
                <KeyRound
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: "#8f97a5" }}
                />
                <input
                  id="mfa-code"
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full rounded border py-2.5 pl-9 pr-3 text-sm font-mono tracking-widest outline-none transition-colors focus:border-[#4F7CFF]"
                  style={{
                    backgroundColor: "#252c36",
                    borderColor: "#2e3540",
                    color: "#e9ebf0",
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowMfaStep(false); setError(""); setMfaCode(""); }}
                className="w-1/3 rounded border border-[#2e3540] py-2.5 font-body text-xs font-medium text-[#8f97a5] hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isVerifyingMfa || mfaCode.length !== 6}
                className="flex-1 rounded bg-[#4F7CFF] py-2.5 font-body text-sm font-semibold text-white shadow-md transition-all hover:bg-[#3b66e0] disabled:opacity-50"
              >
                {isVerifyingMfa ? "Verifying..." : "Verify & Sign In"}
              </button>
            </div>
          </form>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block font-mono text-xs uppercase tracking-wider"
              style={{ color: "#8f97a5" }}
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: "#8f97a5" }}
              />
              <input
                id="login-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="pratik@example.com"
                autoComplete="email"
                className="w-full rounded border py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-[#2a8c82]"
                style={{
                  backgroundColor: "#252c36",
                  borderColor: "#2e3540",
                  color: "#e9ebf0",
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block font-mono text-xs uppercase tracking-wider"
              style={{ color: "#8f97a5" }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: "#8f97a5" }}
              />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded border py-2.5 pl-9 pr-10 text-sm outline-none transition-colors focus:border-[#2a8c82]"
                style={{
                  backgroundColor: "#252c36",
                  borderColor: "#2e3540",
                  color: "#e9ebf0",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 transition-colors hover:opacity-100"
                style={{ color: "#8f97a5", opacity: 0.7 }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="font-mono text-xs transition-colors hover:opacity-100"
              style={{ color: "#8f97a5", opacity: 0.7 }}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded py-2.5 font-body text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#2a8c82" }}
          >
            {isLoading ? (
              <span className="font-mono text-xs">Signing in...</span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      )}

        {/* Back to portfolio */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="font-mono text-xs transition-colors hover:text-white"
            style={{ color: "#8f97a5" }}
          >
            ← Back to portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
