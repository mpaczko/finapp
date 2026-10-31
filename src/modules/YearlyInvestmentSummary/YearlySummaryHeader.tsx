type YearlySummaryHeaderProps = {
  year: number;
  currentYear: number;
  onYearChange: (year: number) => void;
};

const YearlySummaryHeader = ({
  year,
  currentYear,
  onYearChange,
}: YearlySummaryHeaderProps) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="space-y-1">
      <p className="text-lg font-semibold text-foreground">
        Roczne podsumowanie finansów
      </p>
      <p className="max-w-lg text-sm text-muted">
        Podsumowanie roczne: inwestycje, podróże, ubrania/sprzęt sportowy oraz
        szacowany zwrot IP Box.
      </p>
    </div>

    <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-muted px-3 py-2">
      <span className="text-sm text-muted">Rok</span>
      <input
        type="number"
        min="2000"
        max="2100"
        step="1"
        value={year}
        onChange={(event) => {
          const nextYear = Number(event.target.value);
          onYearChange(Number.isNaN(nextYear) ? currentYear : nextYear);
        }}
        className="w-20 border-none bg-transparent text-right text-sm font-semibold text-foreground outline-none"
      />
    </div>
  </div>
);

export default YearlySummaryHeader;
