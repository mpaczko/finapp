import { formatSummaryCurrency } from "../../lib/summaryVisibility";

type YearlyStatCardProps = {
  title: string;
  value: number;
  loading: boolean;
  showValues: boolean;
};

const YearlyStatCard = ({
  title,
  value,
  loading,
  showValues,
}: YearlyStatCardProps) => (
  <div className="flex min-h-[150px] min-w-0 flex-col rounded-2xl border border-border bg-surface-muted p-4">
    <p className="text-sm font-medium text-muted">{title}</p>
    <div className="mt-auto">
      {loading ? (
        <div className="h-8 w-32 animate-pulse rounded bg-border" />
      ) : (
        <p className="text-2xl font-bold text-foreground">
          {formatSummaryCurrency(value, showValues)}
        </p>
      )}
    </div>
  </div>
);

export default YearlyStatCard;
