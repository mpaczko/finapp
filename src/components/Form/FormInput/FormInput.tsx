import { InputHTMLAttributes } from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { cn } from "../../../lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../ui/Form";
import Input from "../../../ui/Input";

type FormInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  className?: string;
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name">;

const FormInput = <T extends FieldValues>({
  name,
  label,
  className,
  inputClassName,
  ...rest
}: FormInputProps<T>) => {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("col-span-1 text-start", className)}>
          <FormLabel className="flex gap-1 font-lexend text-sm font-normal">
            {label}
          </FormLabel>
          <FormControl>
            <Input
              {...rest}
              {...field}
              value={String(field.value ?? "")}
              className={inputClassName}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormInput;
