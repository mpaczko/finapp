import { useEffect, useMemo, useState } from "react";
import {
  CHART_HEIGHT,
  CHART_WIDTH,
  PADDING,
  type MonthlyOverview,
  series,
  type SeriesKey,
} from "../yearlyIncomeExpensesChartConfig";

export type ActivePoint = { seriesIndex: number; monthIndex: number } | null;

export type ChartData = {
  points: { x: number; y: number; value: number }[][];
  gridValues: { value: number; y: number }[];
  averageY: number[];
  averageLabelY: number[];
};

const MONTHLY_VALUES_VISIBILITY_STORAGE_KEY =
  "finapp.yearlyIncomeExpensesChartMonthlyValuesVisible";
const AVERAGE_VISIBILITY_STORAGE_KEY =
  "finapp.yearlyIncomeExpensesChartAverageVisible";
const SERIES_VISIBILITY_STORAGE_KEY =
  "finapp.yearlyIncomeExpensesChartSeriesVisibility";

const readBooleanSetting = (key: string, defaultValue: boolean) => {
  if (typeof window === "undefined") return defaultValue;

  try {
    const value = window.localStorage.getItem(key);
    return value === null ? defaultValue : value === "true";
  } catch {
    return defaultValue;
  }
};

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

const persistSetting = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Settings still work during the current session when storage is unavailable.
  }
};

export const useYearlyIncomeExpensesChart = (
  year: number,
  monthlyOverview: MonthlyOverview[],
) => {
  const [showMonthlyValues, setShowMonthlyValues] = useState(() =>
    readBooleanSetting(MONTHLY_VALUES_VISIBILITY_STORAGE_KEY, false),
  );
  const [showAverage, setShowAverage] = useState(() =>
    readBooleanSetting(AVERAGE_VISIBILITY_STORAGE_KEY, true),
  );
  const [seriesVisibility, setSeriesVisibility] = useState(
    getInitialSeriesVisibility,
  );
  const [activePoint, setActivePoint] = useState<ActivePoint>(null);

  useEffect(() => {
    persistSetting(
      MONTHLY_VALUES_VISIBILITY_STORAGE_KEY,
      String(showMonthlyValues),
    );
  }, [showMonthlyValues]);

  useEffect(() => {
    persistSetting(AVERAGE_VISIBILITY_STORAGE_KEY, String(showAverage));
  }, [showAverage]);

  useEffect(() => {
    persistSetting(
      SERIES_VISIBILITY_STORAGE_KEY,
      JSON.stringify(seriesVisibility),
    );
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
  const chart = useMemo<ChartData>(() => {
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
      averageLabelY[index] = Math.max(
        previousLabelY + minimumLabelGap,
        Math.min(value, maximumLabelY - remainingLabels * minimumLabelGap),
      );
      previousLabelY = averageLabelY[index];
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

  const activeTooltip = useMemo(() => {
    if (
      !activePoint ||
      !seriesVisibility[series[activePoint.seriesIndex].key]
    ) {
      return null;
    }

    const point = chart.points[activePoint.seriesIndex][activePoint.monthIndex];
    const visibleSeries = series
      .map((seriesItem) => ({
        ...seriesItem,
        value: visibleOverview[activePoint.monthIndex][seriesItem.key],
      }))
      .filter(({ key }) => seriesVisibility[key]);
    const tooltipWidth = 316;
    const tooltipHeight = 44 + visibleSeries.length * 24;
    const tooltipGap = 14;
    const x =
      CHART_WIDTH - PADDING.right - point.x - tooltipGap >= tooltipWidth
        ? point.x + tooltipGap
        : Math.max(PADDING.left, point.x - tooltipWidth - tooltipGap);
    const y =
      point.y - PADDING.top - tooltipGap >= tooltipHeight
        ? point.y - tooltipHeight - tooltipGap
        : Math.min(
            CHART_HEIGHT - PADDING.bottom - tooltipHeight,
            point.y + tooltipGap,
          );

    return {
      ...{ x, y, tooltipWidth, tooltipHeight, visibleSeries },
      monthIndex: activePoint.monthIndex,
    };
  }, [activePoint, chart.points, seriesVisibility, visibleOverview]);

  return {
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
  };
};
