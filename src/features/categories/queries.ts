import { useQuery } from "@tanstack/react-query";

import { categoriesApi } from "../../lib/categoriesApi";

export const categoriesQueryKey = ["categories"] as const;

export const useCategoriesQuery = (enabled = true) =>
  useQuery({
    queryKey: categoriesQueryKey,
    queryFn: ({ signal }) => categoriesApi.list(signal),
    enabled,
  });
