"use client";

import { useEffect, useRef, useState } from "react";

import { useCreateManyExpensesMutation } from "../../features/expenses/queries";
import { useAppSelector } from "../../store/reduxHook";
import { Button } from "../../ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/Dialog";
import ExpenseForm, {
  type ExpenseFormHandle,
} from "../ExpenseDialog/ExpenseForm/AddExpenseForm";
import { CsvIssue, Transaction } from "./MultipleExpenses.types";
import { parseCSV } from "./parseCSV";

const ExpensesDialog = () => {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [invalidRows, setInvalidRows] = useState<CsvIssue[]>([]);
  const [warnings, setWarnings] = useState<CsvIssue[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formRefs = useRef<Record<string, ExpenseFormHandle | null>>({});
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);
  const createManyMutation = useCreateManyExpensesMutation(selectedMonth);

  const resetImport = () => {
    setExpenses([]);
    setInvalidRows([]);
    setWarnings([]);
    formRefs.current = {};
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetImport();
  };

  useEffect(() => {
    if (open && expenses.length === 0) handleOpenChange(false);
  }, [expenses.length, open]);

  const handleFiles = async (files: File[]) => {
    const results = await Promise.all(
      files.map(async (file) => ({ fileName: file.name, result: parseCSV(await file.text()) })),
    );

    setExpenses(results.flatMap(({ result }) => result.validRows));
    setInvalidRows(results.flatMap(({ fileName, result }) =>
      result.invalidRows.map((issue) => ({ ...issue, fileName })),
    ));
    setWarnings(results.flatMap(({ fileName, result }) =>
      result.warnings.map((issue) => ({ ...issue, fileName })),
    ));
    setOpen(true);
  };

  const removeExpense = (id: string) => {
    delete formRefs.current[id];
    setExpenses((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== id),
    );
  };

  const importAllExpenses = async () => {
    if (!expenses.length || createManyMutation.isPending) return;

    const forms = expenses
      .map((expense) => formRefs.current[expense.id])
      .filter((form): form is ExpenseFormHandle => form !== null && form !== undefined);
    if (forms.length !== expenses.length) return;

    const validationResults = await Promise.all(forms.map((form) => form.validate()));
    if (validationResults.some((isValid) => !isValid)) return;

    await createManyMutation.mutateAsync(forms.map((form) => form.getValues()));
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="flex">
        <Button onClick={() => fileInputRef.current?.click()}>Wgraj plik CSV</Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => void handleFiles(Array.from(event.target.files ?? []))}
        />
      </div>

      <DialogContent className="overflow-visible rounded-3xl border-slate-100 bg-white p-0 shadow-2xl sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5 pr-12">
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
            Dodaj kilka wydatków
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm text-slate-500">
            Sprawdź dane i dodaj wszystkie pozycje jednocześnie albo zapisz je pojedynczo.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(65vh,680px)] space-y-4 overflow-y-auto px-6 py-5">
          <p className="text-sm text-slate-600">
            Poprawne wydatki: <span className="font-semibold text-slate-900">{expenses.length}</span>. Błędne wiersze: {invalidRows.length}.
          </p>

          {expenses.map(({ id, ...expense }) => (
            <div key={id} className="overflow-visible rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
              <ExpenseForm
                ref={(form) => {
                  formRefs.current[id] = form;
                }}
                expense={expense}
                onClose={() => removeExpense(id)}
                onRemove={() => removeExpense(id)}
                showRemoveButton={expenses.length > 1}
                disabled={createManyMutation.isPending}
              />
            </div>
          ))}

          {(invalidRows.length > 0 || warnings.length > 0) && (
            <div className="space-y-2">
              {invalidRows.map((issue, index) => <p key={`error-${index}`} className="text-sm text-red-600">{issue.fileName ? `${issue.fileName}, ` : ""}wiersz {issue.line}: {issue.reason}</p>)}
              {warnings.map((issue, index) => <p key={`warning-${index}`} className="text-sm text-amber-600">{issue.fileName ? `${issue.fileName}, ` : ""}wiersz {issue.line}: {issue.reason}</p>)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={createManyMutation.isPending}
            className="rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Anuluj
          </Button>
          <Button
            type="button"
            onClick={() => void importAllExpenses()}
            disabled={!expenses.length || createManyMutation.isPending}
            className="rounded-xl bg-slate-900 px-5 text-white shadow-sm hover:bg-slate-800"
          >
            {createManyMutation.isPending
              ? "Dodawanie..."
              : `Dodaj wszystkie (${expenses.length})`}
          </Button>
        </div>

        {createManyMutation.error && (
          <p className="px-6 pb-5 text-sm text-red-600">
            Nie udało się dodać wydatków: {createManyMutation.error.message}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExpensesDialog;
