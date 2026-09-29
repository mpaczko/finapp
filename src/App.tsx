import { useAppSelector } from "./store/reduxHook";
import { useAuth } from "./components/AuthProvider/AuthContext";

import Main from "./layout/Main";
import Nav from "./layout/Navigation";

const App = () => {
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Nav />
      <Main userId={user.id} selectedMonth={selectedMonth} />
    </div>
  );
};

export default App;
