import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  defaultValues,
  formSchema,
  IAddExpenseForm,
} from "./addExpenseForm.config";
import { yupResolver } from "@hookform/resolvers/yup";

import { ComboboxCategories } from "./ComboboxCategories";
import { useDispatch } from "react-redux";
import { startOfMonth, format, endOfMonth } from "date-fns";
import { IExpense } from "../../../types/expenseType";
import { useAppSelector } from "../../../store/reduxHook";
import { supabase } from "../../../createClient";
import { setExpenses } from "../../../store/expensesSlice/expensesSlice";
import FormDatePicker from "../../../components/Form/FormDatePicker";
import { Button } from "../../../ui/Button";
import FormInput from "../../../components/Form/FormInput";

type Props = {
  expense?: IExpense;
  onClose?: () => void;
};

const ExpenseForm = ({ expense, onClose }: Props) => {
  const dispatch = useDispatch();
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);

  const methods = useForm<IAddExpenseForm>({
    defaultValues: defaultValues,
    resolver: yupResolver(formSchema()),
  });
  const { reset, handleSubmit } = methods;

  async function fetchExpenses(month: string) {
    const startDate = format(
      startOfMonth(new Date(month + "-01")),
      "yyyy-MM-dd"
    );
    const endDate = format(endOfMonth(new Date(month + "-01")), "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) {
      console.error("Błąd podczas pobierania wydatków:", error);
    }

    if (data) {
      dispatch(setExpenses(data));
    }
  }

  useEffect(() => {
    if (expense) {
      reset(expense);
    }
  }, [expense, methods]);

  async function onSubmit(data: IAddExpenseForm) {
    if (expense?.id) {
      await supabase.from("expenses").update(data).eq("id", expense.id);
    } else {
      await supabase.from("expenses").insert(data);
    }

    await fetchExpenses(selectedMonth);
    reset(defaultValues);
    onClose?.();
  }

  return (
    <div>
      <FormProvider {...methods}>
        <form
          className="flex flex-col gap-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="w-full flex flex-col gap-4">
            <FormInput<IAddExpenseForm>
              name="name"
              label="Nazwa"
              className="w-full"
            />

            <div className="w-full flex gap-4">
              <ComboboxCategories
                label="Kategoria"
                name="category"
                className="w-1/2"
              />
              <FormInput<IAddExpenseForm>
                name="cost"
                label="Wydatek"
                className="w-1/4"
                type="number"
                step="0.01"
              />
              <FormDatePicker<IAddExpenseForm> name="date" label="Data" />
            </div>
          </div>

          <div className="w-full flex justify-end">
            <Button type="submit" variant="ghost" className="ml-auto">
              {expense ? "Zapisz" : "Dodaj"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ExpenseForm;
