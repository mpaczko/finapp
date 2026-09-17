import { categoryChartColors } from "../../lib/categoryColors";
import { setSelectedCategory } from "../../store/configSlice/configSlice";
import { useAppDispatch } from "../../store/reduxHook";
import { useBudgetSummary } from "../../hooks/useBudgetSummary";
import SummaryTable from "../SummaryTable";
import CategoryBudgetBars from "./CategoryBudgetBars";
import CategorySummarySection from "./CategorySummarySection";
import TotalExpensesCard from "./TotalExpensesCard";
import TableSkeleton from "../../ui/TableSkeleton/TableSkeleton";

const excludedCategoryNames = ["inwestycje", "koszty związane z firmą"];

const normalizeCategoryName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const excludedCategoryKeys = new Set(
  excludedCategoryNames.map(normalizeCategoryName),
);

const CategoriesSummaryTable = () => {
  const {
    summary,
    totals,
    editingCategory,
    inputValue,
    editingIncome,
    incomeInputValue,
    incomeReceived,
    setEditingCategory,
    setInputValue,
    setEditingIncome,
    setIncomeInputValue,
    savePlannedValue,
    saveIncomeValue,
    setIncomeReceived,
    loading,
  } = useBudgetSummary();
  const dispatch = useAppDispatch();

  const categoryColorMap = Object.fromEntries(
    summary.map((row, index) => [
      row.name,
      categoryChartColors[index % categoryChartColors.length],
    ]),
  );
  const primarySummary = summary.filter(
    (row) => !excludedCategoryKeys.has(normalizeCategoryName(row.name)),
  );
  const secondarySummary = summary.filter((row) =>
    excludedCategoryKeys.has(normalizeCategoryName(row.name)),
  );
  const selectCategory = (category: string) =>
    dispatch(setSelectedCategory(category));

  const sectionProps = {
    colorMap: categoryColorMap,
    onSelectCategory: selectCategory,
    editingCategory,
    inputValue,
    setEditingCategory,
    setInputValue,
    savePlannedValue,
  };

  return (
    <div className="grid min-w-0 gap-8 p-4">
      <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">
        Podsumowanie wydatków według kategorii
      </h2>

      <div className="grid min-w-0 gap-8 min-[2400px]:grid-cols-[minmax(0,1fr)_minmax(420px,1fr)] min-[2400px]:items-start">
        <div className="grid min-w-0 auto-rows-max content-start gap-8">
          <CategorySummarySection
            title="Kategorie (bez Inwestycji i Kosztów firmy)"
            rows={primarySummary}
            {...sectionProps}
          />
          <CategorySummarySection
            title="Inwestycje i Koszty firmy"
            rows={secondarySummary}
            {...sectionProps}
          />
          <TotalExpensesCard
            totals={totals}
            editingIncome={editingIncome}
            incomeInputValue={incomeInputValue}
            incomeReceived={incomeReceived}
            loading={loading}
            setEditingIncome={setEditingIncome}
            setIncomeInputValue={setIncomeInputValue}
            saveIncomeValue={saveIncomeValue}
            setIncomeReceived={setIncomeReceived}
          />
          <SummaryTable />
        </div>

        <div className="min-w-0">
          {loading ? (
            <TableSkeleton rows={6} columns={3} className="min-h-[420px]" />
          ) : (
            <CategoryBudgetBars
              rows={summary}
              colorMap={categoryColorMap}
              onSelectCategory={selectCategory}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesSummaryTable;
