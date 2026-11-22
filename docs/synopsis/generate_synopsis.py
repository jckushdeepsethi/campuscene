import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="none"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_page_number_to_run(run):
    fldChar1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    instrText = parse_xml(r'<w:instrText %s xml:space="preserve"> PAGE </w:instrText>' % nsdecls('w'))
    fldChar2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    fldChar3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)

def create_synopsis():
    doc = Document()
    
    # Page setup: Standard A4 margins (1 inch / 72pt)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.27)  # A4
        section.page_height = Inches(11.69)
        section.different_first_page_header_footer = True

    # Base Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
    normal_style.paragraph_format.line_spacing = 1.25
    normal_style.paragraph_format.space_after = Pt(6)

    logo_path = "/Users/kushdeepsethi/Documents/Codex/2026-07-06/linkedin-build-in-public-strategy-this/docs/synopsis/page_1_img_0_Image28.jpg"

    # ==========================================
    # PAGE 1: TITLE / COVER PAGE
    # ==========================================
    p_a = doc.add_paragraph()
    p_a.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_a.paragraph_format.space_before = Pt(10)
    p_a.paragraph_format.space_after = Pt(4)
    run_a = p_a.add_run("A")
    run_a.font.name = "Times New Roman"
    run_a.font.size = Pt(15)

    p_syn = doc.add_paragraph()
    p_syn.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_syn.paragraph_format.space_after = Pt(4)
    run_syn = p_syn.add_run("Capstone Project Synopsis")
    run_syn.font.name = "Times New Roman"
    run_syn.font.size = Pt(20)
    run_syn.font.bold = True

    p_on = doc.add_paragraph()
    p_on.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_on.paragraph_format.space_after = Pt(8)
    run_on = p_on.add_run("On")
    run_on.font.name = "Times New Roman"
    run_on.font.size = Pt(15)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("CampuScene 🎯")
    run_title.font.name = "Times New Roman"
    run_title.font.size = Pt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A) # Deep navy

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(20)
    run_sub = p_sub.add_run("An AI-Powered Event Management, Society Engagement & Opportunity Platform\n(Live at: https://campuscene.in)")
    run_sub.font.name = "Times New Roman"
    run_sub.font.size = Pt(11.5)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    p_subm = doc.add_paragraph()
    p_subm.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_subm.paragraph_format.space_after = Pt(12)
    run_subm = p_subm.add_run("Submitted during VII semester in partial fulfilment of the requirements for the\naward of degree of")
    run_subm.font.name = "Times New Roman"
    run_subm.font.size = Pt(12)

    p_deg = doc.add_paragraph()
    p_deg.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_deg.paragraph_format.space_after = Pt(4)
    run_deg = p_deg.add_run("Bachelor of Technology")
    run_deg.font.name = "Times New Roman"
    run_deg.font.size = Pt(16)
    run_deg.font.bold = True

    p_in = doc.add_paragraph()
    p_in.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_in.paragraph_format.space_after = Pt(4)
    run_in = p_in.add_run("in")
    run_in.font.name = "Times New Roman"
    run_in.font.size = Pt(13)

    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_after = Pt(16)
    run_dept = p_dept.add_run("Computer Engineering")
    run_dept.font.name = "Times New Roman"
    run_dept.font.size = Pt(16)
    run_dept.font.bold = True

    p_by = doc.add_paragraph()
    p_by.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_by.paragraph_format.space_after = Pt(4)
    run_by = p_by.add_run("by")
    run_by.font.name = "Times New Roman"
    run_by.font.size = Pt(12)

    p_stud = doc.add_paragraph()
    p_stud.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_stud.paragraph_format.space_after = Pt(14)
    run_stud = p_stud.add_run("Kushdeep Sethi\n(Roll No: 23001003064)")
    run_stud.font.name = "Times New Roman"
    run_stud.font.size = Pt(14)
    run_stud.font.bold = True

    p_sup = doc.add_paragraph()
    p_sup.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sup.paragraph_format.space_after = Pt(4)
    run_sup = p_sup.add_run("Under supervision of")
    run_sup.font.name = "Times New Roman"
    run_sup.font.size = Pt(12)

    p_guide = doc.add_paragraph()
    p_guide.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_guide.paragraph_format.space_after = Pt(14)
    run_guide = p_guide.add_run("Dr. Rachna Gupta\n(Department of Computer Engineering)")
    run_guide.font.name = "Times New Roman"
    run_guide.font.size = Pt(14)
    run_guide.font.bold = True

    # University Logo
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_after = Pt(12)
        run_logo = p_logo.add_run()
        run_logo.add_picture(logo_path, width=Inches(1.25))

    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_after = Pt(2)
    run_inst = p_inst.add_run("Department of Computer Engineering\nFACULTY OF INFORMATICS & COMPUTING")
    run_inst.font.name = "Times New Roman"
    run_inst.font.size = Pt(13)
    run_inst.font.bold = True

    p_univ = doc.add_paragraph()
    p_univ.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_univ.paragraph_format.space_after = Pt(0)
    run_univ = p_univ.add_run("J.C. BOSE UNIVERSITY OF SCIENCE AND TECHNOLOGY, YMCA\nFARIDABAD, HARYANA (2026)")
    run_univ.font.name = "Times New Roman"
    run_univ.font.size = Pt(12)
    run_univ.font.bold = True
    run_univ.font.color.rgb = RGBColor(0x37, 0x41, 0x51)

    # Page break after Title
    doc.add_page_break()

    # Configure Header & Footer for subsequent pages
    content_section = doc.sections[0]
    header = content_section.header
    header_p = header.paragraphs[0]
    header_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    header_run = header_p.add_run("CampuScene: Capstone Project Synopsis | B.Tech Computer Engineering")
    header_run.font.name = "Times New Roman"
    header_run.font.size = Pt(9)
    header_run.font.italic = True
    header_run.font.color.rgb = RGBColor(0x9C, 0xA3, 0xAF)

    footer = content_section.footer
    footer_p = footer.paragraphs[0]
    footer_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    footer_left = footer_p.add_run("J.C. Bose UST, YMCA, Faridabad                                                                        Page ")
    footer_left.font.name = "Times New Roman"
    footer_left.font.size = Pt(9.5)
    footer_left.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)
    
    footer_page_run = footer_p.add_run()
    footer_page_run.font.name = "Times New Roman"
    footer_page_run.font.size = Pt(9.5)
    footer_page_run.font.bold = True
    add_page_number_to_run(footer_page_run)

    # ==========================================
    # PAGE 2: TABLE OF CONTENTS (INDEX)
    # ==========================================
    h_idx = doc.add_paragraph()
    h_idx.alignment = WD_ALIGN_PARAGRAPH.CENTER
    h_idx.paragraph_format.space_before = Pt(12)
    h_idx.paragraph_format.space_after = Pt(16)
    r_idx = h_idx.add_run("TABLE OF CONTENTS")
    r_idx.font.name = "Times New Roman"
    r_idx.font.size = Pt(16)
    r_idx.font.bold = True
    r_idx.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    # Table of Contents Grid
    toc_data = [
        ("Sr. No.", "Topic / Chapter Name", "Page No."),
        ("1", "Chapter 1: Introduction", "3"),
        ("1.1", "   1.1 Brief of the Project", "3"),
        ("1.2", "   1.2 Problem Statement & Motivation", "3"),
        ("1.3", "   1.3 Objectives of the Project", "4"),
        ("1.4", "   1.4 Technologies Used", "4"),
        ("", "       1.4.1 Frontend Technology Stack", "4"),
        ("", "       1.4.2 Backend Technology Stack", "5"),
        ("", "       1.4.3 Database, Cloud & DevOps Infrastructure", "5"),
        ("2", "Chapter 2: Proposed Methodology", "6"),
        ("2.1", "   2.1 System Architecture & Data Flow", "6"),
        ("2.2", "   2.2 Core Modules & Technical Implementation", "6"),
        ("", "       2.2.1 Multi-Role Authentication & Access Control (RBAC)", "6"),
        ("", "       2.2.2 Society Event Lifecycle & Admin Approval Pipeline", "7"),
        ("", "       2.2.3 Dynamic Waitlist Queue & Auto-Promotion Engine", "7"),
        ("", "       2.2.4 Gemini AI Event Marketing Kit & Interactive Chatbot", "7"),
        ("", "       2.2.5 Real-Time Attendance Verification & CSV Exports", "8"),
        ("", "       2.2.6 Automated Digital Certificate Issuance", "8"),
        ("2.3", "   2.3 Database Schema & Relational Modeling", "8"),
        ("3", "Chapter 3: Applications and Scope", "9"),
        ("3.1", "   3.1 Practical Applications in Campus Ecosystem", "9"),
        ("3.2", "   3.2 Current Scope of CampuScene", "9"),
        ("3.3", "   3.3 Future Enhancements & Scalability Roadmap", "10"),
        ("4", "References & Bibliography", "11"),
    ]

    toc_table = doc.add_table(rows=len(toc_data), cols=3)
    toc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(toc_table, color="D1D5DB", sz="4")

    col_widths = [Inches(1.0), Inches(4.3), Inches(1.1)]

    for row_idx, row in enumerate(toc_table.rows):
        sr, title, page = toc_data[row_idx]
        is_header = (row_idx == 0)
        is_chapter = sr in ["1", "2", "3", "4"]
        
        for col_idx, cell in enumerate(row.cells):
            cell.width = col_widths[col_idx]
            set_cell_margins(cell, top=80 if not is_header else 120, bottom=80 if not is_header else 120, left=100, right=100)
            
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            
            text_val = [sr, title, page][col_idx]
            run = p.add_run(text_val)
            run.font.name = "Times New Roman"
            
            if is_header:
                set_cell_background(cell, "1E3A8A")
                run.font.size = Pt(11)
                run.font.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx != 1 else WD_ALIGN_PARAGRAPH.LEFT
            else:
                if row_idx % 2 == 1:
                    set_cell_background(cell, "F9FAFB")
                else:
                    set_cell_background(cell, "FFFFFF")
                
                run.font.size = Pt(10.5) if not is_chapter else Pt(11)
                if is_chapter:
                    run.font.bold = True
                    run.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
                else:
                    run.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
                
                if col_idx == 0:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                elif col_idx == 2:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                else:
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.add_page_break()

    # Helper function for Chapter Headings
    def add_chapter_heading(number_str, title_str):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(8)
        run = p.add_run(f"Chapter {number_str}: {title_str}")
        run.font.name = "Times New Roman"
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
        return p

    def add_section_heading(sec_str, title_str):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(f"{sec_str} {title_str}")
        run.font.name = "Times New Roman"
        run.font.size = Pt(13.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
        return p

    def add_subsection_heading(subsec_str, title_str):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(f"{subsec_str} {title_str}")
        run.font.name = "Times New Roman"
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
        return p

    def add_body_p(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.2
        p.paragraph_format.space_after = Pt(6)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = "Times New Roman"
            r_pre.font.size = Pt(12)
            r_pre.font.bold = True
        r_text = p.add_run(text)
        r_text.font.name = "Times New Roman"
        r_text.font.size = Pt(12)
        return p

    def add_bullet_p(bold_title, description):
        p = doc.add_paragraph(style='List Bullet')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.2
        p.paragraph_format.space_after = Pt(4)
        r_b = p.add_run(bold_title)
        r_b.font.name = "Times New Roman"
        r_b.font.size = Pt(12)
        r_b.font.bold = True
        r_d = p.add_run(f": {description}")
        r_d.font.name = "Times New Roman"
        r_d.font.size = Pt(12)
        return p

    # ==========================================
    # CHAPTER 1: INTRODUCTION
    # ==========================================
    add_chapter_heading("1", "Introduction")

    add_section_heading("1.1", "Brief of the Project")
    add_body_p(
        "CampuScene is a centralized, AI-powered campus event management, student engagement, and placement opportunity ecosystem. Designed and developed from the ground up for university campuses, the platform solves the fragmentation of college life where extracurricular activities, society hackathons, cultural workshops, placement drives, and official notices are scattered across unorganized WhatsApp groups, paper posters, Instagram stories, and disparate Google Forms."
    )
    add_body_p(
        "Built on a production-grade decoupled architecture, CampuScene integrates a high-performance React 19 (TypeScript) frontend powered by Vite with an enterprise Express 5 REST API, PostgreSQL database managed via Prisma ORM, and Google's Gemini 1.5 Flash Large Language Model. The platform delivers real-time role-based access control (RBAC) across four administrative tiers: Students, Campus Societies, Placement Cells, and University Administrators."
    )
    add_body_p(
        "CampuScene automates the entire campus event lifecycle — from event ideation with AI assistance, administrative audit and verification, real-time seat reservation with automated waitlist promotion, QR-code based live attendance tracking, to instant issuance of cryptographically verifiable digital certificates and analytical reporting."
    )

    add_section_heading("1.2", "Problem Statement & Motivation")
    add_body_p(
        "Modern university campuses host dozens of vibrant technical, cultural, literary, and sports societies alongside active placement cells. Despite this vibrant environment, colleges face persistent administrative and engagement bottlenecks:"
    )
    add_bullet_p(
        "Information Silos & Cluttered Channels",
        "Event updates are routinely buried in spam-heavy unofficial messaging groups, causing students to miss registration deadlines and placement opportunities."
    )
    add_bullet_p(
        "Unverified Organizers & Schedule Conflicts",
        "Without an administrative approval tier, overlapping events compete for the same university auditorium or student audience on the same dates."
    )
    add_bullet_p(
        "Inefficient Manual Registrations & Capacity Overflow",
        "Google Forms lack real-time capacity clamping, resulting in overbooked venues, fire hazards, or high no-show rates with no automated waitlist queue."
    )
    add_bullet_p(
        "Manual Attendance & Fraudulent Certificates",
        "Paper sign-in sheets lead to proxy sign-ins, and manual certificate distribution takes weeks and is prone to forgery."
    )
    add_bullet_p(
        "Organizer Fatigue in Content Creation",
        "Society leads spend excessive time drafting promotional emails, social media announcements, FAQs, and moderation guidelines rather than focusing on event quality."
    )

    add_section_heading("1.3", "Objectives of the Project")
    add_body_p("The primary technical and operational objectives of CampuScene include:")
    add_bullet_p(
        "Unified Campus Portal",
        "Provide a single responsive web destination (https://campuscene.in) unifying all academic and extracurricular events."
    )
    add_bullet_p(
        "Multi-Tiered Role-Based Access Control",
        "Enforce strict cryptographic authorization separating Student participants, Society event creators, Placement coordinators, and University Admins."
    )
    add_bullet_p(
        "Guaranteed Capacity & FIFO Waitlist Auto-Promotion",
        "Implement ACID-compliant database transactions ensuring strict seating capacity limits and instantaneous first-in, first-out (FIFO) promotion when cancellations occur."
    )
    add_bullet_p(
        "GenAI Event Copilot",
        "Leverage Google Gemini 1.5 Flash to automatically generate rich event descriptions, bulleted agendas, FAQs, and social media kits from simple bullet points."
    )
    add_bullet_p(
        "Context-Aware Hallucination-Free Chatbot",
        "Provide a dedicated per-event AI assistant answering attendee queries strictly based on verified organizer details."
    )
    add_bullet_p(
        "Instant Verifiable Digital Certificates",
        "Generate tamper-proof digital certificates with unique verification IDs and print-ready modal layouts for verified attendees."
    )
    add_bullet_p(
        "Live Institutional Analytics",
        "Equip university leadership with real-time dashboards detailing student participation, attendance conversion rates, and society activity metrics."
    )

    add_section_heading("1.4", "Technologies Used")
    add_body_p(
        "CampuScene utilizes a modern, resilient technology stack adhering to industry standards for high concurrency, security, and responsive user experience."
    )

    add_subsection_heading("1.4.1", "Frontend Stack")
    
    fe_tech_data = [
        ("Technology", "Purpose & Architectural Role"),
        ("React 19 (TypeScript)", "Component-driven single page application (SPA) architecture with strict static typing."),
        ("Vite 7", "Next-generation ESM development bundler providing sub-second Hot Module Replacement (HMR)."),
        ("Tailwind CSS 3.4", "Utility-first responsive styling framework for consistent, modern campus UI themes."),
        ("Framer Motion 12", "Production motion library for layout transitions, modals, and fluid progress indicators."),
        ("Lucide React", "Lightweight, accessible tree-shakeable SVG icon system across all navigation tiers."),
        ("TanStack React Query 5", "Asynchronous server-state management, cache invalidation, and optimistic UI updates."),
        ("React Hook Form & Zod", "High-performance un-rendered form state controller with runtime TypeScript schema validation."),
        ("Axios Client Interceptors", "Promise HTTP client handling automatic JWT refresh rotation upon 401 Unauthorized responses."),
        ("HTML5 Canvas & QR Reader", "Digital certificate rendering, print-ready document export, and QR ticket scanning.")
    ]

    t_fe = doc.add_table(rows=len(fe_tech_data), cols=2)
    t_fe.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_fe, color="D1D5DB", sz="4")
    col_w_fe = [Inches(2.0), Inches(4.4)]
    for r_i, r in enumerate(t_fe.rows):
        is_h = (r_i == 0)
        for c_i, c in enumerate(r.cells):
            c.width = col_w_fe[c_i]
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(fe_tech_data[r_i][c_i])
            run.font.name = "Times New Roman"
            if is_h:
                set_cell_background(c, "1E3A8A")
                run.font.size = Pt(11)
                run.font.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            else:
                set_cell_background(c, "F9FAFB" if r_i % 2 == 1 else "FFFFFF")
                run.font.size = Pt(10)
                if c_i == 0:
                    run.font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_subsection_heading("1.4.2", "Backend Stack")
    
    be_tech_data = [
        ("Technology", "Purpose & Architectural Role"),
        ("Node.js (v20 LTS)", "High-throughput asynchronous non-blocking event-driven JavaScript runtime engine."),
        ("Express 5 Framework", "RESTful routing pipeline, middleware chaining, and HTTP request lifecycles."),
        ("TypeScript 5.8", "Full static typing across services, repositories, controllers, and domain models."),
        ("Prisma ORM 6", "Type-safe database abstraction, automated schema migrations, and connection management."),
        ("Google Generative AI SDK", "Native Gemini 1.5 Flash integration for AI generation, JSON structuring, and chatbots."),
        ("JWT (jsonwebtoken)", "Stateless authentication via Bearer Access Tokens (15-minute expiration)."),
        ("bcrypt (12 Salt Rounds)", "One-way cryptographic hashing for secure student and administrator password storage."),
        ("Nodemailer", "SMTP email delivery service rendering responsive HTML account verification and password reset templates."),
        ("Zod & OpenAPI 3.0", "Strict input validation and automated interactive Swagger UI explorer mounted at /api/v1/docs.")
    ]

    t_be = doc.add_table(rows=len(be_tech_data), cols=2)
    t_be.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_be, color="D1D5DB", sz="4")
    for r_i, r in enumerate(t_be.rows):
        is_h = (r_i == 0)
        for c_i, c in enumerate(r.cells):
            c.width = col_w_fe[c_i]
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(be_tech_data[r_i][c_i])
            run.font.name = "Times New Roman"
            if is_h:
                set_cell_background(c, "1E3A8A")
                run.font.size = Pt(11)
                run.font.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            else:
                set_cell_background(c, "F9FAFB" if r_i % 2 == 1 else "FFFFFF")
                run.font.size = Pt(10)
                if c_i == 0:
                    run.font.bold = True

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_subsection_heading("1.4.3", "Database, Cloud & DevOps Infrastructure")
    
    infra_data = [
        ("Platform / Component", "Role & Configuration"),
        ("PostgreSQL 16 (Neon Cloud)", "Serverless cloud PostgreSQL with connection pooling (AWS ap-southeast-1 region)."),
        ("Vercel Edge Network", "Global CDN edge hosting for React frontend connected to custom apex domain campuscene.in."),
        ("Render Cloud Platform", "Managed Linux Web Service running backend API connected to subdomain api.campuscene.in."),
        ("GoDaddy DNS Engine", "Authoritative DNS routing: A Record (@ -> 216.198.79.1) and CNAMEs for www and api."),
        ("Docker & Docker Compose", "Multi-stage production containerization bundling Node.js 20 Alpine and Nginx Alpine."),
        ("Vitest & Node:Test Runner", "Automated test suite encompassing 50 tests (41 backend integration tests + 9 frontend tests).")
    ]

    t_inf = doc.add_table(rows=len(infra_data), cols=2)
    t_inf.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_inf, color="D1D5DB", sz="4")
    for r_i, r in enumerate(t_inf.rows):
        is_h = (r_i == 0)
        for c_i, c in enumerate(r.cells):
            c.width = col_w_fe[c_i]
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(infra_data[r_i][c_i])
            run.font.name = "Times New Roman"
            if is_h:
                set_cell_background(c, "1E3A8A")
                run.font.size = Pt(11)
                run.font.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            else:
                set_cell_background(c, "F9FAFB" if r_i % 2 == 1 else "FFFFFF")
                run.font.size = Pt(10)
                if c_i == 0:
                    run.font.bold = True

    doc.add_page_break()

    # ==========================================
    # CHAPTER 2: PROPOSED METHODOLOGY
    # ==========================================
    add_chapter_heading("2", "Proposed Methodology")

    add_section_heading("2.1", "System Architecture & High-Level Workflow")
    add_body_p(
        "CampuScene is architected following the clean Separation of Concerns (SoC) and Model-View-Controller (MVC) principles, augmented by dedicated Repository and Service abstraction layers. This architectural separation ensures that presentation, business logic, authorization rules, and persistent storage interact through strictly typed interfaces."
    )
    add_body_p(
        "The complete operational workflow is structured into five cohesive phases:"
    )
    add_bullet_p(
        "Phase 1: Identity & Role Verification",
        "Students register with institutional credentials and activate their accounts via secure, time-bounded email tokens. Society and placement credentials are authenticated against master administrative authorization keys."
    )
    add_bullet_p(
        "Phase 2: Event Inception & AI Packaging",
        "Organizers provide raw bullet points; the built-in Gemini AI Copilot converts them into structured JSON packages detailing title, tags, eligibility, learning outcomes, and schedule."
    )
    add_bullet_p(
        "Phase 3: Administrative Moderation",
        "Submitted events enter a PENDING_APPROVAL queue. University administrators review descriptions, verify hall availability, and either publish or reject the event with feedback."
    )
    add_bullet_p(
        "Phase 4: Concurrency-Controlled Registration & Waitlisting",
        "Students register with a single click. Registrations up to maximum capacity are marked REGISTERED. Subsequent registrations are automatically queued as WAITLISTED. If a student cancels, the earliest waitlisted participant is atomically promoted to REGISTERED."
    )
    add_bullet_p(
        "Phase 5: Check-in, Certification & Analytics",
        "Organizers scan student QR tickets or update attendance status. Verified attendees instantly unlock verified digital certificates, and attendance data updates institutional analytics charts."
    )

    add_section_heading("2.2", "Core Modules & Technical Implementation")

    add_subsection_heading("2.2.1", "Multi-Role Authentication & Access Control (RBAC)")
    add_body_p(
        "Security is implemented using a dual-token authentication mechanism: a short-lived stateless JWT access token (15-minute TTL) stored in client memory and passed via the Authorization: Bearer header, paired with a high-entropy cryptographically hashed refresh token stored in an HttpOnly, Secure, SameSite cross-origin cookie (30-day TTL). Role authorization middleware intercept every request, enforcing least-privilege access across STUDENT, SOCIETY, PLACEMENT_CELL, and ADMIN roles."
    )

    add_subsection_heading("2.2.2", "Society Event Lifecycle & Admin Approval Pipeline")
    add_body_p(
        "To prevent duplicate, low-quality, or unauthorized events from appearing on campus, all events drafted by student societies default to the PENDING_APPROVAL status. Only institutional administrators have authorization to transition status to PUBLISHED or REJECTED. Students only view published events on their discovery feed, safeguarding the integrity of campus notices."
    )

    add_subsection_heading("2.2.3", "Dynamic Waitlist Queue & Auto-Promotion Engine")
    add_body_p(
        "Handling high-demand hackathons and guest lectures requires strict concurrency control. When a student registers for an event whose active registered count has reached maxCapacity, the system assigns a WAITLISTED status with an indexed createdAt timestamp. Upon registration cancellation by any student, an automated database transaction executes:"
    )
    add_body_p(
        "1. Marks the cancelling participant's record as CANCELLED.\n2. Queries the earliest waitlisted student for that event (ordered by createdAt ASC).\n3. Atomically promotes that student's status to REGISTERED, notifying them immediately.",
        bold_prefix="Promotion Algorithm: "
    )

    add_subsection_heading("2.2.4", "Gemini AI Event Marketing Kit & Interactive Chatbot")
    add_body_p(
        "CampuScene integrates Google's Gemini 1.5 Flash model through structured prompt engineering with guaranteed JSON schema parsing. Organizers can trigger one-click generation of:"
    )
    add_bullet_p("Structured Overview", "Generates highlights, prerequisites, required materials, and learning outcomes.")
    add_bullet_p("Social Media & Poster Marketing Kit", "Generates punchy poster headlines, 8-word taglines, Instagram captions with emojis, LinkedIn copy, and relevant hashtags (#CampuScene, #TechFest).")
    add_bullet_p("Context-Bounded AI Chatbot", "Each event page features an interactive AI assistant. The system injects verified organizer data as context and instructs the model: 'Use ONLY the provided event details. If information is absent, state that details are not specified.' This completely prevents AI hallucinations.")

    add_subsection_heading("2.2.5", "Real-Time Attendance Verification & CSV Exports")
    add_body_p(
        "Organizers track live attendance using real-time status toggles (ATTENDED, ABSENT, NO_SHOW) recording precise check-in timestamps. Organizers can download an instantaneous, RFC 4180-compliant Attendee CSV Export containing attendee full names, roll numbers, branches, registration statuses, and check-in times for official college records."
    )

    add_subsection_heading("2.2.6", "Automated Digital Certificate Issuance")
    add_body_p(
        "Upon event conclusion, attendees marked with ATTENDED status receive a verifiable digital certificate rendered dynamically via an HTML5 vector canvas modal. Each certificate embeds a unique verification identifier, event title, organizer seal, issue timestamp, and student name, complete with a print/PDF export function."
    )

    add_section_heading("2.3", "Database Schema & Relational Modeling")
    add_body_p(
        "The relational database schema is modeled in Prisma ORM with strict referential integrity, cascading rules, and foreign key constraints across four primary entities:"
    )
    add_bullet_p("User Entity", "Stores user profiles, roles, encrypted passwords, verification status, student branch, and passing year.")
    add_bullet_p("RefreshToken Entity", "Maintains hashed tokens, revocation flags, expiration timestamps, and device user-agent audit trails.")
    add_bullet_p("Event Entity", "Stores titles, descriptions, venue, start/end dates, maxCapacity, status enum, organizer foreign key, and AI metadata.")
    add_bullet_p("Registration Entity", "Links User and Event models under a unique compound index [userId, eventId] to prevent duplicate bookings, tracking status and check-in timestamps.")

    doc.add_page_break()

    # ==========================================
    # CHAPTER 3: APPLICATIONS AND SCOPE
    # ==========================================
    add_chapter_heading("3", "Applications and Scope")

    add_section_heading("3.1", "Practical Applications in Campus Ecosystem")
    add_body_p(
        "CampuScene directly impacts diverse stakeholders across the university campus:"
    )
    add_bullet_p(
        "Student Body",
        "Provides a frictionless, unified hub to discover hackathons, technical workshops, sports tournaments, and placement recruitment drives, eliminating FOMO (Fear Of Missing Out) and missed application deadlines."
    )
    add_bullet_p(
        "Student Societies & Clubs",
        "Streamlines event creation with AI-drafted promotional materials, removes ticketing headaches with automated waitlists, and provides instant attendee CSV exports."
    )
    add_bullet_p(
        "Training & Placement Cell (T&P)",
        "Enables placement officers to post company pre-placement talks (PPTs), coding tests, and campus drive schedules with branch-specific eligibility filters."
    )
    add_bullet_p(
        "University Administration & Faculty",
        "Empowers deans and heads of departments with oversight over campus venue utilization, approving event proposals, preventing scheduling overlaps, and viewing institutional participation analytics."
    )

    add_section_heading("3.2", "Current Scope of CampuScene")
    add_body_p(
        "The currently implemented, tested, and live deployment of CampuScene includes:"
    )
    add_bullet_p("End-to-End Responsive Web Application", "Production deployment live at https://campuscene.in with mobile and desktop responsive layouts.")
    add_bullet_p("Containerized Microservice API", "Express 5 REST API running on Render at https://api.campuscene.in with OpenAPI 3.0 documentation.")
    add_bullet_p("Four-Tier Role-Based Security", "Full separation between Student, Society, Placement Cell, and Admin users with JWT rotation.")
    add_bullet_p("Complete Event Lifecycle Management", "Drafting, admin moderation, publishing, live search filtering, and cancellation.")
    add_bullet_p("Deterministic FIFO Waitlist Promotion", "ACID-safe automatic attendee promotion upon reservation cancellation.")
    add_bullet_p("Generative AI Suite", "Description generators, FAQ builders, social marketing kits, and hallucination-free chatbot.")
    add_bullet_p("Real-Time Analytics & CSV Export", "Attendance rate calculation, status distribution charts, and organizer attendee CSV downloads.")
    add_bullet_p("Automated Verification Suite", "50 automated unit, integration, and E2E tests ensuring zero regressions.")

    add_section_heading("3.3", "Future Enhancements & Scalability Roadmap")
    add_body_p(
        "Future milestones planned for subsequent versions of CampuScene include:"
    )
    add_bullet_p(
        "Native Android & iOS Mobile Applications",
        "Developing cross-platform React Native / Flutter apps with real-time push notifications for registration status and waitlist promotion alerts."
    )
    add_bullet_p(
        "Physical QR Code Hardware Scanners",
        "Equipping student volunteers at auditorium entry gates with native offline-capable mobile camera QR scanners for ultra-fast check-in."
    )
    add_bullet_p(
        "Blockchain-Anchored Certificate Verification",
        "Anchoring digital certificate hashes onto decentralized ledgers (Polygon / Ethereum) to enable public instant tamper-proof verification by external recruiters."
    )
    add_bullet_p(
        "Institutional Single Sign-On (SSO)",
        "Integrating Google Workspace for Education and Microsoft 365 SAML/OAuth SSO for one-click student login using official university email accounts."
    )
    add_bullet_p(
        "Automated University Hall Booking System",
        "Connecting event requests directly to an interactive auditorium and seminar room timetable calendar to completely eliminate venue collision conflicts."
    )

    doc.add_page_break()

    # ==========================================
    # REFERENCES & BIBLIOGRAPHY
    # ==========================================
    p_ref = doc.add_paragraph()
    p_ref.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ref.paragraph_format.space_before = Pt(14)
    p_ref.paragraph_format.space_after = Pt(16)
    r_ref = p_ref.add_run("References & Bibliography")
    r_ref.font.name = "Times New Roman"
    r_ref.font.size = Pt(16)
    r_ref.font.bold = True
    r_ref.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    references = [
        "[1] Fielding, R. T., & Taylor, R. N. (2002). Principled design of the modern Web architecture. ACM Transactions on Internet Technology (TOIT), 2(2), 115-150.",
        "[2] Rescorla, E. (2018). The Transport Layer Security (TLS) Protocol Version 1.3. RFC 8446, Internet Engineering Task Force (IETF).",
        "[3] Jones, M., Bradley, J., & Sakimura, N. (2015). JSON Web Token (JWT). RFC 7519, Internet Engineering Task Force (IETF).",
        "[4] Google DeepMind. (2024). Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context. arXiv preprint arXiv:2403.05530.",
        "[5] Prisma Development Team. (2025). Prisma: Next-generation ORM for Node.js & TypeScript. Official Documentation, https://www.prisma.io/docs.",
        "[6] React Core Team. (2025). React 19: The library for web and native user interfaces. Official Documentation, https://react.dev.",
        "[7] Shafranovich, Y. (2005). Common Format and MIME Type for Comma-Separated Values (CSV) Files. RFC 4180, Network Working Group.",
        "[8] OpenID Foundation. (2023). Role-Based Access Control and Modern Token Rotation Strategies in Web Architecture."
    ]

    for ref in references:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.2
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(ref)
        r.font.name = "Times New Roman"
        r.font.size = Pt(11)
        r.font.color.rgb = RGBColor(0x37, 0x41, 0x51)

    # Save document
    out_file = "/Users/kushdeepsethi/Documents/Codex/2026-07-06/linkedin-build-in-public-strategy-this/docs/synopsis/CampuScene_Project_Synopsis.docx"
    doc.save(out_file)
    print("Successfully generated synopsis at:", out_file)

if __name__ == "__main__":
    create_synopsis()
