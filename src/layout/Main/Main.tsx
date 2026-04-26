import ElementsTable from "../../modules/AllExpensesTable";
import CategoriesSummaryTable from "../../modules/CategoriesSummaryTable";
import SummaryTable from "../../modules/SummaryTable";
import { useAppSelector } from "../../store/reduxHook";

type Props = {
  fetchExpenses: (month: string) => Promise<void>;
};

const Main = ({ fetchExpenses }: Props) => {
  const selectedMonth = useAppSelector((state) => state.config.selectedMonth);

  return (
    <main className="pt-20 flex flex-wrap gap-2 px-6 pb-20">
      <CategoriesSummaryTable />

      <div>
        <SummaryTable />
        <ElementsTable
          onDelete={async () => {
            await fetchExpenses(selectedMonth);
          }}
        />
      </div>
    </main>
  );
};

export default Main;
