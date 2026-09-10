import { apiRequest } from "./apiClient";

export type Category = {
  id: number;
  created_at: string;
  name: string;
  key: string;
};

export const categoriesApi = {
  list: (signal?: AbortSignal) => apiRequest<Category[]>("/categories", { signal }),
};
