# Capstone Project Synopsis
## On CampuScene

Submitted during VII semester in partial fulfilment of the requirements for the award of degree of
**Bachelor of Technology in Computer Engineering**
by **Kushdeep Sethi (23001003064)**
Under supervision of **Rachna Gupta**
Department of Computer Engineering, FACULTY OF INFORMATICS & COMPUTING
J.C. BOSE UNIVERSITY OF SCIENCE AND TECHNOLOGY, YMCA, FARIDABAD, HARYANA

---

## INDEX

| S.No. | Title | Page No. |
| :--- | :--- | :--- |
| **1** | **Chapter 1: Introduction** | **3** |
| 1.1 | 1.1 Brief of the Project | 3 |
| 1.2 | 1.2 Problem Statement & Motivation | 3 |
| 1.3 | 1.3 Objectives of the Project | 4 |
| 1.4 | 1.4 Technologies Used | 4 |
| | Frontend Stack | 4 |
| | Backend Stack | 5 |
| | Database & Cloud Infrastructure | 5 |
| **2** | **Chapter 2: Proposed Methodology** | **6** |
| 2.1 | 2.1 System Architecture & Data Flow | 6 |
| 2.2 | 2.2 Core Modules & Implementation | 6 |
| 2.3 | 2.3 Database Schema & Relational Modeling | 7 |
| **3** | **Chapter 3: Applications and scope** | **8** |
| 3.1 | 3.1 Practical Applications in Campus Ecosystem | 8 |
| 3.2 | 3.2 Scope of CampuScene | 8 |
| 3.3 | 3.3 Future Enhancements | 9 |
| **4** | **References & Bibliography** | **10** |

---

## Chapter 1: Introduction

### 1.1 Brief of the Project
CampuScene is a centralized, AI-powered campus event management, student engagement, and placement opportunity ecosystem. Designed and developed from the ground up for university campuses, the platform addresses the widespread fragmentation of college life where extracurricular activities, society hackathons, cultural workshops, placement drives, and official notices are scattered across unorganized WhatsApp groups, paper posters, Instagram stories, and disparate Google Forms.

Built on a production-grade decoupled architecture, CampuScene integrates a high-performance React 19 (TypeScript) frontend powered by Vite with an enterprise Express 5 REST API, PostgreSQL database managed via Prisma ORM, and Google's Gemini 1.5 Flash Large Language Model. The platform delivers real-time role-based access control (RBAC) across four administrative tiers: Students, Campus Societies, Placement Cells, and University Administrators.

CampuScene automates the entire campus event lifecycle — from event ideation with AI assistance, administrative audit and verification, real-time seat reservation with automated waitlist promotion, live attendance tracking, to instant issuance of cryptographically verifiable digital certificates and analytical reporting. The platform is deployed in production and live at https://campuscene.in with its API operational at https://api.campuscene.in.

### 1.2 Problem Statement & Motivation
Modern university campuses host dozens of vibrant technical, cultural, literary, and sports societies alongside active placement cells. Despite this vibrant environment, colleges face persistent administrative and engagement bottlenecks:
- **Information Silos:** Event updates are routinely buried in informal, spam-heavy chat groups, causing students to miss registration deadlines and placement opportunities.
- **Unverified Organizers & Clashes:** Without an administrative moderation gate, overlapping events compete for the same university auditorium or student audience on the same dates.
- **Manual Registration Overflow:** Google Forms lack real-time capacity clamping, resulting in overbooked venues or high no-show rates with no automated waitlist queue.
- **Manual Attendance & Forged Credentials:** Paper sign-in sheets lead to proxy attendance, and manual certificate distribution takes weeks and is prone to forgery.
- **Organizer Content Fatigue:** Society leads spend excessive time drafting promotional emails, social media announcements, and FAQs rather than focusing on event quality.

