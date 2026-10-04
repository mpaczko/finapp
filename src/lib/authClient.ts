import { apiRequest } from "./apiClient";

export type AuthUser = {
  id: string;
  email: string;
};

type AuthResponse = {
  user: AuthUser;
};

type Credentials = {
  email: string;
  password: string;
};

type ForgotPasswordRequest = {
  email: string;
};

type ResetPasswordRequest = {
  token: string;
  password: string;
  confirmPassword: string;
};

export const authClient = {
  register: (credentials: Credentials) =>
    apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: credentials,
    }),

  login: (credentials: Credentials) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: credentials,
    }),

  requestPasswordReset: (request: ForgotPasswordRequest) =>
    apiRequest<void>("/auth/forgot-password", {
      method: "POST",
      body: request,
    }),

  resetPassword: (request: ResetPasswordRequest) =>
    apiRequest<void>("/auth/reset-password", {
      method: "POST",
      body: request,
    }),

  logout: () =>
    apiRequest<void>("/auth/logout", {
      method: "POST",
    }),

  getCurrentUser: () =>
    apiRequest<AuthUser>("/auth/me", {
      quietOnStatuses: [401],
    }),
};
