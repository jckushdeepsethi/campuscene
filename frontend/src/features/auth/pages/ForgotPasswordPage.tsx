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
    <AuthCard title="Reset your password" subtitle="Enter your account email to receive a 6-digit password reset OTP.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => forgotPasswordMutation.mutate(values))}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Email Address</span>
          <Input autoComplete="email" type="email" placeholder="e.g. rahul@university.edu" {...register("email")} />
          {errors.email && <span className="mt-1 block text-sm text-destructive">{errors.email.message}</span>}
        </label>
        {forgotPasswordMutation.isError && (
          <p className="text-sm text-destructive">
            {getErrorMessage(forgotPasswordMutation.error, "Unable to start password reset.")}
          </p>
        )}
        {forgotPasswordMutation.isSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
            <p className="text-xs font-semibold text-emerald-900">{forgotPasswordMutation.data.message}</p>
            {resetToken && (
              <div className="rounded-lg border border-emerald-300 bg-white p-2.5 text-center">
                <span className="block text-[10px] text-slate-500 font-medium">Development Mode OTP:</span>
                <span className="text-lg font-mono font-bold tracking-[6px] text-indigo-700">{resetToken}</span>
              </div>
            )}
            <Link
              to={`/reset-password?token=${resetToken || ""}`}
              className="block w-full text-center"
            >
              <Button type="button" className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                Enter 6-Digit OTP & Set New Password →
              </Button>
            </Link>
          </div>
        )}
        {!forgotPasswordMutation.isSuccess && (
          <Button className="w-full gap-2" disabled={forgotPasswordMutation.isPending} type="submit">
            <KeyRound size={18} />
            {forgotPasswordMutation.isPending ? "Sending OTP..." : "Send Reset OTP"}
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
