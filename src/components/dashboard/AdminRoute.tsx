import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoadingState } from "@/components/ui/LoadingState";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#171a20" }}>
        <LoadingState message="Verifying access..." />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    // If not authenticated or not an admin, redirect to dashboard root
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
