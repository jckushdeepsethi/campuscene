import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

BLACK = RGBColor(0, 0, 0)

def set_official_table_borders(table):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>'
        f'  <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>'
        f'  <w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>'
        f'  <w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>'
        f'  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        f'  <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def set_cell_padding(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_justified_paragraph(doc, text="", space_before=0, space_after=6, line_spacing=1.15):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.line_spacing = line_spacing
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    
    pPr = p._p.get_or_add_pPr()
    for existing_jc in pPr.findall(qn('w:jc')):
        pPr.remove(existing_jc)
    jc = parse_xml(r'<w:jc %s w:val="both"/>' % nsdecls('w'))
    pPr.append(jc)
    
    if text:
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)
        r.font.color.rgb = BLACK
    return p

def add_bullet_point(doc, bold_prefix, text, space_after=4):
    p = doc.add_paragraph(style='List Bullet')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    
    pPr = p._p.get_or_add_pPr()
    for existing_jc in pPr.findall(qn('w:jc')):
        pPr.remove(existing_jc)
    jc = parse_xml(r'<w:jc %s w:val="both"/>' % nsdecls('w'))
    pPr.append(jc)
    
    if bold_prefix:
        r_b = p.add_run(bold_prefix)
        r_b.font.name = "Times New Roman"
        r_b.font.size = Pt(12)
        r_b.font.bold = True
        r_b.font.color.rgb = BLACK
        
        r_sep = p.add_run(": ")
        r_sep.font.name = "Times New Roman"
        r_sep.font.size = Pt(12)
        r_sep.font.bold = True
        r_sep.font.color.rgb = BLACK
        
    r_t = p.add_run(text)
    r_t.font.name = "Times New Roman"
    r_t.font.size = Pt(12)
    r_t.font.color.rgb = BLACK
    return p

