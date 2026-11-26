import { useState } from "react";
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Copy,
  Eye,
  FileUp,
  Hash,
  HelpCircle,
  List,
  Plus,
  Sparkles,
  Trash2,
  Type,
  X
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export type FormFieldType =
  | "TEXT"
  | "PARAGRAPH"
  | "RADIO"
  | "CHECKBOX"
  | "SELECT"
  | "NUMBER"
  | "DATE"
  | "FILE";

export type FormQuestion = {
  id: string;
  label: string;
  description?: string;
  fieldType: FormFieldType;
  required: boolean;
  options?: string[];
};

export const FIELD_TYPE_OPTIONS: Array<{
  value: FormFieldType;
  label: string;
  icon: any;
  hasOptions?: boolean;
}> = [
  { value: "TEXT", label: "Short Answer", icon: Type },
  { value: "PARAGRAPH", label: "Paragraph", icon: AlignLeft },
  { value: "RADIO", label: "Multiple Choice", icon: CircleDot, hasOptions: true },
  { value: "CHECKBOX", label: "Checkboxes", icon: CheckSquare, hasOptions: true },
  { value: "SELECT", label: "Dropdown", icon: List, hasOptions: true },
  { value: "NUMBER", label: "Number / Phone", icon: Hash },
  { value: "DATE", label: "Date", icon: Calendar },
  { value: "FILE", label: "File Upload", icon: FileUp }
];

export const FORM_PRESETS: Array<{
  name: string;
  questions: Array<Omit<FormQuestion, "id">>;
}> = [
  {
    name: "🏏 Tournament & Sports",
    questions: [
      { label: "Team Name", fieldType: "TEXT", required: true },
      { label: "Captain Full Name", fieldType: "TEXT", required: true },
      { label: "Captain WhatsApp / Mobile Number", fieldType: "NUMBER", required: true },
      {
        label: "Team Members & Roll Numbers (Full Squad)",
        fieldType: "PARAGRAPH",
        required: true,
        description: "List all 6-11 player names and college roll numbers"
      },
      {
        label: "Primary Player Role",
        fieldType: "RADIO",
        required: true,
        options: ["Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"]
      },
      {
        label: "Jersey Size",
        fieldType: "SELECT",
        required: false,
        options: ["S", "M", "L", "XL", "XXL"]
      }
    ]
  },
  {
    name: "💻 Hackathon & Coding",
    questions: [
      { label: "Team Name", fieldType: "TEXT", required: true },
      { label: "GitHub Profile / Portfolio URL", fieldType: "TEXT", required: true },
      {
        label: "Primary Tech Stack",
        fieldType: "CHECKBOX",
        required: true,
        options: ["React / Next.js", "Node.js / Express", "Python / AI / ML", "Flutter / Mobile", "Solidity / Web3"]
      },
      {
        label: "Experience Level",
        fieldType: "RADIO",
        required: false,
        options: ["Beginner (1st Hackathon)", "Intermediate", "Advanced"]
      }
    ]
  },
  {
    name: "🍕 Dietary & Logistics",
    questions: [
      {
        label: "Meal Preference",
        fieldType: "RADIO",
        required: true,
        options: ["Vegetarian", "Non-Vegetarian", "Vegan / Jain"]
      },
      { label: "Emergency Contact Name & Phone", fieldType: "TEXT", required: true },
      { label: "College ID Card Document", fieldType: "FILE", required: true }
    ]
  }
];

type GoogleFormBuilderProps = {
  questions: FormQuestion[];
  onChange: (questions: FormQuestion[]) => void;
  onSuggestAi?: () => void;
  isSuggestingAi?: boolean;
};

