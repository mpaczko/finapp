import { createContext, useContext } from "react";
import type { AuthUser } from "../../lib/authClient";

export type AuthContextValue = {
  user: AuthUser;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthContext.Provider");
  }

  return context;
};
