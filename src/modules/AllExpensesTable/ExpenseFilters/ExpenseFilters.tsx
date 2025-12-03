import React from "react";
import { ComboboxCategoriesStandalone } from "../../../components/ComboboxCategories";

interface ExpenseFiltersProps {
  filters: {
    category: string;
    startDate: string;
    endDate: string;
    minCost: string;
    maxCost: string;
  };
  onFilterChange: (filters: {
    category: string;
    startDate: string;
    endDate: string;
    minCost: string;
    maxCost: string;
  }) => void;
}

const ExpenseFilters = ({ filters, onFilterChange }: ExpenseFiltersProps) => {
  const updateFilter = (key: keyof typeof filters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleClear = () => {
    onFilterChange({
      category: "",
      startDate: "",
      endDate: "",
      minCost: "",
      maxCost: "",
    });
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <ComboboxCategoriesStandalone
        className="max-w-70"
        value={filters.category}
        onChange={(val) => updateFilter("category", val)}
      />

      <input
        type="date"
        value={filters.startDate}
        onChange={(e) => {
          updateFilter("startDate", e.target.value);

          if (filters.endDate && e.target.value > filters.endDate) {
            updateFilter("endDate", e.target.value);
          }
        }}
        className="px-3 py-2 border rounded"
      />

      <input
        type="date"
        value={filters.endDate}
        min={filters.startDate || undefined}
        onChange={(e) => updateFilter("endDate", e.target.value)}
        className="px-3 py-2 border rounded"
      />

      <input
        type="number"
        step="0.01"
        placeholder="Min koszt"
        value={filters.minCost}
        onChange={(e) => updateFilter("minCost", e.target.value)}
        className="px-3 py-2 border rounded w-24"
      />

      <input
        type="number"
        step="0.01"
        placeholder="Max koszt"
        value={filters.maxCost}
        onChange={(e) => updateFilter("maxCost", e.target.value)}
        className="px-3 py-2 border rounded w-24"
      />

      <button
        onClick={handleClear}
        className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
      >
        Wyczyść filtry
      </button>
    </div>
  );
};

export default ExpenseFilters;
