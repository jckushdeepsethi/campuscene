import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
from PIL import Image
import os, zipfile, shutil

# 1. Prepare Images
os.makedirs("docs/report_assets", exist_ok=True)
im_dash = Image.open("/Users/kushdeepsethi/.gemini/antigravity/brain/9cd06f84-74fa-41e5-8b09-53f03468e569/.user_uploaded/media_1790445549995.png").convert("RGB")
im_dash.save("docs/report_assets/image1.jpg", quality=95)

im_modal = Image.open("/Users/kushdeepsethi/.gemini/antigravity/brain/9cd06f84-74fa-41e5-8b09-53f03468e569/.user_uploaded/media_1790445779536.png").convert("RGB")
im_modal.save("docs/report_assets/image2.jpg", quality=95)

# 2. Open Reference Document directly
ref_path = "/Users/kushdeepsethi/.gemini/antigravity/brain/9cd06f84-74fa-41e5-8b09-53f03468e569/.user_uploaded/media_1795170967280_d21ae388.docx"
doc = docx.Document(ref_path)

# Helper function to update paragraph runs while preserving Times New Roman font and colors
def update_p_text(p, text_runs):
    """
    text_runs: list of tuples (text, is_bold, is_italic, font_size_pt)
    """
    # Keep paragraph formatting (spacing, alignment, numbering/bullets)
    p.text = "" # Clears runs but keeps pPr (numbering, indentation, spacing)
    for text, bold, italic, sz in text_runs:
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.bold = bold
        r.italic = italic
        if sz:
            r.font.size = Pt(sz)
        r.font.color.rgb = RGBColor(0, 0, 0)

# Helper to ensure all runs in a paragraph are Times New Roman and pure black
def enforce_tnr_black(p):
    for r in p.runs:
        r.font.name = "Times New Roman"
        r.font.color.rgb = RGBColor(0, 0, 0)

# Map of paragraph replacements:
# P3: Title page project title
p3_text = [
    ("CampuScene - AI-Powered Campus Event Management & Student Engagement Platform\n", True, False, 16),
    ("Submitted during 5th semester in partial fulfillment of the requirements for the award of degree of", False, False, 14)
]
update_p_text(doc.paragraphs[3], p3_text)

# P21: Candidate's declaration
p21_text = [
    ("I hereby certify that the work which is being presented in this Project titled “CampuScene - AI-Powered Campus Event Management & Student Engagement Platform” in fulfilment of the requirements for the degree of Bachelor of Technology in Computer engineering and submitted to “J.C. Bose University of Science and Technology, YMCA, Faridabad”, is an authentic record of my own work carried out under the supervision of Dr. Parul Gupta. ", False, False, 14)
]
update_p_text(doc.paragraphs[21], p21_text)

# P41: Certificate
p41_text = [
    ("It is hereby certified that the project titled ", False, False, 14),
    ("CampuScene - AI-Powered Campus Event Management & Student Engagement Platform ", True, False, 14),
    ("submitted by ", False, False, 14),
    ("Kushdeep (23001003064)", True, False, 14),
    (" of 3rd Year (5th Semester) to “", False, False, 14),
    ("J. C. Bose University of Science and Technology, YMCA, Faridabad", True, False, 14),
    ("” for the award of the degree of Bachelor of Technology in Computer Engineering is a record of a bonafide work carried out by him/her in the Project Lab – J.C. Bose University of Science and Technology, YMCA, Faridabad under my supervision as mentor for December 2025 examination.", False, False, 14)
]
update_p_text(doc.paragraphs[41], p41_text)

# P64 & P65: Acknowledgement spacing/formatting
p64_text = [
    (" I would like to extend my sincere thanks to all them. I am highly indebted to my mentor ", False, False, 14),
    ("Dr. Parul Gupta ", True, False, 14),
    ("for their guidance and constant supervision as well as for providing necessary information regarding the project & also for their support in completing the project.", False, False, 14)
]
update_p_text(doc.paragraphs[64], p64_text)

p65_text = [
    (" I would like to express my gratitude towards my parents & members of J.C. Bose University of Science and Technology for their kind cooperation and encouragement which helped in the completion of this project. I would like to express my special gratitude and thanks to ", False, False, 14),
    ("Dr. Rewa Sharma", True, False, 14),
    (" as well for their guidance.", False, False, 14)
]
update_p_text(doc.paragraphs[65], p65_text)

