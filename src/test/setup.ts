import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./mocks/server";

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
  window.localStorage.clear();
  window.sessionStorage.clear();
  clearCookies();
});

afterAll(() => {
  server.close();
});
