import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function NotifyForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    // NOTE: placeholder only — wire this up to a real mailing list or backend endpoint later.
    setSubmitted(true);
  }

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        {submitted ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 text-sm text-ink"
          >
            <CheckCircle2 className="h-4 w-4 text-indigo" strokeWidth={1.75} />
            You're on the list — I'll let you know when it's live.
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-2 sm:flex-row sm:items-start"
          >
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted/70 focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/40"
              />
              {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-ink px-5 py-3 text-sm font-medium text-paper transition-all hover:-translate-y-0.5 hover:bg-indigo dark:bg-indigo"
            >
              Notify me
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
