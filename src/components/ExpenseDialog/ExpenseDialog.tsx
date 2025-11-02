"use client";

import { useState } from "react";

import ExpenseForm from "../../modules/ExpenseForm";
import { IExpense } from "../../types/expenseType";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/Dialog";
import { Button } from "../../ui/Button";

type Props = {
  expense?: IExpense;
  triggerLabel?: string;
};

const ExpenseDialog = ({ expense, triggerLabel }: Props) => {
  const [open, setOpen] = useState(false);

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
        <ExpenseForm expense={expense} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
