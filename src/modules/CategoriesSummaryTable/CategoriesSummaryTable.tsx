import { useBudgetSummary } from "../../hooks/useBudgetSummary";
import { setSelectedCategory } from "../../store/configSlice/configSlice";
import { useAppDispatch } from "../../store/reduxHook";
// import PieChart from "../../ui/PieChart/PieChart";

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
  const setCategory = (category: string) =>
    dispatch(setSelectedCategory(category));

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

  const excludedNormalized = excludedNames.map((n) => normalize(n));

  const primarySummary = summary.filter(
    (row) => !excludedNormalized.includes(normalize(row.name)),
  );

  const secondarySummary = summary.filter((row) =>
    excludedNormalized.includes(normalize(row.name)),
  );

  const sumTotals = (rows: typeof summary) => {
    const planned = rows.reduce((s, r) => s + Number(r.planned), 0);
    const actual = rows.reduce((s, r) => s + Number(r.actual), 0);
    return {
      planned: planned.toFixed(2) + " zł",
      actual: actual.toFixed(2) + " zł",
      diff: (planned - actual).toFixed(2) + " zł",
    };
  };

  const primaryTotals = sumTotals(primarySummary);
  const secondaryTotals = sumTotals(secondarySummary);

  // const actualChartData = summary
  //   .filter((row) => Number(row.actual) > 0)
  //   .map((row) => ({
  //     label: row.name,
  //     value: Number(row.actual),
  //     color: categoryColorMap[row.name] || "#cbd5e1",
  //   }));

  // const plannedChartData = summary
  //   .filter((row) => Number(row.planned) > 0)
  //   .map((row) => ({
  //     label: row.name,
  //     value: Number(row.planned),
  //     color: categoryColorMap[row.name] || "#cbd5e1",
  //   }));

  return (
    <div className="grid min-w-0 gap-5 p-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Podsumowanie wydatków według kategorii
      </h2>

      {/*
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <PieChart
          title="Wydatki rzeczywiste"
          data={actualChartData}
          totalLabel={`Suma: ${summary
            .reduce((sum, row) => sum + Number(row.actual), 0)
            .toFixed(2)} zł`}
          className="min-h-[380px]"
        />

        <PieChart
          title="Wydatki planowane"
          data={plannedChartData}
          totalLabel={`Suma: ${summary
            .reduce((sum, row) => sum + Number(row.planned), 0)
            .toFixed(2)} zł`}
          className="min-h-[380px]"
        />
      </div>
      */}

      <div className="grid min-w-0 gap-5 xl:grid-cols-2 xl:items-start">
        <div className="grid min-w-0 auto-rows-max content-start gap-5">
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex flex-col gap-1 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Kategorie (bez Inwestycji i Kosztów firmy)
              </h3>
              <div className="text-xs font-medium text-slate-500">
                Suma kategorii: {primaryTotals.actual}
              </div>
            </div>

            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[42%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2.5 border-b border-slate-100">
                    Kategoria
                  </th>
                  <th className="px-2 py-2.5 text-right border-b border-slate-100">
                    Planowane
                  </th>
                  <th className="px-2 py-2.5 text-right border-b border-slate-100">
                    Wydatki
                  </th>
                  <th className="px-2 py-2.5 text-right border-b border-slate-100">
                    Różnica
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {primarySummary.map((row) => (
                  <tr
                    key={row.name}
                    className="hover:bg-slate-50 transition-colors text-slate-900"
                  >
                    <td
                      className="px-3 py-2.5 border-b border-slate-100 cursor-pointer"
                      onClick={() => setCategory(row.name)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              categoryColorMap[row.name] || "#cbd5e1",
                          }}
                        />
                        <span className="text-sm font-medium leading-snug">
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-2 py-2.5 border-b border-slate-100 text-right text-[12px] tabular-nums whitespace-nowrap cursor-pointer"
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
                            if (e.key === "Escape") setEditingCategory(null);
                          }}
                          className="w-24 px-2 py-1 border rounded text-right"
                        />
                      ) : (
                        `${row.planned} zł`
                      )}
                    </td>
                    <td
                      className={`px-2 py-2.5 border-b border-slate-100 text-right text-[12px] font-semibold tabular-nums whitespace-nowrap ${Number(row.actual) > Number(row.planned) ? "text-red-700" : Number(row.actual) === Number(row.planned) ? "text-amber-600" : "text-emerald-600"}`}
                    >
                      {row.actual} zł
                    </td>
                    <td className="px-2 py-2.5 border-b border-slate-100 text-right text-[12px] tabular-nums whitespace-nowrap">
                      {(Number(row.planned) - Number(row.actual)).toFixed(2)} zł
                    </td>
                  </tr>
                ))}

                <tr className="bg-slate-100 text-slate-900 text-xs font-semibold sm:text-[13px]">
                  <td className="px-3 py-2.5">Suma</td>
                  <td className="px-2 py-2.5 text-right tabular-nums whitespace-nowrap">
                    {primaryTotals.planned}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums whitespace-nowrap">
                    {primaryTotals.actual}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums whitespace-nowrap">
                    {primaryTotals.diff}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Secondary categories table */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex flex-col gap-1 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Inwestycje i Koszty firmy
              </h3>
              <div className="text-xs font-medium text-slate-500">
                Suma kategorii: {secondaryTotals.actual}
              </div>
            </div>

            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[42%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2.5 border-b border-slate-100">
                    Kategoria
                  </th>
                  <th className="px-2 py-2.5 text-right border-b border-slate-100">
                    Planowane
                  </th>
                  <th className="px-2 py-2.5 text-right border-b border-slate-100">
                    Wydatki
                  </th>
                  <th className="px-2 py-2.5 text-right border-b border-slate-100">
                    Różnica
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900">
                {secondarySummary.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-slate-500"
                      colSpan={4}
                    >
                      Brak pozycji w tej grupie.
                    </td>
                  </tr>
                ) : (
                  secondarySummary.map((row) => (
                    <tr
                      key={row.name}
                      className="hover:bg-slate-50 transition-colors text-slate-900"
                    >
                      <td
                        className="px-3 py-2.5 border-b border-slate-100 cursor-pointer"
                        onClick={() => setCategory(row.name)}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                categoryColorMap[row.name] || "#cbd5e1",
                            }}
                          />
                          <span className="text-sm font-medium leading-snug">
                            {row.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-2 py-2.5 border-b border-slate-100 text-right text-[12px] tabular-nums whitespace-nowrap cursor-pointer"
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
                              if (e.key === "Escape") setEditingCategory(null);
                            }}
                            className="w-24 px-2 py-1 border rounded text-right"
                          />
                        ) : (
                          `${row.planned} zł`
                        )}
                      </td>
                      <td
                        className={`px-2 py-2.5 border-b border-slate-100 text-right text-[12px] font-semibold tabular-nums whitespace-nowrap ${Number(row.actual) > Number(row.planned) ? "text-red-700" : Number(row.actual) === Number(row.planned) ? "text-amber-600" : "text-emerald-600"}`}
                      >
                        {row.actual} zł
                      </td>
                      <td className="px-2 py-2.5 border-b border-slate-100 text-right text-[12px] tabular-nums whitespace-nowrap">
                        {(Number(row.planned) - Number(row.actual)).toFixed(2)}{" "}
                        zł
                      </td>
                    </tr>
                  ))
                )}

                <tr className="bg-slate-100 text-slate-900 text-xs font-semibold sm:text-[13px]">
                  <td className="px-3 py-2.5">Suma</td>
                  <td className="px-2 py-2.5 text-right tabular-nums whitespace-nowrap">
                    {secondaryTotals.planned}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums whitespace-nowrap">
                    {secondaryTotals.actual}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums whitespace-nowrap">
                    {secondaryTotals.diff}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Overall totals under both tables */}
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-3.5 text-sm text-white shadow-md">
            <div className="grid gap-3">
              <span className="text-sm font-semibold">
                Suma wszystkich wydatków
              </span>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-2.5">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
                    Planowane
                  </div>
                  <div className="mt-1 text-base font-bold tabular-nums text-amber-200">
                    {totals.planned} zł
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-2.5">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
                    Rzeczywiste
                  </div>
                  <div className="mt-1 text-base font-bold tabular-nums text-rose-200">
                    {totals.actual} zł
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-2.5">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
                    Różnica
                  </div>
                  <div
                    className={`mt-1 text-base font-bold tabular-nums ${
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

        <div className="min-w-0">
          {loading && (
            <div className="text-sm text-gray-500 mb-2">
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
