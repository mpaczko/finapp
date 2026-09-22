import { Check, Pencil, Undo2 } from "lucide-react";
import { useSummaryVisibility } from "../../hooks/useSummaryVisibility";
import { formatSummaryCurrency } from "../../lib/summaryVisibility";

type TotalExpensesCardProps = {
  totals: { income: string; planned: string; actual: string; diff: string };
  editingIncome: boolean;
  incomeInputValue: string;
  incomeReceived: boolean;
  loading: boolean;
  setEditingIncome: (editing: boolean) => void;
  setIncomeInputValue: (value: string) => void;
  saveIncomeValue: (value: number) => Promise<void>;
  setIncomeReceived: (received: boolean) => Promise<void>;
};

const TotalExpensesCard = ({
  totals,
  editingIncome,
  incomeInputValue,
  incomeReceived,
  loading,
  setEditingIncome,
  setIncomeInputValue,
  saveIncomeValue,
  setIncomeReceived,
}: TotalExpensesCardProps) => {
  const [showValues] = useSummaryVisibility();

  const saveEditedIncome = () => {
    saveIncomeValue(parseFloat(incomeInputValue) || 0);
    setEditingIncome(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-950 p-3 text-sm text-white shadow-md">
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold">
            Suma wszystkich wydatków
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-xl bg-white/10 p-2.5">
            <div className="text-[10px] font-medium uppercase tracking-wide text-slate-300">
              Przychód
            </div>
            <div className="mt-1 text-sm font-bold tabular-nums text-blue-200 sm:text-base">
              {editingIncome ? (
                <input
                  type="number"
                  autoFocus
                  step="0.01"
                  value={incomeInputValue}
                  onChange={(event) => setIncomeInputValue(event.target.value)}
                  onBlur={saveEditedIncome}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveEditedIncome();
                    if (event.key === "Escape") setEditingIncome(false);
                  }}
                  className="w-full max-w-[120px] rounded border border-blue-200 bg-white/10 px-1.5 py-1 text-right text-sm text-blue-100 outline-none transition focus:border-blue-100 focus:ring-1 focus:ring-blue-100"
                />
              ) : (
                <div className="flex items-center gap-1.5">
                  <span>
                    {formatSummaryCurrency(totals.income, showValues)}
                  </span>
                  <button
                    type="button"
                    aria-label="Edytuj przychód"
                    title="Edytuj"
                    onClick={() => {
                      setEditingIncome(true);
                      setIncomeInputValue(totals.income);
                    }}
                    className="rounded p-1 text-blue-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={() => setIncomeReceived(!incomeReceived)}
                className={`mt-2 inline-flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 ${incomeReceived ? "bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400/30" : "bg-amber-400/20 text-amber-100 hover:bg-amber-400/30"}`}
                aria-label={
                  incomeReceived
                    ? "Cofnij potwierdzenie wpływu"
                    : "Potwierdź otrzymanie wypłaty"
                }
              >
                {incomeReceived ? (
                  <>
                    <Check size={13} aria-hidden="true" />
                    Wpłata potwierdzona
                    <Undo2 size={13} aria-hidden="true" />
                  </>
                ) : (
                  <>Potwierdź otrzymanie wypłaty</>
                )}
              </button>
            </div>
          </div>

          <SummaryMetric
            label="Planowane"
            value={formatSummaryCurrency(totals.planned, showValues)}
            className="text-amber-200"
          />
          <SummaryMetric
            label="Rzeczywiste"
            value={formatSummaryCurrency(totals.actual, showValues)}
            className="text-rose-200"
          />
          <SummaryMetric
            label="Różnica"
            value={formatSummaryCurrency(totals.diff, showValues)}
            className={
              Number(totals.diff) >= 0 ? "text-emerald-200" : "text-rose-200"
            }
          />
        </div>
      </div>
    </div>
  );
};

type SummaryMetricProps = { label: string; value: string; className: string };

const SummaryMetric = ({ label, value, className }: SummaryMetricProps) => (
  <div className="rounded-xl bg-white/10 p-2.5">
    <div className="text-[10px] font-medium uppercase tracking-wide text-slate-300">
      {label}
    </div>
    <div
      className={`mt-1 text-sm font-bold tabular-nums sm:text-base ${className}`}
    >
      {value}
    </div>
  </div>
);

export default TotalExpensesCard;
