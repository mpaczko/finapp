import { lazy, Suspense, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, Moon, Palette, Sun } from "lucide-react";
import { useAppSelector } from "../../store/reduxHook";
import { useAuth } from "../../components/AuthProvider/AuthContext";
import { setSelectedMonth } from "../../store/configSlice/configSlice";
import DeferredExpenseDialog from "../../modules/ExpenseDialog/DeferredExpenseDialog";
import { Button } from "../../ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/Popover/Popover";
import { useSummaryVisibility } from "../../hooks/useSummaryVisibility";
import {
  accentOptions,
  useTheme,
} from "../../components/ThemeProvider/themeContext";

const MultipleExpenses = lazy(() => import("../../modules/MultipleExpenses"));

const Nav = () => {
  const dispatch = useDispatch();
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);
  const [showValues, setShowValues] = useSummaryVisibility();
  const { logout } = useAuth();
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const activeAccent = accentOptions.find(
    (option) => option.id === accentColor,
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border-soft bg-surface px-6 py-3 shadow-sm">
      <div className="flex items-center justify-start">
        <Button
          className="inline-flex items-center gap-1.5 whitespace-nowrap"
          onClick={() => setShowValues((current) => !current)}
          aria-label={
            showValues ? "Ukryj wartości liczbowe" : "Pokaż wartości liczbowe"
          }
        >
          {showValues ? (
            <EyeOff size={16} aria-hidden="true" />
          ) : (
            <Eye size={16} aria-hidden="true" />
          )}
          {showValues ? "Ukryj dane" : "Pokaż dane"}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Budżet</h1>

        <input
          name="month"
          type="month"
          value={selectedMonth}
          aria-label="Wybierz miesiąc budżetu"
          onClick={(e) => e.currentTarget.showPicker?.()}
          onChange={(e) => dispatch(setSelectedMonth(e.target.value))}
          className="max-w-[195px] cursor-pointer appearance-none rounded-2xl border border-border bg-surface-muted px-5 py-2.5 text-center text-lg font-semibold text-foreground shadow-sm outline-none transition hover:border-border-strong hover:bg-surface hover:shadow-md focus:border-border-strong focus:bg-surface focus:ring-4 focus:ring-border [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <Suspense
          fallback={
            <Button disabled className="animate-pulse">
              <span className="inline-block h-4 w-20 rounded bg-border" />
            </Button>
          }
        >
          <MultipleExpenses />
        </Suspense>
        <DeferredExpenseDialog />
        <Button
          type="button"
          variant="outline"
          className="gap-2 border-border bg-surface text-foreground hover:bg-surface-muted"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label="Ciemny motyw"
          title={theme === "light" ? "Włącz ciemny motyw" : "Włącz jasny motyw"}
          aria-pressed={theme === "dark"}
        >
          {theme === "light" ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
          <span className="hidden xl:inline">{theme === "light" ? "Ciemny" : "Jasny"}</span>
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative border-border bg-surface text-foreground hover:bg-surface-muted"
              aria-label="Wybierz kolor główny"
              title="Wybierz kolor główny"
            >
              <Palette size={16} aria-hidden="true" />
              <span
                className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border border-surface"
                style={{
                  backgroundColor: activeAccent?.primary,
                  backgroundImage: activeAccent
                    ? `linear-gradient(135deg, ${activeAccent.primary}, ${activeAccent.primaryHover})`
                    : undefined,
                }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-72 rounded-2xl p-3"
          >
            <p className="mb-3 text-sm font-semibold text-foreground">
              Kolor główny
            </p>
            <div className="grid grid-cols-3 gap-2">
              {accentOptions.map((option) => {
                const isActive = option.id === accentColor;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setAccentColor(option.id)}
                    aria-label={`Kolor ${option.name}`}
                    aria-pressed={isActive}
                    title={option.name}
                    className="group flex flex-col items-center gap-1.5 rounded-xl p-2 text-xs font-medium text-muted transition hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      className="h-8 w-8 rounded-full shadow-sm ring-2 ring-offset-2 ring-offset-surface transition group-hover:scale-110"
                      style={{
                        backgroundColor: option.primary,
                        backgroundImage: `linear-gradient(135deg, ${option.primary}, ${option.primaryHover})`,
                        // The selected swatch uses its own color as the ring.
                        // Other options retain a subtle neutral outline.
                        outline: isActive
                          ? `2px solid ${option.primaryHover}`
                          : "2px solid transparent",
                      }}
                    />
                    <span>{option.name}</span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            className="px-2 py-1 text-lg text-muted"
            onClick={() => setIsMenuOpen((p) => !p)}
          >
            ⋮
          </Button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-surface border border-border rounded-lg shadow-sm z-50">
              <Button
                variant="ghost"
                className="w-full justify-start text-danger hover:bg-danger-surface"
                onClick={async () => {
                  setIsMenuOpen(false);
                  await logout();
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
