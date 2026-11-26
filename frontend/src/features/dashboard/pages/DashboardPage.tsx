import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  GraduationCap,
  LogOut,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserCheck,
  UserRound,
  UserX,
  Users
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { useCurrentUser, useLogout } from "../../auth/hooks/useAuth";
import { authApi, type AuthUser } from "../../auth/services/authApi";
import { useEvents } from "../../events/hooks/useEvents";
import { eventsApi } from "../../events/services/eventsApi";
import { EventAnalyticsWidget } from "../components/EventAnalyticsWidget";

const roleBadges: Record<AuthUser["role"], { label: string; color: string; icon: any }> = {
  STUDENT: { label: "Student Portal", color: "bg-sky-50 text-sky-800 border-sky-200", icon: GraduationCap },
  SOCIETY: { label: "Society / Club Organizers", color: "bg-purple-50 text-purple-800 border-purple-200", icon: Users },
  PLACEMENT_CELL: { label: "Placement & Training Cell", color: "bg-indigo-50 text-indigo-800 border-indigo-200", icon: Building2 },
  ADMIN: { label: "University Administrator", color: "bg-amber-50 text-amber-800 border-amber-200", icon: ShieldCheck }
};

export const DashboardPage = () => {
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();

  if (!user) {
    return null;
  }

  const BadgeIcon = roleBadges[user.role].icon;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
              CS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-primary">CampuScene</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${roleBadges[user.role].color}`}>
                  <BadgeIcon size={12} />
                  {roleBadges[user.role].label}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">
                {user.role === "STUDENT" && "Student Discovery & Ticket Hub"}
                {user.role === "SOCIETY" && "Club & Society Management Console"}
                {user.role === "PLACEMENT_CELL" && "Placement Drives & Career Desk"}
                {user.role === "ADMIN" && "University Governance & Approvals"}
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition px-3.5 py-2 cursor-pointer shadow-xs group"
              title="Click to view & edit Profile and Interests"
            >
              <div className="flex size-8 items-center justify-center rounded-md bg-slate-900 text-white font-bold text-xs group-hover:bg-primary transition">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-950 group-hover:text-primary transition">{user.name}</p>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-600 font-medium">(Profile)</span>
                </div>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>
            </Link>

            <Button
              className="gap-2 text-xs"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              type="button"
              variant="ghost"
            >
              <LogOut size={15} />
              {logoutMutation.isPending ? "Signing out..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {user.role === "STUDENT" && <StudentDashboardView user={user} />}
        {user.role === "SOCIETY" && <SocietyDashboardView user={user} />}
        {user.role === "PLACEMENT_CELL" && <PlacementDashboardView user={user} />}
        {user.role === "ADMIN" && <AdminDashboardView user={user} />}
      </div>
    </main>
  );
};

