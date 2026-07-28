import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "h-11 w-full rounded-md border border-input bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20",
      className
    )}
    {...props}
  />
);

