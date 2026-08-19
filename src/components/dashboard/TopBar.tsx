import { useState } from "react";
import { Menu, Search, Bell, ChevronDown, LogOut, Settings, User, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header
      className="flex h-16 flex-shrink-0 items-center justify-between gap-4 px-6"
      style={{ backgroundColor: "#171824", borderBottom: "1px solid #2A2A3A" }}
    >
      {/* Left: hamburger + search */}
      <div className="flex flex-1 items-center gap-4">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-2 transition-colors hover:bg-[#1B1B28] lg:hidden"
          style={{ color: "#9A9AA8" }}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "#9A9AA8" }}
          />
          <input
            type="search"
            placeholder="Search everything..."
            className="w-full rounded-xl border py-2 pl-9 pr-4 text-xs outline-none transition-all shadow-inner"
            style={{
              backgroundColor: "#1B1B28",
              borderColor: "#2A2A3A",
              color: "#F4F4F7",
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#4F7CFF"; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#2A2A3A"; }}
          />
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-2">
        {/* View public site */}
        <Link
          to="/"
          target="_blank"
          className="hidden items-center gap-2 rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 font-mono text-xs text-[#9A9AA8] transition-all hover:border-[#4F7CFF]/40 hover:text-[#F4F4F7] md:flex"
          title="View public portfolio"
        >
          <Globe className="h-3.5 w-3.5 text-[#4F7CFF]" />
          Portfolio
        </Link>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-xl border border-[#2A2A3A] bg-[#1B1B28] p-2 transition-all hover:border-[#4F7CFF]/40"
          style={{ color: "#9A9AA8" }}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {/* Unread badge */}
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#4F7CFF]"
          />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl border border-[#2A2A3A] bg-[#1B1B28] px-3 py-1.5 transition-all hover:border-[#4F7CFF]/40"
          >
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-[#4F7CFF] to-[#9B4DFF] text-xs font-semibold text-white">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user?.initials ?? "PK"
              )}
            </div>
            <span className="hidden font-body text-xs font-medium text-[#F4F4F7] md:block">{user?.name ?? "Pratik"}</span>
            <ChevronDown
              className={cn("hidden h-3.5 w-3.5 text-[#9A9AA8] transition-transform md:block", profileOpen && "rotate-180")}
            />
          </button>

          {/* Dropdown menu */}
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
              />
              <div
                className="absolute right-0 top-full z-20 mt-2 w-48 rounded-2xl border p-1 shadow-2xl animate-slide-in-up"
                style={{ backgroundColor: "#1B1B28", borderColor: "#2A2A3A" }}
              >
                <div className="px-3 py-2.5 border-b border-[#2A2A3A]">
                  <p className="text-xs font-semibold text-[#F4F4F7]">{user?.name}</p>
                  <p className="font-mono text-[10px] text-[#9A9AA8]">{user?.email}</p>
                </div>
                <Link
                  to="/dashboard/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#9A9AA8] transition-colors hover:bg-[#20202E] hover:text-[#F4F4F7]"
                >
                  <User className="h-3.5 w-3.5 text-[#4F7CFF]" />
                  Profile Builder
                </Link>
                <Link
                  to="/dashboard/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#9A9AA8] transition-colors hover:bg-[#20202E] hover:text-[#F4F4F7]"
                >
                  <Settings className="h-3.5 w-3.5 text-[#9B4DFF]" />
                  Settings
                </Link>
                <div className="my-1 border-t border-[#2A2A3A]" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#FF5C6C] transition-colors hover:bg-[#FF5C6C]/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
