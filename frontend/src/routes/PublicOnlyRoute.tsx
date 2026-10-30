import { Navigate, Outlet } from "react-router-dom";

export const PublicOnlyRoute = () => {
  const token = localStorage.getItem("campuscene_access_token");

  if (token) {
    return <Navigate replace to="/events" />;
  }

  return <Outlet />;
};

export const RootRedirect = () => {
  const token = localStorage.getItem("campuscene_access_token");
  return <Navigate replace to={token ? "/events" : "/login"} />;
};
