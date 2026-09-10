import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { expensesApi } from "../../lib/expensesApi";
import { IAddExpenseForm } from "../../modules/ExpenseDialog/ExpenseForm/addExpenseForm.config";

export const expensesQueryKey = (month: string) => ["expenses", month] as const;

export const useExpensesQuery = (month: string, enabled = true) =>
  useQuery({
    queryKey: expensesQueryKey(month),
    queryFn: ({ signal }) => expensesApi.listByMonth(month, signal),
    enabled,
  });

export const useSaveExpenseMutation = (selectedMonth: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, expense }: { id?: string; expense: IAddExpenseForm }) =>
      id ? expensesApi.update(id, expense) : expensesApi.create(expense),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: expensesQueryKey(selectedMonth),
      });
      void queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
};

export const useDeleteExpenseMutation = (selectedMonth: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: expensesQueryKey(selectedMonth),
      });
      void queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
};
