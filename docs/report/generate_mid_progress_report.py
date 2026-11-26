import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_LINE_SPACING
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import shutil, os

def create_mid_progress_report():
    doc = docx.Document()
    
    # 1. Page Setup: 1.0 inch margins all around
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)
        
        # Clear default header and footer
        for p in section.header.paragraphs:
            p.text = ""
        for p in section.footer.paragraphs:
            p.text = ""

    # Helper styling function
    def add_p(text="", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=False, italic=False, underline=False, space_before=0, space_after=4, line_spacing=1.15):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            r = p.add_run(text)
            r.font.name = "Times New Roman"
            r.font.size = Pt(size_pt)
            r.bold = bold
            r.italic = italic
            r.underline = underline
            r.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_bullet_item(title, description, space_before=4, space_after=4):
        # Paragraph for bullet heading
        p_title = doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_title.paragraph_format.left_indent = Inches(0.3)
        p_title.paragraph_format.space_before = Pt(space_before)
        p_title.paragraph_format.space_after = Pt(1)
        p_title.paragraph_format.line_spacing = 1.15
        
        r_bullet = p_title.add_run("●  ")
        r_bullet.font.name = "Times New Roman"
        r_bullet.font.size = Pt(11)
        r_bullet.font.color.rgb = RGBColor(0, 0, 0)
        
        r_text = p_title.add_run(title)
        r_text.font.name = "Times New Roman"
        r_text.font.size = Pt(11.5)
        r_text.bold = True
        r_text.font.color.rgb = RGBColor(0, 0, 0)
        
        # Paragraph for indented description
        p_desc = doc.add_paragraph()
        p_desc.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_desc.paragraph_format.left_indent = Inches(0.55)
        p_desc.paragraph_format.space_before = Pt(0)
        p_desc.paragraph_format.space_after = Pt(space_after)
        p_desc.paragraph_format.line_spacing = 1.15
        
        r_desc = p_desc.add_run(description)
        r_desc.font.name = "Times New Roman"
        r_desc.font.size = Pt(11)
        r_desc.font.color.rgb = RGBColor(0, 0, 0)
        return p_desc

    print("Building Mid Progress Report...")

    # ==========================================
    # PAGE 1: HEADER & COMPLETED TASKS
    # ==========================================
    add_p("J. C. BOSE UNIVERSITY OF SCIENCE & TECHNOLOGY,", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=14, bold=True, space_before=0, space_after=2)
    add_p("YMCA FARIDABAD", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=14, bold=True, space_before=0, space_after=4)
    add_p("DEPARTMENT OF COMPUTER ENGINEERING", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=13, bold=True, space_before=2, space_after=6)
    add_p("Progress Report for B.Tech. Capstone Project", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=12.5, bold=True, underline=True, space_before=2, space_after=3)
    add_p("Mid Progress Report (October 2025)", align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=12, bold=True, space_before=0, space_after=14)

    # Student / Project details
    details = [
        ("1.  Name of Student", ": Kushdeep Sethi"),
        ("2.  Name of Mentor", ": Dr. Parul Gupta"),
        ("3.  Roll No.", ": 23001003064"),
        ("4.  Name and Roll No of team member", ": Keshav Luthra (23001003058)"),
        ("5.  Title of Project", ": CampuScene: AI-Powered Campus Event Management & Student Engagement Platform")
    ]

    for label, val in details:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        
        r1 = p.add_run(f"{label:<36}")
        r1.font.name = "Times New Roman"
        r1.font.size = Pt(11.5)
        r1.font.color.rgb = RGBColor(0, 0, 0)
        
        r2 = p.add_run(val)
        r2.font.name = "Times New Roman"
        r2.font.size = Pt(11.5)
        r2.font.color.rgb = RGBColor(0, 0, 0)

    # Signature line
    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(16)
    p_sig.paragraph_format.space_after = Pt(16)
    r_date = p_sig.add_run("Date: ")
    r_date.font.name = "Times New Roman"
    r_date.font.size = Pt(12)
    r_date.bold = True
    r_date.font.color.rgb = RGBColor(0, 0, 0)
    
    r_space = p_sig.add_run(" " * 68)
    r_space.font.name = "Times New Roman"
    
    r_sign = p_sig.add_run("(Signature of Student)")
    r_sign.font.name = "Times New Roman"
    r_sign.font.size = Pt(12)
    r_sign.bold = True
    r_sign.font.color.rgb = RGBColor(0, 0, 0)

    # Section 1: Completed Tasks
    add_p("1. Completed Tasks", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=10, space_after=4)
    add_p("Backend (Fully Completed)", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=True, space_before=2, space_after=6)

    add_bullet_item("Database Architecture & Schema Designed", "Configured Prisma ORM with relational schema for Users, Events, Registrations, and Refresh Tokens on PostgreSQL (Neon Serverless).")
    add_bullet_item("Authentication & Role-Based Access Control (RBAC)", "Implemented dual-token JWT authentication (access & refresh tokens) with bcrypt hashing for Students, Society Organizers, and System Admins.")
    add_bullet_item("Event Management & Capacity Engine", "Built modular REST APIs for event CRUD, category filtering (Technical, Cultural, Sports, Workshops), live search, and capacity validation.")
    add_bullet_item("Atomic Concurrency & FIFO Waitlist System", "Implemented isolated database transactions (prisma.$transaction) ensuring race-condition-free reservations and automatic FIFO waitlist promotion upon ticket cancellations.")
    add_bullet_item("Cryptographic QR Ticket Generation", "Engineered automated cryptographic QR pass generation per attendee with secure verification endpoints for organizer check-ins.")
    add_bullet_item("Google Gemini 1.5 Flash AI Integration", "Integrated Google Gemini Generative AI SDK to automatically synthesize professional event descriptions, schedules, and promotional copy.")

    # Page Break to Page 2
    doc.add_page_break()

    # ==========================================
    # PAGE 2: REMAINING TASKS & MENTOR SIGNATURE
    # ==========================================
    add_p("2. Remaining Tasks", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=13, bold=True, space_before=0, space_after=4)
    add_p("Frontend (In Progress)", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=True, space_before=2, space_after=6)

    add_bullet_item("Refine Event Feed & Dashboard UI", "Polishing responsive event grid cards, live capacity badges, and mobile-first navigation layouts using React 19 and Tailwind CSS.")
    add_bullet_item("Interactive Registration & QR Modal", "Implementing one-click RSVP modal dialogs with real-time seat availability indicators and in-browser canvas QR pass rendering.")
    add_bullet_item("Digital Certificate Generation Engine", "Building automated canvas/PDF certificate rendering enabling verified attendees to download personalized participation certificates.")
    add_bullet_item("TanStack Query Cache Optimization", "Optimizing client-side server state synchronization, optimistic UI updates on registration, and automated cache invalidation.")

    add_p("Testing & Deployment (Pending)", align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=12, bold=True, space_before=10, space_after=6)

    add_bullet_item("Full End-to-End Functional Testing", "Validating multi-role user flows including student registrations, organizer QR scanning at venue doors, and administrative approvals.")
    add_bullet_item("Concurrency & Load Stress Testing", "Simulating 100+ concurrent flash-registration bursts to rigorously benchmark database locking and ensure zero seat overselling.")
    add_bullet_item("Production Cloud Deployment", "Deploying React frontend to Vercel (campuscene.in) and Node.js Express API to Render (api.campuscene.in) with custom GoDaddy DNS routing.")

    # Mentor Signature Block (Bottom Right aligned)
    # Add spacing to position mentor signature cleanly at the bottom right
    p_mentor = doc.add_paragraph()
    p_mentor.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_mentor.paragraph_format.space_before = Pt(120)
    p_mentor.paragraph_format.space_after = Pt(2)
    p_mentor.paragraph_format.line_spacing = 1.15
    
    r_m1 = p_mentor.add_run("Dr. Parul Gupta\n")
    r_m1.font.name = "Times New Roman"
    r_m1.font.size = Pt(12)
    r_m1.bold = True
    r_m1.font.color.rgb = RGBColor(0, 0, 0)

    r_m2 = p_mentor.add_run("Associate Professor\n")
    r_m2.font.name = "Times New Roman"
    r_m2.font.size = Pt(12)
    r_m2.bold = True
    r_m2.font.color.rgb = RGBColor(0, 0, 0)

    r_m3 = p_mentor.add_run("Dept of Computer Engineering")
    r_m3.font.name = "Times New Roman"
    r_m3.font.size = Pt(12)
    r_m3.bold = True
    r_m3.font.color.rgb = RGBColor(0, 0, 0)

    # Save documents
    out_root = "CampuScene_Mid_Progress_Report.docx"
    out_docs = "docs/report/CampuScene_Mid_Progress_Report.docx"
    os.makedirs("docs/report", exist_ok=True)
    doc.save(out_root)
    doc.save(out_docs)
    print(f"Successfully generated {out_root} and {out_docs}!")

if __name__ == "__main__":
    create_mid_progress_report()
