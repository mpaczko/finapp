import React from "react";
import { ComboboxCategoriesStandalone } from "../../../components/ComboboxCategories";

interface ExpenseFiltersProps {
  filters: {
    name: string;
    category: string;
    startDate: string;
    endDate: string;
    minCost: string;
    maxCost: string;
  };
  onFilterChange: (filters: {
    name: string;
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
      name: "",
      category: "",
      startDate: "",
      endDate: "",
      minCost: "",
      maxCost: "",
    });
  };

  return (
    <div className="mb-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <ComboboxCategoriesStandalone
          className="max-w-72"
          value={filters.category}
          onChange={(val) => updateFilter("category", val)}
        />

        <input
          type="text"
          placeholder="Szukaj nazwy"
          value={filters.name}
          onChange={(e) => updateFilter("name", e.target.value)}
          className="flex-1 min-w-[180px] px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
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
          className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />

        <input
          type="date"
          value={filters.endDate}
          min={filters.startDate || undefined}
          onChange={(e) => updateFilter("endDate", e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />

        <input
          type="number"
          step="0.01"
          placeholder="Min koszt"
          value={filters.minCost}
          onChange={(e) => updateFilter("minCost", e.target.value)}
          className="w-28 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />

        <input
          type="number"
          step="0.01"
          placeholder="Max koszt"
          value={filters.maxCost}
          onChange={(e) => updateFilter("maxCost", e.target.value)}
          className="w-28 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />

        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 hover:bg-slate-100"
        >
          Wyczyść filtry
        </button>
      </div>
    </div>
  );
};

export default ExpenseFilters;
