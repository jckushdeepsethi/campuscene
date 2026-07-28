import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Select = ({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={cn(
      "h-11 w-full rounded-md border border-input bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
      className
    )}
    {...props}
  />
);

