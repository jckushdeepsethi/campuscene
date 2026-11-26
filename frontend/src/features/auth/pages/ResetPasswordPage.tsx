import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, RotateCcwKey, ShieldAlert } from "lucide-react";
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
    <AuthCard title="Reset password with OTP" subtitle="Enter your 6-digit reset code and create a new secure password.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => resetPasswordMutation.mutate(values))}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">6-Digit Reset OTP Code</span>
          <Input
            autoComplete="one-time-code"
            placeholder="— — — — — —"
            maxLength={6}
            className="text-center font-mono text-xl tracking-[8px] font-bold h-12 uppercase text-indigo-700 bg-slate-50 focus:bg-white placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm"
            {...register("token")}
          />
          {errors.token && <span className="mt-1 block text-sm text-destructive">{errors.token.message}</span>}
          {!searchParams.get("token") && (
            <p className="mt-1 text-[11px] text-slate-500">
              Haven't received a code yet?{" "}
              <Link to="/forgot-password" className="text-primary font-semibold underline">
                Send OTP to your email
              </Link>
            </p>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">New Password</span>
          <Input autoComplete="new-password" type="password" placeholder="At least 8 chars, 1 uppercase, 1 number" {...register("password")} />
          {errors.password && <span className="mt-1 block text-sm text-destructive">{errors.password.message}</span>}
        </label>

        {resetPasswordMutation.isError && (
          <p className="text-sm text-destructive">
            {getErrorMessage(resetPasswordMutation.error, "Invalid or expired reset OTP code.")}
          </p>
        )}

        {resetPasswordMutation.isSuccess && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-2 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-sm">
              <CheckCircle2 size={18} className="text-emerald-600" />
              Password Reset Successfully!
            </div>
            <p className="text-xs text-emerald-700">
              Your password has been updated. You can now log in with your new password.
            </p>
            <Link to="/login" className="inline-block mt-2">
              <Button type="button" className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                Sign In With New Password
              </Button>
            </Link>
          </div>
        )}

        {!resetPasswordMutation.isSuccess && (
          <Button className="w-full gap-2" disabled={resetPasswordMutation.isPending} type="submit">
            <RotateCcwKey size={18} />
            {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
          </Button>
        )}
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
