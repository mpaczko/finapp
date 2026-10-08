"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useState } from "react";

import FormInput from "../../components/Form/FormInput";
import { authClient } from "../../lib/authClient";
import { Button } from "../../ui/Button";

type FormValues = {
  password: string;
  confirmPassword: string;
};

type Props = {
  onCompleted: () => void;
  onRequestPasswordReset: () => void;
};

const INVALID_TOKEN_MESSAGE =
  "Ten link jest nieprawidłowy, wygasł lub został już wykorzystany.";

export default function ResetPasswordForm({
  onCompleted,
  onRequestPasswordReset,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const token = new URLSearchParams(window.location.search).get("token");
  const methods = useForm<FormValues>({
    defaultValues: { password: "", confirmPassword: "" },
  });
  const { handleSubmit, setError } = methods;

  const onSubmit = async (data: FormValues) => {
    if (loading || !token) {
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { message: "Hasła muszą się zgadzać" });
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await authClient.resetPassword({ token, ...data });
      window.history.replaceState({}, document.title, "/");
      onCompleted();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const isNetworkError = /failed to fetch|network error|nie można połączyć/i.test(message);

      setErrorMessage(
        isNetworkError
          ? "Nie udało się ustawić nowego hasła. Sprawdź połączenie i spróbuj ponownie."
          : INVALID_TOKEN_MESSAGE,
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <ResetPasswordError onRequestPasswordReset={onRequestPasswordReset} />
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        className="flex w-[370px] flex-col gap-4 rounded-2xl p-10 shadow-sm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <h1 className="text-xl font-semibold text-foreground">Ustaw nowe hasło</h1>
          <p className="mt-1 text-sm text-muted">
            Wpisz nowe hasło, którego użyjesz przy następnym logowaniu.
          </p>
        </div>

        <FormInput
          name="password"
          label="Nowe hasło"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />

        <FormInput
          name="confirmPassword"
          label="Powtórz nowe hasło"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />

        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Zapisywanie..." : "Ustaw nowe hasło"}
        </Button>

        {errorMessage ? (
          <div
            role="alert"
            className="rounded-xl border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger"
          >
            <p>{errorMessage}</p>
            {!/połączenie/i.test(errorMessage) ? (
              <Button
                type="button"
                variant="link"
                className="mt-2 h-auto px-0 text-danger"
                onClick={onRequestPasswordReset}
              >
                Poproś o nowy link
              </Button>
            ) : null}
          </div>
        ) : null}
      </form>
    </FormProvider>
  );
}

function ResetPasswordError({ onRequestPasswordReset }: Pick<Props, "onRequestPasswordReset">) {
  return (
    <div className="flex w-[370px] flex-col gap-4 rounded-2xl p-10 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Nieprawidłowy link</h1>
        <p className="mt-1 text-sm text-muted">{INVALID_TOKEN_MESSAGE}</p>
      </div>
      <Button type="button" onClick={onRequestPasswordReset}>
        Poproś o nowy link
      </Button>
    </div>
  );
}
