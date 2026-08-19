import { Link } from "react-router-dom";
import { profile } from "@/data/profile";

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#2e3540] bg-[#171a20] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to="/" className="font-display text-sm font-semibold text-[#e9ebf0]">
            {profile.name}
          </Link>
          <p className="font-mono text-xs text-[#8f97a5]">
            © {year} {profile.name}. Built with React + Vite.
          </p>
          <Link
            to="/login"
            className="font-mono text-xs text-[#8f97a5] transition-colors hover:text-[#2a8c82]"
          >
            Private workspace →
          </Link>
        </div>
      </div>
    </footer>
  );
}
