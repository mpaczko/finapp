import { useMemo } from "react";
import { LOADING_TEXT } from "../../../lib/loadingText";

type ComparisonCardProps = {
  title: string;
  planned: number | null;
  actual: number | null;
  loading: boolean;
  baseColor: string;
};

const ComparisonCard = ({
  title,
  planned,
  actual,
  loading,
  baseColor,
}: ComparisonCardProps) => {
  const difference = useMemo(
    () => (Number(planned || 0) - Number(actual || 0)).toFixed(2),
    [planned, actual],
  );

  return (
    <div className="flex h-full min-h-[150px] w-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: baseColor }}
        />
        <span className="text-sm font-medium leading-5 text-slate-500">
          {title}
        </span>
      </div>

      <div className="mt-auto space-y-2 pt-5">
        <div className="grid grid-cols-[90px_1fr] items-center text-sm text-slate-700">
          <span>Plan</span>
          <span className="text-right font-medium text-slate-900">
            {planned?.toFixed(2) ?? "0.00"} zł
          </span>
        </div>
        <div className="grid grid-cols-[90px_1fr] items-center text-sm text-slate-700">
          <span>Rzeczyw.</span>
          <span className="text-right font-medium text-slate-900">
            {loading ? LOADING_TEXT : `${actual?.toFixed(2) ?? "0.00"} zł`}
          </span>
        </div>
        <div className="grid grid-cols-[90px_1fr] items-center border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
          <span>Saldo</span>
          <span className="text-right">{difference} zł</span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonCard;
