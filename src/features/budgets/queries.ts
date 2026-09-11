import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { budgetsApi, UpdateBudgetPayload } from "../../lib/budgetsApi";

export const budgetQueryKey = (month: string) => ["budgets", month] as const;

export const useBudgetQuery = (month: string, enabled = true) =>
  useQuery({
    queryKey: budgetQueryKey(month),
    queryFn: ({ signal }) => budgetsApi.listByMonth(month, signal),
    enabled,
  });

export const useUpdateBudgetMutation = (month: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, budget }: { id: number; budget: UpdateBudgetPayload }) =>
      budgetsApi.update(id, budget),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: budgetQueryKey(month) });
      void queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
};

export const useSetIncomeReceivedMutation = (month: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, received }: { id: number; received: boolean }) =>
      received ? budgetsApi.confirmIncome(id) : budgetsApi.unconfirmIncome(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: budgetQueryKey(month) });
    },
  });
};
