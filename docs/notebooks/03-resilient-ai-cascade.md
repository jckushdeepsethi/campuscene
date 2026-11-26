# Notebook 03: Resilient Multi-Tier AI Cascade with Gemini

> **Focus**: Generative AI Systems, SDK Migration, API Fault-Tolerance, High-Demand 503 Cascades, Prompt Engineering

---

## 1. The Reality of Production Cloud AI APIs

Building production AI applications requires acknowledging that third-party AI APIs will experience:
1. **Model Deprecations**: `404 Not Found` (e.g. `gemini-2.0-flash` or `gemini-2.5-flash` restricted on new keys).
2. **Traffic Spikes**: `503 Unavailable` (*"This model is currently experiencing high demand. Spikes in demand are usually temporary."*).
3. **Quota Throttling**: `429 Too Many Requests`.

Relying on a single model string (`model: "gemini-3.8-flash"`) guarantees that your application will randomly fail during peak usage hours.

---

## 2. Modernizing to `@google/genai` (v3.6.1)

CampuScene migrated from the deprecated legacy `@google/generative-ai` package to Google's modern unified SDK:

```typescript
// Legacy:
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Modern Unified SDK:
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey });
const response = await ai.models.generateContent({
  model: "gemini-3.5-flash-lite",
  contents: prompt
});
```

---

## 3. The Multi-Tier Model Priority Cascade Pattern

To guarantee **99.9% uptime** even during global Google AI demand spikes, CampuScene implements a **cascading priority hierarchy**:

```
           [ Client Requests AI Feature ]
                         │
                         ▼
        ┌──────────────────────────────────┐
        │  Tier 1: gemini-3.5-flash-lite   │ ◄── (Fastest, low latency, immune to spikes)
        └────────────────┬─────────────────┘
                         │ (Fails with 503/404?)
                         ▼
        ┌──────────────────────────────────┐
        │  Tier 2: gemini-3.1-flash-lite   │ ◄── (High reliability backup)
        └────────────────┬─────────────────┘
                         │ (Fails?)
                         ▼
        ┌──────────────────────────────────┐
        │  Tier 3: gemini-3.8-flash        │ ◄── (Advanced reasoning when available)
        └────────────────┬─────────────────┘
                         │ (Fails?)
                         ▼
        ┌──────────────────────────────────┐
        │  Tier 4: gemma-4-31b-it          │ ◄── (Open-weight cloud model)
        └────────────────┬─────────────────┘
                         │ (All cloud endpoints down?)
                         ▼
        ┌──────────────────────────────────┐
        │  Tier 5: Local Heuristic Engine  │ ◄── (Deterministic domain fallback)
        └──────────────────────────────────┘
```

### Implementation in `ai.service.ts`:
```typescript
private async callGeminiJson<T>(prompt: string, fallbackFn: () => T): Promise<T> {
  if (this.ai) {
    const models = [
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.5-flash",
      "gemma-4-31b-it"
    ];

    for (const model of models) {
      try {
        const response = await this.ai.models.generateContent({ model, contents: prompt });
        const text = response.text;
        if (text) {
          const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as T;
          }
        }
      } catch (err) {
        console.warn(`[AiService] Model ${model} failed, cascading to next model...`);
      }
    }
  }
  return fallbackFn();
}
```

---

## 4. Domain-Aware Few-Shot Prompting for Smart Form Building

When an organizer creates a cricket tournament or hackathon, the AI must understand what fields to generate:

```typescript
export const AIPrompts = {
  smartFormBuilder: (title: string, category?: string, existingQuestions?: string[]) => `
You are an expert event operations planner.
Event Title: "${title}"
Category: "${category || "General"}"
Existing Questions Already in Form: ${JSON.stringify(existingQuestions || [])}

Generate 4-6 smart, context-aware registration form questions tailored specifically to this event.
- If it is a tournament / cricket / sports event, ask for Team Name, Captain Name, Captain WhatsApp, Full Squad Roll Numbers, Player Role (Batsman, Bowler, etc.), Jersey Size.
- If it is a hackathon / tech event, ask for Team Name, GitHub Profile URL, Tech Stack, Project Pitch.
- Return ONLY a valid JSON array: [{ "label": string, "fieldType": "TEXT"|"PARAGRAPH"|"RADIO"|"CHECKBOX"|"SELECT"|"NUMBER"|"DATE"|"FILE", "required": boolean, "options": string[] }]
`
};
```

### Key Takeaway for Build-in-Public
> *"Never let your application's reliability depend on a single cloud model endpoint. A resilient AI architecture treats cloud models as a tiered cascade, anchored by deterministic local fallbacks so the user never sees a broken screen."*
