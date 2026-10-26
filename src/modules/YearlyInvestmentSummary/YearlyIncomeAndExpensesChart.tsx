import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import {
  formatSummaryCurrency,
  maskCurrencyValue,
} from "../../lib/summaryVisibility";

type MonthlyOverview = {
  income: number;
  planned: number;
  actual: number;
  investments: number;
};

type YearlyIncomeAndExpensesChartProps = {
  year: number;
  monthlyOverview: MonthlyOverview[];
  loading: boolean;
  showValues: boolean;
};

type ActivePoint = { seriesIndex: number; monthIndex: number } | null;

const monthLabels = [
  "Sty",
  "Lut",
  "Mar",
  "Kwi",
  "Maj",
  "Cze",
  "Lip",
  "Sie",
  "Wrz",
  "Paź",
  "Lis",
  "Gru",
];

const CHART_WIDTH = 960;
const CHART_HEIGHT = 280;
const PADDING = { top: 36, right: 18, bottom: 42, left: 58 };
const MONTHLY_VALUES_VISIBILITY_STORAGE_KEY =
  "finapp.yearlyIncomeExpensesChartMonthlyValuesVisible";
const AVERAGE_VISIBILITY_STORAGE_KEY =
  "finapp.yearlyIncomeExpensesChartAverageVisible";
const SERIES_VISIBILITY_STORAGE_KEY =
  "finapp.yearlyIncomeExpensesChartSeriesVisibility";

const series = [
  {
    key: "income",
    label: "Przychód",
    color: "var(--app-chart-income)",
    averageColor:
      "color-mix(in srgb, var(--app-chart-income) 78%, var(--app-foreground))",
    dashArray: undefined,
  },
  {
    key: "planned",
    label: "Planowane wydatki",
    color: "var(--app-chart-planned)",
    averageColor:
      "color-mix(in srgb, var(--app-chart-planned) 78%, var(--app-foreground))",
    dashArray: "8 5",
  },
  {
    key: "actual",
    label: "Rzeczywiste wydatki",
    color: "var(--app-chart-actual)",
    averageColor:
      "color-mix(in srgb, var(--app-chart-actual) 78%, var(--app-foreground))",
    dashArray: "2 4",
  },
  {
    key: "investments",
    label: "Inwestycje",
    color: "var(--app-chart-investments)",
    averageColor:
      "color-mix(in srgb, var(--app-chart-investments) 78%, var(--app-foreground))",
    dashArray: "10 3 2 3",
  },
] as const;

type SeriesKey = (typeof series)[number]["key"];

const getInitialSeriesVisibility = (): Record<SeriesKey, boolean> => {
  const defaultVisibility = Object.fromEntries(
    series.map(({ key }) => [key, true]),
  ) as Record<SeriesKey, boolean>;

  if (typeof window === "undefined") return defaultVisibility;

  try {
    const savedValue = window.localStorage.getItem(
      SERIES_VISIBILITY_STORAGE_KEY,
    );
    const parsed = savedValue ? JSON.parse(savedValue) : null;

    if (!parsed || typeof parsed !== "object") return defaultVisibility;

    return series.reduce(
      (visibility, { key }) => ({
        ...visibility,
        [key]: typeof parsed[key] === "boolean" ? parsed[key] : true,
      }),
      defaultVisibility,
    );
  } catch {
    return defaultVisibility;
  }
};

const formatValue = (value: number, showValues: boolean) =>
  showValues ? formatSummaryCurrency(value, true) : maskCurrencyValue(value);

