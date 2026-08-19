import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden text-[#F4F4F7]" style={{ backgroundColor: "#0F1018" }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main
          id="dashboard-main"
          className="flex-1 overflow-y-auto p-4 md:p-6 dash-scroll"
          style={{ backgroundColor: "#0F1018" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
