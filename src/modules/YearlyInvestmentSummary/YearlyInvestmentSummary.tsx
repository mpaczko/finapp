import { useState } from "react";
import { useSummaryVisibility } from "../../hooks/useSummaryVisibility";
import { categoryChartColors } from "../../lib/categoryColors";
import YearlyCategorySelector from "./YearlyCategorySelector";
import YearlyCategoryExpensesChart from "./YearlyCategoryExpensesChart";
import YearlyExpensesList from "./YearlyExpensesList";
import YearlyIncomeAndExpensesChart from "./YearlyIncomeAndExpensesChart";
import YearlySummaryCards from "./YearlySummaryCards";
import YearlySummaryHeader from "./YearlySummaryHeader";
import { useYearlyCategorySelection } from "./hooks/useYearlyCategorySelection";
import { useYearlyComparisonSlots } from "./hooks/useYearlyComparisonSlots";
import { useYearlyInvestmentSummaryData } from "./hooks/useYearlyInvestmentSummaryData";

type YearlyInvestmentSummaryProps = {
  userId: string | null;
  selectedMonth: string;
};

const YearlyInvestmentSummary = ({
  userId,
  selectedMonth,
}: YearlyInvestmentSummaryProps) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [editingIpBox, setEditingIpBox] = useState(false);
  const [ipBoxInputValue, setIpBoxInputValue] = useState("");
  const [showValues] = useSummaryVisibility();
  const {
    availableCategories,
    categoryColors,
    comparisonData,
    monthlyOverview,
    monthlyTotals,
    monthlyTotalsLoading,
    selectedBudget,
    summary,
    summaryLoading,
    updateBudgetMutation,
    yearlyBudgetsLoading,
  } = useYearlyInvestmentSummaryData({ userId, selectedMonth, year });
  const { selectedCategory, selectCategory } =
    useYearlyCategorySelection(availableCategories);
  const {
    comparisonSlots,
    clearComparisonSlot,
    placeCategoryInComparisonSlot,
  } = useYearlyComparisonSlots(availableCategories);

  const selectedMonthIpBox = Number(selectedBudget?.ip_box ?? 0);
  const selectedMonthBelongsToYear = selectedBudget?.month.startsWith(
    `${year}-`,
  );

  const saveIpBoxValue = async () => {
    if (!selectedBudget) return;

    const value = Number(ipBoxInputValue);
    if (!Number.isFinite(value) || value < 0) return;

    try {
      await updateBudgetMutation.mutateAsync({
        id: selectedBudget.id,
        budget: { ip_box: value },
      });
      setEditingIpBox(false);
    } catch (error) {
      console.error("Błąd podczas zapisu kwoty IP Box:", error);
    }
  };

  return (
    <div className="w-full min-w-0 rounded-3xl border border-border-soft bg-surface p-5 shadow-sm">
      <YearlySummaryHeader
        year={year}
        currentYear={currentYear}
        onYearChange={setYear}
      />

      <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.5fr)] xl:items-start">
        <section className="min-w-0">
          <YearlySummaryCards
            summary={summary}
            loading={summaryLoading}
            showValues={showValues}
            selectedBudget={selectedBudget}
            selectedMonthBelongsToYear={selectedMonthBelongsToYear}
            selectedMonthIpBox={selectedMonthIpBox}
            editingIpBox={editingIpBox}
            ipBoxInputValue={ipBoxInputValue}
            isSavingIpBox={updateBudgetMutation.isPending}
            onStartEditingIpBox={() => {
              setIpBoxInputValue(selectedMonthIpBox.toFixed(2));
              setEditingIpBox(true);
            }}
            onIpBoxInputChange={setIpBoxInputValue}
            onCancelEditingIpBox={() => setEditingIpBox(false)}
            onSaveIpBox={saveIpBoxValue}
            comparisonSlots={comparisonSlots}
            comparisonData={comparisonData}
            categoryColors={categoryColors}
            loadingComparisons={monthlyTotalsLoading || yearlyBudgetsLoading}
            onPlaceCategory={placeCategoryInComparisonSlot}
            onClearComparisonSlot={clearComparisonSlot}
            selectedCategory={selectedCategory}
          />
        </section>

        <section className="min-w-0">
          <YearlyCategorySelector
            categories={availableCategories}
            selectedCategory={selectedCategory}
            categoryColors={categoryColors}
            onSelectCategory={selectCategory}
          />

          <YearlyCategoryExpensesChart
            category={selectedCategory}
            color={categoryColors[selectedCategory] ?? categoryChartColors[0]}
            year={year}
            monthlyTotals={monthlyTotals}
            loading={monthlyTotalsLoading}
            showValues={showValues}
          />

          <YearlyIncomeAndExpensesChart
            year={year}
            monthlyOverview={monthlyOverview}
            loading={monthlyTotalsLoading || yearlyBudgetsLoading}
            showValues={showValues}
          />
        </section>
      </div>

      <YearlyExpensesList year={year} enabled={Boolean(userId)} />
    </div>
  );
};

export default YearlyInvestmentSummary;
