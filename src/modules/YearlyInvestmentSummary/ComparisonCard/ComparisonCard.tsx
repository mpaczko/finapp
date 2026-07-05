type ComparisonCardProps = {
  title: string;
  planned: number | null;
  actual: number | null;
  loading: boolean;
};

const ComparisonCard = ({
  title,
  planned,
  actual,
  loading,
}: ComparisonCardProps) => {
  const difference = (Number(planned || 0) - Number(actual || 0)).toFixed(2);

  return (
    <div className="flex h-full min-h-[150px] flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium leading-5 text-slate-500">{title}</p>

      <div className="mt-auto space-y-2 pt-5">
        <div className="grid grid-cols-[90px_1fr] items-center">
          <span className="text-sm text-slate-700">Plan</span>

          <span className="text-right text-sm font-medium text-slate-900">
            {planned?.toFixed(2) ?? "0.00"} zł
          </span>
        </div>

        <div className="grid grid-cols-[90px_1fr] items-center">
          <span className="text-sm text-slate-700">Rzeczyw.</span>

          <span className="text-right text-sm font-medium text-slate-900">
            {loading ? "Ładowanie…" : `${actual?.toFixed(2) ?? "0.00"} zł`}
          </span>
        </div>

        <div className="grid grid-cols-[90px_1fr] items-center border-t border-slate-200 pt-2">
          <span className="text-sm font-semibold text-slate-900">Saldo</span>

          <span className="text-right text-sm font-semibold text-slate-900">
            {difference} zł
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonCard;
