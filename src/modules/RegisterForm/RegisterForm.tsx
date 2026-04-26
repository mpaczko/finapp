"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { supabase } from "../../createClient";
import FormInput from "../../components/Form/FormInput";
import { Button } from "../../ui/Button";

type RegisterFormValues = {
  email: string;
  password: string;
};

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);

  const methods = useForm<RegisterFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: RegisterFormValues) => {
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
    }

    setLoading(false);
  };

  return (
    <FormProvider {...methods}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput name="email" label="Email" className="w-full" />

        <FormInput
          name="password"
          label="Hasło"
          type="password"
          className="w-full"
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Rejestracja..." : "Zarejestruj"}
        </Button>
      </form>
    </FormProvider>
  );
}
