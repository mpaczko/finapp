import { useEffect, useState } from "react";
import { supabase } from "./createClient";
import { useAppSelector } from "./store/reduxHook";

import Main from "./layout/Main";
import Nav from "./layout/Navigation";

const App = () => {
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };

    initUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user?.id ?? null);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen">
      <Nav userId={userId} />
      <Main userId={userId} selectedMonth={selectedMonth} />
    </div>
  );
};

export default App;
