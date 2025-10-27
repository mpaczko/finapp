import React, { useState, useEffect } from "react";

interface ExpenseFiltersProps {
  onFilterChange: (filters: {
    search: string;
    date: string;
    minCost: string;
    maxCost: string;
  }) => void;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({ onFilterChange }) => {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [minCost, setMinCost] = useState("");
  const [maxCost, setMaxCost] = useState("");

  useEffect(() => {
    onFilterChange({ search, date, minCost, maxCost });
  }, [search, date, minCost, maxCost, onFilterChange]);

  const handleClear = () => {
    setSearch("");
    setDate("");
    setMinCost("");
    setMaxCost("");
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <input
        type="text"
        placeholder="Szukaj po nazwie lub kategorii..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-2 border rounded w-60"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="px-3 py-2 border rounded"
      />
      <input
        type="number"
        step="0.01"
        placeholder="Min koszt"
        value={minCost}
        onChange={(e) => setMinCost(e.target.value)}
        className="px-3 py-2 border rounded w-24"
      />
      <input
        type="number"
        step="0.01"
        placeholder="Max koszt"
        value={maxCost}
        onChange={(e) => setMaxCost(e.target.value)}
        className="px-3 py-2 border rounded w-24"
      />
      <button
        onClick={handleClear}
        className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Wyczyść filtry
      </button>
    </div>
  );
};

export default ExpenseFilters;
