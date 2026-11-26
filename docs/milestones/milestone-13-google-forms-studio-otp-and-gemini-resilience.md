# Milestone 13: Google Forms Studio, 6-Digit OTP Flow, and Resilient Gemini Cascade

Date: 2026-11-26

## 1. Development Summary

### What Was Built

This milestone upgraded CampuScene with a Google Forms-style dynamic question builder for event organizers, modernized the authentication verification/reset flow with cryptographic 6-digit numeric OTPs, and hardened cloud AI integrations against demand spikes:

1. **Google Forms Registration Studio (`GoogleFormBuilder.tsx`)**:
   - Supports 8 polymorphic question types: `Short Answer (TEXT)`, `Paragraph (PARAGRAPH)`, `Multiple Choice (RADIO)`, `Checkboxes (CHECKBOX)`, `Dropdown (SELECT)`, `Number / Phone (NUMBER)`, `Date (DATE)`, and `File Upload (FILE)`.
   - Complete dynamic controls: Add, duplicate, delete, reorder questions, inline-edit options, and toggle mandatory/optional status.
   - 1-Click quick domain presets (🏏 Cricket/Sports Tournament, 💻 Hackathon & Coding, 🥗 Dietary & Logistics).
   - Live Attendee Form Preview Modal to test student perspective before event publication.
   - Dynamic Attendee Registration Modal on `/events/:id` enforcing required answers with proper input widgets.

2. **6-Digit Cryptographic OTP & Gated Authentication**:
   - Replaced fragile 64-character hash tokens with 6-digit numeric codes (`createNumericOtp(6)`).
   - Zero-cleartext security: stored in PostgreSQL as SHA-256 hashes with 15–60 minute expirations.
   - Upgraded [RegisterPage.tsx](../../frontend/src/features/auth/pages/RegisterPage.tsx), [VerifyEmailPage.tsx](../../frontend/src/features/auth/pages/VerifyEmailPage.tsx), [ForgotPasswordPage.tsx](../../frontend/src/features/auth/pages/ForgotPasswordPage.tsx), and [ResetPasswordPage.tsx](../../frontend/src/features/auth/pages/ResetPasswordPage.tsx).
   - Added new `POST /api/v1/auth/resend-verification` endpoint.
   - Implemented self-healing re-registration: users with expired unverified accounts can re-register and receive a fresh OTP without getting trapped by a `409 Conflict`.
   - Unconfigured SMTP fallback: gracefully surfaces OTP in testing/staging environments when SMTP credentials are not yet wired.

3. **Gemini Multi-Tier Priority Cascade**:
   - Upgraded to modern `@google/genai` (v3.6.1).
   - Resolved global Google API 503 "High Demand Spike" by engineering a cascading fallback hierarchy (`gemini-3.5-flash-lite` -> `gemini-3.1-flash-lite` -> `gemini-3.8-flash` -> `gemma-4-31b-it` -> local heuristic engine).
   - Implemented domain-aware few-shot prompting in `smartFormBuilder` for cricket tournaments, hackathons, and cultural fests.

4. **Desktop Layout Optimization & Data Cleansing**:
   - Modernized `/events/:id` to a responsive 2-column desktop architecture with sticky booking card.
   - Cleaned description text using regex content decoupling, preventing raw schema markdown from polluting the user-facing event narrative.

---

## 2. Architecture & Design Decisions

- **Decoupled Markdown Schema Persistence**: Storing the dynamic form specification under `### 📋 Attendee Registration Requirements:` avoided database migration downtime while providing full backwards compatibility.
- **SHA-256 OTP Hashing at Rest**: Ensures user credentials and verification codes are completely safe even in the event of a database leak.
- **Priority Cascade vs Single Endpoint**: Distributes API traffic and gracefully recovers from cloud vendor outages.

---

## 3. Associated Engineering Notebooks

For complete technical deep-dives on these topics, refer to:
- [Notebook 01: Google Forms Studio Architecture](../notebooks/01-google-forms-architecture.md)
- [Notebook 02: Cryptographic OTP & Gated Auth Architecture](../notebooks/02-otp-auth-and-security.md)
- [Notebook 03: Resilient Multi-Tier AI Cascade with Gemini](../notebooks/03-resilient-ai-cascade.md)
- [Notebook 04: Responsive Frontend Systems & Desktop UX](../notebooks/04-frontend-ux-and-layouts.md)
