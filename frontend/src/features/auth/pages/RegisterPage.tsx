import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert, UserCheck, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { AuthCard } from "../../../components/auth/AuthCard";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { getErrorMessage } from "../../../lib/errors";
import { useRegister } from "../hooks/useAuth";
import { registerSchema, type RegisterFormValues } from "../schemas/authSchemas";

const roles = [
  { value: "STUDENT", label: "Student" },
  { value: "SOCIETY", label: "Society / Club" },
  { value: "PLACEMENT_CELL", label: "Placement Cell" },
  { value: "ADMIN", label: "University Admin" }
] as const;

export const RegisterPage = () => {
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
      adminSecretKey: "",
      collegeName: "",
      rollNumber: "",
      branch: "",
      passingYear: "" as any
    }
  });

  const selectedRole = watch("role");

  return (
    <AuthCard title="Create your account" subtitle="Choose the role that matches how you use CampusConnect.">
      <form className="space-y-4" onSubmit={handleSubmit((values) => registerMutation.mutate(values))}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Full name / Society Name</span>
          <Input autoComplete="name" {...register("name")} placeholder={selectedRole === "SOCIETY" ? "e.g. ACM Student Chapter" : "e.g. Rahul Sharma"} />
          {errors.name && <span className="mt-1 block text-sm text-destructive">{errors.name.message}</span>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
          <Input autoComplete="email" type="email" {...register("email")} placeholder="e.g. rahul@university.edu" />
          {errors.email && <span className="mt-1 block text-sm text-destructive">{errors.email.message}</span>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Role</span>
          <Select {...register("role")}>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </Select>
          {errors.role && <span className="mt-1 block text-sm text-destructive">{errors.role.message}</span>}
        </label>

        {selectedRole === "ADMIN" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
              <ShieldAlert size={14} className="text-amber-600" /> Admin Registration Restricted
            </div>
            <p className="text-[11px] text-amber-800">
              Admin accounts require the system Master Security Key. Standard development default is: <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded text-slate-900">campusconnect-admin-secret-2026</code>
            </p>
            <label className="block pt-1">
              <span className="mb-1 block text-xs font-semibold text-amber-950">Master Security Key</span>
              <Input type="password" {...register("adminSecretKey")} placeholder="Enter Admin Secret Key" />
            </label>
          </div>
        )}

        {(selectedRole === "SOCIETY" || selectedRole === "PLACEMENT_CELL") && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-900 flex items-start gap-2">
            <UserCheck size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <p>
              <strong>Admin Verification Required:</strong> New society & placement cell accounts require University Admin approval before event posting is enabled to prevent fake drive scams.
            </p>
          </div>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">College / Institution Name</span>
          <Input {...register("collegeName")} placeholder="e.g. Campus University / IIT Delhi / DTU" />
        </label>

        {selectedRole === "STUDENT" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Roll / Student ID</span>
              <Input {...register("rollNumber")} placeholder="e.g. 2024CS1042" />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Branch / Department</span>
              <Input {...register("branch")} placeholder="e.g. Computer Science" />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Graduation / Passing Year</span>
              <Input type="number" {...register("passingYear")} placeholder="e.g. 2026" />
            </label>
          </div>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
          <Input autoComplete="new-password" type="password" {...register("password")} />
          {errors.password && <span className="mt-1 block text-sm text-destructive">{errors.password.message}</span>}
        </label>

        {registerMutation.isError && (
          <p className="text-sm text-destructive">
            {getErrorMessage(registerMutation.error, "Unable to create this account.")}
          </p>
        )}

        <Button className="w-full gap-2" disabled={registerMutation.isPending} type="submit">
          <UserPlus size={18} />
          {registerMutation.isPending ? "Creating..." : "Create account"}
        </Button>
      </form>

      {registerMutation.isSuccess && (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Account created successfully.
          {selectedRole === "SOCIETY" || selectedRole === "PLACEMENT_CELL"
            ? " Your society account has been submitted to the University Admin for verification."
            : " You can now sign in to your student dashboard."}
        </p>
      )}

      <p className="mt-5 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link className="font-semibold text-primary hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
};
