from datetime import datetime, timezone
from app import db


class Prediction(db.Model):
    __tablename__ = 'predictions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    image_path = db.Column(db.String(500), nullable=False)
    plant_part = db.Column(db.String(50), nullable=True)        # leaf, stem, rhizome, whole_plant
    disease_name = db.Column(db.String(100), nullable=True)
    confidence = db.Column(db.Float, nullable=True)
    severity = db.Column(db.String(20), nullable=True)          # none, mild, moderate, severe
    affected_part = db.Column(db.String(100), nullable=True)
    color_analysis = db.Column(db.JSON, nullable=True)
    bounding_boxes = db.Column(db.JSON, nullable=True)
    heatmap_path = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(20), default='completed', nullable=False)  # pending, processing, completed, failed
    crop_health_score = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    disease_histories = db.relationship('DiseaseHistory', backref='prediction', lazy=True, cascade='all, delete-orphan')
    reports = db.relationship('Report', backref='prediction', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'image_path': self.image_path,
            'plant_part': self.plant_part,
            'disease_name': self.disease_name,
            'confidence': self.confidence,
            'severity': self.severity,
            'affected_part': self.affected_part,
            'color_analysis': self.color_analysis,
            'bounding_boxes': self.bounding_boxes,
            'heatmap_path': self.heatmap_path,
            'status': self.status,
            'crop_health_score': self.crop_health_score,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<Prediction {self.id} - {self.disease_name}>'
