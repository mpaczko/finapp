"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { authClient, type AuthUser } from "../../lib/authClient";
import FormInput from "../../components/Form/FormInput";
import { Button } from "../../ui/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  IRegisterForm,
  defaultValues,
  formSchema,
} from "./registerForm.config";

type Props = {
  onSwitchToLogin: () => void;
  onAuthenticated: (user: AuthUser) => void;
};

export default function RegisterForm({ onAuthenticated, onSwitchToLogin }: Props) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const methods = useForm<IRegisterForm>({
    defaultValues,
    resolver: yupResolver(formSchema()),
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data: IRegisterForm) => {
    if (loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const { user } = await authClient.register({
        email: data.email,
        password: data.password,
      });
      reset();
      onAuthenticated(user);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "Rejestracja nie powiodła się.";
      const isNetworkError = /failed to fetch|network error|nie można połączyć/i.test(rawMessage);

      setErrorMessage(
        isNetworkError
          ? "Nie udało się zarejestrować. Problem z serwerem lub połączeniem sieciowym."
          : `Błąd rejestracji: ${rawMessage}`,
      );
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
          autoComplete="new-password"
          className="w-full"
        />

        <FormInput
          name="confirmPassword"
          label="Powtórz hasło"
          type="password"
          autoComplete="new-password"
          className="w-full"
        />

        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? "Rejestracja..." : "Zarejestruj"}
        </Button>

        {errorMessage ? (
          <div className="rounded-xl border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger">
            {errorMessage}
          </div>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          className="text-sm mt-2"
          onClick={onSwitchToLogin}
        >
          Masz konto? Zaloguj się
        </Button>
      </form>
    </FormProvider>
  );
}
