import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/common/Container";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NavOverlay } from "@/components/layout/NavOverlay";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          scrolled || menuOpen ? "border-b border-line bg-paper/85 backdrop-blur-md" : "border-b border-transparent",
        )}
      >
        <Container>
          <div className="flex h-16 items-center justify-between md:h-20">
            <Link to="/" className="group flex items-center gap-2.5" aria-label={`${profile.name} — home`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink font-display text-xs font-semibold text-paper transition-colors group-hover:bg-indigo dark:bg-indigo">
                {profile.initials}
              </span>
              <span className="hidden font-display text-sm font-medium tracking-tight text-ink sm:block">
                {profile.name}
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium text-ink transition-colors hover:border-indigo hover:text-indigo"
              >
                {menuOpen ? <X className="h-4 w-4" strokeWidth={1.75} /> : <Menu className="h-4 w-4" strokeWidth={1.75} />}
                <span className="hidden sm:inline">{menuOpen ? "Close" : "Menu"}</span>
              </button>
            </div>
          </div>
        </Container>
      </header>
      <NavOverlay open={menuOpen} onClose={closeMenu} />
    </>
  );
}
