import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { AuthCard } from "../../../components/auth/AuthCard";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { getErrorMessage } from "../../../lib/errors";
import { loginSchema, type LoginFormValues } from "../schemas/authSchemas";
import { useLogin } from "../hooks/useAuth";

export const LoginPage = () => {
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  return (
    <AuthCard title="Welcome back" subtitle="Sign in with your campus account to continue.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => loginMutation.mutate(values))}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
          <Input autoComplete="email" type="email" {...register("email")} />
          {errors.email && <span className="mt-1 block text-sm text-destructive">{errors.email.message}</span>}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
          <Input autoComplete="current-password" type="password" {...register("password")} />
          {errors.password && <span className="mt-1 block text-sm text-destructive">{errors.password.message}</span>}
        </label>
        {loginMutation.isError && (
          <p className="text-sm text-destructive">
            {getErrorMessage(loginMutation.error, "Unable to sign in with those credentials.")}
          </p>
        )}
        <Button className="w-full gap-2" disabled={loginMutation.isPending} type="submit">
          <LogIn size={18} />
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link className="font-semibold text-primary hover:underline" to="/forgot-password">
          Forgot password?
        </Link>
      </p>
      <p className="mt-5 text-center text-sm text-slate-600">
        New to CampuScene?{" "}
        <Link className="font-semibold text-primary hover:underline" to="/register">
          Create account
        </Link>
      </p>
    </AuthCard>
  );
};
