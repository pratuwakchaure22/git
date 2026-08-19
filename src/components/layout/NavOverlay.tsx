import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { navItems, profile, socialLinks } from "@/data/profile";
import { Eyebrow } from "@/components/common/Eyebrow";
import { SocialIcons } from "@/components/common/SocialIcons";

interface NavOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function NavOverlay({ open, onClose }: NavOverlayProps) {
  const location = useLocation();

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-paper pt-24"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-6 pb-10 md:px-10 lg:px-14">
            <nav className="grid grid-cols-1 gap-x-12 gap-y-2 sm:grid-cols-2" aria-label="Primary">
              {navItems.map((item, i) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.04 * i }}
                  >
                    <NavLink
                      to={item.path}
                      className="group flex items-center gap-4 border-b border-line py-4 sm:py-5"
                    >
                      <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                      <span
                        className={`font-display text-3xl font-medium tracking-tight transition-colors sm:text-4xl ${
                          isActive ? "text-indigo" : "text-ink group-hover:text-indigo"
                        }`}
                      >
                        {item.label}
                      </span>
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo" />}
                    </NavLink>
                  </motion.div>
                );
              })}
            </nav>

            <div className="mt-14 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-3">
                <Eyebrow label={profile.availability} tone="amber" />
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-1.5 font-display text-xl text-ink transition-colors hover:text-indigo"
                >
                  {profile.email}
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                </a>
              </div>
              <SocialIcons links={socialLinks} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
