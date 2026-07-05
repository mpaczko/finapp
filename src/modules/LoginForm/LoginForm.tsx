"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { supabase } from "../../createClient";
import FormInput from "../../components/Form/FormInput";
import { Button } from "../../ui/Button";

type FormValues = {
  email: string;
  password: string;
};

type Props = {
  onSwitchToRegister: () => void;
};

export default function LoginForm({ onSwitchToRegister }: Props) {
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

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      const rawMessage = error.message || "Logowanie nie powiodło się.";
      const isNetworkError =
        /failed to fetch|network error|nie można połączyć/i.test(rawMessage);
      const friendlyMessage = isNetworkError
        ? "Nie udało się zalogować. Problem z serwerem lub połączeniem sieciowym."
        : `Błąd logowania: ${rawMessage}`;

      setErrorMessage(friendlyMessage);
    }

    setLoading(false);
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
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

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
