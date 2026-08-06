import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { useAppSelector } from "../../store/reduxHook";
import { cn } from "../../lib/utils";
import { Button } from "../../ui/Button";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command,
} from "../../ui/Command";

type ComboboxCategoriesProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
};

export function ComboboxCategoriesStandalone({
  value,
  onChange,
  label,
  className,
}: ComboboxCategoriesProps) {
  const categories = useAppSelector((state) => state.categories.items);
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("text-start flex-1 min-w-[200px] w-full", className)}>
      {label && (
        <label className="flex gap-1 font-lexend text-sm font-normal">
          {label}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={!!value}
            className="flex-1 min-w-0 w-full h-10 justify-between text-left truncate rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <span className="truncate">
              {value
                ? categories.find((c) => c.name === value)?.name
                : "Wybierz kategorię..."}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[--radix-popover-trigger-width] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-lg max-h-80"
          align="start"
        >
          <Command className="h-full">
            <CommandInput placeholder="Wyszukaj kategorię..." />
            <CommandList className="overflow-y-auto max-h-72">
              <CommandEmpty>Nie znaleziono kategorii</CommandEmpty>

              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={(currentValue) => {
                      const newValue =
                        currentValue === value ? "" : currentValue;
                      onChange(newValue);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <span className="truncate">{category.name}</span>
                    {value === category.name && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
