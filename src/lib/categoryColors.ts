// SVG fills and category markers resolve these variables against the active theme.
export const categoryChartColors = Array.from(
  { length: 14 },
  (_, index) => `var(--category-${index + 1})`,
);
