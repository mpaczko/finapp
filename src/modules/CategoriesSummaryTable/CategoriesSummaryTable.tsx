import { useBudgetSummary } from "../../hooks/useBudgetSummary";
import { setSelectedCategory } from "../../store/configSlice/configSlice";
import { useAppDispatch } from "../../store/reduxHook";

import CategoryBudgetBars from "./CategoryBudgetBars";
import { categoryChartColors } from "../../lib/categoryColors";

const CategoriesSummaryTable = () => {
  const {
    summary,
    totals,
    editingCategory,
    inputValue,
    setEditingCategory,
    setInputValue,
    savePlannedValue,
    loading,
  } = useBudgetSummary();

  const dispatch = useAppDispatch();

  const setCategory = (category: string) => {
    dispatch(setSelectedCategory(category));
  };

  const categoryColorMap = Object.fromEntries(
    summary.map((row, index) => [
      row.name,
      categoryChartColors[index % categoryChartColors.length],
    ]),
  );

  const excludedNames = ["inwestycje", "koszty związane z firmą"];

  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const excludedNormalized = excludedNames.map((name) => normalize(name));

  const primarySummary = summary.filter(
    (row) => !excludedNormalized.includes(normalize(row.name)),
  );

  const secondarySummary = summary.filter((row) =>
    excludedNormalized.includes(normalize(row.name)),
  );

  const sumTotals = (rows: typeof summary) => {
    const planned = rows.reduce((sum, row) => sum + Number(row.planned), 0);
    const actual = rows.reduce((sum, row) => sum + Number(row.actual), 0);

    return {
      planned: `${planned.toFixed(2)} zł`,
      actual: `${actual.toFixed(2)} zł`,
      diff: `${(planned - actual).toFixed(2)} zł`,
    };
  };

  const primaryTotals = sumTotals(primarySummary);
  const secondaryTotals = sumTotals(secondarySummary);

  const renderTable = (
    rows: typeof summary,
    emptyMessage = "Brak pozycji w tej grupie.",
  ) => (
    <table className="w-full table-fixed">
      <colgroup>
        <col className="w-[40%]" />
        <col className="w-[22%]" />
        <col className="w-[20%]" />
        <col className="w-[18%]" />
      </colgroup>

      <thead>
        <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
          <th className="border-b border-slate-100 px-2.5 py-2 font-medium sm:px-3">
            Kategoria
          </th>

          <th className="border-b border-slate-100 px-1.5 py-2 text-right font-medium sm:px-2">
            Planowane
          </th>

          <th className="border-b border-slate-100 px-1.5 py-2 text-right font-medium sm:px-2">
            Wydatki
          </th>

          <th className="border-b border-slate-100 px-1.5 py-2 text-right font-medium sm:px-2">
            Różnica
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 text-slate-900">
        {rows.length === 0 ? (
          <tr>
            <td
              className="px-3 py-5 text-center text-xs text-slate-500"
              colSpan={4}
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row) => {
            const actual = Number(row.actual);
            const planned = Number(row.planned);
            const difference = planned - actual;

            return (
              <tr
                key={row.name}
                className="text-slate-900 transition-colors hover:bg-slate-50"
              >
                <td
                  className="min-w-0 cursor-pointer px-2.5 py-2 sm:px-3"
                  onClick={() => setCategory(row.name)}
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          categoryColorMap[row.name] || "#cbd5e1",
                      }}
                    />

                    <span className="min-w-0 truncate text-xs font-medium leading-snug sm:text-sm">
                      {row.name}
                    </span>
                  </div>
                </td>

                <td
                  className="cursor-pointer px-1.5 py-2 text-right text-[11px] tabular-nums sm:px-2 sm:text-xs"
                  onClick={() => {
                    setEditingCategory(row.name);
                    setInputValue(row.planned.toString());
                  }}
                >
                  {editingCategory === row.name ? (
                    <input
                      type="number"
                      autoFocus
                      step="0.01"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onBlur={() => {
                        const newValue = parseFloat(inputValue) || 0;

                        savePlannedValue(row.name, newValue);
                        setEditingCategory(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const newValue = parseFloat(inputValue) || 0;

                          savePlannedValue(row.name, newValue);
                          setEditingCategory(null);
                        }

                        if (e.key === "Escape") {
                          setEditingCategory(null);
                        }
                      }}
                      className="w-full max-w-[82px] rounded border border-slate-200 px-1.5 py-1 text-right text-xs outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                    />
                  ) : (
                    <span className="whitespace-nowrap">{row.planned} zł</span>
                  )}
                </td>

                <td
                  className={`px-1.5 py-2 text-right text-[11px] font-semibold tabular-nums sm:px-2 sm:text-xs ${
                    actual > planned
                      ? "text-red-700"
                      : actual === planned
                        ? "text-amber-600"
                        : "text-emerald-600"
                  }`}
                >
                  <span className="whitespace-nowrap">{row.actual} zł</span>
                </td>

                <td className="px-1.5 py-2 text-right text-[11px] tabular-nums sm:px-2 sm:text-xs">
                  <span className="whitespace-nowrap">
                    {difference.toFixed(2)} zł
                  </span>
                </td>
              </tr>
            );
          })
        )}

        <tr className="bg-slate-100 text-xs font-semibold text-slate-900">
          <td className="px-2.5 py-2 sm:px-3">Suma</td>

          <td className="px-1.5 py-2 text-right tabular-nums sm:px-2">
            <span className="whitespace-nowrap">{sumTotals(rows).planned}</span>
          </td>

          <td className="px-1.5 py-2 text-right tabular-nums sm:px-2">
            <span className="whitespace-nowrap">{sumTotals(rows).actual}</span>
          </td>

          <td className="px-1.5 py-2 text-right tabular-nums sm:px-2">
            <span className="whitespace-nowrap">{sumTotals(rows).diff}</span>
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div className="grid min-w-0 gap-3 p-3 sm:gap-4 sm:p-4">
      <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">
        Podsumowanie wydatków według kategorii
      </h2>

      <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] 2xl:items-start">
        {/* LEWA KOLUMNA */}
        <div className="grid min-w-0 auto-rows-max content-start gap-4">
          {/* GŁÓWNE KATEGORIE */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-1 border-b border-slate-100 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Kategorie (bez Inwestycji i Kosztów firmy)
              </h3>

              <div className="text-xs font-medium text-slate-500">
                Suma kategorii: {primaryTotals.actual}
              </div>
            </div>

            {renderTable(primarySummary)}
          </div>

          {/* KATEGORIE DODATKOWE */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-1 border-b border-slate-100 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Inwestycje i Koszty firmy
              </h3>

              <div className="text-xs font-medium text-slate-500">
                Suma kategorii: {secondaryTotals.actual}
              </div>
            </div>

            {renderTable(secondarySummary)}
          </div>

          {/* ŁĄCZNE PODSUMOWANIE */}
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-3 text-sm text-white shadow-md">
            <div className="grid gap-3">
              <span className="text-sm font-semibold">
                Suma wszystkich wydatków
              </span>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl bg-white/10 p-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-slate-300">
                    Planowane
                  </div>

                  <div className="mt-1 text-sm font-bold tabular-nums text-amber-200 sm:text-base">
                    {totals.planned} zł
                  </div>
                </div>

                <div className="rounded-xl bg-white/10 p-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-slate-300">
                    Rzeczywiste
                  </div>

                  <div className="mt-1 text-sm font-bold tabular-nums text-rose-200 sm:text-base">
                    {totals.actual} zł
                  </div>
                </div>

                <div className="rounded-xl bg-white/10 p-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-slate-300">
                    Różnica
                  </div>

                  <div
                    className={`mt-1 text-sm font-bold tabular-nums sm:text-base ${
                      Number(totals.diff) >= 0
                        ? "text-emerald-200"
                        : "text-rose-200"
                    }`}
                  >
                    {totals.diff} zł
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRAWA KOLUMNA */}
        <div className="min-w-0">
          {loading && (
            <div className="mb-2 text-xs text-gray-500">
              ⏳ Zapisuję zmiany...
            </div>
          )}

          <CategoryBudgetBars
            rows={summary}
            colorMap={categoryColorMap}
            onSelectCategory={setCategory}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoriesSummaryTable;
