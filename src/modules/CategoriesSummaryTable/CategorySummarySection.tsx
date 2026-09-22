import type { CategorySummary } from "../../hooks/useBudgetSummary";
import { useSummaryVisibility } from "../../hooks/useSummaryVisibility";
import { formatSummaryCurrency } from "../../lib/summaryVisibility";

type CategorySummarySectionProps = {
  title: string;
  rows: CategorySummary[];
  colorMap: Record<string, string>;
  onSelectCategory: (category: string) => void;
  editingCategory: string | null;
  inputValue: string;
  setEditingCategory: (category: string | null) => void;
  setInputValue: (value: string) => void;
  savePlannedValue: (category: string, value: number) => Promise<void>;
};

const calculateTotals = (rows: CategorySummary[]) => {
  const planned = rows.reduce((sum, row) => sum + Number(row.planned), 0);
  const actual = rows.reduce((sum, row) => sum + Number(row.actual), 0);

  return {
    planned,
    actual,
    diff: planned - actual,
  };
};

const CategorySummarySection = ({
  title,
  rows,
  colorMap,
  onSelectCategory,
  editingCategory,
  inputValue,
  setEditingCategory,
  setInputValue,
  savePlannedValue,
}: CategorySummarySectionProps) => {
  const [showValues] = useSummaryVisibility();

  const totals = calculateTotals(rows);

  const saveEditedValue = (category: string) => {
    savePlannedValue(category, parseFloat(inputValue) || 0);
    setEditingCategory(null);
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-col gap-1 border-b border-slate-100 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>Suma kategorii:</span>
          <span>{formatSummaryCurrency(totals.actual, showValues)}</span>
        </div>
      </div>

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
                Brak pozycji w tej grupie.
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
                    onClick={() => onSelectCategory(row.name)}
                  >
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                        style={{
                          backgroundColor: colorMap[row.name] || "#cbd5e1",
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
                      setInputValue(row.planned);
                    }}
                  >
                    {editingCategory === row.name ? (
                      <input
                        type="number"
                        autoFocus
                        step="0.01"
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        onBlur={() => saveEditedValue(row.name)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") saveEditedValue(row.name);
                          if (event.key === "Escape") setEditingCategory(null);
                        }}
                        className="w-full max-w-[82px] rounded border border-slate-200 px-1.5 py-1 text-right text-xs outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                      />
                    ) : (
                      <span className="whitespace-nowrap">
                        {formatSummaryCurrency(row.planned, showValues)}
                      </span>
                    )}
                  </td>

                  <td
                    className={`px-1.5 py-2 text-right text-[11px] font-semibold tabular-nums sm:px-2 sm:text-xs ${actual > planned ? "text-red-700" : actual === planned ? "text-amber-600" : "text-emerald-600"}`}
                  >
                    <span className="whitespace-nowrap">
                      {formatSummaryCurrency(row.actual, showValues)}
                    </span>
                  </td>
                  <td className="px-1.5 py-2 text-right text-[11px] tabular-nums sm:px-2 sm:text-xs">
                    <span className="whitespace-nowrap">
                      {formatSummaryCurrency(difference, showValues)}
                    </span>
                  </td>
                </tr>
              );
            })
          )}

          <tr className="bg-slate-100 text-xs font-semibold text-slate-900">
            <td className="px-2.5 py-2 sm:px-3">Suma</td>
            <td className="px-1.5 py-2 text-right tabular-nums sm:px-2">
              <span className="whitespace-nowrap">
                {formatSummaryCurrency(totals.planned, showValues)}
              </span>
            </td>
            <td className="px-1.5 py-2 text-right tabular-nums sm:px-2">
              <span className="whitespace-nowrap">
                {formatSummaryCurrency(totals.actual, showValues)}
              </span>
            </td>
            <td className="px-1.5 py-2 text-right tabular-nums sm:px-2">
              <span className="whitespace-nowrap">
                {formatSummaryCurrency(totals.diff, showValues)}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CategorySummarySection;
