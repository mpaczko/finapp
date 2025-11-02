import { useAppSelector } from "../../store/reduxHook";
import { supabase } from "../../createClient";
import ExpenseDialog from "../ExpenseDialog";
import { parseISO, format } from "date-fns";
import { pl } from "date-fns/locale";
import React, { useState } from "react";
import ExpenseFilters from "./ExpenseFilters";

interface IProps {
  onDelete: () => Promise<void>;
}

const ElementsTable = (props: IProps) => {
  const { onDelete } = props;
  const expenses = useAppSelector((state) => state.expenses);

  const [filters, setFilters] = useState({
    search: "",
    date: "",
    minCost: "",
    maxCost: "",
  });

  const handleDelete = async (id: number) => {
    await supabase.from("expenses").delete().eq("id", id);
    onDelete();
  };

  const filteredExpenses = expenses.items.filter((el) => {
    const searchValue = filters.search.toLowerCase();

    const matchesSearch = searchValue
      ? el.name.toLowerCase().includes(searchValue) ||
        el.category.toLowerCase().includes(searchValue)
      : true;

    const matchesDate = filters.date
      ? format(parseISO(String(el.date)), "yyyy-MM-dd") === filters.date
      : true;

    const min = parseFloat(filters.minCost.replace(",", ".")) || 0;
    const max = parseFloat(filters.maxCost.replace(",", ".")) || Infinity;
    const matchesCost = el.cost >= min && el.cost <= max;

    return matchesSearch && matchesDate && matchesCost;
  });

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold text-gray-800 pb-5">Moje wydatki</h2>

      <ExpenseFilters onFilterChange={setFilters} />

      <table className="min-w-[50%] border border-gray-200 bg-white rounded-xl shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2 border-b">Nazwa</th>
            <th className="px-4 py-2 border-b">Kategoria</th>
            <th className="px-4 py-2 border-b">Data</th>
            <th className="px-4 py-2 border-b">Koszt</th>
            <th className="px-4 py-2 border-b text-center w-1 whitespace-nowrap">
              Akcje
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((el) => (
            <tr key={el.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{el.name}</td>
              <td className="px-4 py-2 border-b">{el.category}</td>
              <td className="px-4 py-2 border-b">
                {el.date
                  ? format(parseISO(String(el.date)), "dd.MM.yyyy", {
                      locale: pl,
                    })
                  : ""}
              </td>
              <td className="px-4 py-2 border-b">{el.cost.toFixed(2)} zł</td>
              <td className="px-4 py-2 border-b text-center w-1 whitespace-nowrap space-x-2">
                <ExpenseDialog expense={el} triggerLabel="Edytuj" />
                <button
                  onClick={() => handleDelete(el.id)}
                  className="px-2 py-1 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  Usuń
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ElementsTable;
