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
import { EventRegistrationModal, parseEventQuestions } from "../components/EventRegistrationModal";
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
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
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

  const rawDescription = event.description || "";
  const [cleanDescription] = rawDescription.split(/###\s*(?:📋\s*)?Attendee Registration Requirements:/i);
  const registrationQuestions = parseEventQuestions(rawDescription);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/events">
              <Button variant="ghost" className="size-9 p-0">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <p className="text-sm font-semibold text-primary">CampuScene</p>
              <h1 className="text-2xl font-bold text-slate-950">Event Showcase</h1>
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

      <section className="mx-auto max-w-7xl px-5 py-8 space-y-8 lg:px-8">
        {isAdmin && event.status === "PENDING_APPROVAL" && (
          <article className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-amber-700" size={24} />
              <div>
                <h3 className="text-lg font-bold text-amber-950">Admin Review Required</h3>
                <p className="text-sm text-amber-800">
                  This event was submitted by a campus society and requires your approval before publication.
                </p>
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

        {/* Modern 2-Column Desktop Architecture */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Left Content (2 Cols) */}
          <div className="space-y-6 lg:col-span-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 space-y-6">
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

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                {event.title}
              </h2>

              {/* Event Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {event.tags.map((t, i) => (
                    <span key={i} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Clean Event Overview Description (No raw markdown questions!) */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-base font-bold text-slate-900 mb-3">About This Event</h3>
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700 font-normal">
                  {cleanDescription.trim()}
                </p>
              </div>

              {/* Clean Registration Form Requirements Card */}
              {registrationQuestions.length > 0 && (
                <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-purple-50/40 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                        <Sparkles size={14} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Registration Form Requirements</h4>
                        <p className="text-xs text-slate-500">Details attendees will submit during registration</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
                      {registrationQuestions.length} Questions
                    </span>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2 pt-2">
                    {registrationQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-indigo-100 bg-white p-3 shadow-2xs text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-900 block">{q.label}</span>
                            <span className="text-[10px] uppercase text-slate-400 font-mono">
                              Type: {q.fieldType}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            q.required
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {q.required ? "Required" : "Optional"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>

          {/* Right Column (1 Col): Sticky Booking & Key Info Card */}
          <div className="space-y-6 lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              {/* Event Quick Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Date</p>
                    <p className="text-sm font-bold text-slate-900">
                      {startDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                      {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Location / Venue</p>
                    <p className="text-sm font-bold text-slate-900">{event.venue}</p>
                    <p className="text-xs text-slate-500">
                      {event.collegeName || "Campus Grounds"} • {event.scope === "INTER_COLLEGE" ? "All Colleges" : "Intra-College"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Capacity Progress */}
              <div className="border-t border-slate-100 pt-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Available Spots</span>
                  <span className="font-bold text-slate-900">
                    {event.registrationCount ?? 0} / {event.capacity} Filled
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all duration-300 ${
                      capacityPercent >= 100 ? "bg-amber-500" : "bg-indigo-600"
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              </div>

              {/* Registration CTA Actions */}
              {event.status === "PUBLISHED" && (
                <div className="border-t border-slate-100 pt-5">
                  {event.userRegistrationStatus === "REGISTERED" ? (
                    <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                        <CheckCircle2 size={18} /> You are Registered!
                      </div>
                      <p className="text-xs text-emerald-700">
                        Your verifiable digital ticket is secured for this event.
                      </p>
                      <div className="flex flex-col gap-2 pt-1">
                        <Button
                          onClick={() => setShowCertModal(true)}
                          className="w-full text-xs gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xs"
                        >
                          <Award size={14} /> View Digital Certificate
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full text-xs text-rose-700 hover:bg-rose-100"
                          disabled={cancelRegistrationMutation.isPending}
                          onClick={() => cancelRegistrationMutation.mutate()}
                        >
                          {cancelRegistrationMutation.isPending ? "Cancelling..." : "Cancel Registration"}
                        </Button>
                      </div>
                    </div>
                  ) : event.userRegistrationStatus === "WAITLISTED" ? (
                    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
                        <Clock size={18} /> You are on the Waitlist
                      </div>
                      <p className="text-xs text-amber-700">
                        All seats are currently filled. If a spot opens up, you will be auto-promoted!
                      </p>
                      <Button
                        variant="ghost"
                        className="w-full text-xs text-rose-700 hover:bg-rose-100"
                        disabled={cancelRegistrationMutation.isPending}
                        onClick={() => cancelRegistrationMutation.mutate()}
                      >
                        {cancelRegistrationMutation.isPending ? "Cancelling..." : "Leave Waitlist"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full py-5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer gap-2"
                      disabled={registerMutation.isPending}
                      onClick={() => setShowRegistrationModal(true)}
                    >
                      <Ticket size={18} /> Register for Event
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

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
      {showRegistrationModal && event && (
        <EventRegistrationModal
          event={event}
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          isSubmitting={registerMutation.isPending}
          onSubmit={async () => {
            await registerMutation.mutateAsync();
            setShowRegistrationModal(false);
          }}
        />
      )}
    </main>
  );
};
