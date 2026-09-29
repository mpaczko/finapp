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

  logout: () =>
    apiRequest<void>("/auth/logout", {
      method: "POST",
    }),

  getCurrentUser: () => apiRequest<AuthUser>("/auth/me"),
};
