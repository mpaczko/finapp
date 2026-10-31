import type { DragEvent } from "react";

type YearlyCategorySelectorProps = {
  categories: string[];
  selectedCategory: string;
  categoryColors: Record<string, string>;
  onSelectCategory: (category: string) => void;
};

const YearlyCategorySelector = ({
  categories,
  selectedCategory,
  categoryColors,
  onSelectCategory,
}: YearlyCategorySelectorProps) => (
  <div className="flex flex-wrap gap-2" aria-label="Wybór kategorii wykresu">
    {categories.map((category) => {
      const active = category === selectedCategory;
      const color = categoryColors[category];

      return (
        <button
          key={category}
          type="button"
          draggable
          onDragStart={(event: DragEvent<HTMLButtonElement>) => {
            event.dataTransfer.effectAllowed = "copy";
            event.dataTransfer.setData("text/plain", category);
          }}
          aria-pressed={active}
          onClick={() => onSelectCategory(category)}
          className={`shrink-0 cursor-grab rounded-xl border px-3 py-2 text-sm font-medium text-foreground-soft transition hover:brightness-95 active:cursor-grabbing ${
            active ? "shadow-sm" : "bg-surface"
          }`}
          style={{
            backgroundColor: active ? color : undefined,
            borderColor: color,
            color: active ? "var(--app-chart-label)" : undefined,
          }}
        >
          {category}
        </button>
      );
    })}
  </div>
);

export default YearlyCategorySelector;
