"""
Soil Analysis API Routes
Blueprint: soil | Prefix: /api/soil
All endpoints require JWT authentication.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import SoilAnalysis
from app.ai.soil_predictor import SoilPredictor

soil_bp = Blueprint('soil', __name__, url_prefix='/api/soil')
predictor = SoilPredictor()


@soil_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze():
    """
    POST /api/soil/analyze
    Validate soil parameters, run Random Forest prediction, save to DB.
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    # ── Validate required fields ──────────────────────────────────────────
    required = ['ph', 'nitrogen', 'phosphorus', 'potassium',
                'moisture', 'organic_carbon', 'temperature', 'humidity']
    missing = [f for f in required if data.get(f) is None]
    if missing:
        return jsonify({'message': f'Missing fields: {", ".join(missing)}'}), 400

    # ── Parse and validate ranges ─────────────────────────────────────────
    try:
        params = {
            'ph':             float(data['ph']),
            'nitrogen':       float(data['nitrogen']),
            'phosphorus':     float(data['phosphorus']),
            'potassium':      float(data['potassium']),
            'moisture':       float(data['moisture']),
            'organic_carbon': float(data['organic_carbon']),
            'temperature':    float(data['temperature']),
            'humidity':       float(data['humidity']),
        }
    except (ValueError, TypeError):
        return jsonify({'message': 'All soil parameters must be numeric values'}), 400

    if not (0 <= params['ph'] <= 14):
        return jsonify({'message': 'pH must be between 0 and 14'}), 400
    if not (0 <= params['moisture'] <= 100):
        return jsonify({'message': 'Moisture must be between 0 and 100'}), 400

    # ── Run AI prediction ─────────────────────────────────────────────────
    try:
        result = predictor.predict(params)
    except Exception as e:
        return jsonify({'message': f'Prediction error: {str(e)}'}), 500

    # ── Save to database ──────────────────────────────────────────────────
    try:
        analysis = SoilAnalysis(
            user_id         = user_id,
            ph              = params['ph'],
            nitrogen        = params['nitrogen'],
            phosphorus      = params['phosphorus'],
            potassium       = params['potassium'],
            moisture        = params['moisture'],
            organic_carbon  = params['organic_carbon'],
            temperature     = params['temperature'],
            humidity        = params['humidity'],
            soil_health     = result['soil_health'],
            fertility_score = result['fertility_score'],
            recommendations = result['recommendations'],
        )
        db.session.add(analysis)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

    return jsonify({
        'id':              analysis.id,
        'soil_health':     result['soil_health'],
        'fertility_score': result['fertility_score'],
        'recommendations': result['recommendations'],
        'params':          params,
        'created_at':      analysis.created_at.isoformat(),
    }), 201


@soil_bp.route('/history', methods=['GET'])
@jwt_required()
def history():
    """GET /api/soil/history — list all soil analyses for current user."""
    user_id = get_jwt_identity()
    analyses = (SoilAnalysis.query
                .filter_by(user_id=user_id)
                .order_by(SoilAnalysis.created_at.desc())
                .limit(50)
                .all())
    return jsonify({'analyses': [a.to_dict() for a in analyses]}), 200


@soil_bp.route('/<int:analysis_id>', methods=['GET'])
@jwt_required()
def get_analysis(analysis_id):
    """GET /api/soil/<id> — retrieve single soil analysis."""
    user_id  = get_jwt_identity()
    analysis = SoilAnalysis.query.filter_by(id=analysis_id, user_id=user_id).first()
    if not analysis:
        return jsonify({'message': 'Soil analysis not found'}), 404
    return jsonify(analysis.to_dict()), 200