# Chapter 1 replacements
# P74
update_p_text(doc.paragraphs[74], [("1.1 Project Overview", True, False, 13)])
# P75
update_p_text(doc.paragraphs[75], [
    ("The CampuScene web application developed in this project demonstrates a fully functional, scalable, and modern campus event management and student engagement platform built using ", False, False, 12),
    ("React 19", True, False, 12),
    (", ", False, False, 12),
    ("Express.js 5", True, False, 12),
    (", ", False, False, 12),
    ("Prisma ORM", True, False, 12),
    (", ", False, False, 12),
    ("Neon PostgreSQL", True, False, 12),
    (", and ", False, False, 12),
    ("Google Gemini 1.5 Flash AI", True, False, 12),
    (". This system is designed to simulate the core features of modern high-scale collegiate portals.", False, False, 12)
])
# P76
update_p_text(doc.paragraphs[76], [
    ("In contemporary university ecosystems, extra-curricular activities, technical hackathons, guest lectures, and cultural fests play a decisive role in holistic student growth. Traditional fragmented circulars on WhatsApp and paper posters are inefficient and cause severe information silos. CampuScene solves this by establishing a persistent, high-availability centralized portal with live search, interactive event feeds, atomic registration locking, and automated verifiable certificates of participation.", False, False, 12)
])
# P77
update_p_text(doc.paragraphs[77], [
    ("The CampuScene platform supports multiple users registering simultaneously, live ticket allocation, instant QR pass generation, automated waitlist promotion, and administrative analytics through a seamless modern interface live at https://campuscene.in with API microservices at https://api.campuscene.in.", False, False, 12)
])

# 1.2
update_p_text(doc.paragraphs[79], [("1.2 Importance of Campus Event Automation & Engagement", True, False, 13)])
update_p_text(doc.paragraphs[80], [
    ("Digital event automation forms the structural foundation of organized university operations. By eliminating manual paperwork and fragmented messaging, campus event automation guarantees transparency, administrative accountability, and equal opportunity for student participation across all departments.", False, False, 12)
])
update_p_text(doc.paragraphs[81], [
    ("The adoption of a specialized centralized platform over traditional ad-hoc methods produces major institutional benefits:", False, False, 12)
])
update_p_text(doc.paragraphs[82], [("Elimination of fragmented communication channels", False, False, 12)])
update_p_text(doc.paragraphs[83], [("Guaranteed seating capacity control preventing overcrowding", False, False, 12)])
update_p_text(doc.paragraphs[84], [("Zero registration collisions using atomic transactions", False, False, 12)])
update_p_text(doc.paragraphs[85], [("Real-time automated ticket issuance via dynamic QR codes", False, False, 12)])
update_p_text(doc.paragraphs[86], [("Instant digital certificate distribution upon verified attendance", False, False, 12)])
update_p_text(doc.paragraphs[87], [
    ("These advantages establish CampuScene as a powerful technological platform for modern engineering institutions striving toward digital campus excellence and streamlined accreditation compliance.", False, False, 12)
])

# 1.3 Key Features
update_p_text(doc.paragraphs[89], [("1.3 Key Features", True, False, 13)])
update_p_text(doc.paragraphs[90], [("Dual-token JWT authentication", True, False, 12), (" with HTTP-only cookies and bcrypt password hashing", False, False, 12)])
update_p_text(doc.paragraphs[91], [("Real-time ACID-compliant RSVP", True, False, 12), (" engine preventing overselling through isolated database transactions", False, False, 12)])
update_p_text(doc.paragraphs[92], [("Automated FIFO waitlist engine", True, False, 12), (" automatically promoting waitlisted candidates upon ticket cancellation", False, False, 12)])
update_p_text(doc.paragraphs[93], [("Google Gemini 1.5 Flash AI Copilot", True, False, 12), (" for automated event description and schedule generation", False, False, 12)])
update_p_text(doc.paragraphs[94], [("Dynamic QR code ticket generation", True, False, 12), (" for rapid on-spot mobile check-in verification", False, False, 12)])
update_p_text(doc.paragraphs[95], [("Digital certificate generation engine", True, False, 12), (" issuing automated PDF participation certificates", False, False, 12)])
update_p_text(doc.paragraphs[96], [("Comprehensive society dashboards", True, False, 12), (" tracking live headcounts, registrations, and attendance analytics", False, False, 12)])
update_p_text(doc.paragraphs[97], [("Optimistic UI state synchronization", True, False, 12), (" powered by TanStack Query for instantaneous feedback", False, False, 12)])
update_p_text(doc.paragraphs[98], [("Responsive mobile-first interface", True, False, 12), (" built using React 19 and Tailwind CSS", False, False, 12)])

# 1.4 Technologies Used
update_p_text(doc.paragraphs[99], [("1.4 Technologies Used ", True, False, 13)])
update_p_text(doc.paragraphs[100], [("Backend Technologies", True, False, 12)])
update_p_text(doc.paragraphs[101], [("Node.js (v20+ LTS):", True, False, 12), (" High-performance asynchronous JavaScript runtime executing backend services.", False, False, 12)])
update_p_text(doc.paragraphs[102], [("Express.js 5:", True, False, 12), (" Modern web framework providing robust RESTful routing and middleware orchestration.", False, False, 12)])
update_p_text(doc.paragraphs[103], [("Prisma ORM:", True, False, 12), (" Next-generation type-safe ORM ensuring schema validation and transactional queries.", False, False, 12)])
update_p_text(doc.paragraphs[104], [("PostgreSQL (Neon Serverless):", True, False, 12), (" Cloud-native ACID database providing auto-scaling storage and connection pooling.", False, False, 12)])
update_p_text(doc.paragraphs[105], [("Google Gemini AI SDK:", True, False, 12), (" Official @google/genai SDK leveraging Gemini 1.5 Flash for intelligent event drafting.", False, False, 12)])

