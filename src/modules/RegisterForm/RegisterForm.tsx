"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { supabase } from "../../createClient";
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
};

export default function RegisterForm({ onSwitchToLogin }: Props) {
  const [loading, setLoading] = useState(false);

  const methods = useForm<IRegisterForm>({
    defaultValues,
    resolver: yupResolver(formSchema()),
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data: IRegisterForm) => {
    if (loading) return;

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Sprawdź maila i potwierdź konto");
      reset();
      onSwitchToLogin();
    }

    setLoading(false);
  };

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col gap-4 w-[370px] p-10 rounded-2xl shadow-sm border"
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
