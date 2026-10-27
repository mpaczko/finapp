import { useBudgetSummary } from "../../hooks/useBudgetSummary";
import TotalExpensesCard from "./TotalExpensesCard";

const MonthlyExpensesTotal = () => {
  const {
    totals,
    editingIncome,
    incomeInputValue,
    incomeReceived,
    setEditingIncome,
    setIncomeInputValue,
    saveIncomeValue,
    setIncomeReceived,
    loading,
  } = useBudgetSummary();

  return (
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
  );
};

export default MonthlyExpensesTotal;