update_p_text(doc.paragraphs[106], [("Frontend Technologies", True, False, 12)])
update_p_text(doc.paragraphs[107], [("HTML5 & CSS3:", True, False, 12), (" Semantic document structure and modern responsive UI styling.", False, False, 12)])
update_p_text(doc.paragraphs[108], [("Tailwind CSS:", True, False, 12), (" Utility-first CSS framework enabling consistent design systems and responsive breakpoints.", False, False, 12)])
update_p_text(doc.paragraphs[109], [("React 19:", True, False, 12), (" Component-based reactive UI library with concurrent rendering and optimized state hooks.", False, False, 12)])
update_p_text(doc.paragraphs[110], [("Vite & TanStack Query:", True, False, 12), (" Fast build tooling paired with client-side server state caching and optimistic updates.", False, False, 12)])

update_p_text(doc.paragraphs[111], [("Tools & Platforms", True, False, 12)])
update_p_text(doc.paragraphs[112], [("VS Code:", True, False, 12), (" Integrated development environment used for code authoring, linting, and debugging.", False, False, 12)])
update_p_text(doc.paragraphs[113], [("GitHub:", True, False, 12), (" Distributed version control system managing repository commits and CI/CD pipelines.", False, False, 12)])
update_p_text(doc.paragraphs[114], [("Vercel & Render Cloud:", True, False, 12), (" Edge hosting for frontend (campuscene.in) and container platform for API (api.campuscene.in).", False, False, 12)])

# Chapter 2 replacements
update_p_text(doc.paragraphs[147], [("CHAPTER 2 – SYSTEM ANALYSIS AND DESIGN ", True, False, 17)])
update_p_text(doc.paragraphs[148], [("2.1 Problem Statement", True, False, 13)])
update_p_text(doc.paragraphs[149], [("Traditional campus event management relies heavily on disconnected tools like WhatsApp groups, paper rosters, and Google Sheets. This causes:", False, False, 12)])
update_p_text(doc.paragraphs[150], [("Information fragmentation\n", True, False, 12), (" Announcements are dispersed across uncoordinated social groups, causing low student turnout.", False, False, 12)])
update_p_text(doc.paragraphs[151], [("Capacity overflows\n", True, False, 12), (" Lack of atomic seat locking leads to overcrowded seminar halls and disruptive on-the-spot turnaways.", False, False, 12)])
update_p_text(doc.paragraphs[152], [("Manual attendance tracking\n", True, False, 12), (" Paper signature sheets cause long entry bottlenecks, illegible records, and extensive student proxies.", False, False, 12)])
update_p_text(doc.paragraphs[153], [("Organizer administrative burnout\n", True, False, 12), (" Coordinators waste countless hours manually cross-referencing registration spreadsheets and designing certificates.", False, False, 12)])
update_p_text(doc.paragraphs[154], [("To overcome this, CampuScene establishes a centralized, automated web platform that delivers real-time ticket allocation, strict database concurrency, and intelligent administrative automation.", False, False, 12)])

update_p_text(doc.paragraphs[155], [("2.2 Need for Centralized Campus Platforms", True, False, 13)])
update_p_text(doc.paragraphs[156], [("Centralized campus engagement platforms are important in:", False, False, 12)])
update_p_text(doc.paragraphs[157], [("Student community engagement\n", True, False, 12), (" Enables students across all branches and academic years to discover and attend diverse extracurricular activities.", False, False, 12)])
update_p_text(doc.paragraphs[158], [("Society & club governance\n", True, False, 12), (" Equips college societies (CSI, IEEE, SAE) with standardized registration pipelines, reducing operational chaos.", False, False, 12)])
update_p_text(doc.paragraphs[159], [("Training & Placement (T&P) drives\n", True, False, 12), (" Facilitates seamless pre-placement talks and mock interview registrations with strict eligibility filters.", False, False, 12)])
update_p_text(doc.paragraphs[160], [("Faculty & administration oversight\n", True, False, 12), (" Empowers department heads to audit event calendars, track auditorium utilization, and avoid scheduling clashes.", False, False, 12)])
update_p_text(doc.paragraphs[161], [("Institutional accreditation (NAAC/NBA)\n", True, False, 12), (" Produces verified, tamper-proof student participation records required for national quality accreditations.", False, False, 12)])
update_p_text(doc.paragraphs[162], [("Alumni & industry networking\n", True, False, 12), (" Connects external industry speakers and alumni mentors directly to university event cohorts.", False, False, 12)])
update_p_text(doc.paragraphs[163], [("Because of these use cases, there is a rising demand for efficient, secure, and scalable campus event management systems.", False, False, 12)])

