"""
Admin API Routes
Blueprint: admin | Prefix: /api/admin
All endpoints require JWT + admin role.
"""

import csv
import io
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from app.models import User, Prediction, SoilAnalysis, Report, DiseaseHistory
from app.utils.auth_helpers import admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def list_users():
    """GET /api/admin/users — paginated list of all users."""
    page     = request.args.get('page', 1, type=int)
    limit    = request.args.get('limit', 20, type=int)
    search   = request.args.get('search', '').strip()

    query = User.query
    if search:
        query = query.filter(
            (User.name.ilike(f'%{search}%')) | (User.email.ilike(f'%{search}%'))
        )

    users = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=limit, error_out=False
    )

    return jsonify({
        'users':  [u.to_dict() for u in users.items],
        'total':  users.total,
        'page':   page,
        'pages':  users.pages,
    }), 200


@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_user_status(user_id):
    """PUT /api/admin/users/<id>/status — toggle user active status."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    if user.role == 'admin':
        return jsonify({'message': 'Cannot deactivate admin accounts'}), 403

    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({
        'message':   f'User {"activated" if user.is_active else "deactivated"} successfully',
        'is_active': user.is_active,
    }), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    """DELETE /api/admin/users/<id> — permanently delete a user."""
    me = get_jwt_identity()
    if int(me) == user_id:
        return jsonify({'message': 'Cannot delete your own account'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    if user.role == 'admin':
        return jsonify({'message': 'Cannot delete admin accounts'}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200


@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def system_stats():
    """GET /api/admin/stats — system-wide statistics."""
    total_users       = User.query.count()
    active_users      = User.query.filter_by(is_active=True).count()
    total_predictions = Prediction.query.count()
    total_reports     = Report.query.count()
    total_soil        = SoilAnalysis.query.count()

    # Disease distribution
    disease_rows = (db.session.query(Prediction.disease_name, func.count(Prediction.id))
                    .filter(Prediction.disease_name.isnot(None))
                    .group_by(Prediction.disease_name)
                    .all())
    disease_distribution = {row[0]: row[1] for row in disease_rows}

    # Weekly scans (last 7 days)
    week_labels, week_data = [], []
    for i in range(6, -1, -1):
        day = datetime.utcnow() - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end   = day_start + timedelta(days=1)
        count = Prediction.query.filter(
            Prediction.created_at >= day_start,
            Prediction.created_at <  day_end
        ).count()
        week_labels.append(day.strftime('%a'))
        week_data.append(count)

    return jsonify({
        'total_users':        total_users,
        'active_users':       active_users,
        'total_predictions':  total_predictions,
        'total_reports':      total_reports,
        'total_soil_analyses': total_soil,
        'disease_distribution': disease_distribution,
        'weekly_scans': {'labels': week_labels, 'data': week_data},
    }), 200


@admin_bp.route('/predictions', methods=['GET'])
@jwt_required()
@admin_required
def all_predictions():
    """GET /api/admin/predictions — paginated list of all predictions."""
    page = request.args.get('page', 1, type=int)
    preds = (Prediction.query
             .order_by(Prediction.created_at.desc())
             .paginate(page=page, per_page=20, error_out=False))
    return jsonify({
        'predictions': [p.to_dict() for p in preds.items],
        'total':       preds.total,
        'page':        page,
        'pages':       preds.pages,
    }), 200


@admin_bp.route('/disease-stats', methods=['GET'])
@jwt_required()
@admin_required
def disease_stats():
    """GET /api/admin/disease-stats — disease frequency by month."""
    rows = (db.session.query(
                func.date_format(Prediction.created_at, '%Y-%m').label('month'),
                Prediction.disease_name,
                func.count(Prediction.id).label('count')
            )
            .filter(Prediction.disease_name.isnot(None))
            .group_by('month', Prediction.disease_name)
            .order_by('month')
            .all())
    stats = [{'month': r.month, 'disease': r.disease_name, 'count': r.count} for r in rows]
    return jsonify({'disease_stats': stats}), 200


@admin_bp.route('/export/predictions', methods=['GET'])
@jwt_required()
@admin_required
def export_predictions():
    """GET /api/admin/export/predictions — CSV export of all predictions."""
    preds = Prediction.query.order_by(Prediction.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'User ID', 'Plant Part', 'Disease', 'Confidence', 'Severity', 'Status', 'Date'])
    for p in preds:
        writer.writerow([
            p.id, p.user_id, p.plant_part, p.disease_name or '',
            f'{round((p.confidence or 0)*100, 1)}%', p.severity or '',
            p.status, p.created_at.strftime('%Y-%m-%d %H:%M'),
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=predictions_export.csv'},
    )


@admin_bp.route('/export/users', methods=['GET'])
@jwt_required()
@admin_required
def export_users():
    """GET /api/admin/export/users — CSV export of all users."""
    users = User.query.order_by(User.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'Name', 'Email', 'Role', 'Active', 'Last Login', 'Joined'])
    for u in users:
        writer.writerow([
            u.id, u.name, u.email, u.role,
            'Yes' if u.is_active else 'No',
            u.last_login.strftime('%Y-%m-%d') if u.last_login else '',
            u.created_at.strftime('%Y-%m-%d'),
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=users_export.csv'},
    )
