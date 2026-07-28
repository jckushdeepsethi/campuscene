import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { AuthCard } from "../../../components/auth/AuthCard";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { getErrorMessage } from "../../../lib/errors";
import { useForgotPassword } from "../hooks/useAuth";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas/authSchemas";

export const ForgotPasswordPage = () => {
  const forgotPasswordMutation = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const resetToken = forgotPasswordMutation.data?.data?.resetToken;

  return (
    <AuthCard title="Reset your password" subtitle="Enter your account email and use the reset token to set a new password.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => forgotPasswordMutation.mutate(values))}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
          <Input autoComplete="email" type="email" {...register("email")} />
          {errors.email && <span className="mt-1 block text-sm text-destructive">{errors.email.message}</span>}
        </label>
        {forgotPasswordMutation.isError && (
          <p className="text-sm text-destructive">
            {getErrorMessage(forgotPasswordMutation.error, "Unable to start password reset.")}
          </p>
        )}
        {forgotPasswordMutation.isSuccess && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <p>{forgotPasswordMutation.data.message}</p>
            {resetToken && <p className="mt-2 break-all font-mono text-xs">Development reset token: {resetToken}</p>}
          </div>
        )}
        <Button className="w-full gap-2" disabled={forgotPasswordMutation.isPending} type="submit">
          <KeyRound size={18} />
          {forgotPasswordMutation.isPending ? "Sending..." : "Send reset token"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">
        Remembered your password?{" "}
        <Link className="font-semibold text-primary hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
};
