import { useFormContext } from "react-hook-form";
import { InputHTMLAttributes, useState, useEffect } from "react";

import { cn } from "../../../lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../ui/Form";
import Input from "../../../ui/Input";

type IProps<T> = {
  name: keyof T;
  label?: string;
  className?: string;
  inputClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const FormInput = <T,>({
  name,
  label,
  className,
  inputClassName,
  type,
  ...rest
}: IProps<T>) => {
  const { control, setValue, watch } = useFormContext();
  const value = watch(name as string);

  const [displayValue, setDisplayValue] = useState(value ?? "");
  const [isFocused, setIsFocused] = useState(false);

  // Update display value without touching form state
  useEffect(() => {
    if (!isFocused && type === "number" && name === "cost") {
      const num = parseFloat(value as any);
      setDisplayValue(`${!isNaN(num) ? num.toFixed(2) : "0.00"} zł`);
    } else if (!isFocused) {
      setDisplayValue(value ?? "");
    }
  }, [value, isFocused, name, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (type === "number" && name === "cost") {
      // extract numeric part only
      const numeric = raw.replace(/[^\d,\.]/g, "").replace(",", ".");
      setValue(name as any, numeric ? parseFloat(numeric) : 0); // **always numeric**
      setDisplayValue(raw); // display keeps user's typing
    } else {
      setValue(name as any, raw);
      setDisplayValue(raw);
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem className={cn("col-span-1 text-start", className)}>
          <FormLabel className="flex gap-1 font-lexend text-sm font-normal">
            {label}
          </FormLabel>
          <FormControl>
            <Input
              {...rest}
              value={displayValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              type={type === "number" && name === "cost" ? "text" : type}
              className={inputClassName}
              inputMode={type === "number" ? "decimal" : undefined}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormInput;
