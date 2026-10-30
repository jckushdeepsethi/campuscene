import { Outlet } from "react-router-dom";

export const AuthLayout = () => (
  <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_520px]">
    <section className="hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="text-2xl font-black text-indigo-400">CampuScene <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-sans uppercase tracking-wider">AI</span></div>
      <div className="max-w-xl">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">What's the scene on campus?</p>
        <h1 className="mt-4 text-5xl font-extrabold leading-tight">Campus events, hackathons, fests & placement drives in one live feed.</h1>
        <p className="mt-5 text-base leading-7 text-slate-300">
          Discover personalized event recommendations, AI-powered event assistants, verified digital certificates, and instant registrations.
        </p>
      </div>
      <p className="text-xs font-semibold text-slate-400">Built for students, campus societies, placement cells, and university admins.</p>
    </section>
    <section className="flex min-h-screen items-center justify-center px-5 py-10">
      <Outlet />
    </section>
  </main>
);
