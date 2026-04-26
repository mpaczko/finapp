import { useEffect, useState } from "react";
import { supabase } from "../../createClient";
import LoginForm from "../../modules/LoginForm";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
        <LoginForm />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow-md rounded-xl px-8 py-6 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
          <p className="text-sm text-gray-600 font-medium">Ładowanie...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
