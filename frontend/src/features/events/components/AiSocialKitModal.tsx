import { useState } from "react";
import { Check, Copy, FileText, Loader2, Mail, Share2, Sparkles, X } from "lucide-react";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/Button";

export const AiSocialKitModal = ({
  eventId,
  eventTitle,
  eventDescription,
  onClose
}: {
  eventId: string;
  eventTitle: string;
  eventDescription: string;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<"social" | "email" | "faqs">("social");
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [socialKit, setSocialKit] = useState<any>(null);
  const [emailDraft, setEmailDraft] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);

  const [emailTone, setEmailTone] = useState<"Professional" | "Friendly" | "Exciting" | "Formal">("Exciting");
  const [emailType, setEmailType] = useState<"REGISTRATION" | "REMINDER" | "THANK_YOU" | "WINNER_ANNOUNCEMENT">("REGISTRATION");

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchSocialKit = async () => {
    setLoading(true);
    try {
      const res = await api.post<{ data: any }>("/ai/social-kit", {
        title: eventTitle,
        description: eventDescription
      });
      setSocialKit(res.data.data);
    } catch {
      alert("Failed to generate social media kit.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailDraft = async () => {
    setLoading(true);
    try {
      const res = await api.post<{ data: any }>("/ai/generate-email", {
        eventType: emailType,
        eventTitle: eventTitle,
        tone: emailTone
      });
      setEmailDraft(res.data.data);
    } catch {
      alert("Failed to generate email draft.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await api.post<{ data: any[] }>("/ai/generate-faqs", {
        title: eventTitle,
        description: eventDescription
      });
      setFaqs(res.data.data);
    } catch {
      alert("Failed to generate FAQs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-5 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400" size={20} />
            <h3 className="text-base font-bold">AI Organizer Marketing & Social Kit</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            onClick={() => {
              setActiveTab("social");
              if (!socialKit) fetchSocialKit();
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-t border-x ${
              activeTab === "social" ? "bg-white text-indigo-600 border-slate-200" : "text-slate-600 border-transparent hover:bg-slate-100"
            }`}
          >
            <Share2 size={14} /> Social & Poster Kit
          </button>
          <button
            onClick={() => {
              setActiveTab("email");
              if (!emailDraft) fetchEmailDraft();
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-t border-x ${
              activeTab === "email" ? "bg-white text-indigo-600 border-slate-200" : "text-slate-600 border-transparent hover:bg-slate-100"
            }`}
          >
            <Mail size={14} /> AI Email Generator
          </button>
          <button
            onClick={() => {
              setActiveTab("faqs");
              if (faqs.length === 0) fetchFaqs();
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-t border-x ${
              activeTab === "faqs" ? "bg-white text-indigo-600 border-slate-200" : "text-slate-600 border-transparent hover:bg-slate-100"
            }`}
          >
            <FileText size={14} /> Auto FAQs
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading && (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto" />
              <p className="font-semibold text-slate-700">Google Gemini AI is crafting content...</p>
            </div>
          )}

          {!loading && activeTab === "social" && (
            <div className="space-y-4">
              {!socialKit ? (
                <div className="text-center py-6">
                  <Button onClick={fetchSocialKit} className="gap-2 bg-indigo-600 hover:bg-indigo-500">
                    <Sparkles size={16} /> Generate Social Kit with AI
                  </Button>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-slate-500">Poster Headline & Tagline</span>
                      <Button
                        variant="ghost"
                        className="h-7 text-[11px] gap-1"
                        onClick={() => handleCopy(`${socialKit.headline}\n${socialKit.tagline}`, "headline")}
                      >
                        {copiedKey === "headline" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />} Copy
                      </Button>
                    </div>
                    <p className="text-sm font-extrabold text-slate-950">{socialKit.headline}</p>
                    <p className="text-xs italic text-indigo-600">{socialKit.tagline}</p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-slate-500">Instagram Caption</span>
                      <Button
                        variant="ghost"
                        className="h-7 text-[11px] gap-1"
                        onClick={() => handleCopy(`${socialKit.instagramCaption}\n\n${(socialKit.hashtags || []).join(" ")}`, "ig")}
                      >
                        {copiedKey === "ig" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />} Copy IG Text
                      </Button>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap">{socialKit.instagramCaption}</p>
                    <p className="text-[11px] font-bold text-indigo-700">{(socialKit.hashtags || []).join(" ")}</p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-slate-500">LinkedIn Post</span>
                      <Button
                        variant="ghost"
                        className="h-7 text-[11px] gap-1"
                        onClick={() => handleCopy(socialKit.linkedInAnnouncement, "li")}
                      >
                        {copiedKey === "li" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />} Copy LinkedIn Text
                      </Button>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap">{socialKit.linkedInAnnouncement}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {!loading && activeTab === "email" && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email Type</label>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-xs font-medium"
                    value={emailType}
                    onChange={(e: any) => setEmailType(e.target.value)}
                  >
                    <option value="REGISTRATION">Registration Confirmation</option>
                    <option value="REMINDER">24-Hour Event Reminder</option>
                    <option value="THANK_YOU">Post-Event Thank You</option>
                    <option value="WINNER_ANNOUNCEMENT">Winner Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email Tone</label>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-xs font-medium"
                    value={emailTone}
                    onChange={(e: any) => setEmailTone(e.target.value)}
                  >
                    <option value="Exciting">Exciting 🔥</option>
                    <option value="Professional">Professional 💼</option>
                    <option value="Friendly">Friendly 😊</option>
                    <option value="Formal">Formal 🏛️</option>
                  </select>
                </div>
              </div>

              <div className="text-right">
                <Button onClick={fetchEmailDraft} className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500">
                  <Sparkles size={14} /> Generate Email
                </Button>
              </div>

              {emailDraft && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <p className="text-xs font-bold text-slate-900">Subject: {emailDraft.subject}</p>
                    <Button
                      variant="ghost"
                      className="h-7 text-[11px] gap-1"
                      onClick={() => handleCopy(`Subject: ${emailDraft.subject}\n\n${emailDraft.body}`, "email")}
                    >
                      {copiedKey === "email" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />} Copy Entire Email
                    </Button>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap font-sans">{emailDraft.body}</p>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === "faqs" && (
            <div className="space-y-4">
              {faqs.length === 0 ? (
                <div className="text-center py-6">
                  <Button onClick={fetchFaqs} className="gap-2 bg-indigo-600 hover:bg-indigo-500">
                    <Sparkles size={16} /> Generate FAQs with AI
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                      <p className="text-xs font-bold text-indigo-900">Q: {faq.question}</p>
                      <p className="text-xs text-slate-600">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