/* -------------------------------------------------------------------------- */
/* STUDENT DASHBOARD VIEW                                                      */
/* -------------------------------------------------------------------------- */
const StudentDashboardView = ({ user }: { user: AuthUser }) => {
  const { data: publishedData, isLoading } = useEvents({ status: "PUBLISHED" });
  const publishedEvents = publishedData?.data ?? [];

  const myRegisteredEvents = publishedEvents.filter((ev) => ev.isRegistered);

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <section className="rounded-xl border border-sky-200 bg-gradient-to-r from-sky-900 to-indigo-900 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              🎓 Student Portal
            </span>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Welcome back, {user.name.split(" ")[0]}!</h2>
            <p className="mt-2 max-w-xl text-sm text-sky-100">
              Discover upcoming technical workshops, cultural fests, placement talks, and track your active event tickets.
            </p>
          </div>
          <Link to="/events">
            <Button className="bg-white text-sky-900 hover:bg-sky-50 font-bold gap-2">
              <Search size={16} /> Explore Events Feed
            </Button>
          </Link>
        </div>
      </section>

      {/* Student Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <a
          href="#my-tickets"
          className="rounded-lg border border-slate-200 bg-white hover:bg-sky-50/40 hover:border-sky-200 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to jump to your registered tickets"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase group-hover:text-sky-800 transition">My Active Tickets</span>
            <Ticket className="text-sky-600 group-hover:scale-110 transition" size={20} />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-950 group-hover:text-sky-900 transition">{myRegisteredEvents.length}</p>
          <p className="mt-1 text-xs text-slate-500 group-hover:text-sky-700 transition">Registered campus events ↓</p>
        </a>

        <Link
          to="/events?status=PUBLISHED"
          className="rounded-lg border border-slate-200 bg-white hover:bg-emerald-50/40 hover:border-emerald-200 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to view all live published events"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase group-hover:text-emerald-800 transition">Live Campus Events</span>
            <CalendarDays className="text-emerald-600 group-hover:scale-110 transition" size={20} />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-950 group-hover:text-emerald-700 transition">{publishedEvents.length}</p>
          <p className="mt-1 text-xs text-slate-500 group-hover:text-emerald-600 transition">Published & open for registration →</p>
        </Link>

        <Link
          to="/profile"
          className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to view & edit Profile and Interests"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase group-hover:text-slate-900 transition">Student Profile & Status</span>
            <CheckCircle2 className="text-emerald-500 group-hover:scale-110 transition" size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-700">Verified</p>
          <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-700 transition">{user.email} (View Profile →)</p>
        </Link>
      </div>

      {/* My Tickets Section */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="text-sky-600" size={20} />
            <h3 className="text-lg font-bold text-slate-900">My Event Registrations</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">{myRegisteredEvents.length} Active</span>
        </div>

        {myRegisteredEvents.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <p className="text-sm">You haven't registered for any upcoming events yet.</p>
            <Link to="/events" className="mt-3 inline-block">
              <Button variant="secondary" className="gap-2 h-9 text-xs">
                <Search size={14} /> Browse Available Events
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myRegisteredEvents.map((ev) => (
              <div key={ev.id} className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {ev.userRegistrationStatus ?? "REGISTERED"}
                    </span>
                    <span className="text-xs text-slate-500">{ev.venue}</span>
                  </div>
                  <h4 className="mt-2 text-base font-bold text-slate-900">{ev.title}</h4>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3">
                  <span className="text-xs text-slate-500">Starts: {new Date(ev.startsAt).toLocaleDateString()}</span>
                  <Link to={`/events/${ev.id}`}>
                    <Button variant="secondary" className="gap-1 text-xs h-8 px-3">
                      View Ticket <ChevronRight size={14} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Campus Events Stream */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-500" size={20} />
            <h3 className="text-lg font-bold text-slate-900">Featured Campus Events Feed</h3>
          </div>
          <Link to="/events" className="text-xs font-semibold text-primary hover:underline">
            View All ({publishedEvents.length})
          </Link>
        </div>

        {isLoading ? (
          <p className="py-4 text-center text-xs text-slate-500">Loading events feed...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publishedEvents.slice(0, 6).map((ev) => (
              <div key={ev.id} className="flex flex-col justify-between rounded-lg border border-slate-200 p-4 hover:border-slate-300">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">{ev.organizer?.name ?? "Campus Society"}</span>
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {ev.registrationCount ?? 0} / {ev.capacity} Seats
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-bold text-slate-950">{ev.title}</h4>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                </div>
                <Link to={`/events/${ev.id}`} className="mt-4">
                  <Button className="w-full gap-1 text-xs h-9">
                    {ev.isRegistered ? "View Registration" : "Register Now"} <ChevronRight size={14} />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SOCIETY DASHBOARD VIEW                                                      */
/* -------------------------------------------------------------------------- */
const SocietyDashboardView = ({ user }: { user: AuthUser }) => {
  const { data: eventsData, isLoading } = useEvents();
  const allEvents = eventsData?.data ?? [];

  const mySocietyEvents = allEvents.filter((ev) => ev.organizerId === user.id);
  const pendingApprovals = mySocietyEvents.filter((ev) => ev.status === "PENDING_APPROVAL");
  const publishedEvents = mySocietyEvents.filter((ev) => ev.status === "PUBLISHED");

  return (
    <div className="space-y-8">
      {/* Banner & Action Header */}
      <section className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              🎭 Club & Society Console
            </span>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{user.name}</h2>
            <p className="mt-2 max-w-xl text-sm text-purple-100">
              Draft technical workshops and cultural fests, submit them for admin approval, track student registrations, and manage check-ins.
            </p>
          </div>
          <Link to="/events/new">
            <Button className="bg-white text-purple-900 hover:bg-purple-50 font-bold gap-2">
              <Plus size={18} /> Create New Event
            </Button>
          </Link>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Link
          to="/events"
          className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to view all events created by your society"
        >
          <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase group-hover:text-slate-900 transition">My Society Events</p>
            <ArrowUpRight size={16} className="text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">{mySocietyEvents.length}</p>
          <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-700 transition">Total events drafted/published →</p>
        </Link>

        <Link
          to="/events?status=PENDING_APPROVAL"
          className="rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to view events awaiting admin review"
        >
          <div className="flex items-center justify-between text-amber-800">
            <p className="text-xs font-bold uppercase group-hover:text-amber-950 transition">Pending Review</p>
            <ArrowUpRight size={16} className="text-amber-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-600">{pendingApprovals.length}</p>
          <p className="mt-1 text-xs text-amber-600 group-hover:text-amber-800 transition">Awaiting admin approval →</p>
        </Link>

        <Link
          to="/events?status=PUBLISHED"
          className="rounded-lg border border-slate-200 bg-white hover:bg-emerald-50/40 hover:border-emerald-200 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to view live published events"
        >
          <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase group-hover:text-emerald-800 transition">Published Live</p>
            <ArrowUpRight size={16} className="text-emerald-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-600">{publishedEvents.length}</p>
          <p className="mt-1 text-xs text-slate-500 group-hover:text-emerald-700 transition">Live on campus feed →</p>
        </Link>

        <Link
          to="/profile"
          className="rounded-lg border border-slate-200 bg-white hover:bg-purple-50/40 hover:border-purple-200 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to manage Society Profile & Settings"
        >
          <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase group-hover:text-purple-800 transition">Organizer Role</p>
            <ArrowUpRight size={16} className="text-purple-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <p className="mt-3 text-xl font-bold text-purple-700">Society Lead</p>
          <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-800 transition">{user.email} →</p>
        </Link>
      </div>

      {/* Managed Events Workspace */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-purple-600" size={20} />
            <h3 className="text-lg font-bold text-slate-900">Managed Society Events Workspace</h3>
          </div>
          <Link to="/events/new">
            <Button variant="secondary" className="gap-1 text-xs h-8 px-3">
              <Plus size={14} /> Add Event
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <p className="py-4 text-center text-xs text-slate-500">Loading society events...</p>
        ) : mySocietyEvents.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <p className="text-sm">No events created by your society yet.</p>
            <Link to="/events/new" className="mt-3 inline-block">
              <Button className="gap-1 h-9 text-xs">
                <Plus size={14} /> Draft First Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {mySocietyEvents.map((ev) => (
              <div key={ev.id} className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      ev.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-800" :
                      ev.status === "PENDING_APPROVAL" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                    }`}>
                      {ev.status}
                    </span>
                    <span className="text-xs text-slate-500">Capacity: {ev.capacity}</span>
                  </div>
                  <h4 className="mt-1 text-base font-bold text-slate-950">{ev.title}</h4>
                  <p className="text-xs text-slate-500">Starts: {new Date(ev.startsAt).toLocaleString()} • Venue: {ev.venue}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/events/${ev.id}`}>
                    <Button variant="secondary" className="gap-1 text-xs h-8 px-3">
                      Manage & Check-ins <ChevronRight size={14} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Analytics Widget */}
      <EventAnalyticsWidget />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* PLACEMENT CELL DASHBOARD VIEW                                               */
/* -------------------------------------------------------------------------- */
const PlacementDashboardView = ({ user }: { user: AuthUser }) => {
  const { data: eventsData, isLoading } = useEvents();
  const allEvents = eventsData?.data ?? [];

  const myDrives = allEvents.filter((ev) => ev.organizerId === user.id);

  return (
    <div className="space-y-8">
      {/* Banner */}
      <section className="rounded-xl border border-indigo-200 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              🏢 Placement Cell Console
            </span>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{user.name}</h2>
            <p className="mt-2 max-w-xl text-sm text-indigo-200">
              Publish recruitment drives, pre-placement talks, coding assessment sessions, and download candidate registration lists.
            </p>
          </div>
          <Link to="/events/new">
            <Button className="bg-indigo-600 hover:bg-indigo-500 font-bold gap-2 text-white">
              <Plus size={18} /> Post Placement Drive
            </Button>
          </Link>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/events"
          className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to view all corporate drives posted"
        >
          <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase group-hover:text-indigo-950 transition">Placement Drives</p>
            <ArrowUpRight size={16} className="text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-indigo-950">{myDrives.length}</p>
          <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-700 transition">Corporate drives posted →</p>
        </Link>

        <Link
          to="/events?status=PUBLISHED"
          className="rounded-lg border border-slate-200 bg-white hover:bg-emerald-50/40 hover:border-emerald-200 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to view all live published talks & drives"
        >
          <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase group-hover:text-emerald-800 transition">Live Campus Feed</p>
            <ArrowUpRight size={16} className="text-emerald-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-600">{allEvents.filter((e) => e.status === "PUBLISHED").length}</p>
          <p className="mt-1 text-xs text-slate-500 group-hover:text-emerald-700 transition">Total published talks & drives →</p>
        </Link>

        <Link
          to="/profile"
          className="rounded-lg border border-slate-200 bg-white hover:bg-indigo-50/40 hover:border-indigo-200 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to view Placement Cell Profile & Settings"
        >
          <div className="flex items-center justify-between text-slate-500">
            <p className="text-xs font-bold uppercase group-hover:text-indigo-800 transition">Role Permissions</p>
            <ArrowUpRight size={16} className="text-indigo-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <p className="mt-3 text-xl font-bold text-indigo-800">Placement Desk</p>
          <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-700 transition">Auto-publish enabled →</p>
        </Link>
      </div>

      {/* Managed Placement Drives Workspace */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="text-indigo-600" size={20} />
            <h3 className="text-lg font-bold text-slate-900">Active Placement Drives & Sessions</h3>
          </div>
          <Link to="/events/new">
            <Button variant="secondary" className="gap-1 text-xs h-8 px-3">
              <Plus size={14} /> New Drive
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <p className="py-4 text-center text-xs text-slate-500">Loading placement drives...</p>
        ) : myDrives.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <p className="text-sm">No corporate placement drives posted yet.</p>
            <Link to="/events/new" className="mt-3 inline-block">
              <Button className="gap-1 h-9 text-xs">
                <Plus size={14} /> Post Placement Drive
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myDrives.map((ev) => (
              <div key={ev.id} className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
                <div>
                  <h4 className="text-base font-bold text-slate-950">{ev.title}</h4>
                  <p className="text-xs text-slate-500">Venue: {ev.venue} • Starts: {new Date(ev.startsAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/events/${ev.id}`}>
                    <Button variant="secondary" className="gap-1 text-xs h-8 px-3">
                      View Candidate List <ChevronRight size={14} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Analytics Widget */}
      <EventAnalyticsWidget />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* ADMIN DASHBOARD VIEW                                                        */
/* -------------------------------------------------------------------------- */
const AdminDashboardView = ({ user }: { user: AuthUser }) => {
  const { data: pendingData, isLoading: isPendingLoading, refetch } = useEvents({ status: "PENDING_APPROVAL" });
  const { data: allData } = useEvents();

  const pendingEvents = pendingData?.data ?? [];
  const allEvents = allData?.data ?? [];
  const publishedCount = allEvents.filter((e) => e.status === "PUBLISHED").length;

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pendingOrganizers, setPendingOrganizers] = useState<AuthUser[]>([]);
  const [isOrganizersLoading, setIsOrganizersLoading] = useState(false);

  const fetchPendingOrganizers = async () => {
    setIsOrganizersLoading(true);
    try {
      const organizers = await authApi.getPendingOrganizers();
      setPendingOrganizers(organizers);
    } catch {
      // Ignore
    } finally {
      setIsOrganizersLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrganizers();
  }, []);

  const handleOrganizerVerification = async (userId: string, action: "APPROVE" | "REJECT") => {
    try {
      await authApi.updateOrganizerStatus(userId, action === "APPROVE" ? "ACTIVE" : "SUSPENDED");
      await fetchPendingOrganizers();
    } catch {
      alert("Failed to update society account status.");
    }
  };

  const handleApproval = async (eventId: string, status: "PUBLISHED" | "REJECTED") => {
    setProcessingId(eventId);
    try {
      await eventsApi.approveOrRejectEvent(eventId, { status });
      await refetch();
    } catch (err) {
      console.error("Failed to process event approval", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <section className="rounded-xl border border-amber-200 bg-gradient-to-r from-slate-900 to-amber-950 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-sm border border-amber-500/30">
              🛡️ University Governance Console
            </span>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{user.name}</h2>
            <p className="mt-2 max-w-xl text-sm text-amber-100">
              Review pending society event requests, enforce campus guidelines, approve published events, and monitor system analytics.
            </p>
          </div>
          <Link to="/events?status=PENDING_APPROVAL">
            <Button className="bg-amber-500 hover:bg-amber-400 font-bold gap-2 text-slate-950">
              <ShieldAlert size={18} /> Review Pending ({pendingEvents.length})
            </Button>
          </Link>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Link
          to="/events?status=PENDING_APPROVAL"
          className="rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to view all events pending admin approval"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-amber-800 group-hover:text-amber-950 transition">
              Pending Approval Queue
            </p>
            <ArrowUpRight size={16} className="text-amber-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-700">{pendingEvents.length}</p>
          <p className="mt-1 text-xs text-amber-600 group-hover:text-amber-800 transition">Requires admin action →</p>
        </Link>

        <Link
          to="/events"
          className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to view all campus events across all departments"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-slate-500 group-hover:text-slate-900 transition">
              Total Campus Events
            </p>
            <ArrowUpRight size={16} className="text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">{allEvents.length}</p>
          <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-700 transition">Across all departments →</p>
        </Link>

        <Link
          to="/events?status=PUBLISHED"
          className="rounded-lg border border-slate-200 bg-white hover:bg-emerald-50/40 hover:border-emerald-200 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to view all live published events visible to students"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-slate-500 group-hover:text-emerald-800 transition">
              Live Published
            </p>
            <ArrowUpRight size={16} className="text-emerald-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-600">{publishedCount}</p>
          <p className="mt-1 text-xs text-slate-500 group-hover:text-emerald-700 transition">Visible to students →</p>
        </Link>

        <Link
          to="/profile"
          className="rounded-lg border border-slate-200 bg-white hover:bg-amber-50/40 hover:border-amber-200 p-5 shadow-sm transition hover:shadow-md cursor-pointer group block"
          title="Click to manage Administrator profile & settings"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-slate-500 group-hover:text-amber-800 transition">
              Admin Authority
            </p>
            <ArrowUpRight size={16} className="text-amber-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <p className="mt-3 text-xl font-bold text-amber-700">Full Access</p>
          <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-800 transition">{user.email} →</p>
        </Link>
      </div>

      {/* Pending Society Account Verification Queue */}
      <section className="rounded-lg border border-indigo-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="text-indigo-600" size={20} />
            <h3 className="text-lg font-bold text-slate-900">Pending Society & Club Account Verification</h3>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
            {pendingOrganizers.length} Pending Accounts
          </span>
        </div>

        {isOrganizersLoading ? (
          <p className="py-4 text-center text-xs text-slate-500">Checking pending organizer accounts...</p>
        ) : pendingOrganizers.length === 0 ? (
          <div className="py-6 text-center text-slate-500">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-1" size={20} />
            <p className="text-sm font-semibold text-slate-700">No pending society verification requests!</p>
            <p className="text-xs text-slate-500">All registered societies and placement cells are verified.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOrganizers.map((org) => (
              <div key={org.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-indigo-100 bg-indigo-50/40 p-4 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                      {org.role}
                    </span>
                    <span className="text-xs text-slate-500">{org.collegeName ?? "Campus University"}</span>
                  </div>
                  <h4 className="mt-1 text-sm font-bold text-slate-950">{org.name}</h4>
                  <p className="text-xs text-slate-600 font-mono">{org.email}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => handleOrganizerVerification(org.id, "APPROVE")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1 h-8 px-3"
                  >
                    <UserCheck size={14} /> Verify & Activate
                  </Button>
                  <Button
                    onClick={() => handleOrganizerVerification(org.id, "REJECT")}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs gap-1 h-8 px-3"
                  >
                    <UserX size={14} /> Reject / Suspend
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Priority Approval Queue Widget */}
      <section className="rounded-lg border border-amber-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-amber-600" size={20} />
            <h3 className="text-lg font-bold text-slate-900">Priority Event Approval Queue</h3>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
            {pendingEvents.length} Pending Actions
          </span>
        </div>

        {isPendingLoading ? (
          <p className="py-4 text-center text-xs text-slate-500">Loading pending requests...</p>
        ) : pendingEvents.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={24} />
            <p className="text-sm font-semibold text-slate-700">Approval queue is empty!</p>
            <p className="text-xs text-slate-500 mt-1">All submitted society events have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingEvents.map((ev) => (
              <div key={ev.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between rounded-lg border border-amber-100 bg-amber-50/40 p-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 uppercase">{ev.organizer?.name ?? "Society"}</span>
                    <span className="text-xs text-slate-500">• Venue: {ev.venue} • Capacity: {ev.capacity}</span>
                  </div>
                  <h4 className="mt-1 text-base font-bold text-slate-950">{ev.title}</h4>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    disabled={processingId === ev.id}
                    onClick={() => handleApproval(ev.id, "PUBLISHED")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1 h-8 px-3"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </Button>
                  <Button
                    disabled={processingId === ev.id}
                    onClick={() => handleApproval(ev.id, "REJECTED")}
                    className="bg-rose-600 hover:bg-rose-50 text-white font-bold text-xs gap-1 h-8 px-3"
                  >
                    <AlertCircle size={14} /> Reject
                  </Button>
                  <Link to={`/events/${ev.id}`}>
                    <Button variant="secondary" className="text-xs h-8 px-3">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Analytics Widget */}
      <EventAnalyticsWidget />
    </div>
  );
};
