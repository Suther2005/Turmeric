import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Table, TableStyle,
    Spacer, HRFlowable, Image
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# ── TurmeriCare brand palette ───────────────────────────────────────────────
GREEN        = colors.Color(34/255,  139/255, 34/255)
DARK_GREEN   = colors.Color(0/255,   100/255, 0/255)
LIGHT_GREEN  = colors.Color(144/255, 238/255, 144/255)
ORANGE       = colors.Color(255/255, 140/255, 0/255)
LIGHT_GRAY   = colors.Color(0.95, 0.95, 0.95)
WHITE        = colors.white


# ── Helper: build a section header paragraph ────────────────────────────────

def _section(text: str, styles) -> Paragraph:
    return Paragraph(text, styles['SectionHeader'])


def generate_report(report_data: dict, output_path: str) -> str:
    """Generate a professional A4 TurmeriCare agricultural PDF report.

    Args:
        report_data: dict with keys: farmer, disease, color_analysis, soil,
                     recommendations, crop_health_score, prevention_tips,
                     pesticide_rec, report_id, report_date.
        output_path: absolute path where the PDF should be written.

    Returns:
        output_path (str)
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm,   bottomMargin=2*cm,
    )

    # ── Style definitions ────────────────────────────────────────────────────
    base = getSampleStyleSheet()
    styles = {}

    styles['BrandTitle'] = ParagraphStyle(
        'BrandTitle', parent=base['Title'],
        fontSize=26, textColor=GREEN,
        spaceAfter=4, alignment=TA_CENTER, fontName='Helvetica-Bold',
    )
    styles['Subtitle'] = ParagraphStyle(
        'Subtitle', parent=base['Normal'],
        fontSize=12, textColor=DARK_GREEN,
        spaceAfter=2, alignment=TA_CENTER,
    )
    styles['MetaLine'] = ParagraphStyle(
        'MetaLine', parent=base['Normal'],
        fontSize=9, textColor=colors.grey,
        alignment=TA_CENTER, spaceAfter=8,
    )
    styles['SubHeader'] = ParagraphStyle(
        'SubHeader', parent=base['Heading3'],
        fontSize=11, textColor=DARK_GREEN,
        spaceBefore=6, spaceAfter=4,
        fontName='Helvetica-Bold',
    )
    styles['SectionHeader'] = ParagraphStyle(
        'SectionHeader', parent=base['Heading2'],
        fontSize=12, textColor=WHITE, backColor=GREEN,
        spaceBefore=10, spaceAfter=5,
        leftIndent=6, rightIndent=6, leading=20,
        fontName='Helvetica-Bold',
    )
    styles['Body'] = ParagraphStyle(
        'Body', parent=base['Normal'],
        fontSize=10, spaceAfter=4, leading=14,
    )
    styles['Bullet'] = ParagraphStyle(
        'Bullet', parent=base['Normal'],
        fontSize=10, leftIndent=16, spaceAfter=3, leading=14,
    )
    styles['Footer'] = ParagraphStyle(
        'Footer', parent=base['Normal'],
        fontSize=8, textColor=colors.grey, alignment=TA_CENTER,
    )

    # ── Unpack data ──────────────────────────────────────────────────────────
    farmer          = report_data.get('farmer', {}) or {}
    disease         = report_data.get('disease', {}) or {}
    color_analysis  = report_data.get('color_analysis', {}) or {}
    soil            = report_data.get('soil', {}) or {}
    recommendations = report_data.get('recommendations', {}) or {}
    crop_score      = report_data.get('crop_health_score', 0) or 0
    prevention_tips = report_data.get('prevention_tips', []) or []
    report_date     = report_data.get('report_date', datetime.now().strftime('%Y-%m-%d %H:%M'))
    report_id       = report_data.get('report_id', 'N/A')

    disease_name    = disease.get('disease_name', 'Healthy') or 'Healthy'
    severity        = str(disease.get('severity', 'none') or 'none').replace('_', ' ').title()
    confidence      = float(disease.get('confidence', 0) or 0)
    affected_part   = str(disease.get('affected_part', 'N/A') or 'N/A').replace('_', ' ').title()
    plant_part      = str(disease.get('plant_part', 'N/A') or 'N/A').replace('_', ' ').title()
    location        = farmer.get('location', 'N/A') or 'N/A'
    farm_email      = farmer.get('email', 'N/A') or 'N/A'
    farm_phone      = farmer.get('phone', 'N/A') or 'N/A'
    farmer_name     = farmer.get('name', 'N/A') or 'N/A'
    soil_health     = str(soil.get('soil_health', 'N/A') or 'N/A').replace('_', ' ').title()
    fertility_score = soil.get('fertility_score', 'N/A')

    if crop_score >= 75:
        score_note = 'Good crop condition with only minor issues detected.'
    elif crop_score >= 50:
        score_note = 'Moderate stress detected. Monitor closely and follow the recommendations.'
    else:
        score_note = 'Low crop health score. Immediate intervention is recommended.'

    elements = []

    # ── Title block ──────────────────────────────────────────────────────────
    elements.append(Paragraph('TurmeriCare Crop Health Report', styles['BrandTitle']))
    elements.append(Paragraph('AI-powered turmeric disease, color, and soil analysis summary', styles['Subtitle']))
    elements.append(Paragraph(f'Report ID: {report_id} | Report Date: {report_date}', styles['MetaLine']))
    elements.append(HRFlowable(width='100%', thickness=2, color=GREEN, spaceAfter=6))

    # ── Farmer & Scan Details ───────────────────────────────────────────────
    elements.append(_section(' Report Overview', styles))
    overview_rows = [
        ['Farmer Name', farmer_name, 'Email', farm_email],
        ['Phone', farm_phone, 'Location', location],
        ['Plant Part', plant_part, 'Report ID', str(report_id)],
    ]
    meta_table = Table(overview_rows, colWidths=[3.5*cm, 5.5*cm, 3.5*cm, 5.5*cm])
    meta_table.setStyle(TableStyle([
        ('FONTNAME',       (0, 0), (-1, -1), 'Helvetica'),
        ('FONTNAME',       (0, 0), (0, -1),  'Helvetica-Bold'),
        ('FONTNAME',       (2, 0), (2, -1),  'Helvetica-Bold'),
        ('FONTSIZE',       (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [LIGHT_GRAY, WHITE]),
        ('GRID',           (0, 0), (-1, -1), 0.3, colors.lightgrey),
        ('TOPPADDING',     (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING',  (0, 0), (-1, -1), 4),
        ('LEFTPADDING',    (0, 0), (-1, -1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 0.3*cm))

    # ── Overall Assessment ──────────────────────────────────────────────────
    elements.append(_section(' Overall Assessment', styles))
    score_color = GREEN if crop_score >= 70 else (ORANGE if crop_score >= 40 else colors.red)
    score_style = ParagraphStyle(
        'ScoreDyn', parent=base['Normal'],
        fontSize=32, textColor=score_color, leading=38,
        alignment=TA_CENTER, fontName='Helvetica-Bold',
    )
    score_label_style = ParagraphStyle(
        'ScoreLabel', parent=base['Normal'],
        fontSize=10, textColor=colors.grey, leading=12,
        alignment=TA_CENTER,
    )
    score_box = Table(
        [[Paragraph('Crop Health Score', score_label_style)], [Paragraph(f'{crop_score:.1f} / 100', score_style)]],
        colWidths=[8*cm],
    )
    score_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f7fbf6')),
        ('BOX', (0, 0), (-1, -1), 0.8, GREEN),
        ('INNERGRID', (0, 0), (-1, -1), 0, WHITE),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))

    image_path = disease.get('image_path')
    if image_path and os.path.exists(image_path):
        try:
            img = Image(image_path)
            aspect = img.imageHeight / float(img.imageWidth)
            img.drawWidth = 7.5*cm
            img.drawHeight = 7.5*cm * aspect
            
            # Side by side layout
            top_layout = Table([[img, score_box]], colWidths=[8*cm, 8.5*cm])
            top_layout.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ]))
            elements.append(top_layout)
        except Exception as e:
            print(f"Error loading image for PDF: {e}")
            elements.append(score_box)
    else:
        elements.append(score_box)

    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph(score_note, styles['Subtitle']))
    elements.append(Spacer(1, 0.35*cm))

    summary_rows = [
        ['Disease', disease_name, 'Severity', severity],
        ['Confidence', f'{confidence * 100:.1f}%', 'Affected Part', affected_part],
        ['Plant Part', plant_part, 'Crop Status', 'Healthy' if disease_name == 'Healthy' else 'Attention Needed'],
    ]
    summary_table = Table(summary_rows, colWidths=[3.2*cm, 6.8*cm, 3.2*cm, 6.8*cm])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND',    (0, 0), (-1, 0), DARK_GREEN),
        ('TEXTCOLOR',     (0, 0), (-1, 0), WHITE),
        ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME',      (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE',      (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS',(0, 1), (-1, -1), [LIGHT_GRAY, WHITE]),
        ('GRID',          (0, 0), (-1, -1), 0.3, colors.lightgrey),
        ('TOPPADDING',    (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING',   (0, 0), (-1, -1), 8),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.25*cm))

    # ── Interpretation ─────────────────────────────────────────────────────
    elements.append(_section(' Interpretation', styles))
    interpretation = (
        f'The scan indicates <b>{disease_name}</b> on the {plant_part.lower()}. '
        f'The reported confidence is <b>{confidence * 100:.1f}%</b> and the current severity is <b>{severity}</b>. '
        f'Affected region: <b>{affected_part}</b>.'
    )
    elements.append(Paragraph(interpretation, styles['Body']))
    elements.append(Spacer(1, 0.15*cm))

    # ── Disease Detection ────────────────────────────────────────────────────
    elements.append(_section(' Disease Detection Results', styles))
    disease_rows = [
        ['Parameter', 'Value'],
        ['Disease Name', disease_name],
        ['Confidence', f'{confidence * 100:.1f}%'],
        ['Severity', severity],
        ['Affected Part', affected_part],
        ['Plant Part Analyzed', plant_part],
    ]
    disease_table = Table(disease_rows, colWidths=[7*cm, 11*cm])
    disease_table.setStyle(TableStyle([
        ('BACKGROUND',    (0, 0), (-1, 0), GREEN),
        ('TEXTCOLOR',     (0, 0), (-1, 0), WHITE),
        ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME',      (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE',      (0, 0), (-1, -1), 10),
        ('ROWBACKGROUNDS',(0, 1), (-1, -1), [LIGHT_GRAY, WHITE]),
        ('GRID',          (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('TOPPADDING',    (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING',   (0, 0), (-1, -1), 8),
    ]))
    elements.append(disease_table)
    elements.append(Spacer(1, 0.3*cm))

    # ── Color Analysis ───────────────────────────────────────────────────────
    elements.append(_section(' Color Analysis', styles))
    color_rows = [
        ['Metric', 'Value', 'Interpretation'],
        ['Green', f"{color_analysis.get('green_pct',  0):.1f}%", 'Healthy chlorophyll content'],
        ['Yellow', f"{color_analysis.get('yellow_pct', 0):.1f}%", 'Possible stress or chlorosis'],
        ['Brown', f"{color_analysis.get('brown_pct',  0):.1f}%", 'Necrotic or diseased tissue'],
        ['Other', f"{color_analysis.get('other_pct',  0):.1f}%", 'Background or non-leaf pixels'],
        ['Condition', str(color_analysis.get('condition', 'N/A')).replace('_', ' ').title(), ''],
        ['Health Index', f"{color_analysis.get('health_index', 0):.1f} / 100", ''],
    ]
    color_table = Table(color_rows, colWidths=[4.5*cm, 4*cm, 8.5*cm])
    color_table.setStyle(TableStyle([
        ('BACKGROUND',    (0, 0), (-1, 0), DARK_GREEN),
        ('TEXTCOLOR',     (0, 0), (-1, 0), WHITE),
        ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE',      (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS',(0, 1), (-1, -1), [LIGHT_GRAY, WHITE]),
        ('GRID',          (0, 0), (-1, -1), 0.3, colors.lightgrey),
        ('TOPPADDING',    (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING',   (0, 0), (-1, -1), 8),
    ]))
    elements.append(color_table)
    elements.append(Spacer(1, 0.3*cm))

    # ── Soil Health ──────────────────────────────────────────────────────────
    if soil:
        elements.append(_section(' Soil Health Parameters', styles))
        soil_rows = [
            ['Parameter', 'Measured', 'Recommended Range', 'Status'],
            ['pH', str(soil.get('ph', 'N/A')), '5.5 - 7.0', ''],
            ['Nitrogen (kg/ha)', str(soil.get('nitrogen', 'N/A')), '80 - 200', ''],
            ['Phosphorus (kg/ha)', str(soil.get('phosphorus', 'N/A')), '20 - 80', ''],
            ['Potassium (kg/ha)', str(soil.get('potassium', 'N/A')), '100 - 300', ''],
            ['Moisture (%)', str(soil.get('moisture', 'N/A')), '60 - 85', ''],
            ['Organic Carbon (%)', str(soil.get('organic_carbon', 'N/A')), '0.5 - 3.0', ''],
            ['Temperature (C)', str(soil.get('temperature', 'N/A')), '25 - 35', ''],
            ['Humidity (%)', str(soil.get('humidity', 'N/A')), '60 - 90', ''],
            ['Soil Health', soil_health, '', soil_health],
            ['Fertility Score', f"{fertility_score}/100", '', ''],
        ]
        soil_table = Table(soil_rows, colWidths=[5.2*cm, 3.6*cm, 4.3*cm, 4.9*cm])
        soil_table.setStyle(TableStyle([
            ('BACKGROUND',    (0, 0), (-1, 0), GREEN),
            ('TEXTCOLOR',     (0, 0), (-1, 0), WHITE),
            ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE',      (0, 0), (-1, -1), 9),
            ('ROWBACKGROUNDS',(0, 1), (-1, -1), [LIGHT_GRAY, WHITE]),
            ('GRID',          (0, 0), (-1, -1), 0.3, colors.lightgrey),
            ('TOPPADDING',    (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING',   (0, 0), (-1, -1), 8),
        ]))
        elements.append(soil_table)
        elements.append(Spacer(1, 0.3*cm))

    # ── Recommendations ──────────────────────────────────────────────────────
    elements.append(_section(' Recommendations', styles))
    recommendation_lines = []
    if recommendations.get('pesticide'):
        recommendation_lines.append(f"<b>Pesticide:</b> {recommendations['pesticide']}")
    if recommendations.get('fertilizer'):
        recommendation_lines.append(f"<b>Fertilizer:</b> {recommendations['fertilizer']}")
    if recommendations.get('organic_manure'):
        recommendation_lines.append(f"<b>Organic Manure:</b> {recommendations['organic_manure']}")
    if recommendations.get('irrigation'):
        recommendation_lines.append(f"<b>Irrigation:</b> {recommendations['irrigation']}")
    if recommendations.get('soil_improvement'):
        recommendation_lines.append(f"<b>Soil Improvement:</b> {recommendations['soil_improvement']}")

    if prevention_tips:
        recommendation_lines.append('<b>Prevention Tips:</b>')
        for i, tip in enumerate(prevention_tips, 1):
            recommendation_lines.append(f'{i}. {tip}')

    if recommendation_lines:
        for line in recommendation_lines:
            elements.append(Paragraph(line, styles['Body']))
    else:
        elements.append(Paragraph('No specific recommendations available for this report.', styles['Body']))
    elements.append(Spacer(1, 0.2*cm))

    # ── Footer ───────────────────────────────────────────────────────────────
    elements.append(HRFlowable(width='100%', thickness=1, color=GREEN, spaceBefore=12))
    elements.append(Paragraph(
        f'Generated by TurmeriCare AI Platform | {datetime.now().strftime("%Y-%m-%d %H:%M:%S")} | Confidential Agricultural Report',
        styles['Footer'],
    ))

    doc.build(elements)
    return output_path
