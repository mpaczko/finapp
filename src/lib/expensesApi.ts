import { IAddExpenseForm } from "../modules/ExpenseDialog/ExpenseForm/addExpenseForm.config";
import { Expense } from "../store/expensesSlice/expensesSlice";

import { apiRequest } from "./apiClient";

export const expensesApi = {
  listByMonth: (month: string) =>
    apiRequest<Expense[]>(`/expenses?month=${encodeURIComponent(month)}`),

  create: (expense: IAddExpenseForm) =>
    apiRequest<Expense>("/expenses", {
      method: "POST",
      body: expense,
    }),

  update: (id: string, expense: IAddExpenseForm) =>
    apiRequest<Expense>(`/expenses/${id}`, {
      method: "PATCH",
      body: expense,
    }),

  remove: (id: string) =>
    apiRequest<{ id: string }>(`/expenses/${id}`, {
      method: "DELETE",
    }),
};
