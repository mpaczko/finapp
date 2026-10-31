import { useEffect, useState } from "react";

const COMPARISON_SLOTS_STORAGE_KEY = "finapp.yearlyComparisonSlots";
const COMPARISON_SLOTS_COUNT = 2;

const emptySlots = () =>
  Array.from({ length: COMPARISON_SLOTS_COUNT }, () => null);

const getComparisonSlotsFromStorage = (): (string | null)[] => {
  if (typeof window === "undefined") return emptySlots();

  try {
    const savedValue = window.localStorage.getItem(
      COMPARISON_SLOTS_STORAGE_KEY,
    );
    const parsed = savedValue ? JSON.parse(savedValue) : [];
    if (!Array.isArray(parsed)) throw new Error("Invalid comparison slots");

    return Array.from({ length: COMPARISON_SLOTS_COUNT }, (_, index) =>
      typeof parsed[index] === "string" ? parsed[index] : null,
    );
  } catch {
    return emptySlots();
  }
};

export const useYearlyComparisonSlots = (availableCategories: string[]) => {
  const [comparisonSlots, setComparisonSlots] = useState(
    getComparisonSlotsFromStorage,
  );

  useEffect(() => {
    setComparisonSlots((slots) =>
      slots.map((category) =>
        category && availableCategories.includes(category) ? category : null,
      ),
    );
  }, [availableCategories]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        COMPARISON_SLOTS_STORAGE_KEY,
        JSON.stringify(comparisonSlots),
      );
    } catch {
      // Slots still work during the current session when storage is unavailable.
    }
  }, [comparisonSlots]);

  const placeCategoryInComparisonSlot = (
    slotIndex: number,
    category: string,
  ) => {
    if (!availableCategories.includes(category)) return;

    setComparisonSlots((slots) => {
      const nextSlots = slots.map((slotCategory) =>
        slotCategory === category ? null : slotCategory,
      );
      nextSlots[slotIndex] = category;
      return nextSlots;
    });
  };

  const clearComparisonSlot = (slotIndex: number) => {
    setComparisonSlots((slots) => {
      const remainingCategories = slots.filter(
        (category, index) => category && index !== slotIndex,
      );

      return Array.from(
        { length: COMPARISON_SLOTS_COUNT },
        (_, index) => remainingCategories[index] ?? null,
      );
    });
  };

  return {
    comparisonSlots,
    clearComparisonSlot,
    placeCategoryInComparisonSlot,
  };
};
