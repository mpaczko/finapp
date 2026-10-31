import type { Dispatch, SetStateAction } from "react";
import {
  CHART_WIDTH,
  formatChartValue,
  monthLabels,
  PADDING,
  series,
  type SeriesKey,
} from "./yearlyIncomeExpensesChartConfig";
import type {
  ActivePoint,
  ChartData,
} from "./hooks/useYearlyIncomeExpensesChart";

type YearlyIncomeExpensesSeriesProps = {
  chart: ChartData;
  averages: number[];
  showAverage: boolean;
  showMonthlyValues: boolean;
  showValues: boolean;
  seriesVisibility: Record<SeriesKey, boolean>;
  activePoint: ActivePoint;
  setActivePoint: Dispatch<SetStateAction<ActivePoint>>;
};

const YearlyIncomeExpensesSeries = ({
  chart,
  averages,
  showAverage,
  showMonthlyValues,
  showValues,
  seriesVisibility,
  activePoint,
  setActivePoint,
}: YearlyIncomeExpensesSeriesProps) => (
  <>
    {showAverage &&
      series.map(
        ({ key, label, averageColor }, index) =>
          seriesVisibility[key] && (
            <line
              key={`${key}-average`}
              x1={PADDING.left}
              x2={CHART_WIDTH - PADDING.right}
              y1={chart.averageY[index]}
              y2={chart.averageY[index]}
              stroke={averageColor}
              strokeWidth="2"
              strokeDasharray="5 5"
              opacity="0.7"
            >
              <title>{`Średnia miesięczna — ${label}: ${formatChartValue(averages[index], showValues)}`}</title>
            </line>
          ),
      )}

    {series.map(({ key, label, color, dashArray }, seriesIndex) => {
      if (!seriesVisibility[key]) return null;

      const points = chart.points[seriesIndex];
      const path = points
        .map(
          (point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
        )
        .join(" ");

      return (
        <g key={key}>
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dashArray}
          />
          {points.map((point, index) => (
            <g key={`${key}-${monthLabels[index]}`}>
              {showMonthlyValues && (
                <text
                  x={point.x}
                  y={Math.max(PADDING.top + 10, point.y - 8)}
                  textAnchor="middle"
                  className="text-[10px] font-bold"
                  fill={color}
                  paintOrder="stroke"
                  stroke="var(--app-surface)"
                  strokeWidth="5"
                  strokeLinejoin="round"
                  pointerEvents="none"
                >
                  {formatChartValue(point.value, showValues)}
                </text>
              )}
              <g
                className="cursor-pointer"
                onPointerEnter={() =>
                  setActivePoint({ seriesIndex, monthIndex: index })
                }
                onPointerLeave={() => setActivePoint(null)}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={
                    activePoint?.seriesIndex === seriesIndex &&
                    activePoint.monthIndex === index
                      ? "7"
                      : "4.5"
                  }
                  fill="var(--app-surface)"
                  stroke={color}
                  strokeWidth="3"
                >
                  <title>{`${label}, ${monthLabels[index]}: ${formatChartValue(point.value, showValues)}`}</title>
                </circle>
              </g>
            </g>
          ))}
        </g>
      );
    })}

    {showAverage &&
      series.map(
        ({ key, label, averageColor }, index) =>
          seriesVisibility[key] && (
            <g key={`${key}-average-label`}>
              <line
                x1={CHART_WIDTH - PADDING.right - 4}
                x2={CHART_WIDTH - PADDING.right - 4}
                y1={chart.averageY[index]}
                y2={chart.averageLabelY[index]}
                stroke={averageColor}
                strokeWidth="2"
                opacity="0.85"
              />
              <text
                x={CHART_WIDTH - PADDING.right}
                y={chart.averageLabelY[index] + 4}
                textAnchor="end"
                className="text-[11px] font-bold"
                fill={averageColor}
                paintOrder="stroke"
                stroke="var(--app-surface)"
                strokeWidth="5"
                strokeLinejoin="round"
              >
                {`Śr. ${formatChartValue(averages[index], showValues)}`}
              </text>
              <title>{`Średnia miesięczna — ${label}: ${formatChartValue(averages[index], showValues)}`}</title>
            </g>
          ),
      )}
  </>
);

export default YearlyIncomeExpensesSeries;
