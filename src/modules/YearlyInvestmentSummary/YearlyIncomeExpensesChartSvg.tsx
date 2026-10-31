import type { Dispatch, SetStateAction } from "react";
import {
  CHART_HEIGHT,
  CHART_WIDTH,
  formatChartValue,
  monthLabels,
  PADDING,
  type MonthlyOverview,
  type SeriesKey,
} from "./yearlyIncomeExpensesChartConfig";
import type {
  ActivePoint,
  ChartData,
} from "./hooks/useYearlyIncomeExpensesChart";
import YearlyIncomeExpensesSeries from "./YearlyIncomeExpensesSeries";
import YearlyIncomeExpensesTooltip from "./YearlyIncomeExpensesTooltip";

type YearlyIncomeExpensesChartSvgProps = {
  chart: ChartData;
  visibleOverview: MonthlyOverview[];
  averages: number[];
  showAverage: boolean;
  showMonthlyValues: boolean;
  showValues: boolean;
  seriesVisibility: Record<SeriesKey, boolean>;
  activePoint: ActivePoint;
  setActivePoint: Dispatch<SetStateAction<ActivePoint>>;
  activeTooltip: {
    x: number;
    y: number;
    tooltipWidth: number;
    tooltipHeight: number;
    monthIndex: number;
    visibleSeries: {
      key: string;
      label: string;
      color: string;
      value: number;
    }[];
  } | null;
};

const YearlyIncomeExpensesChartSvg = ({
  chart,
  visibleOverview,
  averages,
  showAverage,
  showMonthlyValues,
  showValues,
  seriesVisibility,
  activePoint,
  setActivePoint,
  activeTooltip,
}: YearlyIncomeExpensesChartSvgProps) => (
  <div className="mt-5 min-w-0 overflow-x-auto">
    <svg
      className="h-[340px] min-w-[620px] w-full"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      role="img"
      aria-label="Wykres miesięcznego przychodu oraz planowanych i rzeczywistych wydatków"
    >
      {chart.gridValues.map((gridLine) => (
        <g key={gridLine.value}>
          <line
            x1={PADDING.left}
            x2={CHART_WIDTH - PADDING.right}
            y1={gridLine.y}
            y2={gridLine.y}
            stroke="var(--app-border)"
            strokeDasharray="4 4"
          />
          {showMonthlyValues && (
            <text
              x={PADDING.left - 10}
              y={gridLine.y + 4}
              textAnchor="end"
              className="fill-muted text-[11px]"
            >
              {showValues
                ? `${Math.round(gridLine.value)} zł`
                : formatChartValue(gridLine.value, false)}
            </text>
          )}
        </g>
      ))}

      <YearlyIncomeExpensesSeries
        chart={chart}
        averages={averages}
        showAverage={showAverage}
        showMonthlyValues={showMonthlyValues}
        showValues={showValues}
        seriesVisibility={seriesVisibility}
        activePoint={activePoint}
        setActivePoint={setActivePoint}
      />

      {activeTooltip && (
        <YearlyIncomeExpensesTooltip
          tooltip={activeTooltip}
          showValues={showValues}
        />
      )}

      {visibleOverview.map((_, index) => (
        <text
          key={monthLabels[index]}
          x={chart.points[0][index].x}
          y={CHART_HEIGHT - 12}
          textAnchor="middle"
          className="fill-muted text-[11px]"
        >
          {monthLabels[index]}
        </text>
      ))}
    </svg>
  </div>
);

export default YearlyIncomeExpensesChartSvg;
