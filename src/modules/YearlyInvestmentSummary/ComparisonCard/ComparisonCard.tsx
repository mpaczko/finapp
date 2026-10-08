import { useMemo } from "react";
import { useSummaryVisibility } from "../../../hooks/useSummaryVisibility";
import { formatSummaryCurrency } from "../../../lib/summaryVisibility";

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
  const [showValues] = useSummaryVisibility();

  const difference = useMemo(
    () => (Number(planned || 0) - Number(actual || 0)).toFixed(2),
    [planned, actual],
  );

  return (
    <div className="flex h-full min-h-[150px] w-full flex-col rounded-2xl border border-border bg-surface-muted p-4">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: baseColor }}
          />
          <span className="text-sm font-medium leading-5 text-muted">
            {title}
          </span>
        </div>
      </div>

      <div className="mt-auto space-y-2 pt-5">
        <div className="grid grid-cols-[90px_1fr] items-center text-sm text-foreground-soft">
          <span>Plan</span>
          <span className="text-right font-medium text-foreground">
            {formatSummaryCurrency(planned ?? 0, showValues)}
          </span>
        </div>
        <div className="grid grid-cols-[90px_1fr] items-center text-sm text-foreground-soft">
          <span>Rzeczyw.</span>
          {loading ? (
            <div className="h-5 w-24 animate-pulse justify-self-end rounded bg-border" />
          ) : (
            <span className="text-right font-medium text-foreground">
              {formatSummaryCurrency(actual ?? 0, showValues)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-[90px_1fr] items-center border-t border-border pt-2 text-sm font-semibold text-foreground">
          <span>Saldo</span>
          <span className="text-right">
            {formatSummaryCurrency(difference, showValues)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonCard;
