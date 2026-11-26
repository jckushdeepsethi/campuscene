# CampuScene Engineering & Learning Notebooks

Welcome to the **CampuScene Engineering Notebooks** — a structured, deep-dive technical journal documenting architectural decisions, design patterns, algorithmic trade-offs, security practices, and practical lessons learned while building **CampuScene** (AI-Powered Campus Event & Registration Platform).

This notebook series serves as a reference for:
1. **System Architecture & Core Engineering Concepts**: In-depth explanations of how complex features were built from first principles.
2. **Build-in-Public & LinkedIn Learning Curve**: Polished technical summaries, key takeaways, diagrams, and code snippets ready to share with the developer community.
3. **Engineering Trade-offs & Post-Mortem Debugging**: Honest accounts of what failed in development/production (e.g., AI 503 spikes, SMTP delivery, UX traps) and the elegant patterns that solved them.

---

## 📚 Notebook Directory & Curriculum

| # | Notebook Title | Focus Area | Core Concepts Covered |
|---|----------------|------------|------------------------|
| **01** | [**Google Forms Studio Architecture**](./01-google-forms-architecture.md) | Frontend & Schema Design | Dynamic typed inputs, polymorphic form builders, markdown serialization, decoupled schema storage, zero-migration schema extensibility. |
| **02** | [**Cryptographic OTP & Gated Auth State Machine**](./02-otp-auth-and-security.md) | Backend Security & Auth | 6-digit numeric OTP generation, SHA-256 token hashing, gated registration state machines, self-healing re-registration, SMTP dev fallbacks. |
| **03** | [**Resilient Multi-Tier AI Cascade with Gemini**](./03-resilient-ai-cascade.md) | GenAI & Distributed Systems | Modern `@google/genai` SDK, handling 503 High Demand outages, multi-tier fallback priority cascades, domain-specific few-shot prompting. |
| **04** | [**Responsive Frontend Systems & Desktop UX**](./04-frontend-ux-and-layouts.md) | UI/UX & React Patterns | 2-column responsive layout grids, sticky viewport elements, regex content stripping, monospace OTP input typography traps. |

---

## 🎯 How to Use These Notebooks

- **Deep Dive Learning**: Read sequentially or by topic when exploring full-stack full-lifecycle web development.
- **Milestone References**: Each notebook maps directly to the active milestones located in [`docs/milestones/`](../milestones/).
- **LinkedIn / Public Logs**: Each chapter contains an executive summary, before-and-after architecture comparisons, and "Lessons Learned" bullet points tailored for tech blogs and social documentation.
