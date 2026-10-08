import { format } from "date-fns";
import { pl } from "date-fns/locale";
import DeferredExpenseDialog from "../../ExpenseDialog/DeferredExpenseDialog";

type Expense = {
  id: string;
  name: string;
  category: string;
  date: string;
  cost: number;
};

type Props = {
  expenses: Expense[];
  rowColorByDate: Map<string, string>;
  handleDelete: (id?: string) => Promise<void> | void;
};

const ExpensesTable = ({ expenses, rowColorByDate, handleDelete }: Props) => {
  return (
    <div className="mx-auto max-w-[1360px] overflow-x-auto rounded-3xl border border-border-soft bg-surface shadow-sm">
      <table className="w-full min-w-[680px] table-fixed">
        <thead>
          <tr className="bg-surface-muted text-left text-xs uppercase tracking-wider text-muted">
            <th className="w-[26%] px-4 py-3">Nazwa</th>
            <th className="w-[23%] px-4 py-3">Kategoria</th>
            <th className="w-[14%] px-2 py-3 whitespace-nowrap">Data</th>
            <th className="w-[13%] px-2 py-3 whitespace-nowrap">Koszt</th>
            <th className="w-[24%] px-2 py-3 text-center whitespace-nowrap">
              Akcje
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-row-divider">
          {expenses.map((el) => {
            const dateKey = format(new Date(el.date), "yyyy-MM-dd");
            const rowBg = rowColorByDate.get(dateKey) ?? "bg-surface";

            return (
              <tr
                key={el.id}
                className={`${rowBg} transition-colors hover:bg-surface-muted`}
              >
                <td className="px-4 py-3 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-foreground">
                  <span className="block truncate">{el.name}</span>
                </td>
                <td className="px-4 py-3 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-foreground">
                  <span className="block truncate">{el.category}</span>
                </td>
                <td className="px-2 py-3 whitespace-nowrap text-sm text-foreground">
                  {format(new Date(el.date), "dd.MM.yyyy", { locale: pl })}
                </td>
                <td className="px-2 py-3 whitespace-nowrap text-sm text-foreground">
                  {el.cost.toFixed(2)} zł
                </td>
                <td className="px-2 py-3 text-center">
                  <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <DeferredExpenseDialog
                      expense={el}
                      isEdit
                      triggerLabel="Edytuj"
                    />
                    <button
                      onClick={() => handleDelete(el.id)}
                      className="px-2 py-1 text-sm rounded-lg border border-danger-border text-danger hover:bg-danger-surface"
                    >
                      Usuń
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ExpensesTable;
