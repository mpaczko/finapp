import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import type { Expense } from "../../lib/expensesApi";
import { formatSummaryCurrency } from "../../lib/summaryVisibility";

type YearlyCategoryExpensesChartProps = {
  category: string;
  color: string;
  year: number;
  expenses: Expense[];
  loading: boolean;
  showValues: boolean;
};

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
const CHART_HEIGHT = 260;
const PADDING = { top: 32, right: 18, bottom: 42, left: 58 };
const MONTHLY_VALUES_VISIBILITY_STORAGE_KEY =
  "finapp.yearlyChartMonthlyValuesVisible";
const AVERAGE_VISIBILITY_STORAGE_KEY = "finapp.yearlyChartAverageVisible";

const getMonthIndex = (date: string) => Number(date.slice(5, 7)) - 1;

const YearlyCategoryExpensesChart = ({
  category,
  color,
  year,
  expenses,
  loading,
  showValues,
}: YearlyCategoryExpensesChartProps) => {
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
  const values = useMemo(() => {
    const monthlyValues = Array.from({ length: 12 }, () => 0);

    expenses.forEach((expense) => {
      if (expense.category !== category) return;

      const monthIndex = getMonthIndex(expense.date);
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyValues[monthIndex] += Number(expense.cost);
      }
    });

    return monthlyValues;
  }, [category, expenses]);

  const visibleMonthCount = useMemo(() => {
    const currentDate = new Date();

    if (year < currentDate.getFullYear()) {
      return 12;
    }

    if (year > currentDate.getFullYear()) return 0;

    return currentDate.getMonth() + 1;
  }, [year]);

  const visibleValues = values.slice(0, visibleMonthCount);
  const total = visibleValues.reduce((sum, value) => sum + value, 0);
  const average = visibleValues.length ? total / visibleValues.length : 0;
  const chart = useMemo(() => {
    const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
    const maxValue = Math.max(...visibleValues, 0);
    const scaleMax = maxValue === 0 ? 1 : Math.ceil(maxValue / 100) * 100;
    const x = (index: number) =>
      PADDING.left +
      (visibleValues.length > 1
        ? (index * innerWidth) / (visibleValues.length - 1)
        : innerWidth / 2);
    const y = (value: number) =>
      PADDING.top + innerHeight - (value / scaleMax) * innerHeight;
    const points = visibleValues.map((value, index) => ({
      x: x(index),
      y: y(value),
      value,
    }));

    return {
      innerHeight,
      points,
      scaleMax,
      averageY: y(average),
      path: points
        .map(
          (point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
        )
        .join(" "),
      gridValues: [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
        value: scaleMax * ratio,
        y: PADDING.top + innerHeight * (1 - ratio),
      })),
    };
  }, [average, visibleValues]);

  return (
    <section className="mt-4 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Wydatki miesięczne — {category || "wybierz kategorię"}
          </h3>
          <p className="text-xs text-slate-500">
            Suma wydatków w poszczególnych miesiącach.
          </p>
        </div>
        {!loading && category && (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {formatSummaryCurrency(total, showValues)}
            </p>
            <button
              type="button"
              onClick={() => setShowMonthlyValues((visible) => !visible)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
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
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              aria-pressed={showAverage}
            >
              {showAverage ? "Ukryj średnią" : "Pokaż średnią"}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-5 h-[260px] animate-pulse rounded-xl bg-slate-200" />
      ) : !category ? (
        <div className="mt-5 flex h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
          Brak kategorii do wyświetlenia.
        </div>
      ) : (
        <div className="mt-5 min-w-0 overflow-x-auto">
          <svg
            className="h-[260px] min-w-[620px] w-full"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            role="img"
            aria-label={`Wykres wydatków miesięcznych dla kategorii ${category}`}
          >
            {chart.gridValues.map((gridLine) => (
              <g key={gridLine.value}>
                <line
                  x1={PADDING.left}
                  x2={CHART_WIDTH - PADDING.right}
                  y1={gridLine.y}
                  y2={gridLine.y}
                  stroke="#cbd5e1"
                  strokeDasharray="4 4"
                />
                <text
                  x={PADDING.left - 10}
                  y={gridLine.y + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[11px]"
                >
                  {showValues ? `${Math.round(gridLine.value)} zł` : "•••"}
                </text>
              </g>
            ))}

            <path
              d={chart.path}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {showAverage && (
              <g>
                <line
                  x1={PADDING.left}
                  x2={CHART_WIDTH - PADDING.right}
                  y1={chart.averageY}
                  y2={chart.averageY}
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeDasharray="7 5"
                />
                <text
                  x={CHART_WIDTH - PADDING.right}
                  y={Math.max(PADDING.top + 12, chart.averageY - 7)}
                  textAnchor="end"
                  className="fill-blue-600 text-[11px] font-semibold"
                >
                  {`Średnia: ${formatSummaryCurrency(average, showValues)}`}
                </text>
              </g>
            )}

            {chart.points.map((point, index) => (
              <g key={monthLabels[index]}>
                {showMonthlyValues && showValues && (
                  <text
                    x={point.x}
                    y={Math.max(PADDING.top - 8, point.y - 12)}
                    textAnchor="middle"
                    className="fill-slate-700 text-[11px] font-medium"
                  >
                    {formatSummaryCurrency(point.value, true)}
                  </text>
                )}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#fff"
                  stroke={color}
                  strokeWidth="3"
                >
                  <title>{`${monthLabels[index]}: ${formatSummaryCurrency(point.value, showValues)}`}</title>
                </circle>
                <text
                  x={point.x}
                  y={CHART_HEIGHT - 12}
                  textAnchor="middle"
                  className="fill-slate-500 text-[11px]"
                >
                  {monthLabels[index]}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </section>
  );
};

export default YearlyCategoryExpensesChart;
