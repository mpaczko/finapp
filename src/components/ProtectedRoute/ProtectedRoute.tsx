import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../createClient";
import LoginForm from "../../modules/LoginForm";
import RegisterForm from "../../modules/RegisterForm";

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
  const [user, setUser] = useState<User | null>(null);
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {isRegister ? (
          <RegisterForm onSwitchToLogin={() => setIsRegister(false)} />
        ) : (
          <LoginForm onSwitchToRegister={() => setIsRegister(true)} />
        )}
      </div>
    );
  }

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

  return (
    <AuthenticatedSession key={user.id}>{children}</AuthenticatedSession>
  );
}
