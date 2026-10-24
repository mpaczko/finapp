import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { expect, it, vi } from "vitest";

import { createAuthUser } from "../../test/factories";
import { server } from "../../test/mocks/server";
import { renderWithProviders } from "../../test/render";
import LoginForm from "./LoginForm";

const renderLoginForm = (onAuthenticated = vi.fn()) => {
  renderWithProviders(
    <LoginForm
      onAuthenticated={onAuthenticated}
      onSwitchToForgotPassword={vi.fn()}
      onSwitchToRegister={vi.fn()}
    />,
  );

  return { onAuthenticated };
};

const fillCredentials = async () => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.type(screen.getByLabelText("Hasło"), "hasło-testowe");
  await user.click(screen.getByRole("button", { name: "Zaloguj" }));
};

it("logs in after entering valid credentials", async () => {
  const { onAuthenticated } = renderLoginForm();

  await fillCredentials();

  expect(onAuthenticated).toHaveBeenCalledWith(createAuthUser());
});

it("shows an API error when logging in fails", async () => {
  server.use(
    http.post("*/api/auth/login", () =>
      HttpResponse.json(
        { message: "Nieprawidłowy e-mail lub hasło." },
        { status: 401 },
      ),
    ),
  );
  vi.spyOn(console, "error").mockImplementation(() => undefined);

  renderLoginForm();
  await fillCredentials();

  expect(
    await screen.findByText("Błąd logowania: Nieprawidłowy e-mail lub hasło."),
  ).toBeInTheDocument();
});
