import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Bot, FolderOpen, Cloud, FileText, CheckSquare,
  Bell, Calendar, Star, User, FileSpreadsheet, Settings, Shield,
  X, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: "AI Assistant", href: "/dashboard/ai", icon: <Bot className="h-4 w-4" /> },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Documents", href: "/dashboard/documents", icon: <FolderOpen className="h-4 w-4" /> },
      { label: "Google Drive", href: "/dashboard/drive", icon: <Cloud className="h-4 w-4" /> },
      { label: "Notes", href: "/dashboard/notes", icon: <FileText className="h-4 w-4" /> },
      { label: "Tasks", href: "/dashboard/tasks", icon: <CheckSquare className="h-4 w-4" /> },
      { label: "Reminders", href: "/dashboard/reminders", icon: <Bell className="h-4 w-4" /> },
      { label: "Deadlines", href: "/dashboard/deadlines", icon: <Calendar className="h-4 w-4" /> },
      { label: "Important", href: "/dashboard/important", icon: <Star className="h-4 w-4" /> },
    ],
  },
  {
    label: "Profile",
    items: [
      { label: "Profile Builder", href: "/dashboard/profile", icon: <User className="h-4 w-4" /> },
      { label: "Resume", href: "/dashboard/resume", icon: <FileSpreadsheet className="h-4 w-4" /> },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: <Settings className="h-4 w-4" /> },
      { label: "Admin", href: "/dashboard/admin", icon: <Shield className="h-4 w-4" /> },
    ],
  },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const sidebarContent = (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: "#171824", borderRight: "1px solid #2A2A3A" }}
    >
      {/* Header */}
      <div
        className="flex h-16 flex-shrink-0 items-center justify-between px-5"
        style={{ borderBottom: "1px solid #2A2A3A" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#4F7CFF] to-[#9B4DFF] text-xs font-bold text-white shadow-md">
            PK
          </div>
          <span className="font-display text-sm font-semibold tracking-tight text-[#F4F4F7]">
            Personal Hub
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 transition-colors hover:bg-[#20202E] lg:hidden"
          style={{ color: "#9A9AA8" }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 dash-scroll">
        <div className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p
                className="mb-1.5 px-3 font-mono text-[10px] uppercase tracking-widest font-semibold"
                style={{ color: "#9A9AA8" }}
              >
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === "/dashboard"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-[#4F7CFF]/15 to-[#9B4DFF]/15 text-[#4F7CFF] border-l-2 border-[#4F7CFF] font-semibold"
                          : "text-[#9A9AA8] hover:bg-[#1B1B28] hover:text-[#F4F4F7]"
                      )
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: "1px solid #2A2A3A" }}
      >
        <div className="flex items-center gap-3 rounded-xl bg-[#1B1B28] p-2.5 border border-[#2A2A3A]">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-[#4F7CFF] to-[#9B4DFF] text-xs font-semibold text-white">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.initials ?? "PK"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-[#F4F4F7]">
              {user?.name ?? "Pratik"}
            </p>
            <p className="truncate font-mono text-[10px] text-[#9A9AA8]">
              {user?.email ?? "pratik@example.com"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-[#9A9AA8] transition-colors hover:bg-[#20202E] hover:text-[#FF5C6C]"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-shrink-0 lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="absolute left-0 top-0 h-full w-56 animate-slide-in-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
