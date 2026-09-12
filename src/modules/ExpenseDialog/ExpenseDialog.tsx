"use client";

import { useState } from "react";

import { IExpense } from "../../types/expenseType";
import {
  Dialog,
  DialogContent,
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
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="pb-5">
            {expense ? "Edytuj wydatek" : "Wprowadź swój wydatek"}
          </DialogTitle>
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
