import { Plus, X } from "lucide-react";
import type { DragEvent } from "react";
import { categoryChartColors } from "../../lib/categoryColors";
import ComparisonCard from "./ComparisonCard";

type Comparison = { planned: number; actual: number };

type YearlyComparisonSlotsProps = {
  slots: (string | null)[];
  comparisonData: Record<string, Comparison>;
  categoryColors: Record<string, string>;
  loading: boolean;
  selectedCategory: string;
  onPlaceCategory: (slotIndex: number, category: string) => void;
  onClearSlot: (slotIndex: number) => void;
};

const YearlyComparisonSlots = ({
  slots,
  comparisonData,
  categoryColors,
  loading,
  selectedCategory,
  onPlaceCategory,
  onClearSlot,
}: YearlyComparisonSlotsProps) => (
  <>
    {slots.map((category, slotIndex) => {
      if (slotIndex > 0 && !slots[slotIndex - 1]) return null;

      const comparison = category ? comparisonData[category] : null;
      const dropHandlers = {
        onDragOver: (event: DragEvent<HTMLElement>) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        },
        onDrop: (event: DragEvent<HTMLElement>) => {
          event.preventDefault();
          onPlaceCategory(slotIndex, event.dataTransfer.getData("text/plain"));
        },
      };

      return (
        <div key={slotIndex} className="min-w-0" {...dropHandlers}>
          {category && comparison ? (
            <ComparisonCard
              title={`${category} — planowane vs zrealizowane`}
              planned={comparison.planned}
              actual={comparison.actual}
              loading={loading}
              baseColor={categoryColors[category] ?? categoryChartColors[0]}
              action={
                <button
                  type="button"
                  onClick={() => onClearSlot(slotIndex)}
                  className="rounded-lg p-1 text-muted transition hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`Usuń kategorię ${category} z porównania`}
                  title="Usuń z porównania"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              }
            />
          ) : (
            <button
              type="button"
              onClick={() => onPlaceCategory(slotIndex, selectedCategory)}
              className="flex min-h-[150px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-strong bg-surface-muted p-4 text-center text-sm font-medium text-muted transition hover:border-primary hover:bg-surface-subtle hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={`Dodaj kategorię do pola porównania ${slotIndex + 1}`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-current">
                <Plus size={20} aria-hidden="true" />
              </span>
              <span>Przeciągnij tutaj kategorię</span>
              <span className="text-xs font-normal">
                lub dodaj wybraną kategorię
              </span>
            </button>
          )}
        </div>
      );
    })}
  </>
);

export default YearlyComparisonSlots;
