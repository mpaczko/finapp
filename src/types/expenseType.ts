import { IAddExpenseForm } from "../modules/ExpenseForm/addExpenseForm.config";

export type IExpense = IAddExpenseForm & { id?: number };
