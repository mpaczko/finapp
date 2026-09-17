type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

const TableSkeleton = ({
  rows = 5,
  columns = 4,
  className = "",
}: TableSkeletonProps) => {
  return (
    <div
      className={`w-full overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm ${className}`}
    >
      <div className="grid w-full animate-pulse gap-0">
        <div className="grid gap-0 bg-slate-50">
          <div className="grid grid-cols-4 border-b border-slate-100">
            {Array.from({ length: columns }).map((_, index) => (
              <div key={`header-${index}`} className="h-11 px-4 py-3">
                <div className="h-2.5 w-2/3 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>

        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid grid-cols-4 border-b border-slate-100 last:border-b-0"
          >
            {Array.from({ length: columns }).map((__, colIndex) => (
              <div key={`cell-${rowIndex}-${colIndex}`} className="px-4 py-3">
                <div
                  className={`h-3.5 rounded bg-slate-200 ${
                    colIndex === columns - 1 ? "w-2/3 ml-auto" : "w-3/4"
                  }`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
