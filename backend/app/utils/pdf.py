from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import os

def generate_invoice(registration_id: str, name: str, event_title: str, amount: float, path: str):
    """Generates a professional PDF invoice for a user registration."""
    # Ensure directory exists
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    
    story = []
    
    # Custom Styles
    title_style = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=colors.HexColor('#00f3ff'),  # Electric Cyan
        spaceAfter=15
    )
    
    body_style = ParagraphStyle(
        'InvoiceBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#ffffff'),  # White text matching dark design, but for print we use standard black/gray
        spaceAfter=10
    )
    
    # For print readability, we style the PDF with clean light-theme typography
    header_style = ParagraphStyle('HStyle', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=18, textColor=colors.HexColor('#0f172a'), spaceAfter=5)
    text_style = ParagraphStyle('TStyle', parent=styles['Normal'], fontName='Helvetica', fontSize=10, textColor=colors.HexColor('#334155'), spaceAfter=8)
    text_bold = ParagraphStyle('TBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#0f172a'))
    
    story.append(Paragraph("ISTE MITS STUDENT CHAPTER", header_style))
    story.append(Paragraph("Official Payment Invoice / Receipt", text_style))
    story.append(Spacer(1, 15))
    
    # Roster details table
    data = [
        [Paragraph("Registration ID:", text_bold), Paragraph(registration_id, text_style)],
        [Paragraph("Attendee Name:", text_bold), Paragraph(name, text_style)],
        [Paragraph("Event Name:", text_bold), Paragraph(event_title, text_style)],
        [Paragraph("Transaction Status:", text_bold), Paragraph("VERIFIED / PAID", text_bold)],
        [Paragraph("Amount Paid:", text_bold), Paragraph(f"INR {amount:.2f}", text_bold)],
        [Paragraph("Date:", text_bold), Paragraph(datetime_to_str(), text_style)]
    ]
    
    table = Table(data, colWidths=[150, 300])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    story.append(table)
    story.append(Spacer(1, 30))
    story.append(Paragraph("Thank you for participating! This is a computer-generated invoice receipt confirming your registration status. No signature required.", text_style))
    
    doc.build(story)

def generate_certificate(name: str, event_title: str, path: str):
    """Generates a landscape participation certificate with elegant decorative layouts."""
    # Ensure directory exists
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    doc = SimpleDocTemplate(path, pagesize=landscape(letter), rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()
    story = []
    
    cert_title = ParagraphStyle('CertT', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=28, textColor=colors.HexColor('#0f172a'), alignment=1, spaceAfter=20)
    cert_sub = ParagraphStyle('CertS', parent=styles['Normal'], fontName='Helvetica', fontSize=14, textColor=colors.HexColor('#64748b'), alignment=1, spaceAfter=25)
    name_style = ParagraphStyle('CertN', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=26, textColor=colors.HexColor('#00f3ff'), alignment=1, spaceAfter=20)
    cert_desc = ParagraphStyle('CertD', parent=styles['Normal'], fontName='Helvetica', fontSize=12, textColor=colors.HexColor('#334155'), alignment=1, spaceAfter=30, leading=16)
    
    story.append(Spacer(1, 30))
    story.append(Paragraph("INDIAN SOCIETY FOR TECHNICAL EDUCATION", cert_sub))
    story.append(Paragraph("CERTIFICATE OF PARTICIPATION", cert_title))
    story.append(Spacer(1, 10))
    story.append(Paragraph("This is proudly presented to", cert_sub))
    story.append(Paragraph(name.upper(), name_style))
    story.append(Paragraph(f"for actively participating and successfully completing the technical fest / training workshop module titled <b>{event_title}</b> organized by ISTE MITS Student Chapter.", cert_desc))
    story.append(Spacer(1, 20))
    
    # Signature rows
    sig_data = [
        [Paragraph("_______________________<br/><b>Faculty Advisor</b><br/>ISTE MITS Chapter", cert_desc),
         Paragraph("_______________________<br/><b>Chairperson</b><br/>ISTE MITS Chapter", cert_desc)]
    ]
    sig_table = Table(sig_data, colWidths=[350, 350])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    
    story.append(sig_table)
    doc.build(story)

def datetime_to_str() -> str:
    from datetime import datetime
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
