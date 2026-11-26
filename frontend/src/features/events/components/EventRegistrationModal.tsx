import { useState } from "react";
import {
  AlertCircle,
  AlignLeft,
  Calendar,
  CheckCircle2,
  CheckSquare,
  CircleDot,
  FileUp,
  Hash,
  List,
  ListFilter,
  Loader2,
  Sparkles,
  Ticket,
  Type,
  X
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type { EventItem } from "../services/eventsApi";
import type { FormFieldType, FormQuestion } from "./GoogleFormBuilder";

export type RegistrationQuestion = FormQuestion;

export function parseEventQuestions(description?: string): RegistrationQuestion[] {
  if (!description) return [];
  const match = description.match(/###\s*(?:📋\s*)?Attendee Registration Requirements:\s*([\s\S]*?)(?:$|\n###)/i);
  if (!match) return [];
  const lines = match[1].split("\n").map((l) => l.trim()).filter((l) => l.startsWith("-"));
  const questions: RegistrationQuestion[] = [];

  for (const line of lines) {
    const labelMatch = line.match(/-\s*\*\*([^*]+)\*\*/);
    if (!labelMatch) continue;
    const label = labelMatch[1].trim();

    const required = /\(Required/i.test(line);

    const typeMatch = line.match(/Type:\s*([A-Za-z_]+)/i);
    const fieldType = (typeMatch ? typeMatch[1].toUpperCase() : "TEXT") as FormFieldType;

    // Parse options if present (supports [A, B] brackets or comma/pipe separated)
    let options: string[] | undefined;
    const optionsBracketMatch = line.match(/Options:\s*\[([^\]]*)\]/i);
    if (optionsBracketMatch) {
      const parsed = optionsBracketMatch[1].split(",").map((o) => o.trim()).filter(Boolean);
      if (parsed.length > 0) options = parsed;
    } else {
      const optionsMatch = line.match(/Options:\s*([^)]*?)(?:,\s*Desc:|\)$)/i);
      if (optionsMatch) {
        const parsed = optionsMatch[1]
          .split(/[,|]/)
          .map((o) => o.trim())
          .filter(Boolean);
        if (parsed.length > 0) options = parsed;
      }
    }

    const descMatch = line.match(/Desc:\s*([^)]+)/i);
    const desc = descMatch ? descMatch[1].trim() : undefined;

    questions.push({
      id: "q_" + Math.random().toString(36).substring(2, 7),
      label,
      description: desc,
      required,
      fieldType,
      options
    });
  }
  return questions;
}

type EventRegistrationModalProps = {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (answers: Record<string, any>) => void;
  isSubmitting: boolean;
};

