import { lazy, Suspense, useState } from "react";

import { Button } from "../../ui/Button";
import type { ExpenseDialogProps } from "./ExpenseDialog";

const ExpenseDialog = lazy(() => import("./ExpenseDialog"));

type Props = Omit<ExpenseDialogProps, "defaultOpen">;

const DeferredExpenseDialog = ({ triggerLabel, ...props }: Props) => {
  const [requested, setRequested] = useState(false);
  const label = triggerLabel || (props.expense ? "Edytuj" : "Dodaj wydatek");

  if (!requested) {
    return <Button onClick={() => setRequested(true)}>{label}</Button>;
  }

  return (
    <Suspense fallback={<Button disabled>Ładowanie...</Button>}>
      <ExpenseDialog {...props} triggerLabel={triggerLabel} defaultOpen />
    </Suspense>
  );
};

export default DeferredExpenseDialog;
