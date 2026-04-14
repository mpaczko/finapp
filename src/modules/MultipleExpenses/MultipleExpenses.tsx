"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../../ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/Dialog";

import ExpenseForm from "../ExpenseDialog/ExpenseForm";
import { Transaction } from "./MultipleExpenses.types";
import { parseCSV } from "./parseCSV";

const ExpensesDialog = () => {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (!isOpen) {
      setExpenses([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    if (expenses.length === 0 && open) {
      setOpen(false);
    }
  }, [expenses, open]);

  const handleRemoveExpense = (idToRemove?: string) =>
    setExpenses((prev) => prev.filter((exp) => exp.id !== idToRemove));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="flex">
        <Button onClick={() => fileInputRef.current?.click()}>
          Wgraj plik CSV
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv"
          className="hidden"
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            let all: Transaction[] = [];

            for (const file of files) {
              const text = await file.text();
              all = [...all, ...parseCSV(text)];
            }

            setExpenses(all);

            if (all.length > 0) {
              setOpen(true);
            }
          }}
        />
      </div>

      <DialogContent className="bg-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Twoje wydatki</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {expenses.map((expense) => {
            const { id, ...expenseWithoutId } = expense;

            return (
              <div key={id} className=" border p-3 rounded">
                <ExpenseForm
                  expense={expenseWithoutId}
                  onClose={() => handleRemoveExpense(id)}
                />
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpensesDialog;
