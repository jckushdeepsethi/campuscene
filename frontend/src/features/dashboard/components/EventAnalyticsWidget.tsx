import { Link } from "react-router-dom";
import { BarChart3, CheckCircle2, Clock, Loader2, TrendingUp, UserCheck, UserX, Users } from "lucide-react";
import { useEventAnalytics } from "../../events/hooks/useEvents";

export const EventAnalyticsWidget = () => {
  const { data: analytics, isLoading, isError } = useEventAnalytics();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  if (isError || !analytics) {
    return null;
  }

  const { statusCounts, registrationCounts, attendanceRatePercent, topHighDemandEvents } = analytics;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-primary" size={20} />
          <h2 className="text-lg font-bold text-slate-950">Campus Event Analytics</h2>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <TrendingUp size={12} /> Live Insights
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Attendance Conversion Gauge */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Attendance Rate</span>
            <UserCheck className="text-emerald-600" size={18} />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-950">{attendanceRatePercent}%</span>
            <span className="text-xs text-slate-500">check-in conversion</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${attendanceRatePercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>Attended: <strong>{registrationCounts.ATTENDED}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500" />
              <span>No Show: <strong>{registrationCounts.NO_SHOW}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-sky-500" />
              <span>Registered: <strong>{registrationCounts.REGISTERED}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" />
              <span>Waitlisted: <strong>{registrationCounts.WAITLISTED}</strong></span>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Event Status Distribution</span>
            <Users className="text-slate-400" size={18} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-md border border-slate-100 bg-slate-50/80 p-3">
              <p className="text-xs text-slate-500">Published</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{statusCounts.PUBLISHED}</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-emerald-100">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="rounded-md border border-slate-100 bg-slate-50/80 p-3">
              <p className="text-xs text-slate-500">Pending Review</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{statusCounts.PENDING_APPROVAL}</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-amber-100">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="rounded-md border border-slate-100 bg-slate-50/80 p-3">
              <p className="text-xs text-slate-500">Drafts</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{statusCounts.DRAFT}</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                <div className="h-full bg-slate-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="rounded-md border border-slate-100 bg-slate-50/80 p-3">
              <p className="text-xs text-slate-500">Cancelled</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{statusCounts.CANCELLED}</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-rose-100">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top High Demand Events Leaderboard */}
      {topHighDemandEvents.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">High-Demand Events Capacity Utilization</h3>
            <span className="text-xs text-slate-500">Top 5 by fill rate</span>
          </div>

          <div className="space-y-3">
            {topHighDemandEvents.map((ev: any) => (
              <div key={ev.id} className="flex items-center justify-between gap-4 text-sm">
                <Link to={`/events/${ev.id}`} className="font-semibold text-slate-900 hover:text-primary truncate max-w-xs">
                  {ev.title}
                </Link>

                <div className="flex items-center gap-4 min-w-[240px]">
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${ev.fillRatePercent}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 min-w-[70px] text-right">
                    {ev.registrationCount} / {ev.capacity} ({ev.fillRatePercent}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
