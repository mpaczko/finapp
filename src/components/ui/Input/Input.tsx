import * as React from "react";

import { cn } from "../../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (type === "number" && newValue.startsWith("-")) {
        e.preventDefault();
      } else if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-lavender px-3 py-2 text-sm text-gray shadow-sm  ring-offset-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-spun-pearl",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
        min="0"
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
