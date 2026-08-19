import { useCallback, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Lock } from "lucide-react";
import { Container } from "@/components/common/Container";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

const publicLinks = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Achievements", href: "/#achievements" },
  { label: "Contact", href: "/#contact" },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleAnchor(href: string) {
    closeMenu();
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: "smooth" }); }
    }
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled || menuOpen
            ? "border-b border-[#2e3540] bg-[#171a20]/90 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <Container>
          <div className="flex h-16 items-center justify-between md:h-18">
            {/* Logo */}
            <Link
              to="/"
              className="group flex items-center gap-2.5"
              aria-label={`${profile.name} — home`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded bg-[#efede6] font-mono text-xs font-semibold text-[#171a20] transition-colors group-hover:bg-[#2a8c82] group-hover:text-white">
                {profile.initials}
              </span>
              <span className="hidden font-display text-sm font-semibold tracking-tight text-[#e9ebf0] sm:block">
                {profile.name}
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-6 md:flex">
              {publicLinks.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleAnchor(link.href)}
                  className="font-body text-sm text-[#8f97a5] transition-colors hover:text-[#e9ebf0]"
                >
                  {link.label}
                </button>
              ))}
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-[#8f97a5] transition-colors hover:text-[#e9ebf0]"
              >
                Resume
              </a>
            </nav>

            {/* Right: Login + mobile menu */}
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  cn(
                    "hidden items-center gap-1.5 rounded border px-3 py-1.5 font-body text-sm font-medium transition-colors md:flex",
                    isActive
                      ? "border-[#2a8c82] bg-[#2a8c82] text-white"
                      : "border-[#2e3540] text-[#e9ebf0] hover:border-[#2a8c82] hover:text-[#2a8c82]"
                  )
                }
              >
                <Lock className="h-3.5 w-3.5" />
                Login
              </NavLink>

              <button
                type="button"
                onClick={() => setMenuOpen((p) => !p)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="flex h-9 items-center gap-2 rounded border border-[#2e3540] px-3 text-sm font-medium text-[#e9ebf0] transition-colors hover:border-[#2a8c82] hover:text-[#2a8c82] md:hidden"
              >
                {menuOpen ? <X className="h-4 w-4" strokeWidth={1.75} /> : <Menu className="h-4 w-4" strokeWidth={1.75} />}
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="border-t border-[#2e3540] bg-[#171a20] px-4 py-4 md:hidden animate-slide-in-up">
            <nav className="flex flex-col gap-1">
              {publicLinks.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleAnchor(link.href)}
                  className="rounded px-3 py-2.5 text-left font-body text-sm text-[#8f97a5] hover:bg-[#2e3540]/40 hover:text-[#e9ebf0] transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded px-3 py-2.5 font-body text-sm text-[#8f97a5] hover:bg-[#2e3540]/40 hover:text-[#e9ebf0] transition-colors"
                onClick={closeMenu}
              >
                Resume
              </a>
              <div className="my-1 border-t border-[#2e3540]" />
              <NavLink
                to="/login"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded px-3 py-2.5 font-body text-sm font-medium text-[#2a8c82] hover:bg-[#2e3540]/40"
              >
                <Lock className="h-4 w-4" />
                Login to Dashboard
              </NavLink>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
