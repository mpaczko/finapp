import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useFormContext } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { useCategoriesQuery } from "../../features/categories/queries";
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
  const { data: categories = [] } = useCategoriesQuery();
  const [open, setOpen] = useState(false);

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem
          className={cn("text-start flex-1 min-w-[200px] w-full", className)}
        >
          {label && (
            <FormLabel className="flex gap-1 text-sm font-medium text-foreground-soft">
              {label}
            </FormLabel>
          )}
          <FormControl>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "h-10 w-full min-w-0 justify-between rounded-xl border-border bg-surface-muted px-3 text-left text-foreground shadow-none hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-border",
                  )}
                >
                  <span className="truncate">
                    {field.value
                      ? (categories.find((c) => c.name === field.value)?.name ??
                        field.value)
                      : "Wybierz kategorię..."}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
              </PopoverTrigger>

              <PopoverPortal>
                <PopoverContent
                  className="z-[60] max-h-80 w-[--radix-popover-trigger-width] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface p-1 shadow-xl"
                  align="start"
                  sideOffset={8}
                  onWheel={(event) => event.stopPropagation()}
                >
                  <Command className="h-full">
                    <CommandInput placeholder="Wyszukaj kategorię..." />
                    <CommandList className="max-h-72 overflow-y-auto overscroll-contain">
                      <CommandEmpty>Nie znaleziono kategorii</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.name}
                            onSelect={(currentValue) => {
                              const newValue =
                                currentValue === field.value
                                  ? ""
                                  : currentValue;
                              field.onChange(newValue);
                              setOpen(false);
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
              </PopoverPortal>
            </Popover>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
