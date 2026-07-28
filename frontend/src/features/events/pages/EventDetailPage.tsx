import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trash2,
  UserCheck,
  Users,
  XCircle
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { EventChatbotWidget } from "../components/EventChatbotWidget";
import { AiSocialKitModal } from "../components/AiSocialKitModal";
import { CertificateModal } from "../components/CertificateModal";
import { useCurrentUser } from "../../auth/hooks/useAuth";
import {
  useApproveEvent,
  useCancelRegistration,
  useDeleteEvent,
  useEvent,
  useEventRegistrations,
  useMarkAttendance,
  useRegisterForEvent
} from "../hooks/useEvents";
import { eventsApi, type EventStatus, type RegistrationStatus } from "../services/eventsApi";

const statusPills: Record<EventStatus, { label: string; className: string }> = {
  PUBLISHED: { label: "Published", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PENDING_APPROVAL: { label: "Pending Approval", className: "bg-amber-50 text-amber-700 border-amber-200" },
  DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-700 border-slate-200" },
  REJECTED: { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-200 text-slate-800 border-slate-300" },
  COMPLETED: { label: "Completed", className: "bg-sky-50 text-sky-700 border-sky-200" }
};

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = id || "";

  const { data: user } = useCurrentUser();
  const [showAiKitModal, setShowAiKitModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const { data: event, isLoading, isError } = useEvent(eventId);
  const registerMutation = useRegisterForEvent(eventId);
  const cancelRegistrationMutation = useCancelRegistration(eventId);
  const approveMutation = useApproveEvent(eventId);
  const deleteMutation = useDeleteEvent();
  const markAttendanceMutation = useMarkAttendance(eventId);

  const isOrganizer = user && event && (event.organizerId === user.id || user.role === "ADMIN");
  const isAdmin = user?.role === "ADMIN";

  const { data: registrations } = useEventRegistrations(isOrganizer ? eventId : "");

  const handleExportCsv = async () => {
    try {
      const blob = await eventsApi.exportAttendeesCsv(eventId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `event-${eventId}-attendees.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch {
      alert("Failed to export attendee CSV.");
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="animate-spin" size={24} />
      </main>
    );
  }

  if (isError || !event) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-center">
        <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Event Not Found</h2>
          <p className="mt-2 text-sm text-slate-600">This event does not exist or you do not have permission to view it.</p>
          <Link to="/events" className="mt-6 inline-block">
            <Button variant="secondary">Back to Events</Button>
          </Link>
        </div>
      </main>
    );
  }

  const pill = statusPills[event.status] || statusPills.DRAFT;
  const startDate = new Date(event.startsAt);
  const endDate = new Date(event.endsAt);
  const capacityPercent = Math.min(100, Math.round(((event.registrationCount ?? 0) / event.capacity) * 100));

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/events">
              <Button variant="ghost" className="size-9 p-0">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <p className="text-sm font-semibold text-primary">CampusConnect</p>
              <h1 className="text-2xl font-bold text-slate-950">Event Workspace</h1>
            </div>
          </div>
          {isOrganizer && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowAiKitModal(true)}
                className="gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Sparkles size={16} /> AI Social & Email Kit
              </Button>
              <Button
                variant="ghost"
                className="gap-2 text-rose-600 hover:bg-rose-50 text-xs"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (confirm("Are you sure you want to delete/cancel this event?")) {
                    deleteMutation.mutate(eventId);
                  }
                }}
              >
                <Trash2 size={16} />
                {event.status === "DRAFT" ? "Delete Draft" : "Cancel Event"}
              </Button>
            </div>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-8 space-y-6 lg:px-8">
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${pill.className}`}>
              {pill.label}
            </span>
            {event.organizer && (
              <span className="text-xs font-medium text-slate-500">
                Organized by <strong className="text-slate-900">{event.organizer.name}</strong> ({event.organizer.role})
              </span>
            )}
          </div>

          <h2 className="mt-4 text-3xl font-bold text-slate-950">{event.title}</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">{event.description}</p>

          <div className="mt-8 grid gap-4 rounded-md border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-white text-primary shadow-xs">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Date</p>
                <p className="text-sm font-semibold text-slate-900">
                  {startDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-white text-primary shadow-xs">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Time</p>
                <p className="text-sm font-semibold text-slate-900">
                  {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                  {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-white text-primary shadow-xs">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Venue</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{event.venue}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-900">Capacity & Registrations</span>
              <span className="text-slate-600">
                {event.registrationCount ?? 0} / {event.capacity} seats filled ({capacityPercent}%)
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${capacityPercent}%` }} />
            </div>
          </div>

          {event.status === "PUBLISHED" && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              {event.userRegistrationStatus === "REGISTERED" ? (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} /> You are registered for this event!
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowCertModal(true)}
                      className="h-8 text-xs gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                    >
                      <Award size={14} /> View Digital Certificate
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8 text-xs text-rose-700 hover:bg-rose-100"
                      disabled={cancelRegistrationMutation.isPending}
                      onClick={() => cancelRegistrationMutation.mutate()}
                    >
                      {cancelRegistrationMutation.isPending ? "Cancelling..." : "Cancel Registration"}
                    </Button>
                  </div>
                </div>
              ) : event.userRegistrationStatus === "WAITLISTED" ? (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                  <div className="flex items-center gap-2">
                    <Clock size={18} /> Event capacity reached. You are on the waitlist.
                  </div>
                  <Button
                    variant="ghost"
                    className="h-8 text-xs text-rose-700 hover:bg-rose-100"
                    disabled={cancelRegistrationMutation.isPending}
                    onClick={() => cancelRegistrationMutation.mutate()}
                  >
                    {cancelRegistrationMutation.isPending ? "Cancelling..." : "Cancel Waitlist"}
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full gap-2 sm:w-auto"
                  disabled={registerMutation.isPending}
                  onClick={() => registerMutation.mutate()}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Registering...
                    </>
                  ) : (
                    <>
                      <Ticket size={16} /> Register for Event
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </article>

        {isAdmin && event.status === "PENDING_APPROVAL" && (
          <article className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-amber-700" size={24} />
              <div>
                <h3 className="text-lg font-bold text-amber-950">Admin Review Required</h3>
                <p className="text-sm text-amber-800">This event was submitted by a campus society and requires your approval before publication.</p>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                disabled={approveMutation.isPending}
                onClick={() => approveMutation.mutate({ status: "PUBLISHED" })}
              >
                <CheckCircle2 size={16} /> Approve & Publish
              </Button>
              <Button
                variant="ghost"
                className="gap-2 text-rose-700 hover:bg-rose-100"
                disabled={approveMutation.isPending}
                onClick={() => approveMutation.mutate({ status: "REJECTED" })}
              >
                <XCircle size={16} /> Reject Event
              </Button>
            </div>
          </article>
        )}

        {isOrganizer && registrations && (
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Event Registrations</h3>
                <p className="text-sm text-slate-500">Manage student attendees and mark attendance check-in.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  className="h-8 text-xs gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={handleExportCsv}
                >
                  <Download size={14} /> Export CSV
                </Button>
                <div className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <Users size={14} /> Total: {registrations.length}
                </div>
              </div>
            </div>

            {registrations.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No students have registered for this event yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Roll No</th>
                      <th className="px-4 py-3">College</th>
                      <th className="px-4 py-3">Branch & Year</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Checked In</th>
                      <th className="px-4 py-3 text-right">Attendance Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <div>{reg.user?.name ?? "Student"}</div>
                          <div className="text-xs font-normal text-slate-500">{reg.user?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-800">{reg.user?.rollNumber ?? "N/A"}</td>
                        <td className="px-4 py-3 text-xs">{reg.user?.collegeName ?? "Campus University"}</td>
                        <td className="px-4 py-3 text-xs">{reg.user?.branch ?? "General"} {reg.user?.passingYear ? `(${reg.user.passingYear})` : ""}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              reg.status === "ATTENDED"
                                ? "bg-emerald-50 text-emerald-700"
                                : reg.status === "WAITLISTED"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-sky-50 text-sky-700"
                            }`}
                          >
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleTimeString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button
                            variant="ghost"
                            className="h-8 px-2 text-xs gap-1 text-emerald-700 hover:bg-emerald-50"
                            disabled={markAttendanceMutation.isPending || reg.status === "ATTENDED"}
                            onClick={() =>
                              markAttendanceMutation.mutate({
                                registrationId: reg.id,
                                input: { status: "ATTENDED" as RegistrationStatus }
                              })
                            }
                          >
                            <UserCheck size={14} /> Attended
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-8 px-2 text-xs gap-1 text-rose-700 hover:bg-rose-50"
                            disabled={markAttendanceMutation.isPending || reg.status === "NO_SHOW"}
                            onClick={() =>
                              markAttendanceMutation.mutate({
                                registrationId: reg.id,
                                input: { status: "NO_SHOW" as RegistrationStatus }
                              })
                            }
                          >
                            <XCircle size={14} /> No Show
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        )}
      </section>
      <EventChatbotWidget event={event} />
      {showAiKitModal && event && (
        <AiSocialKitModal
          eventId={event.id}
          eventTitle={event.title}
          eventDescription={event.description}
          onClose={() => setShowAiKitModal(false)}
        />
      )}
      {showCertModal && event && (
        <CertificateModal eventId={event.id} onClose={() => setShowCertModal(false)} />
      )}
    </main>
  );
};
