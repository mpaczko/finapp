import type { Budget } from "../../lib/budgetsApi";
import type { YearlySummary } from "../../lib/summaryApi";
import ComparisonCard from "./ComparisonCard";
import YearlyComparisonSlots from "./YearlyComparisonSlots";
import YearlyIpBoxCard from "./YearlyIpBoxCard";
import YearlyStatCard from "./YearlyStatCard";

type Comparison = { planned: number; actual: number };

type YearlySummaryCardsProps = {
  summary?: YearlySummary;
  loading: boolean;
  showValues: boolean;
  selectedBudget?: Budget;
  selectedMonthBelongsToYear: boolean | undefined;
  selectedMonthIpBox: number;
  editingIpBox: boolean;
  ipBoxInputValue: string;
  isSavingIpBox: boolean;
  onStartEditingIpBox: () => void;
  onIpBoxInputChange: (value: string) => void;
  onCancelEditingIpBox: () => void;
  onSaveIpBox: () => void;
  comparisonSlots: (string | null)[];
  comparisonData: Record<string, Comparison>;
  categoryColors: Record<string, string>;
  loadingComparisons: boolean;
  onPlaceCategory: (slotIndex: number, category: string) => void;
  onClearComparisonSlot: (slotIndex: number) => void;
  selectedCategory: string;
};

const YearlySummaryCards = ({
  summary,
  loading,
  showValues,
  selectedBudget,
  selectedMonthBelongsToYear,
  selectedMonthIpBox,
  editingIpBox,
  ipBoxInputValue,
  isSavingIpBox,
  onStartEditingIpBox,
  onIpBoxInputChange,
  onCancelEditingIpBox,
  onSaveIpBox,
  comparisonSlots,
  comparisonData,
  categoryColors,
  loadingComparisons,
  onPlaceCategory,
  onClearComparisonSlot,
  selectedCategory,
}: YearlySummaryCardsProps) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
    <YearlyStatCard
      title="Inwestycje — łączne wydatki w danym roku"
      value={summary?.investmentSum ?? 0}
      loading={loading}
      showValues={showValues}
    />

    <YearlyIpBoxCard
      summaryValue={summary?.ipBoxSum}
      loading={loading}
      showValues={showValues}
      selectedBudget={selectedBudget}
      selectedMonthBelongsToYear={selectedMonthBelongsToYear}
      selectedMonthIpBox={selectedMonthIpBox}
      editing={editingIpBox}
      inputValue={ipBoxInputValue}
      isSaving={isSavingIpBox}
      onStartEditing={onStartEditingIpBox}
      onInputChange={onIpBoxInputChange}
      onCancelEditing={onCancelEditingIpBox}
      onSave={onSaveIpBox}
    />

    <ComparisonCard
      title="Podróże — planowane vs zrealizowane"
      planned={summary?.travelPlanned ?? null}
      actual={summary?.travelActual ?? null}
      loading={loading}
      baseColor="var(--category-9)"
    />

    <ComparisonCard
      title="Ubrania / sprzęt sportowy — planowane vs zrealizowane"
      planned={summary?.clothesPlanned ?? null}
      actual={summary?.clothesActual ?? null}
      loading={loading}
      baseColor="var(--category-11)"
    />

    <YearlyComparisonSlots
      slots={comparisonSlots}
      comparisonData={comparisonData}
      categoryColors={categoryColors}
      loading={loadingComparisons}
      selectedCategory={selectedCategory}
      onPlaceCategory={onPlaceCategory}
      onClearSlot={onClearComparisonSlot}
    />
  </div>
);

export default YearlySummaryCards;
