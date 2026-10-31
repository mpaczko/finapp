import { Pencil } from "lucide-react";
import type { Budget } from "../../lib/budgetsApi";
import { formatSummaryCurrency } from "../../lib/summaryVisibility";

type YearlyIpBoxCardProps = {
  summaryValue?: number;
  loading: boolean;
  showValues: boolean;
  selectedBudget?: Budget;
  selectedMonthBelongsToYear: boolean | undefined;
  selectedMonthIpBox: number;
  editing: boolean;
  inputValue: string;
  isSaving: boolean;
  onStartEditing: () => void;
  onInputChange: (value: string) => void;
  onCancelEditing: () => void;
  onSave: () => void;
};

const YearlyIpBoxCard = ({
  summaryValue,
  loading,
  showValues,
  selectedBudget,
  selectedMonthBelongsToYear,
  selectedMonthIpBox,
  editing,
  inputValue,
  isSaving,
  onStartEditing,
  onInputChange,
  onCancelEditing,
  onSave,
}: YearlyIpBoxCardProps) => (
  <div className="flex min-h-[150px] min-w-0 flex-col gap-2 rounded-2xl border border-border bg-surface-muted p-4">
    <p className="text-sm font-medium text-muted">
      IP Box — szacowany zwrot za dany rok dotychczas
    </p>
    <div className="mt-auto">
      {loading || summaryValue == null ? (
        <div className="h-8 w-32 animate-pulse rounded bg-border" />
      ) : (
        <p className="text-2xl font-bold text-foreground">
          {formatSummaryCurrency(summaryValue, showValues)}
        </p>
      )}
    </div>

    {selectedBudget && selectedMonthBelongsToYear && (
      <div className="mt-2 border-t border-border pt-2">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted">
          <span>Kwota dla {selectedBudget.month}</span>
          {!editing && (
            <button
              type="button"
              onClick={onStartEditing}
              className="rounded p-1 text-muted transition hover:bg-border hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Edytuj kwotę IP Box dla wybranego miesiąca"
              title="Edytuj kwotę IP Box"
            >
              <Pencil size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        {editing ? (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              autoFocus
              value={inputValue}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSave();
                if (event.key === "Escape") onCancelEditing();
              }}
              className="min-w-0 flex-1 rounded-lg border border-border-strong bg-surface px-2 py-1 text-right text-sm font-semibold text-foreground outline-none focus:border-border-strong focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              disabled={isSaving}
              onClick={onSave}
              className="rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Zapisz
            </button>
          </div>
        ) : (
          <p className="mt-1 text-sm font-semibold text-foreground-soft">
            {formatSummaryCurrency(selectedMonthIpBox, showValues)}
          </p>
        )}
      </div>
    )}
  </div>
);

export default YearlyIpBoxCard;
