"""
Reports API Routes
Blueprint: reports | Prefix: /api/reports
All endpoints require JWT authentication.
"""

import os
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Report, Prediction, SoilAnalysis, User
from app.utils.pdf_generator import generate_report

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')


def _resolve_report_path(path: str | None) -> str | None:
    if not path:
        return None
    if os.path.isabs(path):
        return path
    return os.path.abspath(os.path.join(current_app.root_path, '..', path))


@reports_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate():
    """
    POST /api/reports/generate
    Combine a prediction + soil analysis, generate a PDF report, save to DB.
    """
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    prediction_id    = data.get('prediction_id')
    soil_analysis_id = data.get('soil_analysis_id')

    # Fetch linked prediction (optional)
    prediction = None
    if prediction_id:
        prediction = Prediction.query.filter_by(id=prediction_id, user_id=user_id).first()

    # Fetch linked soil analysis (optional)
    soil = None
    if soil_analysis_id:
        soil = SoilAnalysis.query.filter_by(id=soil_analysis_id, user_id=user_id).first()

    if not prediction and not soil:
        return jsonify({'message': 'At least one of prediction_id or soil_analysis_id is required'}), 400

    # Compute crop health score
    crop_health_score = 50.0
    if prediction and prediction.confidence:
        crop_health_score = round(prediction.confidence * 100, 1)
    if soil and soil.fertility_score:
        if prediction and prediction.confidence:
            crop_health_score = round((prediction.confidence * 100 * 0.6 + soil.fertility_score * 0.4), 1)
        else:
            crop_health_score = soil.fertility_score

    # Build prevention tips from prediction
    prevention_tips = []
    pesticide_rec   = 'Apply neem-based organic pesticide as preventive measure.'
    if prediction:
        recs = prediction.color_analysis or {}
        prevention_tips = [
            'Remove and destroy all infected plant material from the field immediately.',
            'Apply recommended fungicide/bactericide at the prescribed dosage.',
            'Maintain proper field drainage to reduce moisture stress.',
            'Avoid overhead irrigation; use drip or furrow irrigation.',
            'Schedule follow-up inspection after 14 days.',
        ]
        disease = prediction.disease_name or ''
        if 'Rot' in disease:
            pesticide_rec = 'Metalaxyl + Mancozeb 72 WP @ 2.5 g/L as soil drench every 21 days.'
        elif 'Blotch' in disease or 'Blight' in disease:
            pesticide_rec = 'Mancozeb 75 WP @ 2 g/L or Chlorothalonil 75 WP @ 2 g/L as foliar spray.'
        elif 'Wilt' in disease:
            pesticide_rec = 'Carbendazim 50 WP @ 1 g/L as soil drench. Remove and burn infected plants.'
        elif 'Yellow' in disease:
            pesticide_rec = 'Control aphid vectors with Imidacloprid 17.8 SL @ 0.5 ml/L. Remove infected plants.'

    try:
        report = Report(
            user_id           = user_id,
            prediction_id     = prediction.id if prediction else None,
            soil_analysis_id  = soil.id if soil else None,
            pdf_path          = None,
            crop_health_score = crop_health_score,
            prevention_tips   = prevention_tips,
            pesticide_rec     = pesticide_rec,
        )
        db.session.add(report)
        db.session.flush()

        user = db.session.get(User, user_id)

        farmer = {
            'id': user_id,
            'name': user.name if user else 'N/A',
            'location': user.location if user else 'N/A',
            'phone': user.phone if user else 'N/A',
            'email': user.email if user else 'N/A',
        }
        disease = prediction.to_dict() if prediction else {}
        if disease:
            disease['plant_part'] = str(disease.get('plant_part', '')).replace('_', ' ').title()
            if disease.get('image_path'):
                disease['image_path'] = os.path.abspath(os.path.join(current_app.root_path, '..', disease['image_path']))
        report_data = {
            'report_id': report.id,
            'report_date': report.report_date.strftime('%Y-%m-%d %H:%M') if report.report_date else datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M'),
            'crop_health_score': crop_health_score,
            'farmer': farmer,
            'disease': disease,
            'color_analysis': prediction.color_analysis if prediction and prediction.color_analysis else {},
            'soil': soil.to_dict() if soil else {},
            'recommendations': {
                'pesticide': pesticide_rec,
                'prevention_tips': prevention_tips,
            },
            'prevention_tips': prevention_tips,
            'pesticide_rec': pesticide_rec,
        }

        # Generate PDF
        reports_dir = os.path.abspath(
            os.path.join(current_app.root_path, '..', current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'reports')
        )
        os.makedirs(reports_dir, exist_ok=True)

        pdf_filename = f'report_{report.id}_{int(__import__("time").time())}.pdf'
        pdf_path     = os.path.join(reports_dir, pdf_filename)

        generate_report(report_data, pdf_path)
        report.pdf_path = pdf_path
        db.session.commit()
    except Exception as e:
        current_app.logger.error(f'PDF generation error: {e}')
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

    return jsonify({
        'report': report.to_dict(),
        'message': 'Report generated successfully',
    }), 201


@reports_bp.route('/', methods=['GET'], strict_slashes=False)
@reports_bp.route('', methods=['GET'], strict_slashes=False)
@jwt_required()
def list_reports():
    """GET /api/reports/ — list all reports for current user."""
    user_id = get_jwt_identity()
    page    = request.args.get('page', 1, type=int)
    per_page = 20

    reports = (Report.query
               .filter_by(user_id=user_id)
               .order_by(Report.report_date.desc())
               .paginate(page=page, per_page=per_page, error_out=False))

    return jsonify({
        'reports':  [r.to_dict() for r in reports.items],
        'total':    reports.total,
        'page':     page,
        'pages':    reports.pages,
    }), 200


@reports_bp.route('/<int:report_id>', methods=['GET'])
@jwt_required()
def get_report(report_id):
    """GET /api/reports/<id> — single report."""
    user_id = get_jwt_identity()
    report  = Report.query.filter_by(id=report_id, user_id=user_id).first()
    if not report:
        return jsonify({'message': 'Report not found'}), 404
    return jsonify(report.to_dict()), 200


@reports_bp.route('/<int:report_id>/download', methods=['GET'])
@jwt_required()
def download_report(report_id):
    """GET /api/reports/<id>/download — stream PDF file."""
    user_id = get_jwt_identity()
    report  = Report.query.filter_by(id=report_id, user_id=user_id).first()
    if not report:
        return jsonify({'message': 'Report not found'}), 404
    file_path = _resolve_report_path(report.pdf_path)
    if not file_path or not os.path.exists(file_path):
        return jsonify({'message': 'PDF file not found. Please regenerate the report.'}), 404
    return send_file(
        file_path,
        as_attachment=True,
        download_name=f'TurmeriCare_Report_{report.id}.pdf',
        mimetype='application/pdf',
    )


@reports_bp.route('/<int:report_id>', methods=['DELETE'])
@jwt_required()
def delete_report(report_id):
    """DELETE /api/reports/<id> — delete report and associated PDF."""
    user_id = get_jwt_identity()
    report  = Report.query.filter_by(id=report_id, user_id=user_id).first()
    if not report:
        return jsonify({'message': 'Report not found'}), 404

    # Delete PDF file from disk
    file_path = _resolve_report_path(report.pdf_path)
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass

    db.session.delete(report)
    db.session.commit()
    return jsonify({'message': 'Report deleted successfully'}), 200
