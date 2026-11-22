import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_report():
    doc = docx.Document()
    
    # Configure Page Margins: 1.0 inch all around
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Configure Header with Top-Right Page Numbering
        # Unlink header from title page if needed or standard header
        header = section.header
        header.is_linked_to_previous = False
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        # add page number field
        hrun = hp.add_run()
        hrun.font.name = "Times New Roman"
        hrun.font.size = Pt(10)
        hrun.font.color.rgb = RGBColor(0, 0, 0)
        
        fldSimple = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
        hp._p.append(fldSimple)

    # Helper function for setting run font
    def style_run(run, font_name="Times New Roman", size_pt=12, bold=False, italic=False, color=(0, 0, 0)):
        run.font.name = font_name
        run.font.size = Pt(size_pt)
        run.bold = bold
        run.italic = italic
        run.font.color.rgb = RGBColor(*color)

    # Helper function for adding paragraphs
    def add_p(text="", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=False, italic=False, space_after=6, space_before=0, line_spacing=1.15):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            r = p.add_run(text)
            style_run(r, size_pt=size_pt, bold=bold, italic=italic)
        return p

    def add_justified(text, bold_prefix=None, size_pt=12, space_after=6):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            style_run(r_bold, size_pt=size_pt, bold=True)
        r_text = p.add_run(text)
        style_run(r_text, size_pt=size_pt, bold=False)
        return p

    def add_bullet(bold_prefix, text="", size_pt=12, space_after=4):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.line_spacing = 1.15
        
        r_bullet = p.add_run("●  ")
        style_run(r_bullet, size_pt=size_pt, bold=False)
        
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            style_run(r_bold, size_pt=size_pt, bold=True)
            
        if text:
            r_text = p.add_run(" " + text if bold_prefix and not bold_prefix.endswith(" ") else text)
            style_run(r_text, size_pt=size_pt, bold=False)
        return p

    def add_subbullet(bold_prefix, text="", size_pt=12, space_after=3):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.left_indent = Inches(0.5)
        p.paragraph_format.line_spacing = 1.15
        
        r_bullet = p.add_run("○  ")
        style_run(r_bullet, size_pt=size_pt, bold=False)
        
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            style_run(r_bold, size_pt=size_pt, bold=True)
            
        if text:
            r_text = p.add_run(" " + text if bold_prefix and not bold_prefix.endswith(" ") else text)
            style_run(r_text, size_pt=size_pt, bold=False)
        return p

    print("Building Document Structure...")

    # ==========================================
    # PAGE 1: TITLE PAGE
    # ==========================================
    add_p("A", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=14, space_before=10, space_after=6)
    add_p("Capstone Project Report", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=18, bold=True, space_after=6)
    add_p("On", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=14, space_after=6)
    add_p("CampuScene - AI-Powered Campus Event Management & Student Engagement Platform", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=16, bold=True, space_after=12)
    add_p("Submitted during 5th semester in partial fulfillment of the requirements for the award of degree of", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=14, space_after=8)
    add_p("Bachelor of Technology", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=16, bold=True, space_after=4)
    add_p("in", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=14, space_after=4)
    add_p("Computer Engineering", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=16, bold=True, space_after=8)
    add_p("by", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=14, space_after=4)
    add_p("Kushdeep (23001003064)", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=16, bold=True, space_after=8)
    add_p("Under supervision of", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=14, space_after=4)
    add_p("Dr. Parul Gupta", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=16, bold=True, space_after=14)

    # University Logo
    logo_path = "docs/report_assets/ymca_logo.png"
    if os.path.exists(logo_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_after = Pt(14)
        run_img = p_img.add_run()
        run_img.add_picture(logo_path, width=Inches(1.3))

    add_p("Department of Computer Engineering", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=14, bold=True, space_after=4)
    add_p("FACULTY OF INFORMATICS & COMPUTING", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=14, bold=True, space_after=4)
    add_p("J.C. Bose University of Science & Technology, YMCA", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=14, bold=True, space_after=4)
    add_p("Faridabad – 121006", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=14, bold=True, space_after=8)
    add_p("DECEMBER 2025", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=14, bold=True, space_after=0)

    doc.add_page_break()

    # ==========================================
    # PAGE 2: CANDIDATE'S DECLARATION
    # ==========================================
    add_p("CANDIDATE’S DECLARATION", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=16, bold=True, space_before=20, space_after=30)
    add_justified("I hereby certify that the work which is being presented in this Project titled “CampuScene - AI-Powered Campus Event Management & Student Engagement Platform” in fulfilment of the requirements for the degree of Bachelor of Technology in Computer engineering and submitted to “J.C. Bose University of Science and Technology, YMCA, Faridabad”, is an authentic record of my own work carried out under the supervision of Dr. Parul Gupta.", size_pt=14, space_after=20)
    add_justified("The work contained in this project has not been submitted to any other University or Institute for the award of any degree or diploma by me.", size_pt=14, space_after=80)
    
    add_p("Kushdeep", align=WD_ALIGN_PARAGRAPH.RIGHT, size_pt=14, bold=True, space_after=0)

    doc.add_page_break()

    # ==========================================
    # PAGE 3: CERTIFICATE
    # ==========================================
    add_p("CERTIFICATE", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=16, bold=True, space_before=20, space_after=30)
    add_justified("It is hereby certified that the project titled CampuScene - AI-Powered Campus Event Management & Student Engagement Platform submitted by Kushdeep (23001003064) of 3rd Year (5th Semester) to “J. C. Bose University of Science and Technology, YMCA, Faridabad” for the award of the degree of Bachelor of Technology in Computer Engineering is a record of a bonafide work carried out by him/her in the Project Lab – J.C. Bose University of Science and Technology, YMCA, Faridabad under my supervision as mentor for December 2025 examination.", size_pt=14, space_after=18)
    add_justified("In my opinion, the project has reached the standards of fulfilling the requirements of the regulations to the degree.", size_pt=14, space_after=70)

    add_p("Dr. Parul Gupta (Mentor)", align=WD_ALIGN_PARAGRAPH.RIGHT, size_pt=14, bold=True, space_after=2)
    add_p("Associate Professor,", align=WD_ALIGN_PARAGRAPH.RIGHT, size_pt=14, bold=False, space_after=2)
    add_p("Department of Computer Engg.", align=WD_ALIGN_PARAGRAPH.RIGHT, size_pt=14, bold=False, space_after=0)

    doc.add_page_break()

    # ==========================================
    # PAGE 4: ACKNOWLEDGEMENT
    # ==========================================
    add_p("ACKNOWLEDGEMENT", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=16, bold=True, space_before=20, space_after=30)
    add_justified("I have taken efforts in this project. However, it would not have been possible without the kind support and help of many individuals.", size_pt=14, space_after=16)
    add_justified("I would like to extend my sincere thanks to all them. I am highly indebted to my mentor Dr. Parul Gupta for their guidance and constant supervision as well as for providing necessary information regarding the project & also for their support in completing the project.", size_pt=14, space_after=16)
    add_justified("I would like to express my gratitude towards my parents & members of J.C. Bose University of Science and Technology for their kind cooperation and encouragement which helped in the completion of this project. I would like to express my special gratitude and thanks to Dr. Rewa Sharma as well for their guidance.", size_pt=14, space_after=60)

    add_p("Kushdeep", align=WD_ALIGN_PARAGRAPH.RIGHT, size_pt=14, bold=True, space_after=0)

    doc.add_page_break()

    # ==========================================
    # PAGE 5: CHAPTER 1 – INTRODUCTION
    # ==========================================
    add_p("CHAPTER 1 – INTRODUCTION", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=17, bold=True, space_before=10, space_after=14)
    add_p("1.1 Project Overview", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_after=8)
    add_justified("The CampuScene web application developed in this project demonstrates a fully functional, scalable, and modern campus event management and student engagement platform built using React 19, Express.js 5, Prisma ORM, PostgreSQL (Neon Serverless), and Google Gemini 1.5 Flash AI. This platform is engineered to modernize collegiate extra-curricular administration by replacing unorganized WhatsApp circulars, static paper posters, and manual Google Forms with a unified, real-time web portal.", size_pt=12, space_after=8)
    add_justified("In contemporary university ecosystems, extra-curricular activities, technical hackathons, guest lectures, and cultural fests play a decisive role in holistic student growth. However, decentralized information dissemination often results in low student turnout, booking collisions, and severe logistical mismanagement. CampuScene solves these critical bottlenecks by providing a high-availability centralized portal with instant search, interactive event feeds, atomic registration locking, automated waitlists, dynamic QR-code entry passes, and automated verifiable certificates of participation.", size_pt=12, space_after=8)
    add_justified("The platform is live and operational in production at https://campuscene.in with its micro-services backend hosted at https://api.campuscene.in, delivering enterprise-grade performance, low latency, and zero-downtime scalability across both desktop and mobile client environments.", size_pt=12, space_after=14)

    add_p("1.2 Importance of Campus Event Automation & Engagement", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_after=8)
    add_justified("Digital event automation forms the structural foundation of organized university operations. By eliminating manual paperwork and fragmented communication, campus event automation guarantees transparency, administrative accountability, and equal opportunity for student participation across all departments.", size_pt=12, space_after=8)
    add_justified("The adoption of a specialized centralized platform over ad-hoc communication channels delivers substantial institutional benefits:", size_pt=12, space_after=6)
    add_bullet("Elimination of information silos", "across fragmented departmental messaging groups.")
    add_bullet("Guaranteed seating capacity control", "preventing auditorium overcrowding and fire-code safety violations.")
    add_bullet("Zero registration collisions", "using ACID-compliant database locking mechanisms.")
    add_bullet("Real-time automated ticket issuance", "and instant attendee verification through scannable QR passes.")
    add_bullet("Instant digital certificate distribution", "linked directly to verified attendance records.")
    add_justified("These systemic advantages establish CampuScene as a vital technological asset for modern engineering institutions striving toward digital campus excellence and streamlined accreditation compliance.", size_pt=12, space_after=0)

    doc.add_page_break()

    # ==========================================
    # PAGE 6: 1.3 Key Features
    # ==========================================
    add_p("1.3 Key Features", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=10, space_after=12)
    add_bullet("Dual-Token JWT Authentication:", "Secure session management utilizing HTTP-only cookies, bcrypt password hashing, and token rotation for Students, Organizers, and Admins.")
    add_bullet("Real-Time ACID-Compliant RSVP:", "Atomic seat reservation engine preventing overselling through isolated row-level database transactions.")
    add_bullet("Automated FIFO Waitlist Engine:", "Real-time queuing pipeline that automatically promotes the earliest waitlisted candidate upon any ticket cancellation.")
    add_bullet("Google Gemini 1.5 Flash AI Copilot:", "Integrated generative AI assistant that generates professional event descriptions, marketing copy, and multi-track schedules.")
    add_bullet("Dynamic QR Code Ticket Generation:", "Unique cryptographic entry passes generated per attendee for rapid on-spot mobile check-in verification.")
    add_bullet("Digital Certificate Generation Engine:", "Automated generation and instant download of customized PDF participation certificates for verified attendees.")
    add_bullet("Comprehensive Society & Event Dashboards:", "Administrative controls for society leads and faculty mentors to track live headcounts, registrations, and attendance analytics.")
    add_bullet("Full-Text Search & Category Filtering:", "Instant client-side querying across technical, cultural, literary, and sports event categories.")
    add_bullet("Optimistic UI State Synchronization:", "Powered by TanStack Query v5 for instantaneous visual feedback without page refreshes or unnecessary polling.")
    add_bullet("Responsive Mobile-First Interface:", "Engineered with Tailwind CSS and modern React components to deliver a native-like experience on smartphones, tablets, and desktops.")

    doc.add_page_break()

    # ==========================================
    # PAGE 7: 1.4 Technologies Used
    # ==========================================
    add_p("1.4 Technologies Used", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=10, space_after=10)
    add_p("Backend Technologies", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=True, space_after=6)
    add_bullet("Node.js (v20+ LTS):", "High-performance asynchronous JavaScript runtime executing event-driven backend services.")
    add_bullet("Express.js 5:", "Modern, minimalist web application framework providing robust routing and middleware orchestration.")
    add_bullet("Prisma ORM:", "Next-generation type-safe Object-Relational Mapper ensuring schema validation, migrations, and transactional query execution.")
    add_bullet("PostgreSQL (Neon Serverless):", "Cloud-native, ACID-compliant relational database providing auto-scaling storage and high-concurrency connection pooling.")
    add_bullet("Google Gemini AI SDK:", "Official @google/genai SDK integration leveraging Gemini 1.5 Flash for natural language processing and event drafting.")
    add_bullet("JSON Web Tokens (JWT) & bcrypt.js:", "Stateless access token verification combined with adaptive one-way cryptographic hashing for secure authentication.")

    add_p("Frontend Technologies", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=True, space_before=8, space_after=6)
    add_bullet("HTML5 & Modern CSS3:", "Semantic, standards-compliant web document structure and responsive UI layouts.")
    add_bullet("Tailwind CSS:", "Utility-first CSS framework enabling rapid styling, consistent design systems, and responsive viewport breakpoints.")
    add_bullet("React 19:", "Component-based reactive user interface library featuring concurrent rendering and state lifecycle hooks.")
    add_bullet("Vite:", "Next-generation frontend tooling providing sub-millisecond Hot Module Replacement (HMR) and optimized build bundles.")
    add_bullet("TanStack Query (React Query v5):", "Asynchronous state management library handling caching, background synchronization, and optimistic UI updates.")

    add_p("Tools & Platforms", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=True, space_before=8, space_after=6)
    add_bullet("Visual Studio Code:", "Integrated development environment used for code authoring, linting, and debugging.")
    add_bullet("GitHub:", "Distributed version control system managing repository commits, feature branches, and collaboration.")
    add_bullet("Vercel Edge Network:", "Cloud hosting platform deploying the React production frontend (campuscene.in) with global SSL CDN caching.")
    add_bullet("Render Cloud Platform:", "Fully managed cloud infrastructure running the Node.js Express API backend service (api.campuscene.in).")
    add_bullet("GoDaddy DNS Manager:", "Domain registrar configuring DNS A-records, CNAME aliases, and custom nameservers.")

    doc.add_page_break()

    # ==========================================
    # PAGE 8: CHAPTER 2 – SYSTEM ANALYSIS AND DESIGN
    # ==========================================
    add_p("CHAPTER 2 – SYSTEM ANALYSIS AND DESIGN", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=17, bold=True, space_before=10, space_after=14)
    add_p("2.1 Problem Statement", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_after=8)
    add_justified("Traditional campus event management relies heavily on disconnected third-party tools such as WhatsApp groups, Instagram stories, physical paper rosters, and standalone Google Sheets. This fragmented approach suffers from several severe structural shortcomings:", size_pt=12, space_after=8)
    add_bullet("Information Silos & Low Student Turnout:", "Announcements are dispersed across uncoordinated social groups, leaving non-member students unaware of vital workshops, hackathons, and seminars.")
    add_bullet("Capacity Overflows & Safety Hazards:", "Without atomic seat locking, popular university events frequently exceed venue capacity, causing overcrowded seminar halls and disruptive on-the-spot turnaways.")
    add_bullet("Manual Attendance Tracking & Proxy Check-ins:", "Paper signature sheets at venue entrances cause long entry bottlenecks, illegible records, and extensive student proxy sign-ins.")
    add_bullet("Organizer Administrative Burnout:", "Student coordinators spend countless hours manually cross-referencing registration spreadsheets, compiling lists, and handcrafting individual participation certificates.")
    add_justified("To eliminate these systemic vulnerabilities, CampuScene establishes a centralized, automated web platform that delivers real-time ticket allocation, strict database concurrency, and intelligent administrative automation.", size_pt=12, space_after=14)

    add_p("2.2 Need for Centralized Campus Platforms", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_after=8)
    add_justified("Centralized campus engagement platforms are indispensable across all facets of modern collegiate life:", size_pt=12, space_after=6)
    add_bullet("Student Community Engagement:", "Enables students across all branches and academic years to discover, bookmark, and attend diverse extracurricular activities.")
    add_bullet("Society & Club Governance:", "Equips college societies (CSI, IEEE, SAE, Cultural Club) with standardized registration pipelines, reducing operational chaos.")
    add_bullet("Training & Placement (T&P) Drives:", "Facilitates seamless pre-placement talks, coding workshops, and mock interview registrations with strict eligibility filters.")
    add_bullet("Faculty & Administration Oversight:", "Empowers department heads and university administration to audit event calendars, track auditorium utilization, and avoid scheduling clashes.")
    add_bullet("Institutional Accreditation (NAAC/NBA):", "Produces verified, tamper-proof student participation records required for national quality accreditations and institutional rankings.")
    add_justified("Because of these essential requirements, there is an urgent demand for secure, scalable, and automated event management systems tailored for university environments.", size_pt=12, space_after=0)

    doc.add_page_break()

    # ==========================================
    # PAGE 9: 2.3 Objectives
    # ==========================================
    add_p("2.3 Objectives", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=10, space_after=12)
    add_bullet("Centralize Campus Event Discovery:", "Provide a unified, beautifully designed web portal where students can explore, search, and register for all institutional and society events.")
    add_bullet("Implement ACID-Compliant Seat Allocations:", "Guarantee zero double-bookings or capacity overflows through atomic database transactions and strict concurrency control.")
    add_bullet("Automate Waitlist Queue Promotion:", "Deploy a first-in, first-out (FIFO) queue that automatically promotes the earliest waitlisted student whenever an active registration is cancelled.")
    add_bullet("Integrate Generative AI Event Copilot:", "Utilize Google Gemini 1.5 Flash to automatically draft engaging descriptions, agendas, and promotional copy for student organizers.")
    add_bullet("Cryptographic QR Attendance Verification:", "Replace manual entry rosters with scannable, tamper-proof QR tickets verified through authenticated organizer mobile cameras.")
    add_bullet("Automated Digital Certificate Generation:", "Instantly issue verified digital PDF participation certificates to validated attendees, eliminating weeks of manual design work.")
    add_bullet("Enforce Strict Role-Based Access Control (RBAC):", "Implement dual-token authentication strictly partitioning administrative capabilities between Students, Society Leads, and System Administrators.")
    add_bullet("Deliver Zero-Latency User Interaction:", "Leverage TanStack Query for optimistic UI updates, ensuring sub-second screen responsiveness without manual browser refreshes.")
    add_bullet("Achieve High Availability Cloud Deployment:", "Maintain production reliability, SSL encryption, and high uptime on Vercel Edge and Render cloud hosting platforms.")

    doc.add_page_break()

    # ==========================================
    # PAGE 10: 2.4 System Requirements & 2.5 System Architecture
    # ==========================================
    add_p("2.4 System Requirements", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=10, space_after=8)
    add_p("Hardware Requirements", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=True, space_after=6)
    add_bullet("Processor: Intel i3 / AMD Ryzen 3 / Apple Silicon or above", "Capable of running development servers, Vite bundler, and backend runtime.")
    add_bullet("RAM: 4 GB minimum (8 GB recommended)", "Ensures smooth execution of full-stack Node.js environments and browser developer tools.")
    add_bullet("Storage: 1 GB available disk space", "Sufficient for project source code, node_modules dependencies, and local asset builds.")

    add_p("Software Requirements", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=True, space_before=8, space_after=6)
    add_bullet("Node.js 20+ LTS", "— Core runtime engine powering Express API server and npm package ecosystem.")
    add_bullet("PostgreSQL 16+ / Neon Serverless", "— Relational database hosting structured transactional tables.")
    add_bullet("Modern Web Browser (Chrome / Firefox / Safari)", "— Supporting modern JavaScript ES6+, HTML5 canvas, and Web Storage.")
    add_bullet("Visual Studio Code", "— Primary integrated development environment for TypeScript/JavaScript authoring.")
    add_bullet("Git & GitHub CLI", "— Version control system managing source code synchronization and deployment workflows.")

    add_p("2.5 System Architecture", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=10, space_after=8)
    add_justified("The CampuScene system employs a multi-tiered decoupled architecture following the flow: Client (Browser SPA) → Vercel Edge CDN → Express API Gateway → Prisma Data Layer → PostgreSQL (Neon) & Gemini AI Engine.", size_pt=12, space_after=8)
    add_p("Components", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=True, space_after=6)
    add_bullet("Client Application (React 19 SPA):", "Renders dynamic components, manages local state, caches API queries, and renders tickets.")
    add_bullet("Vercel Edge Network (Frontend Host):", "Delivers compiled single-page application assets with global edge caching and automatic SSL termination.")
    add_bullet("Express API Server (Render Cloud):", "Serves as the core business logic processor, authenticating tokens, verifying RBAC, and executing API routes.")
    add_bullet("Prisma ORM & Connection Pool:", "Translates object-oriented requests into optimized SQL statements while managing connection pooling.")
    add_bullet("Neon Serverless PostgreSQL Database:", "Maintains ACID transactional storage with automated branching and autoscaling compute.")
    add_bullet("Google Gemini 1.5 Flash Cloud Service:", "Executes natural language prompts to generate rich event schedules, descriptions, and summaries.")

    doc.add_page_break()

    # ==========================================
    # PAGE 11: 2.5 Flow Diagram Explanation
    # ==========================================
    add_p("Flow Diagram Explanation", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=10, space_after=10)
    add_bullet("User Authenticates → Submits credentials to /api/auth/login", "Express verifies bcrypt hash and issues a signed JWT access token alongside a secure HTTP-only refresh token.")
    add_bullet("Client Browses Events → Fetches from /api/events", "TanStack Query issues an asynchronous GET request; the backend queries PostgreSQL via Prisma and returns active event listings.")
    add_bullet("Student Registers → Submits RSVP to /api/events/:id/register", "Express initiates an isolated database transaction that atomically verifies remaining capacity and creates a registration record.")
    add_bullet("Capacity Reached → System Queues to FIFO Waitlist", "If confirmed registrations equal venue capacity, the user is automatically assigned a WAITLISTED status with timestamp priority.")
    add_bullet("Cancellation Handled → Triggers Auto-Promotion", "When an attendee cancels, an atomic transaction immediately promotes the earliest waitlisted candidate to CONFIRMED status.")
    add_bullet("Organizer Generates Content → Queries /api/ai/generate", "Backend formats prompt parameters and invokes Google Gemini 1.5 Flash, streaming structured agenda text back to the client.")
    add_bullet("Venue Door Check-in → Organizer Scans QR Code", "Organizer camera scans student ticket QR code, sending hash to /api/tickets/verify to instantly confirm attendance.")
    add_bullet("Certificate Distribution → Unlocked upon Verified Attendance", "Attendee profile automatically activates a certificate download button, pulling a dynamically signed PDF.")
    add_justified("This architecture guarantees exceptionally low latency, strict data consistency, zero race conditions, and complete operational transparency.", size_pt=12, space_after=0)

    doc.add_page_break()

    # ==========================================
    # PAGE 12: CHAPTER 3 – IMPLEMENTATION & METHODOLOGY
    # ==========================================
    add_p("CHAPTER 3 – IMPLEMENTATION & METHODOLOGY", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=17, bold=True, space_before=10, space_after=14)
    add_p("3.1 Backend Implementation", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_after=8)
    add_p("3.1.1 Express & Prisma Configuration", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_after=8)
    add_justified("The backend server is implemented using Node.js and Express.js 5, establishing a secure, modular REST API. The core configuration performs four vital functions:", size_pt=12, space_after=8)
    add_bullet("CORS & Origin Whitelisting:", "Strictly restricts incoming API requests to the production domain (https://campuscene.in) and authenticated local development origins.")
    add_bullet("Security Middleware & Body Parsing:", "Applies JSON body parsing, URL-encoded payload handling, and cookie-parser to safely extract HTTP-only session tokens.")
    add_bullet("PrismaClient Lifecycle Management:", "Initializes a singleton PrismaClient instance with optimized connection pooling tailored for Neon serverless PostgreSQL compute.")
    add_bullet("Centralized Exception Handling:", "Catches and formats API errors into uniform JSON payloads with exact HTTP status codes (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error).")
    add_justified("This structured configuration establishes an always-reliable, high-throughput communication channel between clients and the database.", size_pt=12, space_after=14)

    add_p("3.1.2 Auth & Event Controllers", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_after=8)
    add_justified("Modular controller architecture organizes server-side business logic into distinct, maintainable service domains:", size_pt=12, space_after=6)
    add_bullet("authController.js:", "Handles user registration, login credential validation, cryptographic password hashing (bcrypt with 10 salt rounds), access token renewal, and secure logout.")
    add_bullet("eventController.js:", "Manages event publishing, updating, metadata editing, category-based queries, and venue capacity limit enforcement.")
    add_bullet("registrationController.js:", "Executes atomic seat locking, status transitions (CONFIRMED vs. WAITLISTED), cancellations, and automatic FIFO waitlist queue promotions.")
    add_bullet("ticketController.js:", "Generates tamper-proof cryptographic QR hashes for registered attendees and handles real-time verification scans by event organizers.")
    add_justified("This decoupling ensures strict separation of concerns, testability, and maintainable software architecture.", size_pt=12, space_after=0)

    doc.add_page_break()

    # ==========================================
    # PAGE 13: 3.1.3 Models & 3.1.4 Concurrency
    # ==========================================
    add_p("3.1.3 Data Models & Schema", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=10, space_after=8)
    add_justified("The database schema is defined declaratively using Prisma, enforcing relational integrity across five primary entities:", size_pt=12, space_after=8)
    add_bullet("User Model:", "Stores id, email, passwordHash, name, rollNumber, department, role (STUDENT, ORGANIZER, ADMIN), and creation timestamp.")
    add_bullet("Event Model:", "Stores id, title, description, category, eventDate, venue, totalCapacity, organizerId, status (DRAFT, PUBLISHED, COMPLETED), and bannerUrl.")
    add_bullet("Registration Model:", "Stores id, userId, eventId, status (CONFIRMED, WAITLISTED, CANCELLED), attended (Boolean), qrCodeHash, and registrationTimestamp.")
    add_bullet("RefreshToken Model:", "Stores id, tokenHash, userId, expirationDate, and revocation status for secure token rotation.")
    add_justified("This normalized relational structure ensures referential integrity and eliminates data redundancy across the application.", size_pt=12, space_after=14)

    add_p("3.1.4 Concurrency & Waitlist Optimization", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_after=8)
    add_justified("To handle high-volume registration rushes during popular college fests, the backend implements robust concurrency safeguards:", size_pt=12, space_after=6)
    add_bullet("Atomic Database Transactions (prisma.$transaction):", "Wraps capacity validation and ticket insertion within an atomic database transaction. If two students attempt to book the final remaining seat simultaneously, database row locks prevent overbooking.")
    add_bullet("Automated First-In, First-Out (FIFO) Promotion:", "When a registered user cancels, an automated database transaction queries the earliest WAITLISTED entry ordered by createdAt ASC and instantly updates its status to CONFIRMED.")
    add_bullet("Serverless Connection Pooling:", "Neon connection poolers manage burst traffic seamlessly, allowing hundreds of concurrent connections without exhausting database socket limits.")
    add_justified("These optimizations guarantee zero data corruption, predictable behavior, and instantaneous response times under heavy concurrent load.", size_pt=12, space_after=0)

    doc.add_page_break()

    # ==========================================
    # PAGE 14: 3.2 Frontend Implementation
    # ==========================================
    add_p("3.2 Frontend Implementation", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=17, bold=True, space_before=10, space_after=14)
    add_p("3.2.1 Auth & Protected Route Workflow", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_after=8)
    add_bullet("User enters credentials on the responsive login interface.")
    add_bullet("Client issues POST request to /api/auth/login and receives access token and user role profile.")
    add_bullet("Access token is stored in memory; refresh token is safely stored in secure HTTP-only browser cookie.")
    add_bullet("React Router DOM evaluates route guards, dynamically granting access to student, organizer, or admin dashboards.")
    add_bullet("Axios interceptors monitor HTTP response status codes; on 401 Unauthorized, an automatic silent token refresh is triggered without interrupting the user's workflow.")

    add_p("3.2.2 Event Dashboard & UI Components", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=12, space_after=8)
    add_bullet("Displays all active campus events in a dynamic grid layout featuring high-contrast typography and status badges.")
    add_bullet("Event cards present critical logistics: date, venue, current registration count, and real-time seat availability.")
    add_bullet("Interactive modal dialogs allow instant registration, displaying whether the user received a CONFIRMED seat or WAITLIST queue position.")
    add_bullet("Verified attendees access an integrated QR ticket pass view with embedded canvas rendering.")
    add_bullet("Instant certificate generation button unlocks upon attendance verification, allowing one-click PDF downloading.")

    doc.add_page_break()

    # ==========================================
    # PAGE 15: 3.2.3 State Logic & 3.3 Complete Data Flow (Steps 1-3)
    # ==========================================
    add_p("3.2.3 TanStack Query State Logic", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=10, space_after=8)
    add_bullet("Server State Caching:", "TanStack Query caches event listings and user profiles locally, preventing redundant network requests.")
    add_bullet("Optimistic UI Updates:", "When a student clicks 'Register', the UI immediately reflects the booked state before the network round-trip finishes, providing zero perceptual latency.")
    add_bullet("Automated Cache Invalidation:", "Upon successful ticket cancellation or registration, query keys ('events', 'registrations') are automatically invalidated, ensuring data is always fresh.")

    add_p("3.3 Complete Data Flow (End-to-End Sequence)", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=17, bold=True, space_before=14, space_after=10)
    add_p("1. User Opens Registration / Login Page", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_after=6)
    add_bullet("Frontend displays clean authentication interface.")
    add_bullet("No active session token is present; protected routes are locked.")

    add_p("2. User Authenticates with Credentials", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=8, space_after=6)
    add_bullet("Client sends POST /api/auth/login.")
    add_bullet("Express validates bcrypt hash and issues dual tokens.")
    add_subbullet("Access Token (JWT in-memory, 15m expiration)")
    add_subbullet("Refresh Token (HTTP-only cookie, 7d expiration)")
    add_bullet("Client state updates and redirects to main dashboard.")

    add_p("3. User Browses Event Feed", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=8, space_after=6)
    add_bullet("Frontend requests GET /api/events with category and search query parameters.")
    add_bullet("Backend queries PostgreSQL database via Prisma and returns active event listings.")

    doc.add_page_break()

    # ==========================================
    # PAGE 16: 3.3 Complete Data Flow (Steps 4-9)
    # ==========================================
    add_p("4. Student Clicks 'Register' on Event", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=10, space_after=6)
    add_bullet("Frontend dispatches POST /api/events/:id/register with bearer authorization header.")

    add_p("5. Backend Executes Atomic Capacity Transaction", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=8, space_after=6)
    add_bullet("prisma.$transaction locks event registration rows.")
    add_bullet("System counts existing CONFIRMED records against total venue capacity.")

    add_p("6. System Assigns Status & Issues QR Ticket", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=8, space_after=6)
    add_bullet("If seats remain: Creates record with status CONFIRMED and generates cryptographic QR payload.")
    add_bullet("If venue full: Creates record with status WAITLISTED and returns queue position.")
    add_bullet("Frontend updates UI instantly displaying confirmed pass or waitlist badge.")

    add_p("7. Cancellation Triggers Automatic FIFO Promotion", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=8, space_after=6)
    add_bullet("When an attendee clicks 'Cancel Registration', status transitions to CANCELLED.")
    add_bullet("Database transaction queries earliest WAITLISTED entry and promotes it to CONFIRMED.")

    add_p("8. Attendee Arrives at Venue & Scans QR Pass", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=8, space_after=6)
    add_bullet("Organizer uses camera scanner to read ticket QR code.")
    add_bullet("Scanner sends POST /api/tickets/verify with ticket hash.")

    add_p("9. Attendance Verified & Certificate Generated", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=8, space_after=6)
    add_bullet("Backend marks attended: true in database.")
    add_bullet("Student dashboard unlocks digital PDF certificate download.")

    doc.add_page_break()

    # ==========================================
    # PAGE 17: CHAPTER 4 – RESULTS & TESTING
    # ==========================================
    add_p("CHAPTER 4 – RESULTS & TESTING", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=17, bold=True, space_before=10, space_after=14)
    add_p("4.1 Output Screens", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_after=8)
    add_bullet("CampuScene Event Discovery & Dashboard UI Snapshot")
    add_bullet("Event Registration & Digital Certificate Modal Snapshot")
    add_bullet("Render Cloud Production Backend Deployment Snapshot")
    add_bullet("Vercel Edge Production Frontend Deployment Snapshot")

    add_p("4.2 Testing Parameters", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=17, bold=True, space_before=14, space_after=10)
    add_p("Functional Testing", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=True, space_after=6)
    add_bullet("User Authentication & Role Guarding (Admin, Organizer, Student)")
    add_bullet("Event Creation, Image Upload, and Gemini AI Description Generation")
    add_bullet("Instant Ticket RSVP, QR Generation, and Cancellation Workflows")
    add_bullet("Automated Waitlist FIFO Queue Promotion Logic")

    add_p("Load & Concurrency Testing", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=True, space_before=8, space_after=6)
    add_bullet("100+ concurrent simulated registration requests executed within 2-second burst window")
    add_bullet("Zero overselling: capacity strictly adhered to without negative seat counts")
    add_bullet("Sub-250ms average API response latency under sustained throughput on Render cloud")

    add_p("Security Testing", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=True, space_before=8, space_after=6)
    add_bullet("Cross-Site Scripting (XSS) prevention through HTML sanitization")
    add_bullet("SQL Injection immunity guaranteed via Prisma parameterized queries")
    add_bullet("Strict CORS origin whitelisting restricting unauthorized third-party requests")
    add_bullet("Cryptographic tamper protection on QR ticket payloads")

    doc.add_page_break()

    # ==========================================
    # PAGE 18: OUTPUT SCREENSHOTS
    # ==========================================
    add_p("Figure 4.1: CampuScene Event Dashboard & Discovery Feed", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=11, bold=True, space_before=4, space_after=4)
    dash_img = "/Users/kushdeepsethi/.gemini/antigravity/brain/9cd06f84-74fa-41e5-8b09-53f03468e569/.user_uploaded/media_1790445549995.png"
    if os.path.exists(dash_img):
        p_d = doc.add_paragraph()
        p_d.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_d.paragraph_format.space_after = Pt(8)
        p_d.add_run().add_picture(dash_img, width=Inches(5.6))

    add_p("Figure 4.2: Event Registration & Certificate Modal Interface", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=11, bold=True, space_before=4, space_after=4)
    modal_img = "/Users/kushdeepsethi/.gemini/antigravity/brain/9cd06f84-74fa-41e5-8b09-53f03468e569/.user_uploaded/media_1790445779536.png"
    if os.path.exists(modal_img):
        p_m = doc.add_paragraph()
        p_m.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_m.paragraph_format.space_after = Pt(8)
        p_m.add_run().add_picture(modal_img, width=Inches(5.6))

    doc.add_page_break()

    # ==========================================
    # PAGE 19: CHAPTER 5 – APPLICATIONS & FUTURE SCOPE
    # ==========================================
    add_p("CHAPTER 5 – APPLICATIONS & FUTURE SCOPE", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=17, bold=True, space_before=10, space_after=14)
    add_p("5.1 Applications", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_after=8)
    add_bullet("University Cultural & Technical Fests (Elements, Culmyca, Hackathons)")
    add_bullet("Departmental Seminars, Guest Lectures & Faculty Development Programs")
    add_bullet("College Societies and Student Club Management (CSI, IEEE, SAE, Dramatics)")
    add_bullet("Training & Placement (T&P) Drive Pre-Talks and Aptitude Test Registrations")
    add_bullet("Intramural Sports Tournaments and Annual Athletic Meets")
    add_bullet("Automated Verified Student Extracurricular Portfolios for NAAC/NBA Accreditation")

    add_p("5.2 Future Enhancements", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=14, space_after=8)
    add_bullet("Cross-Platform Native Mobile App (React Native / Flutter) for Android & iOS")
    add_bullet("Offline QR Scanner Support with local encrypted SQLite synchronization for zero-network venues")
    add_bullet("Blockchain-Anchored Verifiable Credentials (NFT / OpenBadges standard) for tamper-proof certificates")
    add_bullet("Single Sign-On (SSO) Integration with University ERP and Microsoft 365 student accounts")
    add_bullet("Automated Event Reminders via WhatsApp Business API and WebPush notifications")
    add_bullet("AI-Powered Personalized Event Recommendations based on student department and interest tags")

    doc.add_page_break()

    # ==========================================
    # PAGE 20: REFERENCES
    # ==========================================
    add_p("REFERENCES", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=10, space_after=12)
    add_bullet("Node.js v20 LTS Official Documentation — OpenJS Foundation")
    add_bullet("Express.js 5 Application Framework Reference Manual")
    add_bullet("React 19 Official Documentation & Concurrent Features — Meta Open Source")
    add_bullet("Prisma ORM Architecture and Type-Safe Schema Documentation")
    add_bullet("Google Gemini Generative AI SDK Documentation (@google/genai)")
    add_bullet("PostgreSQL 16 Relational Database Management System Standard")
    add_bullet("RFC 7519: JSON Web Token (JWT) Security and Architecture Specifications")
    add_bullet("Tailwind CSS Design Framework Specification and Utilities Guide")

    # Save documents
    out_root = "CampuScene_Final_Project_Report.docx"
    out_docs = "docs/report/CampuScene_Final_Project_Report.docx"
    os.makedirs("docs/report", exist_ok=True)
    doc.save(out_root)
    doc.save(out_docs)
    print(f"Successfully generated {out_root} and {out_docs}!")

if __name__ == "__main__":
    create_report()
