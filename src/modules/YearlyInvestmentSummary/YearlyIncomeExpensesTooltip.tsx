import {
  formatChartValue,
  monthLabels,
} from "./yearlyIncomeExpensesChartConfig";

type YearlyIncomeExpensesTooltipProps = {
  tooltip: {
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
  };
  showValues: boolean;
};

const YearlyIncomeExpensesTooltip = ({
  tooltip,
  showValues,
}: YearlyIncomeExpensesTooltipProps) => (
  <g pointerEvents="none">
    <rect
      x={tooltip.x}
      y={tooltip.y}
      width={tooltip.tooltipWidth}
      height={tooltip.tooltipHeight}
      rx="8"
      fill="var(--app-surface)"
      stroke="var(--app-border-strong)"
      strokeWidth="1.5"
      style={{ filter: "drop-shadow(0 8px 16px rgb(15 23 42 / 20%))" }}
    />
    <text
      x={tooltip.x + 14}
      y={tooltip.y + 22}
      className="fill-foreground-soft text-[11px] font-semibold"
    >
      {`${monthLabels[tooltip.monthIndex]} — podsumowanie miesiąca`}
    </text>
    <line
      x1={tooltip.x + 14}
      x2={tooltip.x + tooltip.tooltipWidth - 14}
      y1={tooltip.y + 31}
      y2={tooltip.y + 31}
      stroke="var(--app-border)"
    />
    {tooltip.visibleSeries.map(({ key, label, color, value }, index) => (
      <g key={key}>
        <circle
          cx={tooltip.x + 18}
          cy={tooltip.y + 49 + index * 24}
          r="4"
          fill={color}
        />
        <text
          x={tooltip.x + 29}
          y={tooltip.y + 53 + index * 24}
          className="fill-muted text-[11px] font-medium"
        >
          {label}
        </text>
        <text
          x={tooltip.x + tooltip.tooltipWidth - 14}
          y={tooltip.y + 53 + index * 24}
          textAnchor="end"
          className="fill-foreground text-[12px] font-bold"
        >
          {formatChartValue(value, showValues)}
        </text>
      </g>
    ))}
  </g>
);

export default YearlyIncomeExpensesTooltip;
