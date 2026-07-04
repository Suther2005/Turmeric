from datetime import datetime, timezone, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from app import db
from app.models.prediction import Prediction
from app.models.disease_history import DiseaseHistory
from app.utils.auth_helpers import get_user_from_jwt

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')


@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    try:
        user_id = get_user_from_jwt()

        total_scans = Prediction.query.filter_by(user_id=user_id).count()

        healthy_plants = Prediction.query.filter_by(
            user_id=user_id, disease_name='Healthy'
        ).count()

        diseased_plants = Prediction.query.filter(
            Prediction.user_id == user_id,
            Prediction.disease_name != 'Healthy',
            Prediction.disease_name.isnot(None),
        ).count()

        avg_score = db.session.query(
            func.avg(Prediction.crop_health_score)
        ).filter_by(user_id=user_id).scalar()
        avg_health_score = round(float(avg_score or 0), 2)

        # Disease distribution
        disease_rows = db.session.query(
            Prediction.disease_name,
            func.count(Prediction.id).label('count'),
        ).filter(
            Prediction.user_id == user_id,
            Prediction.disease_name.isnot(None),
        ).group_by(Prediction.disease_name).all()
        disease_distribution = {row.disease_name: row.count for row in disease_rows}

        # Monthly scans — last 6 calendar months
        now = datetime.now(timezone.utc)
        monthly_scans = []
        for i in range(5, -1, -1):
            # Walk back month-by-month
            target = now - timedelta(days=i * 30)
            month_start = target.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            # First day of next month
            if month_start.month == 12:
                month_end = month_start.replace(year=month_start.year + 1, month=1)
            else:
                month_end = month_start.replace(month=month_start.month + 1)

            count = Prediction.query.filter(
                Prediction.user_id == user_id,
                Prediction.created_at >= month_start,
                Prediction.created_at < month_end,
            ).count()
            monthly_scans.append({
                'month': month_start.strftime('%b %Y'),
                'count': count,
            })

        return jsonify({
            'total_scans':          total_scans,
            'healthy_plants':       healthy_plants,
            'diseased_plants':      diseased_plants,
            'avg_crop_health_score': avg_health_score,
            'disease_distribution': disease_distribution,
            'monthly_scans':        monthly_scans,
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/recent', methods=['GET'])
@jwt_required()
def get_recent():
    try:
        user_id = get_user_from_jwt()
        predictions = (
            Prediction.query.filter_by(user_id=user_id)
            .order_by(Prediction.created_at.desc())
            .limit(10)
            .all()
        )
        return jsonify({'predictions': [p.to_dict() for p in predictions]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/alerts', methods=['GET'])
@jwt_required()
def get_alerts():
    try:
        user_id        = get_user_from_jwt()
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

        recent = DiseaseHistory.query.filter(
            DiseaseHistory.user_id == user_id,
            DiseaseHistory.created_at >= seven_days_ago,
        ).all()

        disease_counts: dict[str, int] = {}
        for entry in recent:
            name = entry.disease_name
            if name and name != 'Healthy':
                disease_counts[name] = disease_counts.get(name, 0) + 1

        alerts = []
        for disease, count in disease_counts.items():
            if count >= 2:
                severity = 'high' if count >= 4 else 'medium'
                alerts.append({
                    'disease':     disease,
                    'occurrences': count,
                    'severity':    severity,
                    'message':     (
                        f'{disease} detected {count} times in the last 7 days. '
                        'Immediate action recommended.'
                    ),
                    'period':      '7 days',
                })

        # Sort by occurrences descending
        alerts.sort(key=lambda a: a['occurrences'], reverse=True)
        return jsonify({'alerts': alerts, 'total': len(alerts)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
