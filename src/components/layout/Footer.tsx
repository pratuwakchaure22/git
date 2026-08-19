import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { Container } from "@/components/common/Container";
import { SocialIcons } from "@/components/common/SocialIcons";
import { navItems, profile, socialLinks } from "@/data/profile";

export function Footer() {
  const year = new Date().getFullYear();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="border-t border-line">
      <Container className="py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Link to="/" className="font-display text-lg font-semibold tracking-tight text-ink">
              {profile.name}
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted">{profile.tagline}</p>
            <SocialIcons links={socialLinks} className="mt-6" />
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="py-1 font-mono text-sm text-muted transition-colors hover:text-indigo"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="font-mono text-xs text-muted">
            © {year} {profile.name}. Built with React, Vite &amp; Tailwind CSS.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-indigo"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </Container>
    </footer>
  );
}
