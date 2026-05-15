import * as yup from "yup";

export const formSchema = () =>
  yup.object({
    email: yup
      .string()
      .required("Email jest wymagany")
      .email("Podaj poprawny email"),

    password: yup
      .string()
      .required("Hasło jest wymagane")
      .min(8)
      .matches(/[A-Z]/, "Musi zawierać wielką literę")
      .matches(/[0-9]/, "Musi zawierać cyfrę"),

    confirmPassword: yup
      .string()
      .required("Powtórz hasło")
      .oneOf([yup.ref("password")], "Hasła muszą się zgadzać"),
  });

export type IRegisterForm = yup.InferType<ReturnType<typeof formSchema>>;

export const defaultValues: IRegisterForm = {
  email: "",
  password: "",
  confirmPassword: "",
};
