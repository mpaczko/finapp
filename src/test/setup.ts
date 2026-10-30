import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { server } from "./mocks/server";

const installJsdomStorage = () => {
  const domWindow = (
    globalThis as typeof globalThis & { jsdom?: { window: Window } }
  ).jsdom?.window;

  if (!domWindow) return;

  Object.defineProperties(globalThis, {
    localStorage: {
      configurable: true,
      value: domWindow.localStorage,
    },
    sessionStorage: {
      configurable: true,
      value: domWindow.sessionStorage,
    },
  });
};

installJsdomStorage();

const clearCookies = () => {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();

    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
};

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
  clearCookies();
});

afterAll(() => {
  server.close();
});
