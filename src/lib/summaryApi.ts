import { apiRequest } from "./apiClient";

export type YearlySummary = {
  investmentSum: number;
  ipBoxSum: number;
  travelPlanned: number;
  travelActual: number;
  travelCategoryName: string;
  clothesPlanned: number;
  clothesActual: number;
  clothesCategoryName: string;
};

export const summaryApi = {
  getYearly: (year: number) =>
    apiRequest<YearlySummary>(`/summary/yearly?year=${encodeURIComponent(year)}`),
};
