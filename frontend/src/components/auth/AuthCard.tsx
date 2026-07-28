import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export const AuthCard = ({ title, subtitle, children }: AuthCardProps) => (
  <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
    </div>
    {children}
  </div>
);

