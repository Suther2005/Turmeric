import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent


def _normalize_database_url(db_url: str) -> str:
    """Normalize provider URLs (e.g. postgres://) for SQLAlchemy."""
    if db_url.startswith('postgres://'):
        return db_url.replace('postgres://', 'postgresql://', 1)
    return db_url


class BaseConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 3600       # 1 hour
    JWT_REFRESH_TOKEN_EXPIRES = 2592000   # 30 days

    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DB_PORT', '3306')
    DB_NAME = os.environ.get('DB_NAME', 'turmericare')
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')

    SQLALCHEMY_DATABASE_URI = _normalize_database_url(
        os.environ.get(
            'DATABASE_URL',
            (
                f"mysql+pymysql://{os.environ.get('DB_USER', 'root')}:"
                f"{os.environ.get('DB_PASSWORD', '')}@"
                f"{os.environ.get('DB_HOST', 'localhost')}:"
                f"{os.environ.get('DB_PORT', '3306')}/"
                f"{os.environ.get('DB_NAME', 'turmericare')}"
            )
        )
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 300,
        'pool_pre_ping': True,
    }

    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16777216))
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

    YOLO_MODEL_PATH = os.environ.get('YOLO_MODEL_PATH', 'app/ai/models/yolov8_turmeric.pt')
    EFFICIENTNET_MODEL_PATH = os.environ.get('EFFICIENTNET_MODEL_PATH', 'app/ai/models/efficientnet_turmeric.h5')

    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    FLASK_ENV = 'development'
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_DATABASE_URI = _normalize_database_url(
        os.environ.get(
            'DATABASE_URL',
            f"sqlite:///{(BASE_DIR / 'turmericare.db').as_posix()}"
        )
    )


class ProductionConfig(BaseConfig):
    DEBUG = False
    FLASK_ENV = 'production'
    SQLALCHEMY_ECHO = False
    JWT_ACCESS_TOKEN_EXPIRES = 1800   # 30 minutes in production


class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_ACCESS_TOKEN_EXPIRES = 300


config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig,
}