def generate_official_synopsis():
    doc = Document()
    
    # Page Setup: Standard A4 margins (1 inch all around)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.different_first_page_header_footer = False

        # Configure Header: Page Number shifted to TOP RIGHT of the page/table
        header = section.header
        h_p = header.paragraphs[0]
        h_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        h_p.paragraph_format.space_after = Pt(0)
        h_p.paragraph_format.space_before = Pt(0)
        
        fld = parse_xml(
            r'<w:fldSimple %s w:instr="PAGE">'
            r'  <w:r>'
            r'    <w:rPr>'
            r'      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
            r'      <w:sz w:val="22"/>'
            r'      <w:color w:val="000000"/>'
            r'    </w:rPr>'
            r'    <w:t>1</w:t>'
            r'  </w:r>'
            r'</w:fldSimple>' % nsdecls('w')
        )
        h_p._p.append(fld)

        # Clear Footer (since page number is moved up right)
        footer = section.footer
        for p in footer.paragraphs:
            p.text = ""

    # Document Styles - Enforce Times New Roman globally
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = BLACK
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(6)
    
    rPr = normal_style._element.get_or_add_rPr()
    rFonts = parse_xml(r'<w:rFonts %s w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>' % nsdecls('w'))
    rPr.append(rFonts)

    logo_path = "/Users/kushdeepsethi/Documents/Codex/2026-07-06/linkedin-build-in-public-strategy-this/docs/synopsis/page_1_img_0_Image28.jpg"

    # ==========================================
    # PAGE 1: TITLE PAGE (Exact Match to Reference PDF)
    # ==========================================
    p_a = doc.add_paragraph()
    p_a.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_a.paragraph_format.space_before = Pt(12)
    p_a.paragraph_format.space_after = Pt(4)
    r_a = p_a.add_run("A")
    r_a.font.name = "Times New Roman"
    r_a.font.size = Pt(14)
    r_a.font.color.rgb = BLACK

    p_syn = doc.add_paragraph()
    p_syn.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_syn.paragraph_format.space_after = Pt(4)
    r_syn = p_syn.add_run("Capstone Project Synopsis")
    r_syn.font.name = "Times New Roman"
    r_syn.font.size = Pt(18)
    r_syn.font.bold = True
    r_syn.font.color.rgb = BLACK

    p_on = doc.add_paragraph()
    p_on.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_on.paragraph_format.space_after = Pt(10)
    r_on = p_on.add_run("On")
    r_on.font.name = "Times New Roman"
    r_on.font.size = Pt(14)
    r_on.font.color.rgb = BLACK

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(18)
    r_title = p_title.add_run("CampuScene")
    r_title.font.name = "Times New Roman"
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = BLACK

    p_subm = doc.add_paragraph()
    p_subm.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_subm.paragraph_format.space_after = Pt(12)
    r_subm = p_subm.add_run("Submitted during VII semester in partial fulfilment of the requirements for the\naward of degree of")
    r_subm.font.name = "Times New Roman"
    r_subm.font.size = Pt(12)
    r_subm.font.color.rgb = BLACK

    p_deg = doc.add_paragraph()
    p_deg.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_deg.paragraph_format.space_after = Pt(4)
    r_deg = p_deg.add_run("Bachelor of Technology")
    r_deg.font.name = "Times New Roman"
    r_deg.font.size = Pt(16)
    r_deg.font.bold = True
    r_deg.font.color.rgb = BLACK

    p_in = doc.add_paragraph()
    p_in.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_in.paragraph_format.space_after = Pt(4)
    r_in = p_in.add_run("in")
    r_in.font.name = "Times New Roman"
    r_in.font.size = Pt(12)
    r_in.font.color.rgb = BLACK

    p_branch = doc.add_paragraph()
    p_branch.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_branch.paragraph_format.space_after = Pt(16)
    r_branch = p_branch.add_run("Computer Engineering")
    r_branch.font.name = "Times New Roman"
    r_branch.font.size = Pt(16)
    r_branch.font.bold = True
    r_branch.font.color.rgb = BLACK

    p_by = doc.add_paragraph()
    p_by.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_by.paragraph_format.space_after = Pt(4)
    r_by = p_by.add_run("by")
    r_by.font.name = "Times New Roman"
    r_by.font.size = Pt(12)
    r_by.font.color.rgb = BLACK

    p_stud = doc.add_paragraph()
    p_stud.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_stud.paragraph_format.space_after = Pt(14)
    r_stud1 = p_stud.add_run("Kushdeep Sethi\n")
    r_stud1.font.name = "Times New Roman"
    r_stud1.font.size = Pt(14)
    r_stud1.font.bold = True
    r_stud1.font.color.rgb = BLACK
    r_stud2 = p_stud.add_run("(23001003064)")
    r_stud2.font.name = "Times New Roman"
    r_stud2.font.size = Pt(12)
    r_stud2.font.bold = True
    r_stud2.font.color.rgb = BLACK

    p_sup = doc.add_paragraph()
    p_sup.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sup.paragraph_format.space_after = Pt(4)
    r_sup = p_sup.add_run("Under supervision of")
    r_sup.font.name = "Times New Roman"
    r_sup.font.size = Pt(12)
    r_sup.font.color.rgb = BLACK

    p_guide = doc.add_paragraph()
    p_guide.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_guide.paragraph_format.space_after = Pt(14)
    r_guide = p_guide.add_run("Rachna Gupta")
    r_guide.font.name = "Times New Roman"
    r_guide.font.size = Pt(14)
    r_guide.font.bold = True
    r_guide.font.color.rgb = BLACK

    # YMCA Logo
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_after = Pt(12)
        r_logo = p_logo.add_run()
        r_logo.add_picture(logo_path, width=Inches(1.25))

    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_after = Pt(2)
    r_dept = p_dept.add_run("Department of Computer Engineering")
    r_dept.font.name = "Times New Roman"
    r_dept.font.size = Pt(13)
    r_dept.font.bold = True
    r_dept.font.color.rgb = BLACK

    p_fac = doc.add_paragraph()
    p_fac.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_fac.paragraph_format.space_after = Pt(0)
    r_fac = p_fac.add_run("FACULTY OF INFORMATICS & COMPUTING")
    r_fac.font.name = "Times New Roman"
    r_fac.font.size = Pt(13)
    r_fac.font.bold = True
    r_fac.font.color.rgb = BLACK

    doc.add_page_break()

    # ==========================================
    # PAGE 2: INDEX / TABLE OF CONTENTS
    # ==========================================
    p_idx_h = doc.add_paragraph()
    p_idx_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_idx_h.paragraph_format.space_before = Pt(8)
    p_idx_h.paragraph_format.space_after = Pt(16)
    r_idx_h = p_idx_h.add_run("INDEX")
    r_idx_h.font.name = "Times New Roman"
    r_idx_h.font.size = Pt(16)
    r_idx_h.font.bold = True
    r_idx_h.font.color.rgb = BLACK

    toc_entries = [
        ("S.No.", "Title", "Page No."),
        ("1", "Chapter 1: Introduction", "3"),
        ("1.1", "1.1 Brief of the Project", "3"),
        ("1.2", "1.2 Problem Statement & Motivation", "3"),
        ("1.3", "1.3 Objectives of the Project", "4"),
        ("1.4", "1.4 Technologies Used", "4"),
        ("", "       Frontend Stack", "4"),
        ("", "       Backend Stack", "5"),
        ("", "       Database & Cloud Infrastructure", "5"),
        ("2", "Chapter 2: Proposed Methodology", "6"),
        ("2.1", "2.1 System Architecture & Data Flow", "6"),
        ("2.2", "2.2 Core Modules & Implementation", "6"),
        ("2.3", "2.3 Database Schema & Relational Modeling", "7"),
        ("3", "Chapter 3: Applications and scope", "7"),
        ("3.1", "3.1 Practical Applications in Campus Ecosystem", "7"),
        ("3.2", "3.2 Scope of CampuScene", "7"),
        ("3.3", "3.3 Future Enhancements", "8"),
        ("4", "References & Bibliography", "8")
    ]

    t_toc = doc.add_table(rows=len(toc_entries), cols=3)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_official_table_borders(t_toc)
    col_w_toc = [Inches(1.0), Inches(4.3), Inches(1.1)]

    for r_i, r in enumerate(t_toc.rows):
        is_h = (r_i == 0)
        sno, title, pg = toc_entries[r_i]
        for c_i, c in enumerate(r.cells):
            c.width = col_w_toc[c_i]
            set_cell_padding(c, top=80, bottom=80, left=100, right=100)
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            
            run = p.add_run([sno, title, pg][c_i])
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)
            run.font.color.rgb = BLACK
            
            if is_h:
                run.font.bold = True
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_i != 1 else WD_ALIGN_PARAGRAPH.LEFT
            else:
                if sno in ["1", "2", "3", "4"]:
                    run.font.bold = True
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_i != 1 else WD_ALIGN_PARAGRAPH.LEFT

    doc.add_page_break()

    # ==========================================
    # PAGE 3: CHAPTER 1 (Brief + Problem Statement)
    # ==========================================
    p_c1 = doc.add_paragraph()
    p_c1.paragraph_format.space_before = Pt(8)
    p_c1.paragraph_format.space_after = Pt(8)
    r_c1 = p_c1.add_run("Chapter 1: Introduction")
    r_c1.font.name = "Times New Roman"
    r_c1.font.size = Pt(16)
    r_c1.font.bold = True
    r_c1.font.color.rgb = BLACK

    p_s11 = doc.add_paragraph()
    p_s11.paragraph_format.space_before = Pt(6)
    p_s11.paragraph_format.space_after = Pt(4)
    r_s11 = p_s11.add_run("1.1 Brief of the Project")
    r_s11.font.name = "Times New Roman"
    r_s11.font.size = Pt(13)
    r_s11.font.bold = True
    r_s11.font.color.rgb = BLACK

    add_justified_paragraph(
        doc,
        "CampuScene is a centralized, AI-powered campus event management, student engagement, and placement opportunity ecosystem. Designed and developed from the ground up for university campuses, the platform addresses the widespread fragmentation of college life where extracurricular activities, society hackathons, cultural workshops, placement drives, and official notices are scattered across unorganized WhatsApp groups, paper posters, Instagram stories, and disparate Google Forms."
    )
    add_justified_paragraph(
        doc,
        "Built on a production-grade decoupled architecture, CampuScene integrates a high-performance React 19 (TypeScript) frontend powered by Vite with an enterprise Express 5 REST API, PostgreSQL database managed via Prisma ORM, and Google's Gemini 1.5 Flash Large Language Model. The platform delivers real-time role-based access control (RBAC) across four administrative tiers: Students, Campus Societies, Placement Cells, and University Administrators."
    )
    add_justified_paragraph(
        doc,
        "CampuScene automates the entire campus event lifecycle — from event ideation with AI assistance, administrative audit and verification, real-time seat reservation with automated waitlist promotion, live attendance tracking, to instant issuance of cryptographically verifiable digital certificates and analytical reporting. The platform is deployed in production and live at https://campuscene.in with its API operational at https://api.campuscene.in."
    )

    p_s12 = doc.add_paragraph()
    p_s12.paragraph_format.space_before = Pt(8)
    p_s12.paragraph_format.space_after = Pt(4)
    r_s12 = p_s12.add_run("1.2 Problem Statement & Motivation")
    r_s12.font.name = "Times New Roman"
    r_s12.font.size = Pt(13)
    r_s12.font.bold = True
    r_s12.font.color.rgb = BLACK

    add_justified_paragraph(
        doc,
        "Modern university campuses host dozens of vibrant technical, cultural, literary, and sports societies alongside active placement cells. Despite this vibrant environment, colleges face persistent administrative and engagement bottlenecks:"
    )
    add_bullet_point(doc, "Information Silos", "Event updates are routinely buried in informal, spam-heavy chat groups, causing students to miss registration deadlines and placement opportunities.")
    add_bullet_point(doc, "Unverified Organizers & Clashes", "Without an administrative moderation gate, overlapping events compete for the same university auditorium or student audience on the same dates.")
    add_bullet_point(doc, "Manual Registration Overflow", "Google Forms lack real-time capacity clamping, resulting in overbooked venues or high no-show rates with no automated waitlist queue.")
    add_bullet_point(doc, "Manual Attendance & Forged Credentials", "Paper sign-in sheets lead to proxy attendance, and manual certificate distribution takes weeks and is prone to forgery.")
    add_bullet_point(doc, "Organizer Content Fatigue", "Society leads spend excessive time drafting promotional emails, social media announcements, and FAQs rather than focusing on event quality.")

    doc.add_page_break()

    # ==========================================
    # PAGE 4: 1.3 Objectives & 1.4 Frontend Stack
    # ==========================================
    p_s13 = doc.add_paragraph()
    p_s13.paragraph_format.space_before = Pt(8)
    p_s13.paragraph_format.space_after = Pt(4)
    r_s13 = p_s13.add_run("1.3 Objectives of the Project")
    r_s13.font.name = "Times New Roman"
    r_s13.font.size = Pt(13)
    r_s13.font.bold = True
    r_s13.font.color.rgb = BLACK

    add_justified_paragraph(doc, "The primary technical and operational objectives of CampuScene include:")
    add_bullet_point(doc, "Unified Campus Portal", "Provide a single responsive web platform (https://campuscene.in) unifying all academic, cultural, and placement events.")
    add_bullet_point(doc, "Multi-Tier Role-Based Access Control", "Enforce strict cryptographic authorization separating Student participants, Society event creators, Placement coordinators, and University Admins.")
    add_bullet_point(doc, "Capacity Bounds & FIFO Waitlist Auto-Promotion", "Implement ACID-compliant database transactions ensuring strict seating capacity limits and instantaneous first-in, first-out (FIFO) promotion when cancellations occur.")
    add_bullet_point(doc, "GenAI Event Copilot", "Leverage Google Gemini 1.5 Flash to automatically generate rich event descriptions, bulleted agendas, FAQs, and social media kits from simple bullet points.")
    add_bullet_point(doc, "Context-Aware Non-Hallucinating Chatbot", "Provide a dedicated per-event AI assistant answering attendee queries strictly based on verified organizer details.")
    add_bullet_point(doc, "Instant Verifiable Digital Certificates", "Generate tamper-proof digital certificates with unique verification IDs and print-ready modal layouts for verified attendees.")
    add_bullet_point(doc, "Live Institutional Analytics", "Equip university leadership with real-time dashboards detailing student participation, attendance conversion rates, and society activity metrics.")

    p_s14 = doc.add_paragraph()
    p_s14.paragraph_format.space_before = Pt(8)
    p_s14.paragraph_format.space_after = Pt(4)
    r_s14 = p_s14.add_run("1.4 Technologies Used")
    r_s14.font.name = "Times New Roman"
    r_s14.font.size = Pt(13)
    r_s14.font.bold = True
    r_s14.font.color.rgb = BLACK

    p_fe = doc.add_paragraph()
    p_fe.paragraph_format.space_before = Pt(4)
    p_fe.paragraph_format.space_after = Pt(4)
    r_fe = p_fe.add_run("Frontend Stack")
    r_fe.font.name = "Times New Roman"
    r_fe.font.size = Pt(12)
    r_fe.font.bold = True
    r_fe.font.color.rgb = BLACK

    fe_tech = [
        ("Technology", "Purpose"),
        ("React 19 (TypeScript)", "Component-driven single page application framework with static typing"),
        ("Vite 7", "Next-generation ESM development bundler providing sub-second HMR"),
        ("Tailwind CSS 3.4", "Utility-first styling and layout framework for responsive campus themes"),
        ("Framer Motion 12", "Fluid page transitions, interactive modals, and animated progress rings"),
        ("Lucide React", "Lightweight tree-shakeable SVG icon set for navigation and status tags"),
        ("React Router DOM 7", "Declarative client-side routing and protected role-based route guards"),
        ("TanStack React Query 5", "Asynchronous server-state management, cache invalidation, and refetching"),
        ("React Hook Form & Zod", "High-performance form state controller with runtime schema validation"),
        ("Axios", "HTTP client with automated JWT refresh token rotation interceptors"),
        ("HTML5 Canvas API", "Dynamic rendering and print export of digital certificates")
    ]

    t_fe = doc.add_table(rows=len(fe_tech), cols=2)
    t_fe.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_official_table_borders(t_fe)
    col_w_tech = [Inches(2.2), Inches(4.2)]

    for r_i, r in enumerate(t_fe.rows):
        is_h = (r_i == 0)
        for c_i, c in enumerate(r.cells):
            c.width = col_w_tech[c_i]
            set_cell_padding(c, top=70, bottom=70, left=100, right=100)
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(fe_tech[r_i][c_i])
            run.font.name = "Times New Roman"
            run.font.size = Pt(10.5) if not is_h else Pt(11)
            run.font.color.rgb = BLACK
            if is_h:
                run.font.bold = True
            elif c_i == 0:
                run.font.bold = True

    doc.add_page_break()

    # ==========================================
    # PAGE 5: Backend & Cloud Infrastructure Stacks
    # ==========================================
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(8)
    p_sp.paragraph_format.space_after = Pt(4)
    r_be = p_sp.add_run("Backend Stack")
    r_be.font.name = "Times New Roman"
    r_be.font.size = Pt(12)
    r_be.font.bold = True
    r_be.font.color.rgb = BLACK

    be_tech = [
        ("Technology", "Purpose"),
        ("Node.js (v20 LTS)", "Asynchronous non-blocking runtime environment for scalable API serving"),
        ("Express 5", "Enterprise RESTful application framework with robust middleware chaining"),
        ("TypeScript 5.8", "Full static typing across business services, repositories, and controllers"),
        ("Prisma ORM 6", "Type-safe database abstraction, automated schema migrations, and queries"),
        ("Google Generative AI SDK", "Integration with Gemini 1.5 Flash for summaries, FAQs, and event chatbots"),
        ("jsonwebtoken (JWT)", "Stateless Bearer access token generation and cryptographic verification"),
        ("bcrypt", "12-round salted one-way password hashing for account credentials"),
        ("Nodemailer", "HTML email delivery for email account verification and password recovery"),
        ("Swagger UI & OpenAPI 3.0", "Interactive API documentation explorer mounted at /api/v1/docs")
    ]

    t_be = doc.add_table(rows=len(be_tech), cols=2)
    t_be.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_official_table_borders(t_be)

    for r_i, r in enumerate(t_be.rows):
        is_h = (r_i == 0)
        for c_i, c in enumerate(r.cells):
            c.width = col_w_tech[c_i]
            set_cell_padding(c, top=70, bottom=70, left=100, right=100)
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(be_tech[r_i][c_i])
            run.font.name = "Times New Roman"
            run.font.size = Pt(10.5) if not is_h else Pt(11)
            run.font.color.rgb = BLACK
            if is_h:
                run.font.bold = True
            elif c_i == 0:
                run.font.bold = True

    p_sp2 = doc.add_paragraph()
    p_sp2.paragraph_format.space_before = Pt(12)
    p_sp2.paragraph_format.space_after = Pt(4)
    r_inf = p_sp2.add_run("Database & Cloud Infrastructure")
    r_inf.font.name = "Times New Roman"
    r_inf.font.size = Pt(12)
    r_inf.font.bold = True
    r_inf.font.color.rgb = BLACK

    inf_tech = [
        ("Technology / Service", "Purpose"),
        ("PostgreSQL 16 (Neon Cloud)", "Serverless PostgreSQL with connection pooling and high concurrency"),
        ("Vercel Edge Network", "Global CDN edge hosting for React frontend at https://campuscene.in"),
        ("Render Cloud Platform", "Managed Linux Web Service running backend API at https://api.campuscene.in"),
        ("GoDaddy DNS Engine", "Authoritative DNS routing: A record (@ -> 216.198.79.1) and CNAMEs for www and api"),
        ("Docker & Docker Compose", "Multi-stage containerization with Node.js 20 Alpine and Nginx Alpine"),
        ("Vitest & Node:Test Runner", "Comprehensive automated suite of 50 tests (41 backend + 9 frontend)")
    ]

    t_inf = doc.add_table(rows=len(inf_tech), cols=2)
    t_inf.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_official_table_borders(t_inf)

    for r_i, r in enumerate(t_inf.rows):
        is_h = (r_i == 0)
        for c_i, c in enumerate(r.cells):
            c.width = col_w_tech[c_i]
            set_cell_padding(c, top=70, bottom=70, left=100, right=100)
            p = c.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(inf_tech[r_i][c_i])
            run.font.name = "Times New Roman"
            run.font.size = Pt(10.5) if not is_h else Pt(11)
            run.font.color.rgb = BLACK
            if is_h:
                run.font.bold = True
            elif c_i == 0:
                run.font.bold = True

    doc.add_page_break()

    # ==========================================
    # PAGE 6: CHAPTER 2 (Architecture & Modules)
    # ==========================================
    p_c2 = doc.add_paragraph()
    p_c2.paragraph_format.space_before = Pt(8)
    p_c2.paragraph_format.space_after = Pt(8)
    r_c2 = p_c2.add_run("Chapter 2: Proposed Methodology")
    r_c2.font.name = "Times New Roman"
    r_c2.font.size = Pt(16)
    r_c2.font.bold = True
    r_c2.font.color.rgb = BLACK

    p_s21 = doc.add_paragraph()
    p_s21.paragraph_format.space_before = Pt(6)
    p_s21.paragraph_format.space_after = Pt(4)
    r_s21 = p_s21.add_run("2.1 System Architecture & Data Flow")
    r_s21.font.name = "Times New Roman"
    r_s21.font.size = Pt(13)
    r_s21.font.bold = True
    r_s21.font.color.rgb = BLACK

    add_justified_paragraph(
        doc,
        "CampuScene is architected following the clean Separation of Concerns (SoC) and Model-View-Controller (MVC) principles, augmented by dedicated Repository and Service abstraction layers. This architectural decoupling ensures that the user interface, business logic, authorization rules, and persistent database interact strictly through typed interfaces."
    )
    add_justified_paragraph(doc, "The operational workflow is divided into five cohesive phases:")
    add_bullet_point(doc, "Phase 1: Registration & Cryptographic Verification", "Students register with institutional credentials and activate accounts via secure, 60-minute email tokens. Society accounts require admin authorization secrets.")
    add_bullet_point(doc, "Phase 2: Event Inception & AI Packaging", "Organizers submit raw event notes; Gemini 1.5 Flash transforms them into structured JSON packages specifying title, tags, eligibility, prerequisites, and learning outcomes.")
    add_bullet_point(doc, "Phase 3: Administrative Moderation", "Submitted society events enter a PENDING_APPROVAL queue. University administrators verify hall availability, review event quality, and either publish or reject with constructive feedback.")
    add_bullet_point(doc, "Phase 4: Concurrency-Controlled Registration & Waitlisting", "Students book seats with one click. Registrations up to maximum capacity are marked REGISTERED. Subsequent registrants enter a FIFO WAITLISTED queue. When an active registration is cancelled, the earliest waitlisted participant is atomically promoted.")
    add_bullet_point(doc, "Phase 5: Check-in, Certification & Analytics", "Organizers scan attendance tickets. Attended students unlock instant verified digital certificates, and attendance data updates real-time institutional analytics dashboards.")

    p_s22 = doc.add_paragraph()
    p_s22.paragraph_format.space_before = Pt(8)
    p_s22.paragraph_format.space_after = Pt(4)
    r_s22 = p_s22.add_run("2.2 Core Modules & Implementation")
    r_s22.font.name = "Times New Roman"
    r_s22.font.size = Pt(13)
    r_s22.font.bold = True
    r_s22.font.color.rgb = BLACK

    add_bullet_point(doc, "Dual-Token RBAC Security", "Stateless 15-minute Bearer access tokens paired with 30-day cryptographically hashed refresh tokens stored in HttpOnly, SameSite=none, Secure cookies, enforcing strict role permissions across STUDENT, SOCIETY, PLACEMENT_CELL, and ADMIN.")
    add_bullet_point(doc, "Society Event Lifecycle", "Society-created events are held in PENDING_APPROVAL until approved by university administrators, safeguarding students from unverified notices or booking conflicts.")
    add_bullet_point(doc, "FIFO Waitlist Promotion Algorithm", "ACID-compliant PostgreSQL transactions ensure that when a seat is freed via registration cancellation, the system automatically queries the earliest waitlisted record (createdAt ASC) and promotes them to REGISTERED.")
    add_bullet_point(doc, "Gemini AI Marketing & Context-Bounded Chatbot", "Generates promotional summaries, Instagram captions, LinkedIn announcements, FAQs, and hosts a dedicated per-event AI assistant instructed strictly on verified organizer data to prevent hallucination.")
    add_bullet_point(doc, "Real-Time Attendance & Attendee CSV Export", "Live check-in toggling with precise timestamps and instant download of RFC 4180-compliant CSV attendee spreadsheets for official university records.")
    add_bullet_point(doc, "Automated Digital Certificate Issuance", "Dynamic HTML5 canvas digital certificate modal embedding unique verification IDs, student name, event title, organizer seal, and print/PDF export.")

    doc.add_page_break()

    # ==========================================
    # PAGE 7: Database Schema & Chapter 3 Intro
    # ==========================================
    p_s23 = doc.add_paragraph()
    p_s23.paragraph_format.space_before = Pt(8)
    p_s23.paragraph_format.space_after = Pt(4)
    r_s23 = p_s23.add_run("2.3 Database Schema & Relational Modeling")
    r_s23.font.name = "Times New Roman"
    r_s23.font.size = Pt(13)
    r_s23.font.bold = True
    r_s23.font.color.rgb = BLACK

    add_justified_paragraph(
        doc,
        "The relational database schema is implemented in PostgreSQL via Prisma ORM with strict foreign keys and cascading referential integrity across four core entities:"
    )
    add_bullet_point(doc, "User Model", "Maintains user identity, role enum, bcrypt password hash, account status, student branch, and passing year.")
    add_bullet_point(doc, "RefreshToken Model", "Stores cryptographically hashed tokens, expiration timestamps, revocation state, and user foreign key.")
    add_bullet_point(doc, "Event Model", "Maintains title, description, category, venue, start/end dates, maxCapacity, status enum, organizer foreign key, and AI metadata.")
    add_bullet_point(doc, "Registration Model", "Binds User and Event under a compound unique constraint [userId, eventId] to prevent double-booking, tracking registration status (REGISTERED, WAITLISTED, CANCELLED, ATTENDED) and check-in timestamps.")

    p_c3 = doc.add_paragraph()
    p_c3.paragraph_format.space_before = Pt(12)
    p_c3.paragraph_format.space_after = Pt(8)
    r_c3 = p_c3.add_run("Chapter 3: Applications and scope")
    r_c3.font.name = "Times New Roman"
    r_c3.font.size = Pt(16)
    r_c3.font.bold = True
    r_c3.font.color.rgb = BLACK

    p_s31 = doc.add_paragraph()
    p_s31.paragraph_format.space_before = Pt(4)
    p_s31.paragraph_format.space_after = Pt(4)
    r_s31 = p_s31.add_run("3.1 Practical Applications in Campus Ecosystem")
    r_s31.font.name = "Times New Roman"
    r_s31.font.size = Pt(13)
    r_s31.font.bold = True
    r_s31.font.color.rgb = BLACK

    add_justified_paragraph(doc, "CampuScene can be used in various fields such as:")
    add_bullet_point(doc, "Student Community & Campus Life", "Enables students to discover hackathons, technical workshops, sports meets, and placement recruitment drives through a single responsive hub, eliminating missed deadlines.")
    add_bullet_point(doc, "Student Societies & Clubs", "Simplifies event creation with AI-drafted promotional materials, removes ticketing bottlenecks with automated waitlists, and provides instant attendee CSV exports.")
    add_bullet_point(doc, "Training & Placement Cell (T&P)", "Provides an official channel to broadcast pre-placement talks (PPTs), interview schedules, and company drives with branch and year-based filtering.")
    add_bullet_point(doc, "University Administration & Deans", "Empowers faculty heads and deans with complete oversight over campus facility usage, approving event proposals, preventing auditorium collisions, and viewing institutional participation analytics.")

    p_sc = doc.add_paragraph()
    p_sc.paragraph_format.space_before = Pt(8)
    p_sc.paragraph_format.space_after = Pt(4)
    r_sc = p_sc.add_run("3.2 Scope of CampuScene")
    r_sc.font.name = "Times New Roman"
    r_sc.font.size = Pt(13)
    r_sc.font.bold = True
    r_sc.font.color.rgb = BLACK

    add_bullet_point(doc, "Centralized Event Hub", "Unifying all university event creation, moderation, discovery, and registration under https://campuscene.in.")
    add_bullet_point(doc, "Real-Time Capacity & Waitlist Engine", "Ensuring strict venue capacity compliance with deterministic FIFO promotion upon cancellations.")
    add_bullet_point(doc, "Artificial Intelligence Integration", "Leveraging Gemini 1.5 Flash for automated description drafting, marketing kits, FAQs, and a hallucination-free chatbot.")
    add_bullet_point(doc, "Institutional Data Governance", "Providing verified attendee CSV exports, real-time check-in conversion analytics, and tamper-proof digital certificates.")

    doc.add_page_break()

    # ==========================================
    # PAGE 8: Future Enhancements & References
    # ==========================================
    p_fe_hd = doc.add_paragraph()
    p_fe_hd.paragraph_format.space_before = Pt(8)
    p_fe_hd.paragraph_format.space_after = Pt(4)
    r_fe_hd = p_fe_hd.add_run("3.3 Future Enhancements & Scalability Roadmap")
    r_fe_hd.font.name = "Times New Roman"
    r_fe_hd.font.size = Pt(13)
    r_fe_hd.font.bold = True
    r_fe_hd.font.color.rgb = BLACK

    add_bullet_point(doc, "Native Mobile Applications", "Developing cross-platform React Native / Flutter apps with real-time push notifications for waitlist promotions and registration alerts.")
    add_bullet_point(doc, "Hardware QR Entry Scanners", "Equipping student volunteers at auditorium gates with native offline-capable mobile camera QR scanners for ultra-fast check-in.")
    add_bullet_point(doc, "Blockchain Certificate Verification", "Anchoring digital certificate hashes onto decentralized ledgers (Polygon / Ethereum) to enable public tamper-proof verification by external recruiters.")
    add_bullet_point(doc, "Institutional Single Sign-On (SSO)", "Integrating Google Workspace for Education and Microsoft 365 SAML/OAuth SSO for one-click student login using official university email accounts.")
    add_bullet_point(doc, "Interactive Venue Booking System", "Connecting event requests directly to an interactive auditorium and seminar room timetable calendar to completely eliminate venue collision conflicts.")

    p_ref = doc.add_paragraph()
    p_ref.paragraph_format.space_before = Pt(14)
    p_ref.paragraph_format.space_after = Pt(8)
    r_ref = p_ref.add_run("References & Bibliography")
    r_ref.font.name = "Times New Roman"
    r_ref.font.size = Pt(16)
    r_ref.font.bold = True
    r_ref.font.color.rgb = BLACK

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
        add_justified_paragraph(doc, ref, space_before=0, space_after=4)

    # Save to both target locations
    target_path = "/Users/kushdeepsethi/Documents/Codex/2026-07-06/linkedin-build-in-public-strategy-this/CampuScene_Project_Synopsis.docx"
    doc.save(target_path)
    
    backup_path = "/Users/kushdeepsethi/Documents/Codex/2026-07-06/linkedin-build-in-public-strategy-this/docs/synopsis/CampuScene_Project_Synopsis.docx"
    doc.save(backup_path)
    
    print("Clean 8-page synopsis generated successfully with top-right page numbering.")

if __name__ == "__main__":
    generate_official_synopsis()
