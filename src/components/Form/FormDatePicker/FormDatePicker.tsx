import { useController, FieldValues, Path } from "react-hook-form";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  Popover,
  PopoverContent,
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
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="justify-start h-[40px] text-left font-normal w-full"
          >
            {selectedDate
              ? selectedDate.toLocaleDateString("pl-PL")
              : "Wybierz datę"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 bg-white shadow-md rounded-md">
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
      </Popover>
    </div>
  );
}

export default FormDatePicker;
