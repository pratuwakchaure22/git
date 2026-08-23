import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Lock } from "lucide-react";
import { Container } from "@/components/common/Container";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-[#2e3540] bg-[#171a20]/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between md:h-18">
          {/* Logo / Branding */}
          <Link
            to="/"
            className="group flex items-center gap-2.5"
            aria-label="Pratik Wakchaure — home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded bg-[#efede6] font-mono text-xs font-semibold text-[#171a20] transition-colors group-hover:bg-[#2a8c82] group-hover:text-white">
              PW
            </span>
            <span className="font-display text-sm font-semibold tracking-tight text-[#e9ebf0]">
              Pratik Wakchaure
            </span>
          </Link>

          {/* Right: Theme toggle + Resume + Login */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/resume"
              className="rounded border border-[#2e3540] px-3 py-1.5 font-body text-sm font-medium text-[#e9ebf0] transition-colors hover:border-[#2a8c82] hover:text-[#2a8c82]"
            >
              Resume
            </Link>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded border px-3 py-1.5 font-body text-sm font-medium transition-colors",
                  isActive
                    ? "border-[#2a8c82] bg-[#2a8c82] text-white"
                    : "border-[#2e3540] text-[#e9ebf0] hover:border-[#2a8c82] hover:text-[#2a8c82]"
                )
              }
            >
              <Lock className="h-3.5 w-3.5" />
              Login
            </NavLink>
          </div>
        </div>
      </Container>
    </header>
  );
}
