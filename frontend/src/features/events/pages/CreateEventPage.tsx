import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  Globe2,
  ListPlus,
  Loader2,
  Plus,
  School,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { GoogleFormBuilder, type FormQuestion, type FormFieldType } from "../components/GoogleFormBuilder";
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

  // AI Feature States
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<{
    isDuplicate: boolean;
    similarEventTitle: string | null;
    similarityScorePercent: number;
    warningMessage: string | null;
  } | null>(null);

  const [isModerating, setIsModerating] = useState(false);
  const [moderationResult, setModerationResult] = useState<{
    isSafe: boolean;
    hasAbusiveLanguage: boolean;
    isSpam: boolean;
    isTooShort: boolean;
    feedbackMessage: string;
  } | null>(null);

  const [isSuggestingFields, setIsSuggestingFields] = useState(false);

  // Active Questions chosen/added to the Google Form registration builder
  const [formQuestions, setFormQuestions] = useState<FormQuestion[]>([]);

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

  const handleCheckDuplicate = async () => {
    if (!currentTitle || currentTitle.trim().length < 3) {
      alert("Please enter an Event Title (at least 3 letters) first.");
      return;
    }
    setIsCheckingDuplicate(true);
    try {
      const res = await eventsApi.detectDuplicateEvent(currentTitle);
      setDuplicateResult(res);
    } catch {
      alert("Duplicate check failed.");
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleModerateContent = async () => {
    const desc = watch("description");
    if (!currentTitle || !desc || desc.trim().length < 5) {
      alert("Please enter both Title and Description before running the AI audit.");
      return;
    }
    setIsModerating(true);
    try {
      const res = await eventsApi.moderateContent(currentTitle, desc);
      setModerationResult(res);
    } catch {
      alert("Content moderation check failed.");
    } finally {
      setIsModerating(false);
    }
  };

  const handleSuggestFields = async () => {
    if (!currentTitle || currentTitle.trim().length < 3) {
      alert("Please enter an event title first so AI can suggest custom questions.");
      return;
    }
    setIsSuggestingFields(true);
    try {
      const existingLabels = formQuestions.map((q) => q.label);
      const fields = await eventsApi.suggestFormFields(currentTitle, undefined, existingLabels);
      
      const newItems: FormQuestion[] = fields.map((f, idx) => ({
        id: "q_ai_" + Date.now() + "_" + idx + "_" + Math.random().toString(36).substring(2, 6),
        label: f.label,
        description: "",
        fieldType: (f.fieldType.toUpperCase() as FormFieldType) || "TEXT",
        required: f.required ?? false,
        options: f.options && f.options.length > 0 ? f.options : undefined
      }));

      // Append suggestions avoiding exact duplicates
      setFormQuestions((prev) => {
        const existing = new Set(prev.map((p) => p.label.toLowerCase()));
        const uniqueNew = newItems.filter((item) => !existing.has(item.label.toLowerCase()));
        return [...prev, ...uniqueNew];
      });
    } catch {
      alert("Failed to suggest form fields.");
    } finally {
      setIsSuggestingFields(false);
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

    let finalDescription = values.description;
    if (formQuestions.length > 0) {
      const questionsMarkdown =
        "\n\n### 📋 Attendee Registration Requirements:\n" +
        formQuestions
          .map((q) => {
            let str = `- **${q.label}** (${q.required ? "Required" : "Optional"}, Type: ${q.fieldType}`;
            if (q.options && q.options.length > 0) str += `, Options: [${q.options.join(", ")}]`;
            if (q.description) str += `, Desc: ${q.description}`;
            str += ")";
            return str;
          })
          .join("\n");
      finalDescription = values.description + questionsMarkdown;
    }

    createEventMutation.mutate(
      {
        title: values.title,
        description: finalDescription,
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-sm font-medium text-slate-900">Event Title</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCheckDuplicate}
                    disabled={isCheckingDuplicate}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded-md transition disabled:opacity-50 cursor-pointer"
                    title="Check if a similar event already exists on campus"
                  >
                    <Search size={13} className="text-slate-600" />
                    {isCheckingDuplicate ? "Checking..." : "🔍 Check Duplicates"}
                  </button>
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
              </div>
              <Input
                className="mt-1"
                placeholder="e.g. Annual Tech Symposium / Inter-College Hackathon 2026"
                {...register("title")}
              />
              {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}

              {/* Duplicate Check Notification */}
              {duplicateResult && (
                <div
                  className={`mt-2 rounded-md p-3 text-xs border flex items-start gap-2 ${
                    duplicateResult.isDuplicate
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  }`}
                >
                  {duplicateResult.isDuplicate ? (
                    <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">
                      {duplicateResult.isDuplicate
                        ? `Potential Duplicate (${duplicateResult.similarityScorePercent}% match)`
                        : "Original Event Title"}
                    </span>
                    <p className="mt-0.5">
                      {duplicateResult.warningMessage ||
                        "No conflicting events found on campus. Your event title is unique and ready to publish!"}
                    </p>
                  </div>
                </div>
              )}
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
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-900">Description</label>
                <button
                  type="button"
                  onClick={handleModerateContent}
                  disabled={isModerating}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition disabled:opacity-50 cursor-pointer"
                  title="Run AI content moderation and quality check"
                >
                  <ShieldCheck size={14} className="text-emerald-600" />
                  {isModerating ? "Auditing..." : "🛡️ AI Safety & Quality Audit"}
                </button>
              </div>
              <textarea
                rows={5}
                className="mt-1 w-full rounded-md border border-input bg-white p-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Describe the event, agenda, rules, and expectations..."
                {...register("description")}
              />
              {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}

              {/* Moderation Audit Result Box */}
              {moderationResult && (
                <div
                  className={`mt-2 rounded-md p-3 text-xs border ${
                    moderationResult.isSafe
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      {moderationResult.isSafe ? (
                        <>
                          <CheckCircle2 size={15} className="text-emerald-600" />
                          Passed AI Quality & Safety Guidelines
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={15} className="text-rose-600" />
                          Content Needs Attention
                        </>
                      )}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Spam: {moderationResult.isSpam ? "Detected" : "Clean"} | Abuse:{" "}
                      {moderationResult.hasAbusiveLanguage ? "Detected" : "None"}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-700">{moderationResult.feedbackMessage}</p>
                </div>
              )}
            </div>

            {/* Google Forms Registration Studio */}
            <GoogleFormBuilder
              questions={formQuestions}
              onChange={setFormQuestions}
              onSuggestAi={handleSuggestFields}
              isSuggestingAi={isSuggestingFields}
            />

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
