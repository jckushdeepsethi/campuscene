import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-sky-600",
  secondary: "bg-slate-900 text-white hover:bg-slate-800",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100"
};

export const Button = ({ className, variant = "primary", ...props }: ButtonProps) => (
  <button
    className={cn(
      "inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
      variantClasses[variant],
      className
    )}
    {...props}
  />
);

