"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useState } from "react";
import FormInput from "../../components/Form/FormInput";
import { authClient } from "../../lib/authClient";
import { Button } from "../../ui/Button";

type FormValues = {
  email: string;
};

type Props = {
  onSwitchToLogin: () => void;
};

const SUCCESS_MESSAGE =
  "Jeśli konto istnieje, wysłaliśmy link do ustawienia nowego hasła.";

export default function ForgotPasswordForm({ onSwitchToLogin }: Props) {
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const methods = useForm<FormValues>({ defaultValues: { email: "" } });
  const { handleSubmit, reset } = methods;

  const onSubmit = async (data: FormValues) => {
    if (loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      await authClient.requestPasswordReset({ email: data.email.trim() });
      reset();
      setIsSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const isNetworkError = /failed to fetch|network error|nie można połączyć/i.test(message);

      setErrorMessage(
        isNetworkError
          ? "Nie udało się wysłać zgłoszenia. Sprawdź połączenie i spróbuj ponownie."
          : "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        className="flex w-[370px] flex-col gap-4 rounded-2xl p-10 shadow-sm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <h1 className="text-xl font-semibold text-foreground">Reset hasła</h1>
          <p className="mt-1 text-sm text-muted">
            Podaj adres e-mail, a wyślemy instrukcję ustawienia nowego hasła.
          </p>
        </div>

        <FormInput
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          className="w-full"
        />

        <Button type="submit" disabled={loading || isSubmitted} className="mt-2">
          {loading ? "Wysyłanie..." : "Wyślij link resetujący"}
        </Button>

        {isSubmitted ? (
          <div
            role="status"
            className="rounded-xl border border-success-border bg-success-surface px-4 py-3 text-sm text-success"
          >
            {SUCCESS_MESSAGE}
          </div>
        ) : null}

        {errorMessage ? (
          <div
            role="alert"
            className="rounded-xl border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger"
          >
            {errorMessage}
          </div>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          className="mt-2 text-sm"
          onClick={onSwitchToLogin}
        >
          Wróć do logowania
        </Button>
      </form>
    </FormProvider>
  );
}
