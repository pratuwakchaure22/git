import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/dashboard/ProtectedRoute";
import { AdminRoute } from "@/components/dashboard/AdminRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RouteLoader } from "@/components/common/RouteLoader";

// Public pages
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Dashboard pages
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const AIAssistant = lazy(() => import("@/pages/dashboard/AIAssistant"));
const Documents = lazy(() => import("@/pages/dashboard/Documents"));
const Drive = lazy(() => import("@/pages/dashboard/Drive"));
const Notes = lazy(() => import("@/pages/dashboard/Notes"));
const Tasks = lazy(() => import("@/pages/dashboard/Tasks"));
const Reminders = lazy(() => import("@/pages/dashboard/Reminders"));
const Deadlines = lazy(() => import("@/pages/dashboard/Deadlines"));
const Important = lazy(() => import("@/pages/dashboard/Important"));
const ProfileBuilder = lazy(() => import("@/pages/dashboard/ProfileBuilder"));
const Resume = lazy(() => import("@/pages/dashboard/Resume"));
const Settings = lazy(() => import("@/pages/dashboard/Settings"));

// Admin pages
const Admin = lazy(() => import("@/pages/dashboard/admin/Admin"));
const AdminProjects = lazy(() => import("@/pages/dashboard/admin/AdminProjects"));
const AdminSkills = lazy(() => import("@/pages/dashboard/admin/AdminSkills"));
const AdminDocuments = lazy(() => import("@/pages/dashboard/admin/AdminDocuments"));
const AdminAI = lazy(() => import("@/pages/dashboard/admin/AdminAI"));

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              {/* Dashboard — protected */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="ai" element={<AIAssistant />} />
                <Route path="documents" element={<Documents />} />
                <Route path="drive" element={<Drive />} />
                <Route path="notes" element={<Notes />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="reminders" element={<Reminders />} />
                <Route path="deadlines" element={<Deadlines />} />
                <Route path="important" element={<Important />} />
                <Route path="profile" element={<ProfileBuilder />} />
                <Route path="resume" element={<Resume />} />
                <Route path="settings" element={<Settings />} />

                {/* Admin */}
                <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>}>
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="skills" element={<AdminSkills />} />
                  <Route path="documents" element={<AdminDocuments />} />
                  <Route path="ai" element={<AdminAI />} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
