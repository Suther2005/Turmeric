import re
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.user import User
from app.utils.auth_helpers import generate_tokens, get_user_from_jwt

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def is_valid_email(email: str) -> bool:
    return bool(re.match(r'^[\w.+-]+@[\w-]+\.[\w.]+$', email))


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body must be JSON.'}), 400

        name     = data.get('name', '').strip()
        email    = data.get('email', '').strip().lower()
        password = data.get('password', '')
        role     = data.get('role', 'farmer')
        phone    = data.get('phone', '')
        location = data.get('location', '')

        if not name:
            return jsonify({'error': 'Name is required.'}), 400
        if not email or not is_valid_email(email):
            return jsonify({'error': 'A valid email address is required.'}), 400
        if not password or len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters.'}), 400
        if role not in ('farmer', 'admin'):
            role = 'farmer'

        existing = User.query.filter_by(email=email).first()
        if existing:
            return jsonify({'error': 'An account with this email already exists.'}), 409

        user = User(name=name, email=email, role=role, phone=phone, location=location)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        tokens = generate_tokens(user.id, user.role)
        return jsonify({
            'message': 'Registration successful.',
            'user': user.to_dict(),
            **tokens,
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body must be JSON.'}), 400

        email    = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'error': 'Email and password are required.'}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password.'}), 401

        if not user.is_active:
            return jsonify({'error': 'Account is deactivated. Contact support.'}), 403

        user.last_login = datetime.now(timezone.utc)
        db.session.commit()

        tokens = generate_tokens(user.id, user.role)
        return jsonify({
            'message': 'Login successful.',
            'user': user.to_dict(),
            **tokens,
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Login failed: {str(e)}'}), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        from flask_jwt_extended import get_jwt
        user_id = get_user_from_jwt()
        claims  = get_jwt()
        role    = claims.get('role', 'farmer')
        tokens  = generate_tokens(user_id, role)
        return jsonify({'access_token': tokens['access_token']}), 200
    except Exception as e:
        return jsonify({'error': f'Token refresh failed: {str(e)}'}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data  = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        if not email:
            return jsonify({'error': 'Email is required.'}), 400
        # Production: send reset email here
        return jsonify({
            'message': 'If an account with this email exists, a password reset link has been sent.',
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    try:
        user_id = get_user_from_jwt()
        user    = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found.'}), 404
        return jsonify({'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_user_from_jwt()
        user    = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found.'}), 404

        data = request.get_json() or {}
        if 'name' in data and str(data['name']).strip():
            user.name = data['name'].strip()
        if 'phone' in data:
            user.phone = data['phone']
        if 'location' in data:
            user.location = data['location']
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']

        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return jsonify({'message': 'Profile updated.', 'user': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    try:
        user_id = get_user_from_jwt()
        user    = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found.'}), 404

        data         = request.get_json() or {}
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')

        if not old_password or not new_password:
            return jsonify({'error': 'Both old_password and new_password are required.'}), 400
        if not user.check_password(old_password):
            return jsonify({'error': 'Current password is incorrect.'}), 401
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters.'}), 400

        user.set_password(new_password)
        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return jsonify({'message': 'Password changed successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
