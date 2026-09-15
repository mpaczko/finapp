import { forwardRef, useEffect, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  defaultValues,
  formSchema,
  IAddExpenseForm,
} from "./addExpenseForm.config";
import { yupResolver } from "@hookform/resolvers/yup";

import { ComboboxCategories } from "../../../components/ComboboxCategories";
import { IExpense } from "../../../types/expenseType";
import { useAppSelector } from "../../../store/reduxHook";
import FormDatePicker from "../../../components/Form/FormDatePicker";
import { Button } from "../../../ui/Button";
import FormInput from "../../../components/Form/FormInput";
import FormCurrencyInput from "../../../components/Form/FormCurrencyInput";
import { useSaveExpenseMutation } from "../../../features/expenses/queries";

type Props = {
  isEdit?: boolean;
  expense?: IExpense;
  onClose?: () => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  disabled?: boolean;
};

export type ExpenseFormHandle = {
  getValues: () => IAddExpenseForm;
  validate: () => Promise<boolean>;
};

const ExpenseForm = forwardRef<ExpenseFormHandle, Props>(function ExpenseForm(
  { isEdit, expense, onClose, onRemove, showRemoveButton, disabled },
  ref,
) {
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);
  const saveExpenseMutation = useSaveExpenseMutation(selectedMonth);

  const methods = useForm<IAddExpenseForm>({
    defaultValues,
    resolver: yupResolver(formSchema()),
  });

  const { getValues, handleSubmit, reset, trigger } = methods;

  useImperativeHandle(
    ref,
    () => ({
      getValues,
      validate: () => trigger(),
    }),
    [getValues, trigger],
  );

  useEffect(() => {
    if (expense) {
      reset(expense);
    }
  }, [expense, reset]);

  async function onSubmit(data: IAddExpenseForm) {
    if (saveExpenseMutation.isPending || disabled) return;

    await saveExpenseMutation.mutateAsync({
      id: expense?.id,
      expense: data,
    });
    reset(defaultValues);
    onClose?.();
  }

  return (
    <div className="px-6 py-6">
      <FormProvider {...methods}>
        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex w-full flex-col gap-5">
            <FormInput<IAddExpenseForm>
              name="name"
              label="Nazwa"
              className="w-full"
              inputClassName="h-10 rounded-xl border-slate-200 bg-slate-50 px-3 text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-slate-200"
            />

            <div className="grid w-full gap-4 sm:grid-cols-2">
              <ComboboxCategories
                label="Kategoria"
                name="category"
                className="w-full"
              />
              <FormCurrencyInput<IAddExpenseForm>
                name="cost"
                label="Wydatek"
                className="w-full"
                step="0.01"
                inputClassName="h-10 rounded-xl border-slate-200 bg-slate-50 px-3 text-slate-900 shadow-none focus-visible:ring-slate-200"
              />
              <div className="sm:col-span-2">
                <FormDatePicker<IAddExpenseForm> name="date" label="Data" />
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-2 border-t border-slate-100 pt-5">
            {showRemoveButton && (
              <Button
                type="button"
                variant="destructive"
                onClick={onRemove}
                disabled={saveExpenseMutation.isPending || disabled}
                className="mr-auto rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-none hover:bg-red-100"
              >
                Usuń
              </Button>
            )}

            <Button
              type="submit"
              disabled={saveExpenseMutation.isPending || disabled}
              className="rounded-xl bg-slate-900 px-5 text-white shadow-sm hover:bg-slate-800"
            >
              {saveExpenseMutation.isPending ? "Zapisywanie..." : isEdit ? "Zapisz" : "Dodaj"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
});

export default ExpenseForm;
