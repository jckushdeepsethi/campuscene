import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../features/auth/hooks/useAuth";

export const ProtectedRoute = () => {
  const token = localStorage.getItem("campuscene_access_token");
  const { data: user, isLoading, isError } = useCurrentUser();

  if (!token) {
    return <Navigate replace to="/login" />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-600">
        Loading CampuScene session...
      </div>
    );
  }

  if (isError || !user) {
    localStorage.removeItem("campuscene_access_token");
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
};
