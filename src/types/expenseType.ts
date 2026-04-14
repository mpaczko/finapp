import { IAddExpenseForm } from "../modules/ExpenseDialog/ExpenseForm/addExpenseForm.config";

export type IExpense = IAddExpenseForm & { id?: string };
