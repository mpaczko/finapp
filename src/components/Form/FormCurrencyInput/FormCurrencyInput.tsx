import { InputHTMLAttributes, useEffect, useState } from "react";
import {
  FieldPath,
  FieldValues,
  useFormContext,
  useWatch,
} from "react-hook-form";

import { cn } from "../../../lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../ui/Form";
import Input from "../../../ui/Input";

type FormCurrencyInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  className?: string;
  inputClassName?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name" | "type" | "value" | "onChange" | "onBlur"
>;

const formatCurrency = (value: unknown) => {
  const amount = typeof value === "number" ? value : Number(value);

  return `${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"} zł`;
};

const FormCurrencyInput = <T extends FieldValues>({
  name,
  label,
  className,
  inputClassName,
  ...rest
}: FormCurrencyInputProps<T>) => {
  const { control } = useFormContext<T>();
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const value = useWatch({ control, name });

  useEffect(() => {
    if (!isFocused) setDisplayValue(formatCurrency(value));
  }, [value, isFocused]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className={cn("col-span-1 text-start", className)}>
            <FormLabel className="flex gap-1 font-lexend text-sm font-normal">
              {label}
            </FormLabel>
            <FormControl>
              <Input
                {...rest}
                ref={field.ref}
                type="text"
                inputMode="decimal"
                value={displayValue}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  field.onBlur();
                }}
                onChange={(event) => {
                  const raw = event.target.value;
                  const numeric = raw.replace(/[^\d,.]/g, "").replace(",", ".");

                  setDisplayValue(raw);
                  field.onChange(numeric === "" ? 0 : Number(numeric));
                }}
                className={inputClassName}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default FormCurrencyInput;
