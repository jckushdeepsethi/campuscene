import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CalendarPlus, Globe2, Loader2, School, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useCurrentUser } from "../../auth/hooks/useAuth";
import { useCreateEvent } from "../hooks/useEvents";
import { eventsApi } from "../services/eventsApi";
import { getErrorMessage } from "../../../lib/errors";
import { eventFormSchema, type EventFormValues } from "../schemas/eventSchemas";

export const CreateEventPage = () => {
  const { data: user } = useCurrentUser();
  const createEventMutation = useCreateEvent();
  const navigate = useNavigate();
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const isSociety = user?.role === "SOCIETY";
  const isPendingVerification = user?.status === "PENDING_VERIFICATION";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      venue: "",
      capacity: 50,
      startsAt: "",
      endsAt: "",
      scope: "INTRA_COLLEGE",
      collegeName: user?.collegeName ?? "",
      allowedBranchesInput: "",
      allowedPassingYearsInput: "",
      status: "PENDING_APPROVAL"
    }
  });

  const selectedScope = watch("scope");
  const currentTitle = watch("title");

  const handleAiGenerate = async () => {
    if (!currentTitle || currentTitle.trim().length < 3) {
      alert("Please enter an Event Title (at least 3 letters) first before using AI Auto-Fill.");
      return;
    }

    setIsGeneratingAi(true);
    try {
      const suggestion = await eventsApi.generateAiDetails(currentTitle);
      setValue("description", suggestion.description);
      setValue("venue", suggestion.venue);
      setValue("capacity", suggestion.suggestedCapacity);
      if (suggestion.allowedBranches?.length > 0) {
        setValue("allowedBranchesInput", suggestion.allowedBranches.join(", "));
      }
      if (suggestion.allowedPassingYears?.length > 0) {
        setValue("allowedPassingYearsInput", suggestion.allowedPassingYears.join(", "));
      }
    } catch {
      alert("Failed to generate AI event details.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const onSubmit = (values: EventFormValues) => {
    const startsAtISO = values.startsAt ? new Date(values.startsAt).toISOString() : new Date().toISOString();
    const endsAtISO = values.endsAt ? new Date(values.endsAt).toISOString() : new Date(Date.now() + 3600000).toISOString();

    const allowedBranches = values.allowedBranchesInput
      ? values.allowedBranchesInput.split(",").map((b) => b.trim()).filter(Boolean)
      : [];

    const allowedPassingYears = values.allowedPassingYearsInput
      ? values.allowedPassingYearsInput.split(",").map((y) => Number(y.trim())).filter((n) => !isNaN(n))
      : [];

    const tags = allowedBranches.length > 0 ? allowedBranches : ["Campus Event"];

    createEventMutation.mutate(
      {
        title: values.title,
        description: values.description,
        venue: values.venue,
        capacity: values.capacity,
        startsAt: startsAtISO,
        endsAt: endsAtISO,
        scope: values.scope ?? "INTRA_COLLEGE",
        collegeName: values.collegeName || user?.collegeName || undefined,
        allowedBranches,
        allowedPassingYears,
        tags,
        status: isSociety ? "PENDING_APPROVAL" : "PUBLISHED"
      },
      {
        onSuccess: () => {
          navigate("/events");
        }
      }
    );
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/events">
              <Button variant="ghost" className="size-9 p-0">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <p className="text-sm font-semibold text-primary">CampuScene</p>
              <h1 className="text-2xl font-bold text-slate-950">Create Campus / Inter-College Event</h1>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-8 lg:px-8">
        {isPendingVerification && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm flex items-start gap-3">
            <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm">Society Account Pending Admin Approval</p>
              <p>
                Your society account is currently awaiting verification by a University Admin. Once an Admin approves your society account from the Admin Governance Dashboard, your submitted events will be published!
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {createEventMutation.isError && (
            <div className="mb-6 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {getErrorMessage(createEventMutation.error, "Failed to create event. Please check inputs.")}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-900">Event Title</label>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isGeneratingAi}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles size={14} className="text-indigo-600 animate-pulse" />
                  {isGeneratingAi ? "Generating..." : "✨ Auto-Fill with AI Copilot"}
                </button>
              </div>
              <Input
                className="mt-1"
                placeholder="e.g. Annual Tech Symposium / Inter-College Hackathon 2026"
                {...register("title")}
              />
              {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
            </div>

            {/* Scope Selection */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-600">Event Scope & College Eligibility</span>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition ${
                  selectedScope === "INTRA_COLLEGE" ? "border-primary bg-white shadow-sm" : "border-slate-200 bg-white/50"
                }`}>
                  <input type="radio" value="INTRA_COLLEGE" {...register("scope")} className="text-primary focus:ring-primary" />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                      <School size={16} className="text-sky-600" /> Intra-College Only
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Restricted to students of host college</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition ${
                  selectedScope === "INTER_COLLEGE" ? "border-primary bg-white shadow-sm" : "border-slate-200 bg-white/50"
                }`}>
                  <input type="radio" value="INTER_COLLEGE" {...register("scope")} className="text-primary focus:ring-primary" />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                      <Globe2 size={16} className="text-indigo-600" /> Inter-College Open
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Open to students from ALL universities</p>
                  </div>
                </label>
              </div>

              {selectedScope === "INTRA_COLLEGE" && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700">Host College / Institution Name</label>
                  <Input
                    className="mt-1 text-xs"
                    placeholder="e.g. Campus University / IIT Delhi"
                    {...register("collegeName")}
                  />
                </div>
              )}
            </div>

            {/* Target Audience Filtering */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-600">Target Student Audience (Optional Filters)</span>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Allowed Branches (Comma Separated)</label>
                  <Input
                    className="mt-1 text-xs"
                    placeholder="e.g. Computer Science, IT, Electrical (Leave empty for all)"
                    {...register("allowedBranchesInput")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Allowed Graduation Years (Comma Separated)</label>
                  <Input
                    className="mt-1 text-xs"
                    placeholder="e.g. 2025, 2026 (Leave empty for all years)"
                    {...register("allowedPassingYearsInput")}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900">Description</label>
              <textarea
                rows={5}
                className="mt-1 w-full rounded-md border border-input bg-white p-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Describe the event, agenda, rules, and expectations..."
                {...register("description")}
              />
              {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-900">Venue / Location</label>
                <Input
                  className="mt-1"
                  placeholder="e.g. Main Auditorium / Lab 3"
                  {...register("venue")}
                />
                {errors.venue && <p className="mt-1 text-xs text-rose-600">{errors.venue.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900">Total Capacity</label>
                <Input
                  type="number"
                  className="mt-1"
                  {...register("capacity", { valueAsNumber: true })}
                />
                {errors.capacity && <p className="mt-1 text-xs text-rose-600">{errors.capacity.message}</p>}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-900">Start Date & Time</label>
                <Input
                  type="datetime-local"
                  className="mt-1"
                  {...register("startsAt")}
                />
                {errors.startsAt && <p className="mt-1 text-xs text-rose-600">{errors.startsAt.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900">End Date & Time</label>
                <Input
                  type="datetime-local"
                  className="mt-1"
                  {...register("endsAt")}
                />
                {errors.endsAt && <p className="mt-1 text-xs text-rose-600">{errors.endsAt.message}</p>}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
            <Link to="/events">
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
            <Button className="gap-2 font-bold" disabled={createEventMutation.isPending} type="submit">
              {createEventMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CalendarPlus size={16} />}
              {createEventMutation.isPending
                ? "Submitting..."
                : isSociety
                ? "Submit for Admin Approval"
                : "Publish Event Instantly"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
};
