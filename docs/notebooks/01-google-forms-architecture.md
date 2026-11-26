# Notebook 01: Google Forms Studio & Dynamic Schema Architecture

> **Focus**: System Architecture, Dynamic Polymorphic Form Builders, Schema Decoupling, Regex Serialization

---

## 1. The Core Engineering Challenge

In campus event management platforms, every event demands radically different registration data:
- **Cricket / Sports Tournament**: Team Name, Captain Name, Captain WhatsApp, Full Squad Roll Numbers, Playing Role, Jersey Size.
- **Hackathon & Coding Competitions**: Team Name, GitHub Profile URL, Tech Stack Selection, Project Pitch, Dietary Preferences.
- **Academic Workshop / Placement Drive**: College Roll Number, CGPA/Branch, Resume / ID Proof PDF Upload.

### The Naive Approach vs The Production Bottleneck

1. **Anti-Pattern 1: Hardcoding static columns in the SQL table**
   - Adding `jerseySize`, `githubUrl`, `teamName` to the `EventRegistration` table.
   - *Why it fails*: Pollutes the database with hundreds of sparse `NULL` columns that only apply to 1% of events.
2. **Anti-Pattern 2: Arbitrary JSON columns with runtime migration costs**
   - Altering existing production schemas requires database migration locks, ORM synchronization, and risk of breaking legacy database records.
3. **The Elegant Solution: Decoupled Markdown Schema Serialization**
   - Store the dynamic Google Form specification within the event's `description` field under a structured marker:
     ```markdown
     ### 📋 Attendee Registration Requirements:
     - **Team Name** (Required, Type: TEXT)
     - **Player Role** (Required, Type: SELECT, Options: Batsman, Bowler, All-Rounder, Wicket Keeper)
     - **ID Proof Document** (Required, Type: FILE)
     ```
   - **Zero database migration required**.
   - Completely backwards-compatible with existing events.
   - Decoupled parsing: the presentation view strips the raw text from the event description, while the registration modal parses the schema to render interactive form controls.

---

## 2. Polymorphic Field Types & Google Form Features

The form builder supports 8 distinct field types modeled directly on Google Forms:

| Field Type | UI Control | Schema Representation | Validation Logic |
|------------|------------|-----------------------|------------------|
| `TEXT` | `<Input type="text" />` | `Type: TEXT` | Non-empty string when required |
| `PARAGRAPH` | `<textarea rows={3} />` | `Type: PARAGRAPH` | Multiline string |
| `RADIO` | Single-select radio list | `Type: RADIO, Options: [...]` | Exactly 1 option selected |
| `CHECKBOX` | Multi-select checkbox list | `Type: CHECKBOX, Options: [...]` | Array of selected options (≥ 1 when required) |
| `SELECT` | `<select />` dropdown | `Type: SELECT, Options: [...]` | Valid option picked |
| `NUMBER` | `<Input type="number" />` | `Type: NUMBER` | Valid integer / phone string |
| `DATE` | `<Input type="date" />` | `Type: DATE` | Valid ISO date |
| `FILE` | File upload dropzone | `Type: FILE` | Selected file object / base64 preview |

---

## 3. Options Management & Interactive Builder State

The builder state in [GoogleFormBuilder.tsx](file:///Users/kushdeepsethi/Documents/Codex/2026-07-06/linkedin-build-in-public-strategy-this/frontend/src/features/events/components/GoogleFormBuilder.tsx) uses an immutable state update pattern:

```typescript
export type FormQuestion = {
  id: string;
  label: string;
  description?: string;
  fieldType: FormFieldType;
  required: boolean;
  options?: string[];
};
```

### Key Operations Implemented:
1. **Dynamic Question Type Switching**: When switching from `TEXT` to `RADIO` or `SELECT`, default options (`["Option 1", "Option 2"]`) are initialized automatically.
2. **Reordering & Duplication**: `Move Up`, `Move Down`, and deep-cloning with unique IDs (`q_${timestamp}_${random}`).
3. **Required Toggle**: Toggle switches per question enforcing mandatory attendee response.
4. **1-Click Quick Presets**: Pre-configured domain templates for Cricket Tournaments, Hackathons, and Logistics.
5. **Live Attendee Preview Modal**: Renders the exact student perspective with working inputs before publication.

---

## 4. Robust Parser & Content Decoupling

To prevent raw markdown from leaking into the public event page, the parser employs dual regex splitting:

```typescript
// Split out the overview description
const [cleanDescription] = rawDescription.split(/###\s*(?:📋\s*)?Attendee Registration Requirements:/i);

// Parse structured questions
export function parseEventQuestions(description?: string): RegistrationQuestion[] {
  if (!description) return [];
  const match = description.match(/###\s*(?:📋\s*)?Attendee Registration Requirements:\s*([\s\S]*?)(?:$|\n###)/i);
  if (!match) return [];
  
  // Extracts label, required status, field type, bracketed/comma-separated options, and descriptions
  // ...
}
```

### Key Takeaway for Build-in-Public
> *"You don't always need complex NoSQL schemas or messy database migrations to build dynamic form features. By establishing a clean serialization protocol, standard relational models can power dynamic, polymorphic interfaces with zero migration downtime."*
