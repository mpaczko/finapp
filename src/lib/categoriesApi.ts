import { Category } from "../store/categoriesSlice/categoriesSlice";
import { apiRequest } from "./apiClient";

export const categoriesApi = {
  list: () => apiRequest<Category[]>("/categories"),
};
