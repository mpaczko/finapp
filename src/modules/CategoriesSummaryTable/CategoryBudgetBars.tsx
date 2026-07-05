type CategoryBudgetBarRow = {
  name: string;
  planned: string;
  actual: string;
};

type CategoryBudgetBarsProps = {
  rows: CategoryBudgetBarRow[];
  colorMap: Record<string, string>;
  onSelectCategory: (category: string) => void;
};

const formatCurrency = (value: number) => `${value.toFixed(2)} zł`;

const getReadableTextColor = (hexColor: string) => {
  const normalized = hexColor.replace("#", "");

  if (normalized.length !== 6) return "#0f172a";

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 170 ? "#0f172a" : "#ffffff";
};

const CategoryBudgetBars = ({
  rows,
  colorMap,
  onSelectCategory,
}: CategoryBudgetBarsProps) => {
  const parsedRows = rows.map((row) => {
    const planned = Number(row.planned) || 0;
    const actual = Number(row.actual) || 0;
    const remaining = planned - actual;

    return {
      ...row,
      planned,
      actual,
      remaining,
    };
  });

  if (parsedRows.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Brak kategorii do pokazania.
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Plan vs wydatki w miesiącu
          </h3>
          <p className="text-sm text-slate-500">
            Wszystkie kategorie z bieżącego budżetu miesięcznego.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            Plan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
            Wydane
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Ponad plan
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        {parsedRows.map((row) => {
          const baseColor = colorMap[row.name] || "#cbd5e1";
          const actualPercent =
            row.planned > 0
              ? Math.min((row.actual / row.planned) * 100, 100)
              : row.actual > 0
                ? 100
                : 0;
          const remainingPercent =
            row.planned > 0 ? Math.max(100 - actualPercent, 0) : 0;
          const actualWidth = `${actualPercent}%`;
          const remainingWidth = `${remainingPercent}%`;
          const spentLabel =
            row.planned > 0 &&
            row.actual > 0 &&
            row.actual >= row.planned * 0.18
              ? formatCurrency(row.actual)
              : "";
          const remainingLabel =
            row.remaining > 0 && remainingPercent >= 22
              ? `Zostało ${formatCurrency(row.remaining)}`
              : "";
          const isOverBudget = row.actual > row.planned;

          return (
            <button
              key={row.name}
              type="button"
              onClick={() => onSelectCategory(row.name)}
              className="group grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-left transition hover:border-slate-200 hover:bg-white hover:shadow-sm cursor-pointer"
            >
              <div className="grid gap-2 2xl:grid-cols-[120px_minmax(0,1fr)_120px] 2xl:items-center">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: baseColor }}
                  />
                  <span className="truncate text-sm font-semibold text-slate-900">
                    {row.name}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="relative h-8 overflow-hidden rounded-full bg-white ring-1 ring-inset ring-slate-200">
                    <div className="absolute inset-0 rounded-full bg-slate-200" />
                    {row.planned > 0 && row.actual > 0 ? (
                      <div
                        className="absolute inset-y-0 left-0 flex items-center justify-end rounded-full px-3 text-xs font-semibold"
                        style={{
                          width: actualWidth,
                          backgroundColor: isOverBudget ? "#f43f5e" : baseColor,
                          color: isOverBudget
                            ? "#ffffff"
                            : getReadableTextColor(baseColor),
                        }}
                      >
                        {isOverBudget ? "Ponad plan" : spentLabel}
                      </div>
                    ) : null}
                    {row.remaining > 0 ? (
                      <div
                        className="absolute inset-y-0 flex items-center justify-center px-2 text-xs font-semibold text-slate-600"
                        style={{
                          left: actualWidth,
                          width: remainingWidth,
                        }}
                      >
                        {remainingLabel}
                      </div>
                    ) : null}
                    {row.planned === 0 && row.actual > 0 ? (
                      <div className="absolute inset-0 flex items-center justify-end rounded-full bg-rose-500 px-3 text-xs font-semibold text-white">
                        Brak planu
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-1 text-xs 2xl:text-right">
                  <span className="text-slate-500">
                    Plan:{" "}
                    <strong className="font-semibold text-slate-800">
                      {formatCurrency(row.planned)}
                    </strong>
                  </span>
                  <span className="text-slate-500">
                    Wydane:{" "}
                    <strong className="font-semibold text-slate-800">
                      {formatCurrency(row.actual)}
                    </strong>
                  </span>
                  <span
                    className={
                      row.remaining >= 0
                        ? "font-semibold text-emerald-700"
                        : "font-semibold text-rose-700"
                    }
                  >
                    {row.remaining >= 0 ? "Zostało" : "Przekroczono"}:{" "}
                    {formatCurrency(Math.abs(row.remaining))}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryBudgetBars;
