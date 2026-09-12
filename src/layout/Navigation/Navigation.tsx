import { lazy, Suspense, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../store/reduxHook";
import { supabase } from "../../createClient";
import { setSelectedMonth } from "../../store/configSlice/configSlice";
import DeferredExpenseDialog from "../../modules/ExpenseDialog/DeferredExpenseDialog";
import { Button } from "../../ui/Button";

type Props = {
  userId: string | null;
};

const MultipleExpenses = lazy(() => import("../../modules/MultipleExpenses"));

const Nav = ({ userId }: Props) => {
  const dispatch = useDispatch();
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-slate-100 bg-white px-6 py-3 shadow-sm">
      <div />

      <div className="flex items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Budżet</h1>

        <input
          name="month"
          type="month"
          value={selectedMonth}
          aria-label="Wybierz miesiąc budżetu"
          onClick={(e) => e.currentTarget.showPicker?.()}
          onChange={(e) => dispatch(setSelectedMonth(e.target.value))}
          className="max-w-[195px] cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-center text-lg font-semibold text-slate-900 shadow-sm outline-none transition hover:border-slate-300 hover:bg-white hover:shadow-md focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>

      <div className="flex items-center justify-end gap-5">
        <Suspense fallback={<Button disabled>Ładowanie CSV...</Button>}>
          <MultipleExpenses />
        </Suspense>
        <DeferredExpenseDialog />

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