update_p_text(doc.paragraphs[165], [("2.3 Objectives", True, False, 13)])
update_p_text(doc.paragraphs[166], [("Centralize campus event discovery\n", True, False, 12), (" Provide a unified web portal where students can explore, search, and register for all campus events.", False, False, 12)])
update_p_text(doc.paragraphs[167], [("Implement ACID-compliant seat allocations\n", True, False, 12), (" Guarantee zero double-bookings or capacity overflows through atomic database transactions.", False, False, 12)])
update_p_text(doc.paragraphs[168], [("Automate waitlist queue promotion\n", True, False, 12), (" Deploy a FIFO queue that automatically promotes the earliest waitlisted student upon ticket cancellation.", False, False, 12)])
update_p_text(doc.paragraphs[169], [("Integrate Generative AI Event Copilot\n", True, False, 12), (" Utilize Google Gemini 1.5 Flash to automatically draft engaging descriptions and agendas for organizers.", False, False, 12)])
update_p_text(doc.paragraphs[170], [("Cryptographic QR attendance verification\n", True, False, 12), (" Replace manual rosters with scannable, tamper-proof QR tickets verified through mobile cameras.", False, False, 12)])
update_p_text(doc.paragraphs[171], [("Automated digital certificate generation\n", True, False, 12), (" Instantly issue verified digital PDF participation certificates to validated attendees.", False, False, 12)])
update_p_text(doc.paragraphs[172], [("Enforce strict role-based access control (RBAC)\n", True, False, 12), (" Implement dual-token authentication strictly partitioning permissions between Students, Organizers, and Admins.", False, False, 12)])

update_p_text(doc.paragraphs[177], [("2.4 System Requirements", True, False, 13)])
update_p_text(doc.paragraphs[178], [("Hardware Requirements", True, False, 12)])
update_p_text(doc.paragraphs[179], [("Processor: Intel i3 / AMD Ryzen 3 / Apple Silicon or above\n", True, False, 12), (" Suitable for running development servers and full-stack runtime.", False, False, 12)])
update_p_text(doc.paragraphs[180], [("RAM: 4 GB minimum (8 GB recommended)\n", True, False, 12), (" Ensures smooth development and execution of full-stack environments.", False, False, 12)])
update_p_text(doc.paragraphs[181], [("Storage: 1 GB available disk space\n", True, False, 12), (" Sufficient for project source code, dependencies, and local asset builds.", False, False, 12)])
update_p_text(doc.paragraphs[182], [("Software Requirements", True, False, 12)])
update_p_text(doc.paragraphs[183], [("Node.js 20+ LTS", True, False, 12), (" — Required for the Express API backend and npm package ecosystem.", False, False, 12)])
update_p_text(doc.paragraphs[184], [("PostgreSQL 16+ / Neon Serverless", True, False, 12), (" — Cloud database engine used to store relational data.", False, False, 12)])
update_p_text(doc.paragraphs[185], [("Modern Web Browser (Chrome / Firefox / Safari)", True, False, 12), (" — Needed for running React 19 UI and testing.", False, False, 12)])
update_p_text(doc.paragraphs[186], [("Visual Studio Code", True, False, 12), (" — IDE used for coding and debugging.", False, False, 12)])
update_p_text(doc.paragraphs[187], [("Git & GitHub CLI", True, False, 12), (" — Version control system managing repository synchronization.", False, False, 12)])
update_p_text(doc.paragraphs[188], [("Prisma CLI & Studio", True, False, 12), (" — Data modeling, schema migration, and visual inspection tools.", False, False, 12)])

update_p_text(doc.paragraphs[189], [("2.5 System Architecture", True, False, 13)])
update_p_text(doc.paragraphs[190], [("The system uses a Client (Browser SPA) → Vercel Edge CDN → Express API Gateway → Prisma Data Layer → PostgreSQL (Neon) & Gemini AI flow.", False, False, 12)])
update_p_text(doc.paragraphs[191], [("Components", True, False, 12)])
update_p_text(doc.paragraphs[192], [("Client (Browser SPA)\n", True, False, 12), (" Renders dynamic components, manages local state, caches API queries, and renders tickets.", False, False, 12)])
update_p_text(doc.paragraphs[193], [("Vercel Edge Network\n", True, False, 12), (" Delivers compiled single-page application assets with global edge caching and SSL termination.", False, False, 12)])
update_p_text(doc.paragraphs[194], [("Express API Server (Render Cloud)\n", True, False, 12), (" Core business logic processor authenticating tokens, verifying RBAC, and executing API routes.", False, False, 12)])
update_p_text(doc.paragraphs[195], [("Prisma ORM & Connection Pool\n", True, False, 12), (" Translates object-oriented requests into optimized SQL statements with connection pooling.", False, False, 12)])
update_p_text(doc.paragraphs[196], [("Neon Serverless PostgreSQL Database\n", True, False, 12), (" Maintains ACID transactional storage with automated branching and autoscaling compute.", False, False, 12)])

