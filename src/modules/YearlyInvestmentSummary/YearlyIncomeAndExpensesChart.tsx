import type { MonthlyOverview } from "./yearlyIncomeExpensesChartConfig";
import YearlyIncomeExpensesChartControls from "./YearlyIncomeExpensesChartControls";
import YearlyIncomeExpensesChartSvg from "./YearlyIncomeExpensesChartSvg";
import YearlyIncomeExpensesLegend from "./YearlyIncomeExpensesLegend";
import { useYearlyIncomeExpensesChart } from "./hooks/useYearlyIncomeExpensesChart";

type YearlyIncomeAndExpensesChartProps = {
  year: number;
  monthlyOverview: MonthlyOverview[];
  loading: boolean;
  showValues: boolean;
};

const YearlyIncomeAndExpensesChart = ({
  year,
  monthlyOverview,
  loading,
  showValues,
}: YearlyIncomeAndExpensesChartProps) => {
  const {
    activePoint,
    activeTooltip,
    averages,
    chart,
    seriesVisibility,
    setActivePoint,
    setSeriesVisibility,
    setShowAverage,
    setShowMonthlyValues,
    showAverage,
    showMonthlyValues,
    totals,
    visibleOverview,
  } = useYearlyIncomeExpensesChart(year, monthlyOverview);

  return (
    <section className="mt-4 min-w-0 rounded-2xl border border-border bg-surface-muted p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Przychód i wydatki miesięczne
          </h3>
          <p className="text-xs text-muted">
            Przychód, wydatki i inwestycje w kolejnych miesiącach.
          </p>
        </div>
        {!loading && (
          <YearlyIncomeExpensesChartControls
            showMonthlyValues={showMonthlyValues}
            showAverage={showAverage}
            onToggleMonthlyValues={() =>
              setShowMonthlyValues((visible) => !visible)
            }
            onToggleAverage={() => setShowAverage((visible) => !visible)}
          />
        )}
      </div>

      {!loading && (
        <YearlyIncomeExpensesLegend
          totals={totals}
          averages={averages}
          showValues={showValues}
          visibility={seriesVisibility}
          onToggle={(key) =>
            setSeriesVisibility((visibility) => ({
              ...visibility,
              [key]: !visibility[key],
            }))
          }
        />
      )}

      {loading ? (
        <div className="mt-5 h-[340px] animate-pulse rounded-xl bg-border" />
      ) : visibleOverview.length === 0 ? (
        <div className="mt-5 flex h-[340px] items-center justify-center rounded-xl border border-dashed border-border bg-surface text-sm text-muted">
          Brak miesięcy do wyświetlenia dla wybranego roku.
        </div>
      ) : (
        <YearlyIncomeExpensesChartSvg
          chart={chart}
          visibleOverview={visibleOverview}
          averages={averages}
          showAverage={showAverage}
          showMonthlyValues={showMonthlyValues}
          showValues={showValues}
          seriesVisibility={seriesVisibility}
          activePoint={activePoint}
          setActivePoint={setActivePoint}
          activeTooltip={activeTooltip}
        />
      )}
    </section>
  );
};

export default YearlyIncomeAndExpensesChart;
