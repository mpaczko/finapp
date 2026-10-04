import { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authClient, type AuthUser } from "../../lib/authClient";
import LoginForm from "../../modules/LoginForm";
import RegisterForm from "../../modules/RegisterForm";
import ForgotPasswordForm from "../../modules/ForgotPasswordForm";
import ResetPasswordForm from "../../modules/ResetPasswordForm";
import { AuthContext } from "../AuthProvider/AuthContext";

const AuthenticatedSession = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(
    () => window.location.pathname === "/reset-password",
  );
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  const loadCurrentUser = useCallback(async () => {
    try {
      const currentUser = await authClient.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isResetPassword) {
      setLoading(false);
      return;
    }

    void loadCurrentUser();
  }, [isResetPassword, loadCurrentUser]);

  const logout = useCallback(async () => {
    try {
      await authClient.logout();
    } finally {
      setUser(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="mb-4 h-8 w-1/2 rounded bg-slate-200" />
          <div className="space-y-3">
            <div className="h-10 rounded bg-slate-200" />
            <div className="h-10 rounded bg-slate-200" />
            <div className="h-10 w-24 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {isResetPassword ? (
          <ResetPasswordForm
            onCompleted={() => {
              setIsResetPassword(false);
              setPasswordResetSuccess(true);
            }}
            onRequestPasswordReset={() => {
              window.history.replaceState({}, document.title, "/");
              setIsResetPassword(false);
              setIsForgotPassword(true);
            }}
          />
        ) : isForgotPassword ? (
          <ForgotPasswordForm onSwitchToLogin={() => setIsForgotPassword(false)} />
        ) : isRegister ? (
          <RegisterForm
            onAuthenticated={setUser}
            onSwitchToLogin={() => setIsRegister(false)}
          />
        ) : (
          <LoginForm
            onAuthenticated={setUser}
            onSwitchToRegister={() => setIsRegister(true)}
            onSwitchToForgotPassword={() => setIsForgotPassword(true)}
            successMessage={
              passwordResetSuccess
                ? "Hasło zostało zmienione. Zaloguj się nowym hasłem."
                : undefined
            }
          />
        )}
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      <AuthenticatedSession key={user.id}>{children}</AuthenticatedSession>
    </AuthContext.Provider>
  );
}