export const GoogleFormBuilder = ({
  questions,
  onChange,
  onSuggestAi,
  isSuggestingAi = false
}: GoogleFormBuilderProps) => {
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    questions[0]?.id || null
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Helper to add new question
  const handleAddNewQuestion = (
    type: FormFieldType = "TEXT",
    customDefaults?: Partial<FormQuestion>
  ) => {
    const newQ: FormQuestion = {
      id: "q_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      label: customDefaults?.label || "Untitled Question",
      description: customDefaults?.description || "",
      fieldType: type,
      required: customDefaults?.required ?? false,
      options:
        customDefaults?.options ||
        (["RADIO", "CHECKBOX", "SELECT"].includes(type)
          ? ["Option 1", "Option 2"]
          : undefined)
    };
    const updated = [...questions, newQ];
    onChange(updated);
    setActiveQuestionId(newQ.id);
  };

  // Duplicate a question
  const handleDuplicateQuestion = (index: number) => {
    const source = questions[index];
    const duplicate: FormQuestion = {
      ...source,
      id: "q_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      label: `${source.label} (Copy)`
    };
    const updated = [...questions];
    updated.splice(index + 1, 0, duplicate);
    onChange(updated);
    setActiveQuestionId(duplicate.id);
  };

  // Delete a question
  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, idx) => idx !== index);
    onChange(updated);
    if (activeQuestionId === questions[index]?.id) {
      setActiveQuestionId(updated[0]?.id || null);
    }
  };

  // Move Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...questions];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  // Move Down
  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return;
    const updated = [...questions];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  // Update question property
  const handleUpdateQuestion = (index: number, updates: Partial<FormQuestion>) => {
    const updated = questions.map((q, idx) => {
      if (idx !== index) return q;
      const next = { ...q, ...updates };

      // Initialize default options if switching to a choice type
      if (
        updates.fieldType &&
        ["RADIO", "CHECKBOX", "SELECT"].includes(updates.fieldType) &&
        (!next.options || next.options.length === 0)
      ) {
        next.options = ["Option 1", "Option 2"];
      }
      return next;
    });
    onChange(updated);
  };

  // Options management
  const handleAddOption = (questionIndex: number) => {
    const q = questions[questionIndex];
    const existing = q.options || [];
    const newOptions = [...existing, `Option ${existing.length + 1}`];
    handleUpdateQuestion(questionIndex, { options: newOptions });
  };

  const handleUpdateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const q = questions[questionIndex];
    const newOptions = [...(q.options || [])];
    newOptions[optionIndex] = value;
    handleUpdateQuestion(questionIndex, { options: newOptions });
  };

  const handleDeleteOption = (questionIndex: number, optionIndex: number) => {
    const q = questions[questionIndex];
    const newOptions = (q.options || []).filter((_, idx) => idx !== optionIndex);
    handleUpdateQuestion(questionIndex, { options: newOptions });
  };

  // Apply a template preset
  const handleApplyPreset = (preset: (typeof FORM_PRESETS)[0]) => {
    const newItems: FormQuestion[] = preset.questions.map((pq, idx) => ({
      ...pq,
      id: "q_" + Date.now() + "_" + idx + "_" + Math.random().toString(36).substring(2, 6)
    }));
    onChange([...questions, ...newItems]);
  };

  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/40 via-white to-white shadow-sm overflow-hidden space-y-5 p-5 sm:p-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-indigo-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <CheckSquare size={16} />
            </span>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Google Forms Registration Studio
            </h3>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              {questions.length} {questions.length === 1 ? "Field" : "Fields"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Build custom registration questions for your attendees, choose question types, and require answers before RSVP.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowPreviewModal(true)}
            className="h-8 gap-1.5 text-xs font-semibold border-indigo-200 text-indigo-900 bg-white hover:bg-indigo-50"
          >
            <Eye size={14} className="text-indigo-600" />
            Preview Form
          </Button>

          {onSuggestAi && (
            <Button
              type="button"
              onClick={onSuggestAi}
              disabled={isSuggestingAi}
              className="h-8 gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <Sparkles size={14} className={isSuggestingAi ? "animate-spin" : ""} />
              {isSuggestingAi ? "AI Generating..." : "✨ AI Suggest Fields"}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Template Presets */}
      <div className="flex items-center gap-2 flex-wrap pb-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Quick Presets:
        </span>
        {FORM_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-800 transition cursor-pointer shadow-2xs"
          >
            + {preset.name}
          </button>
        ))}
      </div>

      {/* Form Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 p-8 text-center space-y-3">
            <CheckSquare size={32} className="mx-auto text-indigo-400" />
            <div>
              <p className="text-sm font-bold text-slate-800">Your Registration Form is Empty</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Add fields like Short Answer, Multiple Choice, Checkboxes, Dropdowns, or File Uploads. Attendees will fill them when booking tickets.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                type="button"
                onClick={() => handleAddNewQuestion("TEXT")}
                className="gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus size={14} /> Add First Question
              </Button>
            </div>
          </div>
        ) : (
          questions.map((q, idx) => {
            const isSelected = activeQuestionId === q.id;
            const currentTypeConfig =
              FIELD_TYPE_OPTIONS.find((t) => t.value === q.fieldType) || FIELD_TYPE_OPTIONS[0];
            const TypeIcon = currentTypeConfig.icon;

            return (
              <div
                key={q.id}
                onClick={() => setActiveQuestionId(q.id)}
                className={`relative rounded-xl border bg-white transition-all shadow-xs overflow-hidden ${
                  isSelected
                    ? "border-indigo-500 ring-2 ring-indigo-500/10 shadow-md"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Google Forms Left Accent Bar */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600" />
                )}

                <div className="p-4 sm:p-5 space-y-4">
                  {/* Question Header & Type Selection */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 grow">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                        {idx + 1}
                      </span>
                      <Input
                        className="text-sm font-bold border-slate-200 focus:border-indigo-600 grow bg-slate-50/50 focus:bg-white"
                        placeholder="Type question title here (e.g., Team Name, GitHub Profile)..."
                        value={q.label}
                        onChange={(e) => handleUpdateQuestion(idx, { label: e.target.value })}
                      />
                    </div>

                    <div className="sm:w-56 shrink-0">
                      <select
                        className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 transition"
                        value={q.fieldType}
                        onChange={(e) =>
                          handleUpdateQuestion(idx, {
                            fieldType: e.target.value as FormFieldType
                          })
                        }
                      >
                        {FIELD_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Optional Help Text */}
                  <div>
                    <Input
                      className="text-xs text-slate-600 border-dashed border-slate-200 placeholder:text-slate-400 bg-slate-50/30"
                      placeholder="Add optional helper note or instructions for the student (optional)..."
                      value={q.description || ""}
                      onChange={(e) => handleUpdateQuestion(idx, { description: e.target.value })}
                    />
                  </div>

                  {/* Options List for Choice Types */}
                  {currentTypeConfig.hasOptions && (
                    <div className="pl-6 space-y-2 border-l-2 border-indigo-100 mt-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Options:
                      </p>
                      {(q.options || []).map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <span className="text-slate-400 shrink-0">
                            {q.fieldType === "RADIO" && <CircleDot size={14} />}
                            {q.fieldType === "CHECKBOX" && <CheckSquare size={14} />}
                            {q.fieldType === "SELECT" && (
                              <span className="text-[11px] font-mono">{oIdx + 1}.</span>
                            )}
                          </span>
                          <Input
                            className="h-8 text-xs grow border-slate-200"
                            value={opt}
                            onChange={(e) => handleUpdateOption(idx, oIdx, e.target.value)}
                            placeholder={`Option ${oIdx + 1}`}
                          />
                          {(q.options || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteOption(idx, oIdx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                              title="Delete option"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddOption(idx)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={13} /> Add another option
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Non-Choice Type Placeholders */}
                  {!currentTypeConfig.hasOptions && (
                    <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-xs text-slate-400 flex items-center gap-2">
                      <TypeIcon size={16} className="text-slate-400" />
                      <span>
                        {q.fieldType === "TEXT" && "Single-line short answer input field"}
                        {q.fieldType === "PARAGRAPH" && "Multi-line paragraph text area"}
                        {q.fieldType === "NUMBER" && "Numeric / Phone keypad input field"}
                        {q.fieldType === "DATE" && "Date picker calendar selector"}
                        {q.fieldType === "FILE" && "Attachment / Document file upload field"}
                      </span>
                    </div>
                  )}

                  {/* Question Footer Toolbar */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    {/* Move Up/Down */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer"
                        title="Move question up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === questions.length - 1}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer"
                        title="Move question down"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    {/* Duplicate, Delete, Required Switch */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDuplicateQuestion(idx)}
                        className="text-slate-500 hover:text-indigo-600 p-1.5 rounded hover:bg-slate-100 transition cursor-pointer"
                        title="Duplicate question"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(idx)}
                        className="text-slate-500 hover:text-rose-600 p-1.5 rounded hover:bg-slate-100 transition cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="h-4 w-px bg-slate-200" />

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-xs font-semibold text-slate-700">Required</span>
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) =>
                            handleUpdateQuestion(idx, { required: e.target.checked })
                          }
                          className="size-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Question Button */}
      <div className="flex items-center justify-center pt-2">
        <Button
          type="button"
          onClick={() => handleAddNewQuestion("TEXT")}
          className="w-full sm:w-auto font-bold bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs gap-2"
        >
          <Plus size={16} /> Add Question
        </Button>
      </div>

      {/* Google Form Live Preview Modal */}
      {showPreviewModal && (
        <GoogleFormPreviewModal
          questions={questions}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
};

// Modal that showcases the live student registration view
const GoogleFormPreviewModal = ({
  questions,
  onClose
}: {
  questions: FormQuestion[];
  onClose: () => void;
}) => {
  const [sampleAnswers, setSampleAnswers] = useState<Record<string, any>>({});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Google Form Purple Accent Header */}
        <div className="bg-indigo-600 h-3 w-full" />

        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              <Eye size={12} /> Attendee Form Preview
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Event Registration Form
            </h3>
            <p className="text-xs text-slate-500">
              This is how your questions will appear to students registering on the event page.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {questions.length === 0 ? (
            <p className="text-center py-8 text-sm text-slate-500">
              No questions in this form yet. Add some questions to preview them!
            </p>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-3"
              >
                <div>
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-1">
                    {idx + 1}. {q.label}
                    {q.required && <span className="text-rose-600">*</span>}
                  </label>
                  {q.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{q.description}</p>
                  )}
                </div>

                {/* Question Renderers */}
                {q.fieldType === "TEXT" && (
                  <Input
                    className="text-xs bg-white"
                    placeholder="Short answer text"
                    value={sampleAnswers[q.id] || ""}
                    onChange={(e) =>
                      setSampleAnswers({ ...sampleAnswers, [q.id]: e.target.value })
                    }
                  />
                )}

                {q.fieldType === "PARAGRAPH" && (
                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    placeholder="Long answer text"
                    value={sampleAnswers[q.id] || ""}
                    onChange={(e) =>
                      setSampleAnswers({ ...sampleAnswers, [q.id]: e.target.value })
                    }
                  />
                )}

                {q.fieldType === "NUMBER" && (
                  <Input
                    type="number"
                    className="text-xs bg-white"
                    placeholder="Numeric answer (e.g. 9876543210)"
                    value={sampleAnswers[q.id] || ""}
                    onChange={(e) =>
                      setSampleAnswers({ ...sampleAnswers, [q.id]: e.target.value })
                    }
                  />
                )}

                {q.fieldType === "DATE" && (
                  <Input
                    type="date"
                    className="text-xs bg-white"
                    value={sampleAnswers[q.id] || ""}
                    onChange={(e) =>
                      setSampleAnswers({ ...sampleAnswers, [q.id]: e.target.value })
                    }
                  />
                )}

                {q.fieldType === "FILE" && (
                  <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white p-4 text-center cursor-pointer hover:bg-slate-50 transition">
                    <FileUp size={20} className="mx-auto text-slate-400 mb-1" />
                    <p className="text-xs font-semibold text-slate-700">Upload document or file</p>
                    <p className="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</p>
                  </div>
                )}

                {q.fieldType === "RADIO" && (
                  <div className="space-y-2">
                    {(q.options || []).map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`preview_${q.id}`}
                          value={opt}
                          checked={sampleAnswers[q.id] === opt}
                          onChange={() =>
                            setSampleAnswers({ ...sampleAnswers, [q.id]: opt })
                          }
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.fieldType === "CHECKBOX" && (
                  <div className="space-y-2">
                    {(q.options || []).map((opt, oIdx) => {
                      const currentSelected = sampleAnswers[q.id] || [];
                      const isChecked = currentSelected.includes(opt);
                      return (
                        <label
                          key={oIdx}
                          className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...currentSelected, opt]
                                : currentSelected.filter((item: string) => item !== opt);
                              setSampleAnswers({ ...sampleAnswers, [q.id]: next });
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.fieldType === "SELECT" && (
                  <select
                    className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-600"
                    value={sampleAnswers[q.id] || ""}
                    onChange={(e) =>
                      setSampleAnswers({ ...sampleAnswers, [q.id]: e.target.value })
                    }
                  >
                    <option value="">-- Choose an option --</option>
                    {(q.options || []).map((opt, oIdx) => (
                      <option key={oIdx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            * Indicates required question
          </span>
          <Button
            type="button"
            onClick={onClose}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
          >
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
};
