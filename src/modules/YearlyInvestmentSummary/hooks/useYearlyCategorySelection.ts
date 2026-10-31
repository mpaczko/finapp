import { useEffect, useState } from "react";
import { setSelectedCategory as setGlobalSelectedCategory } from "../../../store/configSlice/configSlice";
import { useAppDispatch, useAppSelector } from "../../../store/reduxHook";

const SELECTED_CATEGORY_COOKIE = "finapp.yearlyChartSelectedCategory";
const DEFAULT_SELECTED_CATEGORY = "jedzenie";

const getSelectedCategoryFromCookie = () => {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${SELECTED_CATEGORY_COOKIE}=`));

  return cookie
    ? decodeURIComponent(cookie.split("=").slice(1).join("="))
    : DEFAULT_SELECTED_CATEGORY;
};

const saveSelectedCategoryToCookie = (category: string) => {
  document.cookie = `${SELECTED_CATEGORY_COOKIE}=${encodeURIComponent(category)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
};

export const useYearlyCategorySelection = (availableCategories: string[]) => {
  const [selectedCategory, setSelectedCategory] = useState(
    getSelectedCategoryFromCookie,
  );
  const dispatch = useAppDispatch();
  const globallySelectedCategory = useAppSelector(
    (state) => state.config.selectedCategory,
  );

  useEffect(() => {
    if (availableCategories.includes(selectedCategory)) return;

    const foodCategory = availableCategories.find(
      (category) => category.trim().toLocaleLowerCase("pl-PL") === "jedzenie",
    );
    const nextCategory =
      foodCategory ?? availableCategories[0] ?? DEFAULT_SELECTED_CATEGORY;

    setSelectedCategory(nextCategory);
    if (availableCategories.length > 0)
      saveSelectedCategoryToCookie(nextCategory);
  }, [availableCategories, selectedCategory]);

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    saveSelectedCategoryToCookie(category);

    if (globallySelectedCategory !== category) {
      dispatch(setGlobalSelectedCategory(category));
    }
  };

  return { selectedCategory, selectCategory };
};
