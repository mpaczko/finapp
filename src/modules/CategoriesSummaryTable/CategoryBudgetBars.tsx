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
      <div className="rounded-3xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted">
        Brak kategorii do pokazania.
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-border-soft bg-surface p-4 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Plan vs wydatki w miesiącu
          </h3>
          <p className="text-sm text-muted">
            Wszystkie kategorie z bieżącego budżetu miesięcznego.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
            Plan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Wydane
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger" />
            Ponad plan
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        {parsedRows.map((row) => {
          const baseColor = colorMap[row.name] || "var(--app-border-strong)";
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
              className="group grid gap-2 rounded-2xl border border-border-soft bg-surface-muted px-3 py-3 text-left transition hover:border-border hover:bg-surface hover:shadow-sm cursor-pointer"
            >
              <div className="grid gap-2 min-[3200px]:grid-cols-[120px_minmax(0,1fr)_120px] min-[3200px]:items-center">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: baseColor }}
                  />
                  <span className="truncate text-sm font-semibold text-foreground">
                    {row.name}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="relative h-8 overflow-hidden rounded-full bg-surface ring-1 ring-inset ring-border">
                    <div className="absolute inset-0 rounded-full bg-border" />
                    {row.planned > 0 && row.actual > 0 ? (
                      <div
                        className="absolute inset-y-0 left-0 flex items-center justify-end rounded-full px-3 text-xs font-semibold"
                        style={{
                          width: actualWidth,
                          backgroundColor: isOverBudget
                            ? "var(--app-danger)"
                            : "var(--app-primary)",
                          backgroundImage: isOverBudget
                            ? "linear-gradient(135deg, var(--app-danger), color-mix(in srgb, var(--app-danger) 78%, black))"
                            : "var(--app-primary-gradient)",
                          color: isOverBudget
                            ? "var(--app-on-danger)"
                            : "var(--app-on-primary)",
                        }}
                      >
                        {isOverBudget ? "Ponad plan" : spentLabel}
                      </div>
                    ) : null}
                    {row.remaining > 0 ? (
                      <div
                        className="absolute inset-y-0 flex items-center justify-center px-2 text-xs font-semibold text-muted"
                        style={{
                          left: actualWidth,
                          width: remainingWidth,
                        }}
                      >
                        {remainingLabel}
                      </div>
                    ) : null}
                    {row.planned === 0 && row.actual > 0 ? (
                      <div className="absolute inset-0 flex items-center justify-end rounded-full bg-danger px-3 text-xs font-semibold text-[color:var(--app-on-danger)]">
                        Brak planu
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-1 text-xs min-[3200px]:text-right">
                  <span className="text-muted">
                    Plan:{" "}
                    <strong className="font-semibold text-foreground-soft">
                      {formatCurrency(row.planned)}
                    </strong>
                  </span>
                  <span className="text-muted">
                    Wydane:{" "}
                    <strong className="font-semibold text-foreground-soft">
                      {formatCurrency(row.actual)}
                    </strong>
                  </span>
                  <span
                    className={
                      row.remaining >= 0
                        ? "font-semibold text-success"
                        : "font-semibold text-danger"
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