### 1.3 Objectives of the Project
The primary technical and operational objectives of CampuScene include:
- **Unified Campus Portal:** Provide a single responsive web platform (https://campuscene.in) unifying all academic, cultural, and placement events.
- **Multi-Tier Role-Based Access Control:** Enforce strict cryptographic authorization separating Student participants, Society event creators, Placement coordinators, and University Admins.
- **Capacity Bounds & FIFO Waitlist Auto-Promotion:** Implement ACID-compliant database transactions ensuring strict seating capacity limits and instantaneous first-in, first-out (FIFO) promotion when cancellations occur.
- **GenAI Event Copilot:** Leverage Google Gemini 1.5 Flash to automatically generate rich event descriptions, bulleted agendas, FAQs, and social media kits from simple bullet points.
- **Context-Aware Non-Hallucinating Chatbot:** Provide a dedicated per-event AI assistant answering attendee queries strictly based on verified organizer details.
- **Instant Verifiable Digital Certificates:** Generate tamper-proof digital certificates with unique verification IDs and print-ready modal layouts for verified attendees.
- **Live Institutional Analytics:** Equip university leadership with real-time dashboards detailing student participation, attendance conversion rates, and society activity metrics.

### 1.4 Technologies Used

#### Frontend Stack
| Technology | Purpose |
| :--- | :--- |
| **React 19 (TypeScript)** | Component-driven single page application framework with static typing |
| **Vite 7** | Next-generation ESM development bundler providing sub-second HMR |
| **Tailwind CSS 3.4** | Utility-first styling and layout framework for responsive campus themes |
| **Framer Motion 12** | Fluid page transitions, interactive modals, and animated progress rings |
| **Lucide React** | Lightweight tree-shakeable SVG icon set for navigation and status tags |
| **React Router DOM 7** | Declarative client-side routing and protected role-based route guards |
| **TanStack React Query 5** | Asynchronous server-state management, cache invalidation, and data refetching |
| **React Hook Form & Zod** | High-performance form state controller with runtime schema validation |
| **Axios** | HTTP client with automated JWT refresh token rotation interceptors |
| **HTML5 Canvas API** | Dynamic rendering and print export of digital certificates |

#### Backend Stack
| Technology | Purpose |
| :--- | :--- |
| **Node.js (v20 LTS)** | Asynchronous non-blocking runtime environment for scalable API serving |
| **Express 5** | Enterprise RESTful application framework with robust middleware chaining |
| **TypeScript 5.8** | Full static typing across business services, repositories, and controllers |
| **Prisma ORM 6** | Type-safe database abstraction, automated schema migrations, and queries |
| **Google Generative AI SDK** | Integration with Gemini 1.5 Flash for summaries, FAQs, and event chatbots |
| **jsonwebtoken (JWT)** | Stateless Bearer access token generation and cryptographic verification |
| **bcrypt** | 12-round salted one-way password hashing for account credentials |
| **Nodemailer** | HTML email delivery for email account verification and password recovery |
| **Swagger UI & OpenAPI 3.0** | Interactive API documentation explorer mounted at /api/v1/docs |

#### Database & Cloud Infrastructure
| Technology / Service | Purpose |
| :--- | :--- |
| **PostgreSQL 16 (Neon Cloud)** | Serverless PostgreSQL with connection pooling and high concurrency |
| **Vercel Edge Network** | Global CDN edge hosting for React frontend at https://campuscene.in |
| **Render Cloud Platform** | Managed Linux Web Service running backend API at https://api.campuscene.in |
| **GoDaddy DNS Engine** | Authoritative DNS routing: A record (@ -> 216.198.79.1) and CNAMEs for www and api |
| **Docker & Docker Compose** | Multi-stage containerization with Node.js 20 Alpine and Nginx Alpine |
| **Vitest & Node:Test Runner** | Comprehensive automated suite of 50 tests (41 backend + 9 frontend) |

---

## Chapter 2: Proposed Methodology

### 2.1 System Architecture & Data Flow
CampuScene is architected following the clean Separation of Concerns (SoC) and Model-View-Controller (MVC) principles, augmented by dedicated Repository and Service abstraction layers. This architectural decoupling ensures that the user interface, business logic, authorization rules, and persistent database interact strictly through typed interfaces.

The operational workflow is divided into five cohesive phases:
1. **Phase 1: Registration & Cryptographic Verification:** Students register with institutional credentials and activate accounts via secure, 60-minute email tokens. Society accounts require admin authorization secrets.
2. **Phase 2: Event Inception & AI Packaging:** Organizers submit raw event notes; Gemini 1.5 Flash transforms them into structured JSON packages specifying title, tags, eligibility, prerequisites, and learning outcomes.
3. **Phase 3: Administrative Moderation:** Submitted society events enter a PENDING_APPROVAL queue. University administrators verify hall availability, review event quality, and either publish or reject with constructive feedback.
4. **Phase 4: Concurrency-Controlled Registration & Waitlisting:** Students book seats with one click. Registrations up to maximum capacity are marked REGISTERED. Subsequent registrants enter a FIFO WAITLISTED queue. When an active registration is cancelled, the earliest waitlisted participant is atomically promoted.
5. **Phase 5: Check-in, Certification & Analytics:** Organizers scan attendance tickets. Attended students unlock instant verified digital certificates, and attendance data updates real-time institutional analytics dashboards.

### 2.2 Core Modules & Implementation
- **Dual-Token RBAC Security:** Stateless 15-minute Bearer access tokens paired with 30-day cryptographically hashed refresh tokens stored in HttpOnly, SameSite=none, Secure cookies, enforcing strict role permissions across STUDENT, SOCIETY, PLACEMENT_CELL, and ADMIN.
- **Society Event Lifecycle:** Society-created events are held in PENDING_APPROVAL until approved by university administrators, safeguarding students from unverified notices or booking conflicts.
- **FIFO Waitlist Promotion Algorithm:** ACID-compliant PostgreSQL transactions ensure that when a seat is freed via registration cancellation, the system automatically queries the earliest waitlisted record (createdAt ASC) and promotes them to REGISTERED.
- **Gemini AI Marketing & Context-Bounded Chatbot:** Generates promotional summaries, Instagram captions, LinkedIn announcements, FAQs, and hosts a dedicated per-event AI assistant instructed strictly on verified organizer data to prevent hallucination.
- **Real-Time Attendance & Attendee CSV Export:** Live check-in toggling with precise timestamps and instant download of RFC 4180-compliant CSV attendee spreadsheets for official university records.
- **Automated Digital Certificate Issuance:** Dynamic HTML5 canvas digital certificate modal embedding unique verification IDs, student name, event title, organizer seal, and print/PDF export.

### 2.3 Database Schema & Relational Modeling
The relational database schema is implemented in PostgreSQL via Prisma ORM with strict foreign keys and cascading referential integrity across four core entities:
- **User Model:** Maintains user identity, role enum, bcrypt password hash, account status, student branch, and passing year.
- **RefreshToken Model:** Stores cryptographically hashed tokens, expiration timestamps, revocation state, and user foreign key.
- **Event Model:** Maintains title, description, category, venue, start/end dates, maxCapacity, status enum, organizer foreign key, and AI metadata.
- **Registration Model:** Binds User and Event under a compound unique constraint [userId, eventId] to prevent double-booking, tracking registration status (REGISTERED, WAITLISTED, CANCELLED, ATTENDED) and check-in timestamps.

---

## Chapter 3: Applications and scope

### 3.1 Practical Applications in Campus Ecosystem
CampuScene can be used in various fields such as:
- **Student Community & Campus Life:** Enables students to discover hackathons, technical workshops, sports meets, and placement recruitment drives through a single responsive hub, eliminating missed deadlines.
- **Student Societies & Clubs:** Simplifies event creation with AI-drafted promotional materials, removes ticketing bottlenecks with automated waitlists, and provides instant attendee CSV exports.
- **Training & Placement Cell (T&P):** Provides an official channel to broadcast pre-placement talks (PPTs), interview schedules, and company drives with branch and year-based filtering.
- **University Administration & Deans:** Empowers faculty heads and deans with complete oversight over campus facility usage, approving event proposals, preventing auditorium collisions, and viewing institutional participation analytics.

### 3.2 Scope of CampuScene
The scope of CampuScene includes:
- **Centralized Event Hub:** Unifying all university event creation, moderation, discovery, and registration under https://campuscene.in.
- **Real-Time Capacity & Waitlist Engine:** Ensuring strict venue capacity compliance with deterministic FIFO promotion upon cancellations.
- **Artificial Intelligence Integration:** Leveraging Gemini 1.5 Flash for automated description drafting, marketing kits, FAQs, and a hallucination-free chatbot.
- **Institutional Data Governance:** Providing verified attendee CSV exports, real-time check-in conversion analytics, and tamper-proof digital certificates.
- **Enterprise Reliability & Test Coverage:** Backed by a comprehensive test suite of 50 automated tests ensuring zero regressions across auth, event lifecycle, and concurrency.

### 3.3 Future Enhancements
Future Enhancements & Scalability Roadmap:
- **Native Mobile Applications:** Developing cross-platform React Native / Flutter apps with real-time push notifications for waitlist promotions and registration alerts.
- **Hardware QR Entry Scanners:** Equipping student volunteers at auditorium gates with native offline-capable mobile camera QR scanners for ultra-fast check-in.
- **Blockchain Certificate Verification:** Anchoring digital certificate hashes onto decentralized ledgers (Polygon / Ethereum) to enable public tamper-proof verification by external recruiters.
- **Institutional Single Sign-On (SSO):** Integrating Google Workspace for Education and Microsoft 365 SAML/OAuth SSO for one-click student login using official university email accounts.
- **Interactive Venue Booking System:** Connecting event requests directly to an interactive auditorium and seminar room timetable calendar to completely eliminate venue collision conflicts.

---

## References & Bibliography
[1] Fielding, R. T., & Taylor, R. N. (2002). Principled design of the modern Web architecture. ACM Transactions on Internet Technology (TOIT), 2(2), 115-150.  
[2] Rescorla, E. (2018). The Transport Layer Security (TLS) Protocol Version 1.3. RFC 8446, Internet Engineering Task Force (IETF).  
[3] Jones, M., Bradley, J., & Sakimura, N. (2015). JSON Web Token (JWT). RFC 7519, Internet Engineering Task Force (IETF).  
[4] Google DeepMind. (2024). Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context. arXiv preprint arXiv:2403.05530.  
[5] Prisma Development Team. (2025). Prisma: Next-generation ORM for Node.js & TypeScript. Official Documentation, https://www.prisma.io/docs.  
[6] React Core Team. (2025). React 19: The library for web and native user interfaces. Official Documentation, https://react.dev.  
[7] Shafranovich, Y. (2005). Common Format and MIME Type for Comma-Separated Values (CSV) Files. RFC 4180, Network Working Group.  
[8] OpenID Foundation. (2023). Role-Based Access Control and Modern Token Rotation Strategies in Web Architecture.
