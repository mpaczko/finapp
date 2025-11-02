"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { cn } from "../../../lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";

import { useAppSelector } from "../../../store/reduxHook";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../ui/Form";
import { Button } from "../../../ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../ui/Command";

type ComboboxCategoriesProps = {
  name: string;
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
            <Popover>
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
                      ? categories.find((fw) => fw.name === field.value)?.name
                      : "Wybierz kategorie..."}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0 h-80 overflow-y-auto"
                align="start"
              >
                <Command className="h-80">
                  <CommandInput placeholder="Wyszukaj kategorie..." />
                  <CommandList className="overflow-y-auto">
                    <CommandEmpty>Nie znaleziono kategorii</CommandEmpty>
                    <CommandGroup>
                      {categories.map((categories) => (
                        <CommandItem
                          key={categories.id}
                          value={categories.name}
                          onSelect={(currentValue) =>
                            field.onChange(
                              currentValue === field.value ? "" : currentValue
                            )
                          }
                          className="cursor-pointer"
                        >
                          <span className="truncate">{categories.name}</span>
                          {field.value === categories.name && (
                            <Check className="mr-0 ml-auto h-4 w-4" />
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
