import { api, setAccessToken } from "../../../lib/api";
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  RegisterFormValues,
  ResetPasswordFormValues,
  TokenFormValues,
  UserRole
} from "../schemas/authSchemas";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  rollNumber?: string | null;
  branch?: string | null;
  passingYear?: number | null;
  collegeName?: string | null;
  interests?: string[];
  emailVerifiedAt: string | null;
  createdAt: string;
};

type LoginResponse = {
  data: {
    accessToken: string;
    expiresIn: string;
  };
};

type MeResponse = {
  data: {
    user: AuthUser;
  };
};

type ForgotPasswordResponse = {
  data?: {
    resetToken: string | null;
  };
  message: string;
};

export const authApi = {
  async register(input: RegisterFormValues) {
    const response = await api.post("/auth/register", input);
    return response.data;
  },

  async login(input: LoginFormValues) {
    const response = await api.post<LoginResponse>("/auth/login", input);
    setAccessToken(response.data.data.accessToken);
    return response.data;
  },

  async me() {
    const response = await api.get<MeResponse>("/auth/me");
    return response.data.data.user;
  },

  async verifyEmail(input: TokenFormValues) {
    const response = await api.post("/auth/verify-email", input);
    return response.data;
  },

  async forgotPassword(input: ForgotPasswordFormValues) {
    const response = await api.post<ForgotPasswordResponse>("/auth/forgot-password", input);
    return response.data;
  },

  async resetPassword(input: ResetPasswordFormValues) {
    const response = await api.post("/auth/reset-password", input);
    return response.data;
  },

  async logout() {
    await api.post("/auth/logout");
    setAccessToken(null);
  }
};

export const usersApi = {
  async getPendingOrganizers() {
    const response = await api.get<{ data: { organizers: AuthUser[] } }>("/users/organizers/pending");
    return response.data.data.organizers;
  },

  async verifyOrganizer(userId: string, action: "APPROVE" | "REJECT") {
    const response = await api.post<{ message: string }>(`/users/${userId}/verify-organizer`, { action });
    return response.data;
  },

  async updateProfile(data: {
    name?: string;
    collegeName?: string;
    rollNumber?: string;
    branch?: string;
    passingYear?: number;
    interests?: string[];
  }) {
    const response = await api.put<{ data: { user: AuthUser }; message: string }>("/users/profile", data);
    return response.data;
  }
};
