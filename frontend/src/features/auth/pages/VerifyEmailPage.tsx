import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, KeyRound, MailCheck, RefreshCw, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { AuthCard } from "../../../components/auth/AuthCard";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { getErrorMessage } from "../../../lib/errors";
import { useVerifyEmail } from "../hooks/useAuth";
import { authApi } from "../services/authApi";
import { tokenSchema, type TokenFormValues } from "../schemas/authSchemas";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const verifyEmailMutation = useVerifyEmail();
  const [resendEmail, setResendEmail] = useState(searchParams.get("email") || "");
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    success: boolean;
    message: string;
    devOtp?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<TokenFormValues>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      token: searchParams.get("token") ?? ""
    }
  });

  const handleResendOtp = async () => {
    if (!resendEmail || !resendEmail.includes("@")) {
      alert("Please enter a valid email address to resend the OTP.");
      return;
    }
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await authApi.resendVerification(resendEmail);
      setResendStatus({
        success: true,
        message: res.message || "A new 6-digit OTP code has been dispatched.",
        devOtp: res.data?.verificationToken
      });
      if (res.data?.verificationToken) {
        setValue("token", res.data.verificationToken);
      }
    } catch (err: any) {
      setResendStatus({
        success: false,
        message: getErrorMessage(err, "Failed to resend verification OTP.")
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthCard
      title="Verify your email with OTP"
      subtitle="Enter the 6-digit verification code sent to your email to activate your account."
    >
      <form className="space-y-4" onSubmit={handleSubmit((values) => verifyEmailMutation.mutate(values))}>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-center space-y-1">
          <p className="text-xs font-semibold text-indigo-950 flex items-center justify-center gap-1.5">
            <ShieldCheck size={16} className="text-indigo-600" /> Secure Email Verification
          </p>
          <p className="text-[11px] text-slate-600">
            Accounts are only activated once email authenticity is proven via OTP.
          </p>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">6-Digit Verification OTP</span>
          <Input
            autoComplete="one-time-code"
            placeholder="— — — — — —"
            maxLength={6}
            className="text-center font-mono text-xl tracking-[8px] font-bold h-12 uppercase text-indigo-700 bg-slate-50 focus:bg-white placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm"
            {...register("token")}
          />
          {errors.token && <span className="mt-1 block text-sm text-destructive">{errors.token.message}</span>}
        </label>

        {verifyEmailMutation.isError && (
          <p className="text-sm text-destructive">
            {getErrorMessage(verifyEmailMutation.error, "Invalid or expired OTP. Please check your email and try again.")}
          </p>
        )}

        {verifyEmailMutation.isSuccess && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-2 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-sm">
              <CheckCircle2 size={18} className="text-emerald-600" />
              Email Verified Successfully!
            </div>
            <p className="text-xs text-emerald-700">
              Your account has been verified and activated. You can now sign in.
            </p>
            <Link to="/login" className="inline-block mt-2">
              <Button type="button" className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                Proceed to Sign In
              </Button>
            </Link>
          </div>
        )}

        {!verifyEmailMutation.isSuccess && (
          <Button className="w-full gap-2" disabled={verifyEmailMutation.isPending} type="submit">
            <MailCheck size={18} />
            {verifyEmailMutation.isPending ? "Verifying..." : "Verify & Activate Account"}
          </Button>
        )}
      </form>

      {/* Resend OTP Section */}
      {!verifyEmailMutation.isSuccess && (
        <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <RefreshCw size={14} className="text-indigo-600" /> Didn't get the code?
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="email"
              placeholder="Enter your registered email..."
              className="text-xs h-9 bg-slate-50"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              className="h-9 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shrink-0 cursor-pointer"
              disabled={isResending}
              onClick={handleResendOtp}
            >
              {isResending ? "Sending..." : "Resend OTP"}
            </Button>
          </div>

          {resendStatus && (
            <div
              className={`rounded-lg p-2.5 text-xs ${
                resendStatus.success
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              <p>{resendStatus.message}</p>
              {resendStatus.devOtp && (
                <div className="mt-2 flex items-center justify-between rounded bg-white p-2 border border-emerald-200">
                  <span className="text-[11px] font-mono text-slate-600">
                    Latest OTP: <strong className="text-indigo-700 font-bold text-sm tracking-widest">{resendStatus.devOtp}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setValue("token", resendStatus.devOtp!)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <p className="mt-5 text-center text-sm text-slate-600">
        Ready to continue?{" "}
        <Link className="font-semibold text-primary hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
};
