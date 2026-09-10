import { useQuery } from "@tanstack/react-query";

import { summaryApi } from "../../lib/summaryApi";

export const yearlySummaryQueryKey = (year: number) =>
  ["summary", "yearly", year] as const;

export const useYearlySummaryQuery = (year: number, enabled = true) =>
  useQuery({
    queryKey: yearlySummaryQueryKey(year),
    queryFn: ({ signal }) => summaryApi.getYearly(year, signal),
    enabled,
  });
