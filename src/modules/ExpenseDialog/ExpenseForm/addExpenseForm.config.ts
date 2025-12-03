import * as yup from "yup";

// Regex for yyyy-MM-dd
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const formSchema = () =>
  yup.object({
    name: yup
      .string()
      .required("Nazwa jest wymagana")
      .min(1, "Nazwa musi mieć co najmniej 1 znak")
      .max(100, "Nazwa nie może być dłuższa niż 100 znaków"),
    category: yup.string().required("Kategoria jest wymagana"),
    date: yup
      .string()
      .required("Data jest wymagana")
      .matches(DATE_REGEX, "Podaj datę w formacie RRRR-MM-DD"),
    cost: yup
      .number()
      .typeError("Wydatek musi być liczbą")
      .min(0, "Wydatek nie może być ujemny")
      .test("max-decimals", "Maksymalnie 2 miejsca po przecinku", (value) => {
        if (value === undefined || value === null) return true;
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      })
      .required("Wydatek jest wymagany"),
  });

export type IAddExpenseForm = yup.InferType<ReturnType<typeof formSchema>>;

export const defaultValues: IAddExpenseForm = {
  name: "",
  category: "jedzenie",
  date: new Date().toISOString().split("T")[0], // keep as yyyy-MM-dd
  cost: 0,
};
