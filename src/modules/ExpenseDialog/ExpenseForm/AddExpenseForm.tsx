import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  defaultValues,
  formSchema,
  IAddExpenseForm,
} from "./addExpenseForm.config";
import { yupResolver } from "@hookform/resolvers/yup";

import { ComboboxCategories } from "../../../components/ComboboxCategories";
import { useDispatch } from "react-redux";
import { IExpense } from "../../../types/expenseType";
import { useAppSelector } from "../../../store/reduxHook";
import { setExpenses } from "../../../store/expensesSlice/expensesSlice";
import FormDatePicker from "../../../components/Form/FormDatePicker";
import { Button } from "../../../ui/Button";
import FormInput from "../../../components/Form/FormInput";
import { expensesApi } from "../../../lib/expensesApi";

type Props = {
  isEdit?: boolean;
  expense?: IExpense;
  onClose?: () => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
};

const ExpenseForm = ({
  isEdit,
  expense,
  onClose,
  onRemove,
  showRemoveButton,
}: Props) => {
  const dispatch = useDispatch();
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<IAddExpenseForm>({
    defaultValues,
    resolver: yupResolver(formSchema()),
  });

  const { reset, handleSubmit } = methods;

  async function fetchExpenses(month: string) {
    const data = await expensesApi.listByMonth(month);
    dispatch(setExpenses(data));
  }

  useEffect(() => {
    if (expense) {
      reset(expense);
    }
  }, [expense, reset]);

  async function onSubmit(data: IAddExpenseForm) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (expense?.id) {
        const updateData: IAddExpenseForm = {
          name: data.name,
          category: data.category,
          date: data.date,
          cost: data.cost,
        };
        await expensesApi.update(expense.id, updateData);
      } else {
        await expensesApi.create(data);
      }

      await fetchExpenses(selectedMonth);
      reset(defaultValues);
      onClose?.();
    } finally {
      setIsSubmitting(false);
    }
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

          <div className="w-full flex justify-end gap-2">
            {showRemoveButton && (
              <Button
                type="button"
                variant="destructive"
                onClick={onRemove}
                disabled={isSubmitting}
              >
                Usuń
              </Button>
            )}

            <Button type="submit" variant="ghost" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : isEdit ? "Zapisz" : "Dodaj"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ExpenseForm;
