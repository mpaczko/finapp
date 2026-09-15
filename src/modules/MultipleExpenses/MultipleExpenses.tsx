"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "../../ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/Dialog";
import ExpenseForm from "../ExpenseDialog/ExpenseForm";
import { CsvIssue, Transaction } from "./MultipleExpenses.types";
import { parseCSV } from "./parseCSV";

const ExpensesDialog = () => {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [invalidRows, setInvalidRows] = useState<CsvIssue[]>([]);
  const [warnings, setWarnings] = useState<CsvIssue[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resetImport = () => {
    setExpenses([]);
    setInvalidRows([]);
    setWarnings([]);
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
    setExpenses((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== id),
    );
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

      <DialogContent className="bg-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Podgląd importu</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto">
          <p className="text-sm">Poprawne wydatki: {expenses.length}. Błędne wiersze: {invalidRows.length}.</p>

          {expenses.map(({ id, ...expense }) => (
            <div key={id} className="rounded border p-3">
              <ExpenseForm
                expense={expense}
                onClose={() => removeExpense(id)}
                onRemove={() => removeExpense(id)}
                showRemoveButton={expenses.length > 1}
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
      </DialogContent>
    </Dialog>
  );
};

export default ExpensesDialog;
