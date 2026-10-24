import type { AuthUser } from "../lib/authClient";
import type { Budget } from "../lib/budgetsApi";
import type { Category } from "../lib/categoriesApi";
import type { Expense } from "../lib/expensesApi";
import type { YearlySummary } from "../lib/summaryApi";

export const createAuthUser = (
  overrides: Partial<AuthUser> = {},
): AuthUser => ({
  id: "user-1",
  email: "test@example.com",
  ...overrides,
});

export const createExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: "expense-1",
  created_at: "2026-10-01T10:00:00.000Z",
  name: "Zakupy spożywcze",
  category: "jedzenie",
  date: "2026-10-01",
  cost: 42.5,
  ...overrides,
});

export const createBudget = (overrides: Partial<Budget> = {}): Budget => ({
  id: 1,
  created_at: "2026-10-01T10:00:00.000Z",
  month: "2026-10",
  previous_month_savings: 1000,
  income: 8000,
  income_received_at: null,
  rent: 2000,
  media: 300,
  home_stuff: 200,
  food: 1200,
  hangouts: 300,
  parties: 150,
  suplements: 100,
  entertainment: 250,
  health_and_beauty: 200,
  travels: 500,
  transport: 300,
  clothes: 250,
  investments: 1000,
  company_cost: 400,
  others: 200,
  ip_box: 500,
  ...overrides,
});

export const createCategory = (
  overrides: Partial<Category> = {},
): Category => ({
  id: 1,
  created_at: "2026-10-01T10:00:00.000Z",
  name: "jedzenie",
  key: "food",
  ...overrides,
});

export const createYearlySummary = (
  overrides: Partial<YearlySummary> = {},
): YearlySummary => ({
  investmentSum: 12000,
  ipBoxSum: 6000,
  travelPlanned: 6000,
  travelActual: 4500,
  travelCategoryName: "podróże/wakacje",
  clothesPlanned: 3000,
  clothesActual: 2800,
  clothesCategoryName: "ubrania/sprzęt sportowy",
  ...overrides,
});
