import { useState } from "react";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type { EventItem } from "../services/eventsApi";

type Message = {
  sender: "user" | "bot";
  text: string;
};

export const EventChatbotWidget = ({ event }: { event: EventItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuestion, setInputQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: `Hi! I'm TheScene AI Assistant for "${event.title}". Ask me anything about eligibility, timings, or deliverables!`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isLoading) return;

    const userText = inputQuestion.trim();
    setInputQuestion("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsLoading(true);

    const eventContext = `Title: ${event.title}
Description: ${event.description}
Venue: ${event.venue}
Starts: ${event.startsAt}
Ends: ${event.endsAt}
Capacity: ${event.capacity}
Scope: ${event.scope}
Host College: ${event.collegeName ?? "Campus University"}
Allowed Branches: ${(event.allowedBranches ?? []).join(", ") || "Open to all"}
Allowed Years: ${(event.allowedPassingYears ?? []).join(", ") || "Open to all"}`;

    try {
      const res = await api.post<{ data: { answer: string } }>("/ai/chatbot", {
        eventContext,
        studentQuestion: userText
      });
      setMessages((prev) => [...prev, { sender: "bot", text: res.data.data.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I encountered an error checking event details." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-primary px-5 py-3.5 text-sm font-bold text-white shadow-xl hover:opacity-95 transition cursor-pointer z-50 border border-indigo-400/30"
      >
        <Bot size={20} className="animate-bounce" />
        <span>Ask Event AI Assistant</span>
        <Sparkles size={16} className="text-amber-300" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] rounded-xl border border-indigo-200 bg-white shadow-2xl z-50 overflow-hidden flex flex-col h-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 p-4 text-white">
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-indigo-500/20 p-2 border border-indigo-400/30">
            <Bot size={18} className="text-indigo-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold truncate max-w-[200px]">{event.title} AI</h4>
            <p className="text-[10px] text-indigo-200">Strict Non-Hallucination Event Assistant</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            {m.sender === "bot" && (
              <div className="size-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
                <Bot size={14} className="text-indigo-600" />
              </div>
            )}
            <div
              className={`rounded-lg px-3.5 py-2.5 text-xs max-w-[80%] ${
                m.sender === "user"
                  ? "bg-primary text-white font-medium"
                  : "bg-white text-slate-800 border border-slate-200 shadow-sm"
              }`}
            >
              {m.text}
            </div>
            {m.sender === "user" && (
              <div className="size-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User size={14} className="text-slate-600" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
            <Loader2 size={14} className="animate-spin text-indigo-600" />
            <span>Consulting event specifications...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <Input
          className="text-xs"
          placeholder="Ask a question (e.g. Is laptop compulsory?)"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
        />
        <Button type="submit" disabled={isLoading} className="size-9 p-0 shrink-0 bg-indigo-600 hover:bg-indigo-500">
          <Send size={14} />
        </Button>
      </form>
    </div>
  );
};
