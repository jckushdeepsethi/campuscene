import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import os, zipfile, shutil

doc = docx.Document("CampuScene_Final_Project_Report.docx")

# 1. Configure Header & Footer
section = doc.sections[0]
section.different_first_page_header_footer = True

# First page header is empty
first_page_header = section.first_page_header
for p in first_page_header.paragraphs:
    p.text = ""

# Normal header (page 2 onwards) has top-right page numbering
header = section.header
hp = header.paragraphs[0]
hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
hp.text = ""
hrun = hp.add_run()
hrun.font.name = "Times New Roman"
hrun.font.size = Pt(11)
hrun.font.color.rgb = RGBColor(0, 0, 0)
fldSimple = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
hp._p.append(fldSimple)

# Clear any footer
footer = section.footer
for p in footer.paragraphs:
    p.text = ""

# 2. Helper function to style cells
def set_cell_margins_and_border(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(r'''
        <w:tcMar %s>
            <w:top w:w="%d" w:type="dxa"/>
            <w:bottom w:w="%d" w:type="dxa"/>
            <w:left w:w="%d" w:type="dxa"/>
            <w:right w:w="%d" w:type="dxa"/>
        </w:tcMar>
    ''' % (nsdecls('w'), top, bottom, left, right))
    tcPr.append(tcMar)

def style_table_cell(cell, text, bold=False, italic=False, size_pt=11, align=WD_ALIGN_PARAGRAPH.LEFT, color=(0, 0, 0)):
    cell.text = text
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    for r in p.runs:
        r.font.name = "Times New Roman"
        r.font.size = Pt(size_pt)
        r.bold = bold
        r.italic = italic
        r.font.color.rgb = RGBColor(*color)
    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

# 3. Create Index Table
index_data = [
    ("1", "Candidate’s Declaration", "2", True),
    ("2", "Certificate", "3", True),
    ("3", "Acknowledgement", "4", True),
    ("4", "Table of Contents (Index)", "5", True),
    ("5", "Chapter 1 – Introduction", "6", True),
    ("", "   1.1 Project Overview", "6", False),
    ("", "   1.2 Importance of Campus Event Automation & Engagement", "6", False),
    ("", "   1.3 Key Features", "7", False),
    ("", "   1.4 Technologies Used", "8", False),
    ("6", "Chapter 2 – System Analysis and Design", "9", True),
    ("", "   2.1 Problem Statement", "9", False),
    ("", "   2.2 Need for Centralized Campus Platforms", "9", False),
    ("", "   2.3 Objectives", "10", False),
    ("", "   2.4 System Requirements (Hardware & Software)", "11", False),
    ("", "   2.5 System Architecture & Flow Diagram", "11", False),
    ("7", "Chapter 3 – Implementation & Methodology", "13", True),
    ("", "   3.1 Backend Implementation & Controllers", "13", False),
    ("", "   3.2 Frontend Implementation & UI Components", "15", False),
    ("", "   3.3 Complete Data Flow (End-to-End Sequence)", "16", False),
    ("8", "Chapter 4 – Results & Testing", "18", True),
    ("", "   4.1 Output Screens & Production Deployments", "18", False),
    ("", "   4.2 Testing Parameters & Concurrency Benchmarks", "18", False),
    ("9", "Chapter 5 – Applications & Future Scope", "20", True),
    ("", "   5.1 Real-World Campus Applications", "20", False),
    ("", "   5.2 Future Technological Enhancements", "20", False),
    ("10", "References", "21", True),
]

table = doc.add_table(rows=len(index_data) + 1, cols=3)
table.alignment = WD_TABLE_ALIGNMENT.CENTER

# Table borders in XML
tblPr = table._tbl.tblPr
tblBorders = parse_xml(r'''
    <w:tblBorders %s>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
        <w:left w:val="none"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
        <w:right w:val="none"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>
        <w:insideV w:val="none"/>
    </w:tblBorders>
''' % nsdecls('w'))
tblPr.append(tblBorders)

# Header Row
hdr_cells = table.rows[0].cells
hdr_cells[0].width = Inches(0.8)
hdr_cells[1].width = Inches(4.8)
hdr_cells[2].width = Inches(0.9)

style_table_cell(hdr_cells[0], "S. No.", bold=True, size_pt=11, align=WD_ALIGN_PARAGRAPH.CENTER)
style_table_cell(hdr_cells[1], "Chapter / Topic Name", bold=True, size_pt=11, align=WD_ALIGN_PARAGRAPH.LEFT)
style_table_cell(hdr_cells[2], "Page No.", bold=True, size_pt=11, align=WD_ALIGN_PARAGRAPH.CENTER)
set_cell_margins_and_border(hdr_cells[0])
set_cell_margins_and_border(hdr_cells[1])
set_cell_margins_and_border(hdr_cells[2])

for i, (sno, title, page, is_bold) in enumerate(index_data):
    row_cells = table.rows[i + 1].cells
    row_cells[0].width = Inches(0.8)
    row_cells[1].width = Inches(4.8)
    row_cells[2].width = Inches(0.9)
    
    style_table_cell(row_cells[0], sno, bold=is_bold, size_pt=10.5, align=WD_ALIGN_PARAGRAPH.CENTER)
    style_table_cell(row_cells[1], title, bold=is_bold, size_pt=10.5, align=WD_ALIGN_PARAGRAPH.LEFT)
    style_table_cell(row_cells[2], page, bold=is_bold, size_pt=10.5, align=WD_ALIGN_PARAGRAPH.CENTER)
    set_cell_margins_and_border(row_cells[0])
    set_cell_margins_and_border(row_cells[1])
    set_cell_margins_and_border(row_cells[2])

# 4. Insert Index Title & Table between P66 (Acknowledgement) and P73 (Chapter 1)
# P66 is Kushdeep signature on Acknowledgement
# We make P67 a page break
doc.paragraphs[67].text = ""
p_br_before = doc.paragraphs[67]._p.get_or_add_pPr()
p_br_run = doc.paragraphs[67].add_run()
p_br_run.add_break(docx.enum.text.WD_BREAK.PAGE)

# P68 becomes INDEX title
doc.paragraphs[68].text = "INDEX"
doc.paragraphs[68].alignment = WD_ALIGN_PARAGRAPH.CENTER
doc.paragraphs[68].runs[0].font.name = "Times New Roman"
doc.paragraphs[68].runs[0].font.size = Pt(16)
doc.paragraphs[68].runs[0].bold = True
doc.paragraphs[68].runs[0].font.color.rgb = RGBColor(0, 0, 0)
doc.paragraphs[68].paragraph_format.space_before = Pt(10)
doc.paragraphs[68].paragraph_format.space_after = Pt(14)

# Place Table after P68 (before P69)
doc.paragraphs[69]._p.addprevious(table._tbl)

# P72 becomes a page break before Chapter 1 (P73)
doc.paragraphs[72].text = ""
p72_run = doc.paragraphs[72].add_run()
p72_run.add_break(docx.enum.text.WD_BREAK.PAGE)

# Save Document
out_path = "CampuScene_Final_Project_Report.docx"
doc.save(out_path)
shutil.copyfile(out_path, "docs/report/CampuScene_Final_Project_Report.docx")
print("Successfully generated final report with INDEX and Page Numbering!")
