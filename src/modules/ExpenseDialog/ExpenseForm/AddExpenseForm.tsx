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
  const saveExpenseMutation = useSaveExpenseMutation();

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
      // API responses include read-only fields (for example `id` and
      // `created_at`). Reset only the fields that belong to this form so they
      // cannot be submitted back with an update request.
      reset({
        name: expense.name,
        category: expense.category,
        date: expense.date,
        cost: expense.cost,
      });
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
              inputClassName="h-10 rounded-xl border-border bg-surface-muted px-3 text-foreground shadow-none placeholder:text-subtle focus-visible:ring-border"
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
                inputClassName="h-10 rounded-xl border-border bg-surface-muted px-3 text-foreground shadow-none focus-visible:ring-border"
              />
              <div className="sm:col-span-2">
                <FormDatePicker<IAddExpenseForm> name="date" label="Data" />
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-2 border-t border-border-soft pt-5">
            {showRemoveButton && (
              <Button
                type="button"
                variant="destructive"
                onClick={onRemove}
                disabled={saveExpenseMutation.isPending || disabled}
                className="mr-auto rounded-xl border border-danger-border bg-danger-surface text-danger shadow-none hover:bg-danger-surface"
              >
                Usuń
              </Button>
            )}

            <Button
              type="submit"
              disabled={saveExpenseMutation.isPending || disabled}
              className="rounded-xl bg-primary px-5 text-primary-foreground shadow-sm hover:bg-primary-hover"
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
