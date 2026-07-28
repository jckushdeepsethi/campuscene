import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { AuthCard } from "../../../components/auth/AuthCard";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { getErrorMessage } from "../../../lib/errors";
import { useVerifyEmail } from "../hooks/useAuth";
import { tokenSchema, type TokenFormValues } from "../schemas/authSchemas";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const verifyEmailMutation = useVerifyEmail();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TokenFormValues>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      token: searchParams.get("token") ?? ""
    }
  });

  return (
    <AuthCard title="Verify your email" subtitle="Paste the verification token for your CampusConnect account.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => verifyEmailMutation.mutate(values))}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Verification token</span>
          <Input autoComplete="one-time-code" {...register("token")} />
          {errors.token && <span className="mt-1 block text-sm text-destructive">{errors.token.message}</span>}
        </label>
        {verifyEmailMutation.isError && (
          <p className="text-sm text-destructive">
            {getErrorMessage(verifyEmailMutation.error, "Unable to verify email with this token.")}
          </p>
        )}
        {verifyEmailMutation.isSuccess && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Email verified successfully. You can now sign in.
          </p>
        )}
        <Button className="w-full gap-2" disabled={verifyEmailMutation.isPending || verifyEmailMutation.isSuccess} type="submit">
          <MailCheck size={18} />
          {verifyEmailMutation.isPending ? "Verifying..." : "Verify email"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">
        Ready to continue?{" "}
        <Link className="font-semibold text-primary hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
};
