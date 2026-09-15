"use client";

import { useState } from "react";

import { IExpense } from "../../types/expenseType";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/Dialog";
import { Button } from "../../ui/Button";
import ExpenseForm from "./ExpenseForm";

export type ExpenseDialogProps = {
  isEdit?: boolean;
  expense?: IExpense;
  triggerLabel?: string;
  defaultOpen?: boolean;
};

const ExpenseDialog = ({
  isEdit,
  expense,
  triggerLabel,
  defaultOpen = false,
}: ExpenseDialogProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          {triggerLabel || (expense ? "Edytuj" : "Dodaj wydatek")}
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-visible rounded-3xl border-slate-100 bg-white p-0 shadow-2xl sm:max-w-xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5 pr-12">
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
            {expense ? "Edytuj wydatek" : "Wprowadź swój wydatek"}
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm text-slate-500">
            {expense
              ? "Zaktualizuj dane wydatku i zapisz zmiany."
              : "Uzupełnij szczegóły, aby dodać wydatek do budżetu."}
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm
          isEdit={isEdit}
          expense={expense}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
