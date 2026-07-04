from datetime import datetime, timezone
from app import db


class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    prediction_id = db.Column(db.Integer, db.ForeignKey('predictions.id', ondelete='SET NULL'), nullable=True, index=True)
    soil_analysis_id = db.Column(db.Integer, db.ForeignKey('soil_analyses.id', ondelete='SET NULL'), nullable=True, index=True)
    pdf_path = db.Column(db.String(500), nullable=True)
    crop_health_score = db.Column(db.Float, nullable=True)
    prevention_tips = db.Column(db.JSON, nullable=True)
    pesticide_rec = db.Column(db.Text, nullable=True)
    report_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'prediction_id': self.prediction_id,
            'soil_analysis_id': self.soil_analysis_id,
            'pdf_path': self.pdf_path,
            'crop_health_score': self.crop_health_score,
            'prevention_tips': self.prevention_tips,
            'pesticide_rec': self.pesticide_rec,
            'report_date': self.report_date.isoformat() if self.report_date else None,
        }

    def __repr__(self):
        return f'<Report {self.id} - user:{self.user_id}>'
