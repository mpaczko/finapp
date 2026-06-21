import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../store/reduxHook";
import { supabase } from "../../createClient";
import { setSelectedMonth } from "../../store/configSlice/configSlice";
import MultipleExpenses from "../../modules/MultipleExpenses";
import ExpenseDialog from "../../modules/ExpenseDialog";
import { Button } from "../../ui/Button";

type Props = {
  userId: string | null;
};

const Nav = ({ userId }: Props) => {
  const dispatch = useDispatch();
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm border-b border-slate-100 flex items-center justify-between px-6 py-4">
      <div className="flex flex-row gap-3 items-center">
        <h1 className="text-xl font-semibold text-gray-800">Budżet</h1>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => dispatch(setSelectedMonth(e.target.value))}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div className="flex gap-5 items-center">
        <MultipleExpenses />
        <ExpenseDialog />

        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            className="px-2 py-1 text-lg text-gray-600"
            onClick={() => setIsMenuOpen((p) => !p)}
          >
            ⋮
          </Button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-sm z-50">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:bg-red-50"
                onClick={async () => {
                  setIsMenuOpen(false);
                  await handleLogout();
                }}
              >
                Wyloguj
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
