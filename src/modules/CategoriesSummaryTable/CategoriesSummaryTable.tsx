import { categoryChartColors } from "../../lib/categoryColors";
import { setSelectedCategory } from "../../store/configSlice/configSlice";
import { useAppDispatch } from "../../store/reduxHook";
import { useBudgetSummary } from "../../hooks/useBudgetSummary";
import CategoryBudgetBars from "./CategoryBudgetBars";
import CategorySummarySection from "./CategorySummarySection";
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
    editingCategory,
    inputValue,
    setEditingCategory,
    setInputValue,
    savePlannedValue,
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
    <section className="grid min-w-0 gap-6 rounded-3xl border border-border-soft bg-surface p-4 shadow-sm sm:p-5 xl:h-full xl:grid-rows-[auto_minmax(0,1fr)]">
      <h2 className="text-lg font-semibold text-foreground sm:text-xl">
        Wydatki według kategorii
      </h2>

      <div className="grid min-w-0 grid-cols-1 gap-8 xl:min-h-0 xl:grid-rows-[auto_minmax(0,1fr)]">
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
        </div>

        <div className="min-w-0 xl:min-h-0">
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
    </section>
  );
};

export default CategoriesSummaryTable;
