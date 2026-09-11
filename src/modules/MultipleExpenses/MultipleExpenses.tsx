"use client";

import { useRef, useState } from "react";

import { useCreateManyExpensesMutation } from "../../features/expenses/queries";
import { useAppSelector } from "../../store/reduxHook";
import { Button } from "../../ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/Dialog";
import { CsvIssue, Transaction } from "./MultipleExpenses.types";
import { parseCSV } from "./parseCSV";

const ExpensesDialog = () => {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [invalidRows, setInvalidRows] = useState<CsvIssue[]>([]);
  const [warnings, setWarnings] = useState<CsvIssue[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);
  const createManyMutation = useCreateManyExpensesMutation(selectedMonth);

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

  const importExpenses = async () => {
    if (!expenses.length || createManyMutation.isPending) return;
    await createManyMutation.mutateAsync(expenses.map(({ id: _id, ...expense }) => expense));
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

      <DialogContent className="bg-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Podgląd importu</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto">
          <p className="text-sm">Poprawne wydatki: {expenses.length}. Błędne wiersze: {invalidRows.length}.</p>

          {expenses.length > 0 && (
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left"><th className="p-2">Data</th><th className="p-2">Opis</th><th className="p-2">Kategoria</th><th className="p-2">Kwota</th></tr></thead>
                <tbody>{expenses.map((expense) => (
                  <tr key={expense.id} className="border-b last:border-0"><td className="p-2">{expense.date}</td><td className="p-2">{expense.name}</td><td className="p-2">{expense.category}</td><td className="p-2">{expense.cost.toFixed(2)}</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {(invalidRows.length > 0 || warnings.length > 0) && (
            <div className="space-y-2">
              {invalidRows.map((issue, index) => <p key={`error-${index}`} className="text-sm text-red-600">{issue.fileName ? `${issue.fileName}, ` : ""}wiersz {issue.line}: {issue.reason}</p>)}
              {warnings.map((issue, index) => <p key={`warning-${index}`} className="text-sm text-amber-600">{issue.fileName ? `${issue.fileName}, ` : ""}wiersz {issue.line}: {issue.reason}</p>)}
            </div>
          )}

          {createManyMutation.error && <p className="text-sm text-red-600">Nie udało się zaimportować wydatków: {createManyMutation.error.message}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={createManyMutation.isPending}>Anuluj</Button>
          <Button onClick={() => void importExpenses()} disabled={!expenses.length || createManyMutation.isPending}>
            {createManyMutation.isPending ? "Importowanie..." : `Importuj ${expenses.length} wydatków`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpensesDialog;