const YearlyIncomeAndExpensesChart = ({
  year,
  monthlyOverview,
  loading,
  showValues,
}: YearlyIncomeAndExpensesChartProps) => {
  const [showMonthlyValues, setShowMonthlyValues] = useState(() => {
    if (typeof window === "undefined") return false;

    try {
      return (
        window.localStorage.getItem(MONTHLY_VALUES_VISIBILITY_STORAGE_KEY) ===
        "true"
      );
    } catch {
      return false;
    }
  });
  const [showAverage, setShowAverage] = useState(() => {
    if (typeof window === "undefined") return true;

    try {
      const savedValue = window.localStorage.getItem(
        AVERAGE_VISIBILITY_STORAGE_KEY,
      );
      return savedValue === null || savedValue === "true";
    } catch {
      return true;
    }
  });
  const [seriesVisibility, setSeriesVisibility] = useState(
    getInitialSeriesVisibility,
  );
  const [activePoint, setActivePoint] = useState<ActivePoint>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        MONTHLY_VALUES_VISIBILITY_STORAGE_KEY,
        String(showMonthlyValues),
      );
    } catch {
      // The toggle still works for the current session when storage is unavailable.
    }
  }, [showMonthlyValues]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        AVERAGE_VISIBILITY_STORAGE_KEY,
        String(showAverage),
      );
    } catch {
      // The toggle still works for the current session when storage is unavailable.
    }
  }, [showAverage]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SERIES_VISIBILITY_STORAGE_KEY,
        JSON.stringify(seriesVisibility),
      );
    } catch {
      // Visibility settings still work during the current session when storage is unavailable.
    }
  }, [seriesVisibility]);

  const visibleMonthCount = useMemo(() => {
    const currentDate = new Date();

    if (year < currentDate.getFullYear()) return 12;
    if (year > currentDate.getFullYear()) return 0;

    return currentDate.getMonth() + 1;
  }, [year]);

  const visibleOverview = monthlyOverview.slice(0, visibleMonthCount);
  const totals = useMemo(
    () =>
      series.map(({ key }) =>
        visibleOverview.reduce((sum, month) => sum + month[key], 0),
      ),
    [visibleOverview],
  );
  const averages = useMemo(
    () =>
      totals.map((total) =>
        visibleOverview.length ? total / visibleOverview.length : 0,
      ),
    [totals, visibleOverview.length],
  );
  const chart = useMemo(() => {
    const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
    const maxValue = Math.max(
      ...visibleOverview.flatMap((month) =>
        series.map(({ key }) => month[key]),
      ),
      0,
    );
    const scaleMax = maxValue === 0 ? 1 : Math.ceil(maxValue / 100) * 100;
    const x = (index: number) =>
      PADDING.left +
      (visibleOverview.length > 1
        ? (index * innerWidth) / (visibleOverview.length - 1)
        : innerWidth / 2);
    const y = (value: number) =>
      PADDING.top + innerHeight - (value / scaleMax) * innerHeight;

    const averageY = averages.map((average) => y(average));
    const minimumLabelGap = 22;
    const minimumLabelY = PADDING.top + 11;
    const maximumLabelY = CHART_HEIGHT - PADDING.bottom - 11;
    const averageLabelY = Array.from({ length: series.length }, () => 0);
    const sortedAverages = averageY
      .map((value, index) => ({ value, index }))
      .sort((first, second) => first.value - second.value);
    let previousLabelY = minimumLabelY - minimumLabelGap;

    sortedAverages.forEach(({ value, index }, position) => {
      const remainingLabels = sortedAverages.length - position - 1;
      const labelY = Math.max(
        previousLabelY + minimumLabelGap,
        Math.min(value, maximumLabelY - remainingLabels * minimumLabelGap),
      );

      averageLabelY[index] = labelY;
      previousLabelY = labelY;
    });

    return {
      points: series.map(({ key }) =>
        visibleOverview.map((month, index) => ({
          x: x(index),
          y: y(month[key]),
          value: month[key],
        })),
      ),
      gridValues: [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
        value: scaleMax * ratio,
        y: PADDING.top + innerHeight * (1 - ratio),
      })),
      averageY,
      averageLabelY,
    };
  }, [averages, visibleOverview]);
  const activeTooltip =
    activePoint && seriesVisibility[series[activePoint.seriesIndex].key]
      ? (() => {
          const point =
            chart.points[activePoint.seriesIndex][activePoint.monthIndex];
          const visibleSeries = series
            .map((seriesItem) => ({
              ...seriesItem,
              value: visibleOverview[activePoint.monthIndex][seriesItem.key],
            }))
            .filter(({ key }) => seriesVisibility[key]);
          const tooltipWidth = 316;
          const tooltipHeight = 44 + visibleSeries.length * 24;
          const tooltipGap = 14;
          const spaceOnRight =
            CHART_WIDTH - PADDING.right - point.x - tooltipGap;
          const spaceAbove = point.y - PADDING.top - tooltipGap;
          const canPlaceRight = spaceOnRight >= tooltipWidth;
          const canPlaceAbove = spaceAbove >= tooltipHeight;
          const x = canPlaceRight
            ? point.x + tooltipGap
            : Math.max(PADDING.left, point.x - tooltipWidth - tooltipGap);
          const y = canPlaceAbove
            ? point.y - tooltipHeight - tooltipGap
            : Math.min(
                CHART_HEIGHT - PADDING.bottom - tooltipHeight,
                point.y + tooltipGap,
              );

          return {
            x,
            y,
            tooltipWidth,
            tooltipHeight,
            visibleSeries,
          };
        })()
      : null;

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
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowMonthlyValues((visible) => !visible)}
              className="inline-flex w-fit items-center gap-1 rounded-xl border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground-soft transition hover:bg-surface-subtle"
              aria-pressed={showMonthlyValues}
              aria-label={
                showMonthlyValues
                  ? "Ukryj kwoty na wykresie"
                  : "Pokaż kwoty na wykresie"
              }
            >
              {showMonthlyValues ? (
                <EyeOff size={14} aria-hidden="true" />
              ) : (
                <Eye size={14} aria-hidden="true" />
              )}
              {showMonthlyValues ? "Ukryj kwoty" : "Pokaż kwoty"}
            </button>
            <button
              type="button"
              onClick={() => setShowAverage((visible) => !visible)}
              className="rounded-xl border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground-soft transition hover:bg-surface-subtle"
              aria-pressed={showAverage}
            >
              {showAverage ? "Ukryj średnie" : "Pokaż średnie"}
            </button>
          </div>
        )}
      </div>

      {!loading && (
        <div
          className="mt-4 flex flex-wrap gap-x-4 gap-y-2"
          aria-label="Legenda wykresu"
        >
          {series.map(({ key, label, color }, index) => (
            <button
              key={label}
              type="button"
              onClick={() =>
                setSeriesVisibility((visibility) => ({
                  ...visibility,
                  [key]: !visibility[key],
                }))
              }
              className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-left text-xs transition hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary ${
                seriesVisibility[key] ? "text-muted" : "opacity-45"
              }`}
              aria-pressed={seriesVisibility[key]}
              aria-label={`${seriesVisibility[key] ? "Ukryj" : "Pokaż"} serię: ${label}`}
              title={`${seriesVisibility[key] ? "Ukryj" : "Pokaż"}: ${label}`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  seriesVisibility[key] ? "" : "ring-1 ring-current"
                }`}
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span className={seriesVisibility[key] ? "" : "line-through"}>
                {label}:
              </span>
              <span className="font-semibold text-foreground-soft">
                {formatValue(totals[index], showValues)}
              </span>
              <span className="text-muted">
                śr. {formatValue(averages[index], showValues)}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="mt-5 h-[280px] animate-pulse rounded-xl bg-border" />
      ) : visibleOverview.length === 0 ? (
        <div className="mt-5 flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-surface text-sm text-muted">
          Brak miesięcy do wyświetlenia dla wybranego roku.
        </div>
      ) : (
        <div className="mt-5 min-w-0 overflow-x-auto">
          <svg
            className="h-[280px] min-w-[620px] w-full"
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
                      : maskCurrencyValue(gridLine.value)}
                  </text>
                )}
              </g>
            ))}

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
                      <title>{`Średnia miesięczna — ${label}: ${formatValue(averages[index], showValues)}`}</title>
                    </line>
                  ),
              )}

            {series.map(({ key, label, color, dashArray }, seriesIndex) => {
              if (!seriesVisibility[key]) return null;

              const points = chart.points[seriesIndex];
              const path = points
                .map(
                  (point, index) =>
                    `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
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
                          {formatValue(point.value, showValues)}
                        </text>
                      )}
                      <g
                        className="cursor-pointer"
                        onPointerEnter={() =>
                          setActivePoint({
                            seriesIndex,
                            monthIndex: index,
                          })
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
                          <title>{`${label}, ${monthLabels[index]}: ${formatValue(point.value, showValues)}`}</title>
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
                        {`Śr. ${formatValue(averages[index], showValues)}`}
                      </text>
                      <title>{`Średnia miesięczna — ${label}: ${formatValue(averages[index], showValues)}`}</title>
                    </g>
                  ),
              )}

            {activeTooltip && (
              <g pointerEvents="none">
                <rect
                  x={activeTooltip.x}
                  y={activeTooltip.y}
                  width={activeTooltip.tooltipWidth}
                  height={activeTooltip.tooltipHeight}
                  rx="8"
                  fill="var(--app-surface)"
                  stroke="var(--app-border-strong)"
                  strokeWidth="1.5"
                  style={{
                    filter: "drop-shadow(0 8px 16px rgb(15 23 42 / 20%))",
                  }}
                />
                <text
                  x={activeTooltip.x + 14}
                  y={activeTooltip.y + 22}
                  className="fill-foreground-soft text-[11px] font-semibold"
                >
                  {`${monthLabels[activePoint?.monthIndex ?? 0]} — podsumowanie miesiąca`}
                </text>
                <line
                  x1={activeTooltip.x + 14}
                  x2={activeTooltip.x + activeTooltip.tooltipWidth - 14}
                  y1={activeTooltip.y + 31}
                  y2={activeTooltip.y + 31}
                  stroke="var(--app-border)"
                />
                {activeTooltip.visibleSeries.map(
                  ({ key, label, color, value }, index) => (
                    <g key={key}>
                      <circle
                        cx={activeTooltip.x + 18}
                        cy={activeTooltip.y + 49 + index * 24}
                        r="4"
                        fill={color}
                      />
                      <text
                        x={activeTooltip.x + 29}
                        y={activeTooltip.y + 53 + index * 24}
                        className="fill-muted text-[11px] font-medium"
                      >
                        {label}
                      </text>
                      <text
                        x={activeTooltip.x + activeTooltip.tooltipWidth - 14}
                        y={activeTooltip.y + 53 + index * 24}
                        textAnchor="end"
                        className="fill-foreground text-[12px] font-bold"
                      >
                        {formatValue(value, showValues)}
                      </text>
                    </g>
                  ),
                )}
              </g>
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
      )}
    </section>
  );
};

export default YearlyIncomeAndExpensesChart;