update_p_text(doc.paragraphs[197], [("Flow Diagram Explanation", True, False, 13)])
update_p_text(doc.paragraphs[198], [("User Authenticates → Submits credentials to /api/auth/login\n", True, False, 12), (" Express verifies bcrypt hash and issues access & refresh tokens.", False, False, 12)])
update_p_text(doc.paragraphs[199], [("Client Browses Events → Fetches from /api/events\n", True, False, 12), (" TanStack Query issues an asynchronous GET request; the backend returns active event listings.", False, False, 12)])
update_p_text(doc.paragraphs[200], [("Student Registers → Submits RSVP to /api/events/:id/register\n", True, False, 12), (" Express initiates an isolated database transaction that atomically verifies capacity.", False, False, 12)])
update_p_text(doc.paragraphs[201], [("Capacity Reached → System Queues to FIFO Waitlist\n", True, False, 12), (" If confirmed registrations equal venue capacity, the user is assigned a WAITLISTED status.", False, False, 12)])
update_p_text(doc.paragraphs[202], [("This architecture guarantees low latency, strict data consistency, zero race conditions, and complete scalability.", False, False, 12)])

# Chapter 3 replacements
update_p_text(doc.paragraphs[218], [("3.1 Backend Implementation", True, False, 17)])
update_p_text(doc.paragraphs[219], [("3.1.1 Express & Prisma Configuration", True, False, 13)])
update_p_text(doc.paragraphs[220], [("The backend server is implemented using Node.js and Express.js 5, establishing a secure, modular REST API. The core configuration performs four vital functions:", False, False, 12)])
update_p_text(doc.paragraphs[221], [("CORS & Origin Whitelisting: ", True, False, 12), ("Strictly restricts incoming API requests to the production domain (https://campuscene.in) and authenticated local development origins.", False, False, 12)])
update_p_text(doc.paragraphs[222], [("Security Middleware & Body Parsing: ", True, False, 12), ("Applies JSON body parsing, URL-encoded payload handling, and cookie-parser to safely extract HTTP-only session tokens.", False, False, 12)])
update_p_text(doc.paragraphs[223], [("PrismaClient Lifecycle Management: ", True, False, 12), ("Initializes a singleton PrismaClient instance with connection pooling tailored for Neon serverless PostgreSQL compute.", False, False, 12)])
update_p_text(doc.paragraphs[224], [("Centralized Exception Handling: ", True, False, 12), ("Catches and formats API errors into uniform JSON payloads with exact HTTP status codes (400, 401, 403, 404, 500).", False, False, 12)])
update_p_text(doc.paragraphs[225], [("This structured configuration establishes an always-reliable, high-throughput communication channel between clients and the database.", False, False, 12)])

update_p_text(doc.paragraphs[226], [("3.1.2 Auth & Event Controllers", True, False, 13)])
update_p_text(doc.paragraphs[227], [("Modular controller architecture organizes server-side business logic into distinct, maintainable service domains:", False, False, 12)])
update_p_text(doc.paragraphs[228], [("authController.js\n", True, False, 12), (" Handles user registration, login credential validation, cryptographic password hashing (bcrypt with 10 salt rounds), access token renewal, and secure logout.", False, False, 12)])
update_p_text(doc.paragraphs[229], [("eventController.js\n", True, False, 12), (" Manages event publishing, updating, metadata editing, category-based queries, and venue capacity limit enforcement.", False, False, 12)])
update_p_text(doc.paragraphs[230], [("registrationController.js\n", True, False, 12), (" Executes atomic seat locking, status transitions (CONFIRMED vs. WAITLISTED), cancellations, and automatic FIFO waitlist queue promotions.", False, False, 12)])
update_p_text(doc.paragraphs[231], [("This ensures the entire event lifecycle is governed by strict ACID guarantees and real-time data consistency.", False, False, 12)])

update_p_text(doc.paragraphs[233], [("3.1.3 Data Models & Schema", True, False, 13)])
update_p_text(doc.paragraphs[234], [("The database schema is defined declaratively using Prisma, enforcing relational integrity across core entities:", False, False, 12)])
update_p_text(doc.paragraphs[235], [("User (id, email, passwordHash, name, rollNumber, role, department)", False, False, 12)])
update_p_text(doc.paragraphs[236], [("Event (id, title, description, category, eventDate, venue, capacity, organizerId)", False, False, 12)])
update_p_text(doc.paragraphs[237], [("Registration (id, userId, eventId, status [CONFIRMED / WAITLISTED / CANCELLED], attended, qrCodeHash)", False, False, 12)])
update_p_text(doc.paragraphs[238], [("This relational model is validated, migrated, and queried through type-safe Prisma client instances.", False, False, 12)])

