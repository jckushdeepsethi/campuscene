import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/authApi";

export const authKeys = {
  me: ["auth", "me"] as const
};

export const useCurrentUser = () =>
  useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    enabled: Boolean(localStorage.getItem("campusconnect_access_token"))
  });

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
      navigate("/dashboard", { replace: true });
    }
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      navigate("/login", { replace: true });
    }
  });
};

export const useVerifyEmail = () =>
  useMutation({
    mutationFn: authApi.verifyEmail
  });

export const useForgotPassword = () =>
  useMutation({
    mutationFn: authApi.forgotPassword
  });

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      navigate("/login", { replace: true });
    }
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      await queryClient.clear();
      navigate("/login", { replace: true });
    }
  });
};
