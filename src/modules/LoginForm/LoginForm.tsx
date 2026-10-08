"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { authClient, type AuthUser } from "../../lib/authClient";
import FormInput from "../../components/Form/FormInput";
import { Button } from "../../ui/Button";

type FormValues = {
  email: string;
  password: string;
};

type Props = {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  onAuthenticated: (user: AuthUser) => void;
  successMessage?: string;
};

export default function LoginForm({
  onAuthenticated,
  onSwitchToRegister,
  onSwitchToForgotPassword,
  successMessage,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const methods = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: FormValues) => {
    if (loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const { user } = await authClient.login(data);
      onAuthenticated(user);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "Logowanie nie powiodło się.";
      const isNetworkError =
        /failed to fetch|network error|nie można połączyć/i.test(rawMessage);
      const friendlyMessage = isNetworkError
        ? "Nie udało się zalogować. Problem z serwerem lub połączeniem sieciowym."
        : `Błąd logowania: ${rawMessage}`;

      setErrorMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col gap-4 w-[370px] p-10 rounded-2xl shadow-sm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormInput
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          className="w-full"
        />

        <FormInput
          name="password"
          label="Hasło"
          type="password"
          autoComplete="current-password"
        />

        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? "Logowanie..." : "Zaloguj"}
        </Button>

        {errorMessage ? (
          <div className="rounded-xl border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            className="rounded-xl border border-success-border bg-success-surface px-4 py-3 text-sm text-success"
          >
            {successMessage}
          </div>
        ) : null}

        <Button
          type="button"
          variant="link"
          className="self-start px-0 text-sm"
          onClick={onSwitchToForgotPassword}
        >
          Nie pamiętasz hasła?
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="text-sm mt-2"
          onClick={onSwitchToRegister}
        >
          Nie masz konta? Zarejestruj się
        </Button>
      </form>
    </FormProvider>
  );
}
