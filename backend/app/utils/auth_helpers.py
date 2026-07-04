from functools import wraps
from flask import jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)


def generate_tokens(user_id: int, role: str) -> dict:
    """Generate JWT access and refresh tokens with role claim."""
    additional_claims = {'role': role}
    access_token = create_access_token(
        identity=str(user_id),
        additional_claims=additional_claims,
    )
    refresh_token = create_refresh_token(
        identity=str(user_id),
        additional_claims=additional_claims,
    )
    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
    }


def admin_required(fn):
    """Decorator: require a valid JWT with role='admin'.
    Must be applied AFTER @jwt_required() on the route.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        role = claims.get('role', '')
        if role != 'admin':
            return jsonify({'error': 'Admin privileges required.'}), 403
        return fn(*args, **kwargs)
    return wrapper


def get_user_from_jwt() -> int:
    """Return the current user ID (int) extracted from JWT identity."""
    identity = get_jwt_identity()
    try:
        return int(identity)
    except (TypeError, ValueError):
        return None
