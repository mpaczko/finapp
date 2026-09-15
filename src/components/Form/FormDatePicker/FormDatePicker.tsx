import { useController, FieldValues, Path } from "react-hook-form";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from "@radix-ui/react-popover";

import { pl } from "date-fns/locale";
import { format, parse } from "date-fns";
import { Button } from "../../../ui/Button";

type Props<T extends FieldValues> = {
  name: Path<T>;
  label: string;
};

function FormDatePicker<T extends FieldValues>({ name, label }: Props<T>) {
  const {
    field: { value, onChange },
  } = useController({ name });

  // Safely parse only if `value` is a string in "yyyy-MM-dd" format
  const selectedDate =
    typeof value === "string" && value.trim() !== ""
      ? parse(value, "yyyy-MM-dd", new Date())
      : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-start rounded-xl border-slate-200 bg-slate-50 px-3 text-left font-normal text-slate-900 shadow-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-200"
          >
            {selectedDate
              ? selectedDate.toLocaleDateString("pl-PL")
              : "Wybierz datę"}
          </Button>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            className="z-[60] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
            align="start"
            side="top"
            sideOffset={8}
          >
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(day) => {
                if (day) {
                  // Always save as plain yyyy-MM-dd string (no UTC issues)
                  const localDateString = format(day, "yyyy-MM-dd");
                  onChange(localDateString);
                } else {
                  onChange(""); // clear date if user unselects
                }
              }}
              locale={pl}
            />
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  );
}

export default FormDatePicker;
