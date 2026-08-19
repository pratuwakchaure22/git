import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isLoading } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    }
  }

  async function handleGoogle() {
    setError("");
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch {
      setError("Google sign-in failed.");
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

        {/* Form */}
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

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 border-t" style={{ borderColor: "#2e3540" }} />
          <span className="font-mono text-xs" style={{ color: "#8f97a5" }}>
            or
          </span>
          <div className="flex-1 border-t" style={{ borderColor: "#2e3540" }} />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2.5 rounded border py-2.5 font-body text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
          style={{
            borderColor: "#2e3540",
            backgroundColor: "#252c36",
            color: "#e9ebf0",
          }}
        >
          <svg className="h-4 w-4" style={{ color: "#8f97a5" }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

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
