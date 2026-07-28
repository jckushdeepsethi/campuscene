import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcwKey } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { AuthCard } from "../../../components/auth/AuthCard";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { getErrorMessage } from "../../../lib/errors";
import { useResetPassword } from "../hooks/useAuth";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas/authSchemas";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const resetPasswordMutation = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: searchParams.get("token") ?? "",
      password: ""
    }
  });

  return (
    <AuthCard title="Choose a new password" subtitle="Paste your reset token and create a stronger password for your account.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => resetPasswordMutation.mutate(values))}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Reset token</span>
          <Input autoComplete="one-time-code" {...register("token")} />
          {errors.token && <span className="mt-1 block text-sm text-destructive">{errors.token.message}</span>}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">New password</span>
          <Input autoComplete="new-password" type="password" {...register("password")} />
          {errors.password && <span className="mt-1 block text-sm text-destructive">{errors.password.message}</span>}
        </label>
        {resetPasswordMutation.isError && (
          <p className="text-sm text-destructive">
            {getErrorMessage(resetPasswordMutation.error, "Unable to reset password with this token.")}
          </p>
        )}
        <Button className="w-full gap-2" disabled={resetPasswordMutation.isPending} type="submit">
          <RotateCcwKey size={18} />
          {resetPasswordMutation.isPending ? "Resetting..." : "Reset password"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">
        Already reset it?{" "}
        <Link className="font-semibold text-primary hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
};