export const EventRegistrationModal = ({
  event,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}: EventRegistrationModalProps) => {
  if (!isOpen) return null;

  const questions = parseEventQuestions(event.description);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (label: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [label]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleCheckboxChange = (label: string, option: string, checked: boolean) => {
    const current = (answers[label] as string[]) || [];
    const updated = checked ? [...current, option] : current.filter((o) => o !== option);
    handleInputChange(label, updated);
  };

  const handleFileUpload = (label: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [label]: file.name }));
      handleInputChange(label, file.name);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce required fields
    for (const q of questions) {
      if (q.required) {
        const val = answers[q.label];
        if (
          val === undefined ||
          val === null ||
          (typeof val === "string" && val.trim().length === 0) ||
          (Array.isArray(val) && val.length === 0)
        ) {
          setErrorMsg(`Please answer the required question: "${q.label}"`);
          return;
        }
      }
    }

    onSubmit(answers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Google Form Indigo Accent Bar */}
        <div className="bg-indigo-600 h-2.5 w-full" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/60 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Ticket size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">Event Registration</h3>
                {questions.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    <Sparkles size={11} /> Google Form Powered
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 line-clamp-1">{event.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {questions.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-indigo-950 flex items-start gap-2">
                <ListFilter size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  Please complete the following required details specified by the event organizer to register and claim your ticket.
                </p>
              </div>

              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/30 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-900 flex items-center gap-1">
                      {idx + 1}. {q.label}
                      {q.required ? (
                        <span className="text-rose-600 font-bold">*</span>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
                      )}
                    </label>
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      {q.fieldType}
                    </span>
                  </div>

                  {q.description && (
                    <p className="text-xs text-slate-500 pb-1">{q.description}</p>
                  )}

                  {/* Field Type Specific Renderers */}
                  {q.fieldType === "TEXT" && (
                    <Input
                      type="text"
                      className="text-xs bg-white"
                      placeholder={`Enter ${q.label.toLowerCase()}...`}
                      value={answers[q.label] || ""}
                      onChange={(e) => handleInputChange(q.label, e.target.value)}
                    />
                  )}

                  {q.fieldType === "PARAGRAPH" && (
                    <textarea
                      rows={3}
                      className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
                      placeholder={`Provide details for ${q.label.toLowerCase()}...`}
                      value={answers[q.label] || ""}
                      onChange={(e) => handleInputChange(q.label, e.target.value)}
                    />
                  )}

                  {q.fieldType === "NUMBER" && (
                    <Input
                      type="number"
                      className="text-xs bg-white"
                      placeholder={`Enter numeric ${q.label.toLowerCase()}...`}
                      value={answers[q.label] || ""}
                      onChange={(e) => handleInputChange(q.label, e.target.value)}
                    />
                  )}

                  {q.fieldType === "DATE" && (
                    <Input
                      type="date"
                      className="text-xs bg-white"
                      value={answers[q.label] || ""}
                      onChange={(e) => handleInputChange(q.label, e.target.value)}
                    />
                  )}

                  {q.fieldType === "RADIO" && (
                    <div className="space-y-2 pt-1">
                      {(q.options || []).map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`radio_${q.label}`}
                            value={opt}
                            checked={answers[q.label] === opt}
                            onChange={() => handleInputChange(q.label, opt)}
                            className="text-indigo-600 focus:ring-indigo-500 size-3.5"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.fieldType === "CHECKBOX" && (
                    <div className="space-y-2 pt-1">
                      {(q.options || []).map((opt, oIdx) => {
                        const currentArr = (answers[q.label] as string[]) || [];
                        const isChecked = currentArr.includes(opt);
                        return (
                          <label
                            key={oIdx}
                            className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                handleCheckboxChange(q.label, opt, e.target.checked)
                              }
                              className="rounded text-indigo-600 focus:ring-indigo-500 size-3.5"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {q.fieldType === "SELECT" && (
                    <select
                      className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
                      value={answers[q.label] || ""}
                      onChange={(e) => handleInputChange(q.label, e.target.value)}
                    >
                      <option value="">-- Select an option --</option>
                      {(q.options || []).map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {q.fieldType === "FILE" && (
                    <div className="space-y-2">
                      <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-3 hover:bg-slate-50 transition cursor-pointer">
                        <FileUp size={18} className="text-slate-400 mb-1" />
                        <span className="text-xs font-semibold text-slate-700">
                          {uploadedFiles[q.label] ? "Change File" : "Choose File to Upload"}
                        </span>
                        <span className="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(q.label, e)}
                        />
                      </label>
                      {uploadedFiles[q.label] && (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md">
                          <CheckCircle2 size={14} /> Attached: {uploadedFiles[q.label]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center space-y-2">
              <CheckCircle2 size={24} className="text-emerald-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-900">
                Ready to confirm your attendance!
              </p>
              <p className="text-xs text-slate-500">
                Click below to secure your spot for <strong>{event.title}</strong>. Your verifiable QR ticket will be issued immediately.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Confirming Registration...
                </>
              ) : (
                <>
                  <Ticket size={14} /> Submit & Confirm Registration
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
