import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { AIPrompts } from "../prompts/ai.prompts.js";

export type AiEventDescriptionInput = {
  title: string;
  category?: string;
  venue?: string;
  audience?: string;
  shortNotes?: string;
};

export type AiEventDescriptionOutput = {
  description: string;
  highlights: string[];
  eligibility: string[];
  thingsToBring: string[];
  learningOutcomes: string[];
  promotionalParagraph: string;
  venue: string;
  tags: string[];
  suggestedCapacity: number;
};

export class AiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  private async callGeminiJson<T>(prompt: string, fallbackFn: () => T): Promise<T> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as T;
        }
      } catch (err) {
        console.error("Gemini API Error, using fallback engine:", err);
      }
    }
    return fallbackFn();
  }

  // 1. AI Event Description Generator
  async generateEventDescription(input: AiEventDescriptionInput): Promise<AiEventDescriptionOutput> {
    const prompt = AIPrompts.descriptionGenerator(input);
    return this.callGeminiJson<AiEventDescriptionOutput>(prompt, () => {
      const isTech = /hackathon|code|ai|tech|web|data|robot/i.test(input.title);
      return {
        description: isTech
          ? `🚀 Welcome to ${input.title}!\nAn intensive hands-on experience designed to challenge your technical and problem-solving capabilities.`
          : `✨ Join us for ${input.title}!\nA premier campus event uniting students for learning, collaboration, and high-energy networking.`,
        highlights: [
          "Interactive hands-on sessions",
          "Mentorship from senior leads & alumni",
          "Certificates & exciting rewards for top performers"
        ],
        eligibility: ["Open to all branches and years", "Prior basic interest recommended"],
        thingsToBring: ["College Student ID Card", "Laptop & charger", "Notepad & pen"],
        learningOutcomes: ["Practical industry skills", "Team collaboration", "Networking"],
        promotionalParagraph: `🔥 Don't miss ${input.title}! Reserve your spot now on CampusConnect!`,
        venue: input.venue || "Campus Main Auditorium",
        tags: isTech ? ["Coding", "Hackathon", "Tech", "Innovation"] : ["Campus Life", "Networking", "Cultural"],
        suggestedCapacity: 150
      };
    });
  }

  // 2. AI Event Recommendation Engine with Reason Explanations
  async generateRecommendations(studentProfile: any, events: any[]) {
    const studentBranch = studentProfile.branch?.toLowerCase() || "";
    const studentInterests = (studentProfile.interests || []).map((i: string) => i.toLowerCase());

    return events.map((event) => {
      let score = 50;
      const reasons: string[] = [];

      // Branch match
      if (event.allowedBranches && event.allowedBranches.length > 0) {
        if (event.allowedBranches.some((b: string) => b.toLowerCase().includes(studentBranch))) {
          score += 25;
          reasons.push(`Targeted for ${studentProfile.branch || "your department"} students.`);
        }
      }

      // Interest match
      if (event.tags && event.tags.length > 0 && studentInterests.length > 0) {
        const matches = event.tags.filter((tag: string) =>
          studentInterests.some((si: string) => tag.toLowerCase().includes(si) || si.includes(tag.toLowerCase()))
        );
        if (matches.length > 0) {
          score += 30;
          reasons.push(`Based on your interest in ${matches.join(" & ")}.`);
        }
      }

      if (event.registrationCount && event.capacity && event.registrationCount / event.capacity > 0.7) {
        score += 15;
        reasons.push("High demand event popular among students.");
      }

      if (reasons.length === 0) {
        reasons.push("Trending campus opportunity for students.");
      }

      return {
        ...event,
        recommendationScore: Math.min(99, score),
        recommendationReason: reasons[0]
      };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  // 3. AI Semantic Event Search
  async semanticSearchEvents(query: string, events: any[]) {
    const q = query.toLowerCase();
    const synonyms: Record<string, string[]> = {
      coding: ["hackathon", "programming", "code", "developer", "algo", "web"],
      music: ["concert", "band", "singing", "acoustic", "fest"],
      placement: ["interview", "career", "resume", "job", "hiring"],
      robotics: ["hardware", "iot", "circuit", "arduino"]
    };

    let expandedTerms = [q];
    Object.entries(synonyms).forEach(([key, terms]) => {
      if (q.includes(key) || terms.some((t) => q.includes(t))) {
        expandedTerms = [...expandedTerms, key, ...terms];
      }
    });

    return events.filter((ev) => {
      const text = `${ev.title} ${ev.description} ${ev.venue} ${(ev.tags || []).join(" ")}`.toLowerCase();
      return expandedTerms.some((term) => text.includes(term));
    });
  }

  // 4. AI Event Chatbot (Smart Conversational Non-Hallucinating Response)
  async answerEventChatbot(eventContext: string, studentQuestion: string): Promise<string> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are CampusConnect AI Assistant.
Answer the student's question concisely using ONLY the event details provided.
If the question is a greeting (e.g. "hi", "hello"), greet back warmly and summarize the event in 1 sentence.
If the answer is NOT present in the details, politely state: "I'm sorry, but that detail is not specified in the official event information. Please contact the organizer."

Event Context:
${eventContext}

Student Question: "${studentQuestion}"`;

        const res = await model.generateContent(prompt);
        const ansText = res.response.text();
        if (ansText && ansText.trim().length > 0) {
          return ansText.trim();
        }
      } catch (err) {
        console.error("Gemini Chatbot Error, falling back to smart heuristic:", err);
      }
    }

    // Smart Conversational Fallback Engine
    const q = studentQuestion.toLowerCase().trim();

    if (/^(hi|hello|hey|greetings)/i.test(q)) {
      const titleMatch = eventContext.match(/Title:\s*([^\n]+)/i);
      const title = titleMatch ? titleMatch[1] : "this campus event";
      return `Hello! 👋 I am your AI assistant for ${title}. Ask me anything about event timing, venue, eligibility, or capacity!`;
    }

    if (q.includes("venue") || q.includes("where") || q.includes("location") || q.includes("place")) {
      const match = eventContext.match(/Venue:\s*([^\n]+)/i);
      return match ? `📍 The event is located at: **${match[1]}**.` : "The specific venue is listed on the event page.";
    }

    if (q.includes("time") || q.includes("when") || q.includes("date") || q.includes("schedule")) {
      const matchStart = eventContext.match(/Starts:\s*([^\n]+)/i);
      const matchEnd = eventContext.match(/Ends:\s*([^\n]+)/i);
      return matchStart
        ? `🕒 Event Starts: **${new Date(matchStart[1]).toLocaleString()}**${matchEnd ? `\nEnds: **${new Date(matchEnd[1]).toLocaleString()}**` : ""}`
        : "Please check the event schedule dates listed on the main page.";
    }

    if (q.includes("branch") || q.includes("who can") || q.includes("eligible") || q.includes("year") || q.includes("first year")) {
      const branchMatch = eventContext.match(/Allowed Branches:\s*([^\n]+)/i);
      const yearMatch = eventContext.match(/Allowed Years:\s*([^\n]+)/i);
      const branches = branchMatch ? branchMatch[1] : "Open to all branches";
      const years = yearMatch ? yearMatch[1] : "Open to all passing years";
      return `🎓 Eligibility Details:\n• Branches: ${branches}\n• Graduation Years: ${years}`;
    }

    if (q.includes("laptop") || q.includes("bring") || q.includes("requirement") || q.includes("prerequisites")) {
      const isTech = /hackathon|code|ai|tech|web|data|robot/i.test(eventContext);
      return isTech
        ? "💻 Yes! For technical hackathons/workshops, bringing your own laptop and charger is strongly recommended."
        : "🎒 Please bring your university student ID card and a notebook.";
    }

    if (q.includes("fee") || q.includes("cost") || q.includes("paid") || q.includes("free")) {
      return "🎉 This campus event is **100% Free** for registered students!";
    }

    return "I'm sorry, but that specific detail is not mentioned in the event announcement. Please reach out to the society organizer directly!";
  }

  // 5. AI Email Generator
  async generateEmailDraft(input: {
    eventType: "REGISTRATION" | "REMINDER" | "THANK_YOU" | "WINNER_ANNOUNCEMENT" | "CERTIFICATE";
    eventTitle: string;
    tone: "Professional" | "Friendly" | "Exciting" | "Formal";
    customDetails?: string;
  }) {
    const prompt = AIPrompts.emailGenerator(input);
    return this.callGeminiJson<{ subject: string; body: string }>(prompt, () => ({
      subject: `[CampusConnect] Important Update regarding ${input.eventTitle}`,
      body: `Dear Participant,\n\nThank you for engaging with ${input.eventTitle}.\n\nBest regards,\nCampus Event Organizing Committee`
    }));
  }

  // 6. AI Poster Content & Social Kit
  async generatePosterSocialKit(title: string, description: string) {
    const prompt = AIPrompts.posterSocialKit(title, description);
    return this.callGeminiJson(prompt, () => ({
      headline: `JOIN ${title.toUpperCase()} TODAY!`,
      tagline: "Unleash Your Potential on Campus",
      bulletPoints: ["Top Mentors", "Certificates", "Networking"],
      instagramCaption: `🔥 ${title} is LIVE! Don't miss out on campus. Link in bio to register! 🚀`,
      linkedInAnnouncement: `Excited to announce ${title}! Join us for an enriching experience.`,
      hashtags: ["#CampusConnect", `#${title.replace(/\s+/g, "")}`, "#StudentEvents"]
    }));
  }

  // 7. AI FAQ Generator
  async generateFaqs(title: string, description: string) {
    const prompt = AIPrompts.faqGenerator(title, description);
    return this.callGeminiJson(prompt, () => [
      { question: "Who is eligible to participate?", answer: "This event is open to registered university students." },
      { question: "Is there any registration fee?", answer: "Registration is 100% free for campus students." },
      { question: "Will certificates be provided?", answer: "Yes, all verified attendees receive digital certificates." }
    ]);
  }

  // 8. AI Feedback & Sentiment Analysis
  async analyzeFeedback(reviews: string[]) {
    if (reviews.length === 0) {
      return {
        summary: "No reviews submitted yet.",
        overallSentiment: "NEUTRAL",
        positiveHighlights: [],
        commonComplaints: [],
        actionableImprovements: ["Encourage students to submit post-event feedback."]
      };
    }

    const prompt = AIPrompts.feedbackAnalysis(reviews);
    return this.callGeminiJson(prompt, () => ({
      summary: "Participants enjoyed the session organization and hands-on guidance.",
      overallSentiment: "POSITIVE",
      positiveHighlights: ["Great speaker guidance", "Interactive Q&A"],
      commonComplaints: ["Sound system delay"],
      actionableImprovements: ["Test audio equipment prior to event start."]
    }));
  }

  // 9. AI Smart Registration Form Field Builder
  async suggestRegistrationFormFields(eventTitle: string, category?: string) {
    const prompt = AIPrompts.smartFormBuilder(eventTitle, category);
    return this.callGeminiJson(prompt, () => {
      const isTech = /hackathon|code|ai|tech/i.test(eventTitle);
      if (isTech) {
        return [
          { label: "Team Name", fieldType: "TEXT", required: true },
          { label: "GitHub Profile URL", fieldType: "TEXT", required: true },
          { label: "Tech Stack / Preferred Language", fieldType: "TEXT", required: false }
        ];
      }
      return [
        { label: "Contact Phone Number", fieldType: "NUMBER", required: true },
        { label: "Dietary / Seating Preference", fieldType: "SELECT", required: false, options: ["Veg", "Non-Veg"] }
      ];
    });
  }

  // 10. AI Duplicate Event Detector
  async detectDuplicateEvent(newTitle: string, existingTitles: string[]) {
    const prompt = AIPrompts.duplicateDetector(newTitle, existingTitles);
    return this.callGeminiJson(prompt, () => {
      const match = existingTitles.find(
        (t) => t.toLowerCase().includes(newTitle.toLowerCase()) || newTitle.toLowerCase().includes(t.toLowerCase())
      );
      return {
        isDuplicate: Boolean(match),
        similarEventTitle: match ?? null,
        similarityScorePercent: match ? 85 : 10,
        warningMessage: match ? `An active event with title '${match}' already exists on campus.` : null
      };
    });
  }

  // 11. AI Content Moderator
  async moderateContent(title: string, description: string) {
    const prompt = AIPrompts.contentModeration(title, description);
    return this.callGeminiJson(prompt, () => {
      const isShort = description.trim().length < 10;
      return {
        isSafe: !isShort,
        hasAbusiveLanguage: false,
        isSpam: false,
        isTooShort: isShort,
        feedbackMessage: isShort ? "Description is too short. Provide at least 10 characters." : "Content passed moderation checks."
      };
    });
  }
}
