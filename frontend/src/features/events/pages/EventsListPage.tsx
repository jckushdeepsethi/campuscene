import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Globe2,
  LayoutDashboard,
  MapPin,
  Plus,
  School,
  Search,
  Sparkles,
  User,
  Users
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useCurrentUser } from "../../auth/hooks/useAuth";
import { useEvents } from "../hooks/useEvents";
import type { EventStatus } from "../services/eventsApi";

const statusPills: Record<EventStatus, { label: string; className: string }> = {
  PUBLISHED: { label: "Published", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PENDING_APPROVAL: { label: "Pending Approval", className: "bg-amber-50 text-amber-700 border-amber-200" },
  DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-700 border-slate-200" },
  REJECTED: { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-200 text-slate-800 border-slate-300" },
  COMPLETED: { label: "Completed", className: "bg-sky-50 text-sky-700 border-sky-200" }
};

export const EventsListPage = () => {
  const { data: user } = useCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = (searchParams.get("status") as EventStatus) || undefined;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | undefined>(initialStatus);

  const { data, isLoading, isError } = useEvents({
    search: searchTerm || undefined,
    status: selectedStatus
  });

  const canCreate = user?.role && ["SOCIETY", "PLACEMENT_CELL", "ADMIN"].includes(user.role);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="text-sm font-black text-indigo-600 tracking-wide uppercase">CampuScene AI</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">What's the Scene on Campus</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/profile">
              <Button variant="ghost" className="gap-2 text-xs">
                <User size={16} />
                Profile & Interests
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" className="gap-2 text-xs">
                <LayoutDashboard size={16} />
                Dashboard
              </Button>
            </Link>
            {canCreate && (
              <Link to="/events/new">
                <Button className="gap-2 text-xs font-bold">
                  <Plus size={16} />
                  Create Event
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              className="pl-10"
              placeholder="Search by event title, tags, venue, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => {
                setSelectedStatus(undefined);
                setSearchParams({});
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedStatus === undefined
                  ? "bg-primary text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All Events
            </button>
            {Object.keys(statusPills).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status as EventStatus);
                  setSearchParams({ status });
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  selectedStatus === status
                    ? "bg-primary text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {statusPills[status as EventStatus].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {isLoading && (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-slate-500">
              Loading campus events...
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
              Failed to load events. Please try again.
            </div>
          )}

          {!isLoading && !isError && data?.data.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
              <CalendarDays className="mx-auto text-slate-400" size={40} />
              <h3 className="mt-4 text-lg font-bold text-slate-900">No events found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm || selectedStatus
                  ? "Try clearing filters or adjusting your search term."
                  : "No events have been published yet."}
              </p>
              {canCreate && (
                <Link to="/events/new" className="mt-6 inline-block">
                  <Button className="gap-2">
                    <Plus size={16} />
                    Create First Event
                  </Button>
                </Link>
              )}
            </div>
          )}

          {!isLoading && !isError && data && data.data.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.data.map((event) => {
                const pill = statusPills[event.status] || statusPills.DRAFT;
                const startDate = new Date(event.startsAt);

                return (
                  <article
                    key={event.id}
                    className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${pill.className}`}>
                            {pill.label}
                          </span>
                          {event.scope === "INTER_COLLEGE" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                              <Globe2 size={12} /> Inter-College
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                              <School size={12} /> Intra-College
                            </span>
                          )}
                        </div>

                        {event.matchScore && event.matchScore > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-800 bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                            <Sparkles size={12} className="text-indigo-600 animate-pulse" /> {event.matchScore}% Interest Match
                          </span>
                        ) : null}
                      </div>

                      {event.isRegistered && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 size={13} /> Registered
                          </span>
                        </div>
                      )}

                      <h3 className="mt-3 text-xl font-bold text-slate-950 line-clamp-2">{event.title}</h3>

                      <p className="mt-2 text-sm text-slate-600 line-clamp-3">{event.description}</p>

                      {/* Tag Pills */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {event.tags.map((tag) => (
                            <span key={tag} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span>{startDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span>{startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          <span>
                            {event.registrationCount ?? 0} / {event.capacity} registered
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <Link to={`/events/${event.id}`}>
                        <Button variant="secondary" className="w-full">
                          View Details & Register
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
