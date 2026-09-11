import { apiRequest } from "./apiClient";

export type Budget = {
  id: number;
  created_at: string;
  month: string;
  previous_month_savings: number;
  income: number;
  income_received_at: string | null;
  rent: number;
  media: number;
  home_stuff: number;
  food: number;
  hangouts: number;
  parties: number;
  suplements: number;
  entertainment: number;
  health_and_beauty: number;
  travels: number;
  transport: number;
  clothes: number;
  investments: number;
  company_cost: number;
  others: number;
  ip_box: number;
};

export interface CreateBudgetPayload {
  month: string;
  previous_month_savings?: number;
  income?: number;
  rent?: number;
  media?: number;
  home_stuff?: number;
  food?: number;
  hangouts?: number;
  parties?: number;
  suplements?: number;
  entertainment?: number;
  health_and_beauty?: number;
  travels?: number;
  transport?: number;
  clothes?: number;
  investments?: number;
  company_cost?: number;
  others?: number;
  ip_box?: number;
}

export interface UpdateBudgetPayload extends Partial<CreateBudgetPayload> {}

export const budgetsApi = {
  listByMonth: (month: string, signal?: AbortSignal) =>
    apiRequest<Budget[]>(`/budgets?month=${encodeURIComponent(month)}`, {
      signal,
    }),

  create: (budget: CreateBudgetPayload) =>
    apiRequest<Budget>("/budgets", {
      method: "POST",
      body: budget,
    }),

  update: (id: number, budget: UpdateBudgetPayload) =>
    apiRequest<Budget>(`/budgets/${id}`, {
      method: "PATCH",
      body: budget,
    }),

  confirmIncome: (id: number) =>
    apiRequest<Budget>(`/budgets/${id}/income/confirm`, {
      method: "POST",
    }),

  unconfirmIncome: (id: number) =>
    apiRequest<Budget>(`/budgets/${id}/income/confirm`, {
      method: "DELETE",
    }),
};
