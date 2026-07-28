export const AIPrompts = {
  descriptionGenerator: (input: {
    title: string;
    category?: string;
    venue?: string;
    audience?: string;
    shortNotes?: string;
  }) => `You are an expert University Event Strategist.
Generate a structured JSON event package for:
Title: "${input.title}"
Category: "${input.category ?? "General"}"
Venue: "${input.venue ?? "Campus Main Hall"}"
Audience: "${input.audience ?? "All Students"}"
Notes: "${input.shortNotes ?? ""}"

Return ONLY valid JSON matching this schema:
{
  "description": "Engaging overview paragraph",
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "eligibility": ["Eligibility 1", "Eligibility 2"],
  "thingsToBring": ["Item 1", "Item 2"],
  "learningOutcomes": ["Outcome 1", "Outcome 2"],
  "promotionalParagraph": "Short catchy 2-sentence summary for WhatsApp/Telegram",
  "venue": "Suggested specific venue",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "suggestedCapacity": 100
}`,

  chatbotAnswer: (eventContext: string, studentQuestion: string) => `You are CampusConnect AI Assistant.
Use ONLY the following event details to answer the student's question.
If the information is NOT present in the details below, politely state: "I'm sorry, but that detail is not specified in the official event information. Please contact the organizer." Do NOT guess or hallucinate.

Event Details:
${eventContext}

Student Question: "${studentQuestion}"

Provide a concise, helpful response:`,

  emailGenerator: (input: {
    eventType: "REGISTRATION" | "REMINDER" | "THANK_YOU" | "WINNER_ANNOUNCEMENT" | "CERTIFICATE";
    eventTitle: string;
    tone: "Professional" | "Friendly" | "Exciting" | "Formal";
    customDetails?: string;
  }) => `Draft a university email for "${input.eventTitle}".
Email Type: ${input.eventType}
Tone: ${input.tone}
Special Details: "${input.customDetails ?? ""}"

Return ONLY valid JSON:
{
  "subject": "Email Subject Line",
  "body": "Formatted email body text with placeholders like [Student Name]"
}`,

  posterSocialKit: (title: string, description: string) => `Create a Social Media & Poster Marketing Kit for:
Title: "${title}"
Description: "${description}"

Return ONLY valid JSON:
{
  "headline": "Bold 5-word poster headline",
  "tagline": "Catchy 8-word tagline",
  "bulletPoints": ["Bullet 1", "Bullet 2", "Bullet 3"],
  "instagramCaption": "Engaging IG post with emojis and call to action",
  "linkedInAnnouncement": "Professional LinkedIn post text",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3"]
}`,

  faqGenerator: (title: string, description: string) => `Generate 5 realistic FAQs for students attending:
Title: "${title}"
Description: "${description}"

Return ONLY valid JSON array:
[
  { "question": "Question 1?", "answer": "Answer 1." },
  { "question": "Question 2?", "answer": "Answer 2." }
]`,

  feedbackAnalysis: (reviews: string[]) => `Analyze the following student feedback for a campus event:
Feedback:
${reviews.map((r, i) => `${i + 1}. "${r}"`).join("\n")}

Return ONLY valid JSON:
{
  "summary": "2-sentence overall summary",
  "overallSentiment": "POSITIVE | NEUTRAL | NEGATIVE",
  "positiveHighlights": ["Highlight 1", "Highlight 2"],
  "commonComplaints": ["Complaint 1", "Complaint 2"],
  "actionableImprovements": ["Suggestion 1", "Suggestion 2"]
}`,

  smartFormBuilder: (eventTitle: string, category?: string) => `Suggest custom registration form fields for:
Title: "${eventTitle}"
Category: "${category ?? "General"}"

Return ONLY valid JSON array of field objects:
[
  { "label": "Field Label", "fieldType": "TEXT | NUMBER | SELECT | FILE", "required": true, "options": [] }
]`,

  duplicateDetector: (newTitle: string, existingTitles: string[]) => `Compare the new proposed event title "${newTitle}" against existing titles:
${existingTitles.map((t, i) => `${i + 1}. "${t}"`).join("\n")}

Return ONLY valid JSON:
{
  "isDuplicate": true or false,
  "similarEventTitle": "Matching title or null",
  "similarityScorePercent": number from 0 to 100,
  "warningMessage": "Short explanation or null"
}`,

  contentModeration: (title: string, description: string) => `Perform content safety & quality check for:
Title: "${title}"
Description: "${description}"

Return ONLY valid JSON:
{
  "isSafe": true or false,
  "hasAbusiveLanguage": true or false,
  "isSpam": true or false,
  "isTooShort": true or false,
  "feedbackMessage": "Explanation if unsafe, or 'Content passed moderation checks.'"
}`
};
