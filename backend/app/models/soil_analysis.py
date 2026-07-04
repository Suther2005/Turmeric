from datetime import datetime, timezone
from app import db


class SoilAnalysis(db.Model):
    __tablename__ = 'soil_analyses'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    ph = db.Column(db.Float, nullable=True)
    nitrogen = db.Column(db.Float, nullable=True)          # kg/ha
    phosphorus = db.Column(db.Float, nullable=True)        # kg/ha
    potassium = db.Column(db.Float, nullable=True)         # kg/ha
    moisture = db.Column(db.Float, nullable=True)          # percentage
    organic_carbon = db.Column(db.Float, nullable=True)    # percentage
    temperature = db.Column(db.Float, nullable=True)       # Celsius
    humidity = db.Column(db.Float, nullable=True)          # percentage
    soil_health = db.Column(db.String(20), nullable=True)  # poor, fair, good, excellent
    fertility_score = db.Column(db.Float, nullable=True)   # 0-100
    recommendations = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    reports = db.relationship('Report', backref='soil_analysis', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'ph': self.ph,
            'nitrogen': self.nitrogen,
            'phosphorus': self.phosphorus,
            'potassium': self.potassium,
            'moisture': self.moisture,
            'organic_carbon': self.organic_carbon,
            'temperature': self.temperature,
            'humidity': self.humidity,
            'soil_health': self.soil_health,
            'fertility_score': self.fertility_score,
            'recommendations': self.recommendations,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<SoilAnalysis {self.id} - score:{self.fertility_score}>'
