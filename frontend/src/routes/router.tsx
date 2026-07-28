import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ProfilePage } from "../features/auth/pages/ProfilePage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { VerifyEmailPage } from "../features/auth/pages/VerifyEmailPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { CreateEventPage } from "../features/events/pages/CreateEventPage";
import { EventDetailPage } from "../features/events/pages/EventDetailPage";
import { EventsListPage } from "../features/events/pages/EventsListPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute, RootRedirect } from "./PublicOnlyRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/login",
            element: <LoginPage />
          },
          {
            path: "/register",
            element: <RegisterPage />
          },
          {
            path: "/verify-email",
            element: <VerifyEmailPage />
          },
          {
            path: "/forgot-password",
            element: <ForgotPasswordPage />
          },
          {
            path: "/reset-password",
            element: <ResetPasswordPage />
          }
        ]
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />
      },
      {
        path: "/profile",
        element: <ProfilePage />
      },
      {
        path: "/events",
        element: <EventsListPage />
      },
      {
        path: "/events/new",
        element: <CreateEventPage />
      },
      {
        path: "/events/:id",
        element: <EventDetailPage />
      }
    ]
  }
]);
