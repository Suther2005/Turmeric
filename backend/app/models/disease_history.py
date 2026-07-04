from datetime import datetime, timezone
from app import db


class DiseaseHistory(db.Model):
    __tablename__ = 'disease_history'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    prediction_id = db.Column(db.Integer, db.ForeignKey('predictions.id', ondelete='CASCADE'), nullable=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    disease_name = db.Column(db.String(100), nullable=False)
    plant_part = db.Column(db.String(50), nullable=True)
    severity = db.Column(db.String(20), nullable=True)
    confidence = db.Column(db.Float, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'prediction_id': self.prediction_id,
            'user_id': self.user_id,
            'disease_name': self.disease_name,
            'plant_part': self.plant_part,
            'severity': self.severity,
            'confidence': self.confidence,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<DiseaseHistory {self.id} - {self.disease_name}>'
