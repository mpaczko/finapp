import { useEffect, useState } from "react";
import {
  SUMMARY_VISIBILITY_STORAGE_KEY,
  parseSummaryVisibilitySetting,
} from "../lib/summaryVisibility";

const SUMMARY_VISIBILITY_EVENT = "finapp.summaryVisibility.changed";

const readStoredVisibility = (): boolean => {
  if (typeof window === "undefined") return false;

  const storedValue = window.localStorage.getItem(
    SUMMARY_VISIBILITY_STORAGE_KEY,
  );

  return parseSummaryVisibilitySetting(storedValue);
};

export const useSummaryVisibility = () => {
  const [showValues, setShowValues] = useState<boolean>(readStoredVisibility);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SUMMARY_VISIBILITY_STORAGE_KEY) {
        setShowValues(parseSummaryVisibilitySetting(event.newValue));
      }
    };

    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail === undefined) return;
      setShowValues(customEvent.detail === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(SUMMARY_VISIBILITY_EVENT, handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(SUMMARY_VISIBILITY_EVENT, handleCustomEvent);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nextValue = String(showValues);
    const currentValue = window.localStorage.getItem(
      SUMMARY_VISIBILITY_STORAGE_KEY,
    );

    if (currentValue !== nextValue) {
      window.localStorage.setItem(SUMMARY_VISIBILITY_STORAGE_KEY, nextValue);
      window.dispatchEvent(
        new CustomEvent(SUMMARY_VISIBILITY_EVENT, { detail: nextValue }),
      );
    }
  }, [showValues]);

  return [showValues, setShowValues] as const;
};
