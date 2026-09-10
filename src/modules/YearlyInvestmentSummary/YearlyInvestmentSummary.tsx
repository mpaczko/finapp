import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { useBudgetQuery, useUpdateBudgetMutation } from "../../features/budgets/queries";
import { useYearlySummaryQuery } from "../../features/summary/queries";

type YearlyInvestmentSummaryProps = {
  userId: string | null;
  selectedMonth: string;
};

type ComparisonCardProps = {
  title: string;
  planned: number | null;
  actual: number | null;
  loading: boolean;
  baseColor: string;
};

const ComparisonCard = ({
  title,
  planned,
  actual,
  loading,
  baseColor,
}: ComparisonCardProps) => {
  const difference = useMemo(
    () => (Number(planned || 0) - Number(actual || 0)).toFixed(2),
    [planned, actual],
  );

  return (
    <div className="flex h-full min-h-[150px] w-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {/* <p className="text-sm font-medium leading-5 text-slate-500">{title}</p> */}
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: baseColor }}
        />
        <span className="text-sm font-medium leading-5 text-slate-500">
          {title}
        </span>
      </div>

      <div className="mt-auto space-y-2 pt-5">
        <div className="grid grid-cols-[90px_1fr] items-center text-sm text-slate-700">
          <span>Plan</span>
          <span className="text-right font-medium text-slate-900">
            {planned?.toFixed(2) ?? "0.00"} zł
          </span>
        </div>

        <div className="grid grid-cols-[90px_1fr] items-center text-sm text-slate-700">
          <span>Rzeczyw.</span>
          <span className="text-right font-medium text-slate-900">
            {loading ? "Ładowanie…" : `${actual?.toFixed(2) ?? "0.00"} zł`}
          </span>
        </div>

        <div className="grid grid-cols-[90px_1fr] items-center border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
          <span>Saldo</span>
          <span className="text-right">{difference} zł</span>
        </div>
      </div>
    </div>
  );
};

const YearlyInvestmentSummary = ({
  userId,
  selectedMonth,
}: YearlyInvestmentSummaryProps) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [editingIpBox, setEditingIpBox] = useState(false);
  const [ipBoxInputValue, setIpBoxInputValue] = useState("");
  const { data: budgets = [] } = useBudgetQuery(selectedMonth, Boolean(userId));
  const selectedBudget = budgets[0];
  const updateBudgetMutation = useUpdateBudgetMutation(selectedMonth);
  const { data: summary, isLoading: loading } = useYearlySummaryQuery(
    year,
    Boolean(userId),
  );

  const selectedMonthIpBox = Number(selectedBudget?.ip_box ?? 0);
  const selectedMonthBelongsToYear = selectedBudget?.month.startsWith(
    `${year}-`,
  );

  const saveIpBoxValue = async () => {
    if (!selectedBudget) return;

    const value = Number(ipBoxInputValue);
    if (!Number.isFinite(value) || value < 0) return;

    try {
      await updateBudgetMutation.mutateAsync({
        id: selectedBudget.id,
        budget: { ip_box: value },
      });
      setEditingIpBox(false);
    } catch (error) {
      console.error("Błąd podczas zapisu kwoty IP Box:", error);
    }
  };

  return (
    <div className="w-full min-w-0 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-900">
            Roczne podsumowanie finansów
          </p>
          <p className="max-w-lg text-sm text-slate-500">
            Podsumowanie roczne: inwestycje, podróże, ubrania/sprzęt sportowy
            oraz szacowany zwrot IP Box.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-sm text-slate-600">Rok</span>
          <input
            type="number"
            min="2000"
            max="2100"
            step="1"
            value={year}
            onChange={(e) => {
              const nextYear = Number(e.target.value);
              setYear(isNaN(nextYear) ? currentYear : nextYear);
            }}
            className="w-20 border-none bg-transparent text-right text-sm font-semibold text-slate-900 outline-none"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex min-h-[150px] min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">
            Inwestycje — łączne wydatki w danym roku
          </p>

          <p className="mt-auto text-2xl font-bold text-slate-900">
            {loading
              ? "Ładowanie…"
              : `${summary?.investmentSum.toFixed(2) ?? "0.00"} zł`}
          </p>
        </div>

        <div className="flex min-h-[150px] min-w-0 flex-col rounded-2xl border gap-2 border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">
            IP Box — szacowany zwrot za dany rok dotychczas
          </p>

          <p className="mt-auto text-2xl font-bold text-slate-900">
            {loading || summary == null
              ? "Ładowanie…"
              : `${summary.ipBoxSum.toFixed(2)} zł`}
          </p>

          {selectedBudget && selectedMonthBelongsToYear && (
            <div className="mt-2 border-t border-slate-200 pt-2">
              <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
                <span>Kwota dla {selectedBudget.month}</span>
                {editingIpBox ? null : (
                  <button
                    type="button"
                    onClick={() => {
                      setIpBoxInputValue(selectedMonthIpBox.toFixed(2));
                      setEditingIpBox(true);
                    }}
                    className="rounded p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    aria-label="Edytuj kwotę IP Box dla wybranego miesiąca"
                    title="Edytuj kwotę IP Box"
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                )}
              </div>

              {editingIpBox ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    autoFocus
                    value={ipBoxInputValue}
                    onChange={(event) => setIpBoxInputValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveIpBoxValue();
                      if (event.key === "Escape") setEditingIpBox(false);
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-sm font-semibold text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />
                  <button
                    type="button"
                    disabled={updateBudgetMutation.isPending}
                    onClick={saveIpBoxValue}
                    className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Zapisz
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedMonthIpBox.toFixed(2)} zł
                </p>
              )}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <ComparisonCard
            title="Podróże — planowane vs zrealizowane"
            planned={summary?.travelPlanned ?? null}
            actual={summary?.travelActual ?? null}
            loading={loading}
            baseColor="rgb(254, 205, 211)"
          />
        </div>

        <div className="min-w-0">
          <ComparisonCard
            title="Ubrania / sprzęt sportowy — planowane vs zrealizowane"
            planned={summary?.clothesPlanned ?? null}
            actual={summary?.clothesActual ?? null}
            loading={loading}
            baseColor="rgb(165, 243, 252)"
          />
        </div>
      </div>
    </div>
  );
};

export default YearlyInvestmentSummary;
