import { useNavigate } from "react-router-dom";
import {
  Bell, Calendar, Clock, CheckSquare,
  CheckCheck, X, Trash2, BellOff,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import type { AppNotification } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────────────
function getTypeIcon(type: AppNotification["type"]) {
  if (type.startsWith("deadline")) return <Calendar className="h-3.5 w-3.5 flex-shrink-0" />;
  if (type.startsWith("reminder")) return <Clock className="h-3.5 w-3.5 flex-shrink-0" />;
  if (type.startsWith("task")) return <CheckSquare className="h-3.5 w-3.5 flex-shrink-0" />;
  return <Bell className="h-3.5 w-3.5 flex-shrink-0" />;
}

function getTypeColor(type: AppNotification["type"]) {
  if (type === "deadline_overdue" || type === "task_overdue") return "text-[#FF5C6C]";
  if (type === "deadline_today" || type === "task_due_today") return "text-[#FFC43D]";
  if (type === "deadline_tomorrow" || type === "task_due_soon") return "text-[#4F7CFF]";
  if (type === "reminder_due") return "text-[#2a8c82]";
  if (type === "reminder_approaching") return "text-[#9B4DFF]";
  return "text-[#9A9AA8]";
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function getEntityRoute(notification: AppNotification): string {
  switch (notification.entity_type) {
    case "deadline": return "/dashboard/deadlines";
    case "reminder": return "/dashboard/reminders";
    case "task": return "/dashboard/tasks";
    default: return "/dashboard";
  }
}

// ── Component ──────────────────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
}

export function NotificationCenter({ onClose }: Props) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotifications();

  function handleNotificationClick(n: AppNotification) {
    markRead(n.id);
    navigate(getEntityRoute(n));
    onClose();
  }

  return (
    <div
      className="absolute right-0 top-10 z-50 w-80 sm:w-96 overflow-hidden rounded-2xl border border-[#2A2A3A] bg-[#171824] shadow-2xl shadow-black/40"
      style={{ maxHeight: "calc(100vh - 80px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2A2A3A] px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#4F7CFF]" />
          <span className="text-sm font-semibold text-[#F4F4F7]">Notifications</span>
          {unreadCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5C6C] px-1 font-mono text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-[10px] text-[#9A9AA8] transition-colors hover:bg-[#20202E] hover:text-[#4F7CFF]"
              title="Mark all as read"
            >
              <CheckCheck className="h-3 w-3" />
              All read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#9A9AA8] transition-colors hover:bg-[#20202E] hover:text-[#F4F4F7]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto" style={{ maxHeight: "480px" }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#2A2A3A] bg-[#20202E]">
              <BellOff className="h-5 w-5 text-[#9A9AA8]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F4F4F7]">All caught up!</p>
              <p className="mt-0.5 text-xs text-[#9A9AA8]">No notifications yet.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#2A2A3A]">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`group relative flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-[#1B1B28] ${
                  !n.is_read ? "bg-[#4F7CFF]/5" : ""
                }`}
                onClick={() => handleNotificationClick(n)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleNotificationClick(n)}
              >
                {/* Unread dot */}
                {!n.is_read && (
                  <span className="absolute left-1.5 top-4 h-1.5 w-1.5 rounded-full bg-[#4F7CFF]" />
                )}

                {/* Icon */}
                <span className={`mt-0.5 ${getTypeColor(n.type)}`}>
                  {getTypeIcon(n.type)}
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-semibold leading-tight ${n.is_read ? "text-[#9A9AA8]" : "text-[#F4F4F7]"}`}>
                      {n.title}
                    </p>
                    <span className="flex-shrink-0 font-mono text-[9px] text-[#9A9AA8]">
                      {formatTime(n.created_at)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#9A9AA8] line-clamp-2">
                    {n.message}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    {n.entity_type && (
                      <span className={`font-mono text-[9px] uppercase tracking-wider ${getTypeColor(n.type)}`}>
                        {n.entity_type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                  className="flex-shrink-0 rounded-lg p-1 text-transparent transition-all group-hover:text-[#9A9AA8] hover:!text-[#FF5C6C] hover:bg-[#FF5C6C]/10"
                  title="Dismiss"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-[#2A2A3A] px-4 py-2.5 text-center">
          <button
            type="button"
            onClick={() => { navigate("/dashboard/settings"); onClose(); }}
            className="font-mono text-[10px] text-[#9A9AA8] transition-colors hover:text-[#4F7CFF]"
          >
            Notification Settings
          </button>
        </div>
      )}
    </div>
  );
}