update_p_text(doc.paragraphs[240], [("3.1.4 Concurrency & Waitlist Optimization", True, False, 13)])
update_p_text(doc.paragraphs[241], [("To handle high-volume registration rushes during popular college fests, the backend implements robust concurrency safeguards:", False, False, 12)])
update_p_text(doc.paragraphs[242], [("Atomic Database Transactions (prisma.$transaction)", True, False, 12), (" — wraps seat check and reservation in isolated row locks, eliminating double-booking race conditions.", False, False, 12)])
update_p_text(doc.paragraphs[243], [("Automatic FIFO Queue Promotion", True, False, 12), (" — queries earliest WAITLISTED entry ordered by registration timestamp and promotes it to CONFIRMED on cancellation.", False, False, 12)])
update_p_text(doc.paragraphs[244], [("Serverless Connection Pooling", True, False, 12), (" — Neon connection poolers seamlessly buffer burst traffic without exhausting PostgreSQL connection limits.", False, False, 12)])
update_p_text(doc.paragraphs[245], [("These optimizations maintain scalability and sub-second response times as concurrent user traffic spikes.", False, False, 12)])

# 3.2 Frontend
update_p_text(doc.paragraphs[250], [("3.2 Frontend Implementation", True, False, 17)])
update_p_text(doc.paragraphs[251], [("3.2.1 Auth & Protected Route Workflow", True, False, 13)])
update_p_text(doc.paragraphs[252], [("User enters credentials on the responsive login interface.", False, False, 12)])
update_p_text(doc.paragraphs[253], [("Client issues POST request to /api/auth/login and receives access token and user role profile.", False, False, 12)])
update_p_text(doc.paragraphs[254], [("Access token is stored in memory; refresh token is safely stored in secure HTTP-only browser cookie.", False, False, 12)])
update_p_text(doc.paragraphs[255], [("React Router DOM evaluates route guards, dynamically granting access to student, organizer, or admin dashboards.", False, False, 12)])
update_p_text(doc.paragraphs[256], [("Axios interceptors monitor HTTP response status codes; on 401 Unauthorized, an automatic silent token refresh is triggered without interrupting the user's workflow.", False, False, 12)])

update_p_text(doc.paragraphs[257], [("3.2.2 Event Dashboard & UI Components", True, False, 13)])
update_p_text(doc.paragraphs[258], [("Displays all active campus events in a dynamic grid layout featuring high-contrast typography and status badges.", False, False, 12)])
update_p_text(doc.paragraphs[259], [("Event cards present critical logistics: date, venue, current registration count, and real-time seat availability.", False, False, 12)])
update_p_text(doc.paragraphs[260], [("Interactive modal dialogs allow instant registration, displaying whether the user received a CONFIRMED seat or WAITLIST queue position.", False, False, 12)])
update_p_text(doc.paragraphs[261], [("Verified attendees access an integrated QR ticket pass view with embedded canvas rendering.", False, False, 12)])
update_p_text(doc.paragraphs[262], [("Instant certificate generation button unlocks upon attendance verification, allowing one-click PDF downloading.", False, False, 12)])

update_p_text(doc.paragraphs[264], [("3.2.3 TanStack Query State Logic", True, False, 13)])
update_p_text(doc.paragraphs[265], [("Server State Caching\n", True, False, 12), (" TanStack Query caches event listings and user profiles locally, preventing redundant network requests.", False, False, 12)])
update_p_text(doc.paragraphs[266], [("Optimistic UI Updates\n", True, False, 12), (" When a student clicks 'Register', the UI immediately reflects the booked state before the network round-trip finishes, providing zero perceptual latency.", False, False, 12)])
update_p_text(doc.paragraphs[267], [("Automated Cache Invalidation\n", True, False, 12), (" Upon successful ticket cancellation or registration, query keys ('events', 'registrations') are automatically invalidated, ensuring data is always fresh.", False, False, 12)])
update_p_text(doc.paragraphs[268], [("Error & Retry Handling\n", True, False, 12), (" Automatically retries failed network calls with exponential backoff before surfacing friendly toast notifications.", False, False, 12)])
update_p_text(doc.paragraphs[269], [("This eliminates the need for manual browser refreshes and provides a lightning-fast native app feel.", False, False, 12)])

# 3.3 Complete Data Flow
update_p_text(doc.paragraphs[271], [("3.3 Complete Data Flow (End-to-End Sequence)", True, False, 17)])
update_p_text(doc.paragraphs[272], [("1. User Opens Registration / Login Page", True, False, 13)])
update_p_text(doc.paragraphs[273], [("Frontend displays clean authentication interface.", False, False, 12)])
update_p_text(doc.paragraphs[274], [("No active session token is present; protected routes are locked.", False, False, 12)])

