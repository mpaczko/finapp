import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useFormContext } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { useAppSelector } from "../../store/reduxHook";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/Form";
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
  name: "category";
  label?: string;
  className?: string;
};

export function ComboboxCategories({
  name,
  label,
  className,
}: ComboboxCategoriesProps) {
  const { control } = useFormContext();
  const categories = useAppSelector((state) => state.categories.items);
  const [open, setOpen] = useState(false);

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className={cn("text-start flex-1 min-w-0 w-full", className)}>
          {label && (
            <FormLabel className="flex gap-1 font-lexend text-sm font-normal">
              {label}
            </FormLabel>
          )}
          <FormControl>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={!!field.value}
                  className={cn(
                    "flex-1 min-w-0 w-full h-10 justify-between text-left truncate"
                  )}
                >
                  <span className="truncate">
                    {field.value
                      ? categories.find((c) => c.name === field.value)?.name
                      : "Wybierz kategorię..."}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0 max-h-80 overflow-y-auto"
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
                              currentValue === field.value ? "" : currentValue;
                            field.onChange(newValue);
                            setOpen(false); // close popover on selection
                          }}
                          className="cursor-pointer"
                        >
                          <span className="truncate">{category.name}</span>
                          {field.value === category.name && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
