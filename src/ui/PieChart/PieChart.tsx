type PieDatum = {
  label: string;
  value: number;
  color: string;
};

type PieChartProps = {
  title: string;
  data: PieDatum[];
  totalLabel?: string;
  className?: string;
};

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    `M ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    `L ${x} ${y}`,
    "Z",
  ].join(" ");
};

export default function PieChart({
  title,
  data,
  totalLabel,
  className,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const sliceData = [] as Array<{
    label: string;
    value: number;
    color: string;
    path: string;
    percentage: number;
  }>;

  let currentAngle = 0;

  data.forEach((item) => {
    if (item.value <= 0) return;
    const angle = (item.value / total) * 360;
    const path = describeArc(110, 110, 90, currentAngle, currentAngle + angle);
    sliceData.push({
      label: item.label,
      value: item.value,
      color: item.color,
      path,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    });
    currentAngle += angle;
  });

  return (
    <div
      className={`rounded-3xl border border-gray-200 bg-white p-4 shadow-sm ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {totalLabel ? (
          <span className="text-xs text-gray-500">{totalLabel}</span>
        ) : null}
      </div>

      {total === 0 ? (
        <div className="flex h-[260px] min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
          Brak danych do wyświetlenia
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex items-center justify-center">
            <svg width={220} height={220} viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="90" fill="#f8fafc" />
              {sliceData.map((slice) => (
                <path key={slice.label} d={slice.path} fill={slice.color} />
              ))}
              <circle cx="110" cy="110" r="50" fill="#ffffff" />
              <text
                x="110"
                y="98"
                textAnchor="middle"
                className="text-sm font-semibold fill-slate-900"
              >
                {total.toFixed(0)} zł
              </text>
              <text
                x="110"
                y="118"
                textAnchor="middle"
                className="text-xs fill-slate-500"
              >
                suma
              </text>
            </svg>
          </div>

          <div className="grid gap-2 w-full text-sm">
            {sliceData.map((slice) => (
              <div
                key={slice.label}
                className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="font-medium text-slate-900">
                    {slice.label}
                  </span>
                </div>
                <div className="text-right text-slate-700">
                  <div>{slice.value.toFixed(2)} zł</div>
                  <div className="text-xs text-slate-500">
                    {slice.percentage.toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