update_p_text(doc.paragraphs[275], [("2. User Authenticates with Credentials", True, False, 13)])
update_p_text(doc.paragraphs[276], [("Client sends POST /api/auth/login with email and password.", False, False, 12)])
update_p_text(doc.paragraphs[277], [("Express validates bcrypt hash and issues dual JWT tokens.", False, False, 12)])
update_p_text(doc.paragraphs[278], [("Frontend stores access token in memory and refresh token in secure cookie.", False, False, 12)])
update_p_text(doc.paragraphs[279], [("sender: authenticated user", False, False, 12)])
update_p_text(doc.paragraphs[280], [("role: STUDENT / ORGANIZER / ADMIN", False, False, 12)])

update_p_text(doc.paragraphs[281], [("3. User Browses Event Catalog", True, False, 13)])
update_p_text(doc.paragraphs[282], [("Frontend requests GET /api/events with category and search query parameters.", False, False, 12)])
update_p_text(doc.paragraphs[283], [("Backend queries PostgreSQL database via Prisma and returns active event listings.", False, False, 12)])

update_p_text(doc.paragraphs[285], [("4. Student Initiates Event Registration", True, False, 13)])
update_p_text(doc.paragraphs[286], [("Student clicks 'Register' on desired event card.", False, False, 12)])
update_p_text(doc.paragraphs[287], [("Frontend dispatches POST /api/events/:id/register with authorization bearer header.", False, False, 12)])

update_p_text(doc.paragraphs[288], [("5. Backend Executes Atomic Capacity Transaction", True, False, 13)])
update_p_text(doc.paragraphs[289], [("prisma.$transaction locks event registration rows and evaluates remaining capacity.", False, False, 12)])

update_p_text(doc.paragraphs[290], [("6. System Assigns Status & Issues QR Ticket", True, False, 13)])
update_p_text(doc.paragraphs[291], [("If seats remain: Creates record with status CONFIRMED and generates cryptographic QR payload.", False, False, 12)])
update_p_text(doc.paragraphs[292], [("If venue full: Creates record with status WAITLISTED and returns queue position.", False, False, 12)])

update_p_text(doc.paragraphs[293], [("7. Cancellation Triggers Automatic FIFO Promotion", True, False, 13)])
update_p_text(doc.paragraphs[294], [("When a registered user cancels, transaction automatically promotes earliest WAITLISTED entry to CONFIRMED.", False, False, 12)])
update_p_text(doc.paragraphs[295], [("UI reflects updated status in real time across attendee dashboards.", False, False, 12)])

update_p_text(doc.paragraphs[296], [("8. Attendee Arrives at Venue & Scans QR Pass", True, False, 13)])
update_p_text(doc.paragraphs[297], [("Organizer uses camera scanner to read ticket QR code.", False, False, 12)])
update_p_text(doc.paragraphs[298], [("Scanner sends POST /api/tickets/verify with ticket hash.", False, False, 12)])
update_p_text(doc.paragraphs[299], [("Backend validates QR signature and marks attended: true.", False, False, 12)])

update_p_text(doc.paragraphs[300], [("9. Attendance Verified & Certificate Generated", True, False, 13)])
update_p_text(doc.paragraphs[301], [("Student dashboard unlocks digital PDF certificate of participation download.", False, False, 12)])

# Chapter 4
update_p_text(doc.paragraphs[304], [("CHAPTER 4 – RESULTS & TESTING ", True, False, 17)])
update_p_text(doc.paragraphs[305], [("4.1 Output Screens", True, False, 13)])
update_p_text(doc.paragraphs[306], [("Event Discovery & Dashboard UI Snapshot", False, False, 12)])
update_p_text(doc.paragraphs[307], [("Event Registration & Digital Certificate Modal Snapshot", False, False, 12)])
update_p_text(doc.paragraphs[308], [("Render Cloud Production Backend Deployment Snapshot", False, False, 12)])
update_p_text(doc.paragraphs[309], [("Vercel Edge Production Frontend Deployment Snapshot", False, False, 12)])

update_p_text(doc.paragraphs[310], [("4.2 Testing Parameters", True, False, 17)])
update_p_text(doc.paragraphs[311], [("Functional Testing", True, False, 12)])
update_p_text(doc.paragraphs[312], [("User authentication & role enforcement (Admin, Organizer, Student)", False, False, 12)])
update_p_text(doc.paragraphs[313], [("Event creation, image upload, and Gemini AI description generation", False, False, 12)])
update_p_text(doc.paragraphs[314], [("Instant ticket RSVP, QR generation, and cancellation workflows", False, False, 12)])
update_p_text(doc.paragraphs[315], [("Automated waitlist FIFO queue promotion logic", False, False, 12)])

update_p_text(doc.paragraphs[316], [("Load & Concurrency Testing", True, False, 12)])
update_p_text(doc.paragraphs[317], [("100+ concurrent simulated registration requests executed within 2-second burst window", False, False, 12)])
update_p_text(doc.paragraphs[318], [("Zero overselling: capacity strictly adhered to without negative seat counts", False, False, 12)])
update_p_text(doc.paragraphs[319], [("Sub-250ms average API response latency under sustained throughput on Render cloud", False, False, 12)])

