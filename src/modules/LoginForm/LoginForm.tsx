"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { supabase } from "../../createClient";
import FormInput from "../../components/Form/FormInput";
import { Button } from "../../ui/Button";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const methods = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: LoginFormValues) => {
    if (loading) return;

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      alert(error.message);
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
      </form>
    </FormProvider>
  );
}
