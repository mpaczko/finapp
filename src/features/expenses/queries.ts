import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { expensesApi } from "../../lib/expensesApi";
import { IAddExpenseForm } from "../../modules/ExpenseDialog/ExpenseForm/addExpenseForm.config";

export const expensesQueryKey = (month: string) => ["expenses", month] as const;

export const useExpensesQuery = (month: string, enabled = true) =>
  useQuery({
    queryKey: expensesQueryKey(month),
    queryFn: ({ signal }) => expensesApi.listByMonth(month, signal),
    enabled,
    staleTime: 45_000,
  });

export const yearlyExpenseTotalsQueryKey = (year: number) =>
  ["expenses", "monthly-totals", year] as const;

export const useYearlyExpenseTotalsQuery = (year: number, enabled = true) =>
  useQuery({
    queryKey: yearlyExpenseTotalsQueryKey(year),
    queryFn: ({ signal }) => expensesApi.getMonthlyTotals(year, signal),
    enabled,
    staleTime: 2 * 60_000,
  });

const invalidateExpenseData = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: ["expenses"] });
  void queryClient.invalidateQueries({ queryKey: ["summary"] });
};

export const useSaveExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, expense }: { id?: string; expense: IAddExpenseForm }) =>
      id ? expensesApi.update(id, expense) : expensesApi.create(expense),
    onSuccess: () => invalidateExpenseData(queryClient),
  });
};

export const useCreateManyExpensesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expensesApi.createMany,
    onSuccess: () => invalidateExpenseData(queryClient),
  });
};

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => invalidateExpenseData(queryClient),
  });
};
