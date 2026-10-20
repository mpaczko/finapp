import { expect, it } from "vitest";

it("provides browser APIs for component tests", () => {
  expect(document.createElement("button")).toBeInstanceOf(HTMLButtonElement);
  expect(window.localStorage).toBeDefined();
});
