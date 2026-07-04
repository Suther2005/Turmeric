import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()


def create_app(config_name=None):
    from config import config_by_name

    app = Flask(__name__)

    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    cfg = config_by_name.get(config_name, config_by_name['default'])
    app.config.from_object(cfg)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors_origins = app.config.get('CORS_ORIGINS', '*')
    if isinstance(cors_origins, str) and ',' in cors_origins:
        cors_origins = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]
    CORS(app, origins=cors_origins, supports_credentials=True)

    # Create upload directories
    upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
    for subdir in ['', 'images', 'heatmaps', 'reports', 'processed']:
        path = os.path.join(upload_folder, subdir) if subdir else upload_folder
        os.makedirs(path, exist_ok=True)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.detection import detection_bp
    from app.routes.soil import soil_bp
    from app.routes.reports import reports_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(detection_bp)
    app.register_blueprint(soil_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(admin_bp)

    # Create DB tables inside app context
    with app.app_context():
        try:
            from app.models import User, Prediction, DiseaseHistory, SoilAnalysis, Report
            db.create_all()
            print('Database tables created successfully.')
        except Exception as e:
            print(f'Warning: Could not create DB tables: {e}')

    @app.route('/api/health')
    def health_check():
        return {'status': 'ok', 'service': 'TurmeriCare API', 'version': '1.0.0'}

    @app.errorhandler(404)
    def not_found(e):
        return {'error': 'Resource not found'}, 404

    @app.errorhandler(500)
    def server_error(e):
        return {'error': 'Internal server error'}, 500

    @app.errorhandler(413)
    def file_too_large(e):
        return {'error': 'File too large. Maximum size is 16MB.'}, 413

    return app