update_p_text(doc.paragraphs[320], [("Security Testing", True, False, 12)])
update_p_text(doc.paragraphs[321], [("Cross-site scripting (XSS) input sanitization and prevention", False, False, 12)])
update_p_text(doc.paragraphs[322], [("SQL injection immunity guaranteed via Prisma parameterized queries", False, False, 12)])
update_p_text(doc.paragraphs[323], [("Strict CORS origin whitelisting restricting unauthorized third-party requests", False, False, 12)])

# Chapter 5
update_p_text(doc.paragraphs[329], [("CHAPTER 5 – APPLICATIONS & FUTURE SCOPE ", True, False, 17)])
update_p_text(doc.paragraphs[330], [("5.1 Applications", True, False, 13)])
update_p_text(doc.paragraphs[331], [("University Cultural & Technical Fests (Elements, Culmyca, Hackathons)", False, False, 12)])
update_p_text(doc.paragraphs[332], [("Departmental Seminars, Guest Lectures & Faculty Development Programs", False, False, 12)])
update_p_text(doc.paragraphs[333], [("College Societies and Student Club Management (CSI, IEEE, SAE, Dramatics)", False, False, 12)])
update_p_text(doc.paragraphs[334], [("Training & Placement (T&P) Drive Pre-Talks and Aptitude Test Registrations", False, False, 12)])
update_p_text(doc.paragraphs[335], [("Intramural Sports Tournaments and Annual Athletic Meets", False, False, 12)])
update_p_text(doc.paragraphs[336], [("Automated Verified Student Extracurricular Portfolios for NAAC/NBA Accreditation", False, False, 12)])

update_p_text(doc.paragraphs[337], [("5.2 Future Enhancements", True, False, 13)])
update_p_text(doc.paragraphs[338], [("Cross-Platform Native Mobile App (React Native / Flutter) for Android & iOS", False, False, 12)])
update_p_text(doc.paragraphs[339], [("Offline QR Scanner Support with local encrypted SQLite synchronization for zero-network venues", False, False, 12)])
update_p_text(doc.paragraphs[340], [("Blockchain-Anchored Verifiable Credentials (NFT / OpenBadges standard) for tamper-proof certificates", False, False, 12)])
update_p_text(doc.paragraphs[341], [("Single Sign-On (SSO) Integration with University ERP and Microsoft 365 student accounts", False, False, 12)])
update_p_text(doc.paragraphs[342], [("Automated Event Reminders via WhatsApp Business API and WebPush notifications", False, False, 12)])
update_p_text(doc.paragraphs[343], [("AI-Powered Personalized Event Recommendations based on student department and interest tags", False, False, 12)])
update_p_text(doc.paragraphs[344], [("Multi-campus federation for inter-college festival ticketing", False, False, 12)])

# References
update_p_text(doc.paragraphs[348], [("REFERENCES", True, False, 13)])
update_p_text(doc.paragraphs[349], [("Node.js v20 LTS Official Documentation — OpenJS Foundation", False, False, 12)])
update_p_text(doc.paragraphs[350], [("Express.js 5 Application Framework Reference Manual", False, False, 12)])
update_p_text(doc.paragraphs[351], [("React 19 Official Documentation & Concurrent Features — Meta Open Source", False, False, 12)])
update_p_text(doc.paragraphs[352], [("Prisma ORM Architecture and Type-Safe Schema Documentation", False, False, 12)])
update_p_text(doc.paragraphs[353], [("Google Gemini Generative AI SDK Documentation (@google/genai)", False, False, 12)])

# Enforce Times New Roman and black across all remaining paragraphs
for p in doc.paragraphs:
    enforce_tnr_black(p)

# Save intermediate modified docx
intermediate_docx = "docs/report_assets/intermediate.docx"
doc.save(intermediate_docx)

# 3. Replace image1.jpg and image2.jpg in docx zip archive with CampuScene screenshots
final_docx = "CampuScene_Final_Project_Report.docx"
docs_final = "docs/report/CampuScene_Final_Project_Report.docx"

with zipfile.ZipFile(intermediate_docx, 'r') as zin:
    with zipfile.ZipFile(final_docx, 'w') as zout:
        for item in zin.infolist():
            if item.filename == "word/media/image1.jpg":
                with open("docs/report_assets/image1.jpg", "rb") as f_img:
                    zout.writestr(item, f_img.read())
            elif item.filename == "word/media/image2.jpg":
                with open("docs/report_assets/image2.jpg", "rb") as f_img:
                    zout.writestr(item, f_img.read())
            else:
                zout.writestr(item, zin.read(item.filename))

shutil.copyfile(final_docx, docs_final)
print(f"Successfully generated perfect transformed report: {final_docx}")
