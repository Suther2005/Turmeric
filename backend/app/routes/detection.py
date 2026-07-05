import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
from app import db
from app.models.prediction import Prediction
from app.models.disease_history import DiseaseHistory
from app.utils.auth_helpers import get_user_from_jwt
from app.utils.image_processor import preprocess_pipeline
from app.ai.yolo_detector import YOLODetector
from app.ai.efficientnet_classifier import EfficientNetClassifier
from app.ai.swin_classifier import SwinClassifier
from app.ai.color_analyzer import ColorAnalyzer

detection_bp = Blueprint('detection', __name__, url_prefix='/api/detection')

# Initialise AI models once at startup (singletons)
yolo_detector   = YOLODetector()
classifier      = EfficientNetClassifier()
swin_classifier = SwinClassifier()
color_analyzer  = ColorAnalyzer()


def _allowed_file(filename: str, allowed_extensions: set) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


# ── Severity → penalty mapping ───────────────────────────────────────────────
_SEVERITY_PENALTY = {'none': 0, 'mild': 10, 'moderate': 25, 'severe': 40}


@detection_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_image():
    try:
        user_id           = get_user_from_jwt()
        upload_folder     = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        allowed_ext       = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'})

        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided.'}), 400

        file = request.files['image']
        if not file or file.filename == '':
            return jsonify({'error': 'No file selected.'}), 400

        if not _allowed_file(file.filename, allowed_ext):
            return jsonify({'error': f'File type not allowed. Allowed: {sorted(allowed_ext)}'}), 400

        plant_part = request.form.get('plant_part', 'whole_plant')

        # Save uploaded file with secure, collision-free filename
        original_name = secure_filename(file.filename)
        ext           = original_name.rsplit('.', 1)[-1] if '.' in original_name else 'jpg'
        unique_name   = f'{uuid.uuid4().hex}.{ext}'
        images_dir    = os.path.join(upload_folder, 'images')
        os.makedirs(images_dir, exist_ok=True)
        image_path    = os.path.join(images_dir, unique_name)
        file.save(image_path)

        # 1. Preprocessing (best-effort — errors are non-fatal)
        try:
            preprocess_pipeline(image_path)
        except Exception as pre_err:
            print(f'Preprocessing warning (non-fatal): {pre_err}')

        # 2. YOLO detection
        try:
            yolo_result = yolo_detector.detect(image_path)
        except Exception as ye:
            print(f'YOLO error: {ye}')
            yolo_result = {
                'detected_parts': [], 'disease_regions': [],
                'pests_detected': [], 'annotated_image_path': image_path,
            }

        # 3. EfficientNet classification
        try:
            clf_result = classifier.classify(image_path)
        except Exception as ce:
            print(f'Classification error: {ce}')
            clf_result = {
                'disease_name': 'Unknown', 'confidence': 0.5,
                'severity': 'mild', 'affected_part': 'leaf', 'top_predictions': [],
            }

        # 4. Swin Transformer Secondary Verification
        try:
            swin_result = swin_classifier.classify(image_path)
            # Average confidence if the predictions match
            if swin_result.get('disease_name') == clf_result.get('disease_name'):
                clf_result['confidence'] = (clf_result['confidence'] + swin_result.get('confidence', 0.5)) / 2.0
            swin_info = {'verification': swin_result.get('disease_name'), 'confidence': swin_result.get('confidence')}
        except Exception as se:
            print(f'Swin error: {se}')
            swin_info = {'verification': 'Failed'}
        # 5. Color analysis
        try:
            color_result = color_analyzer.analyze(image_path)
        except Exception as cae:
            print(f'Color analysis error: {cae}')
            color_result = {
                'green_pct': 0, 'yellow_pct': 0, 'brown_pct': 0, 'other_pct': 100,
                'condition': 'unknown', 'health_index': 50, 'color_report': 'Analysis failed.',
            }

        # 6. Crop health score — weighted composite
        confidence       = float(clf_result.get('confidence', 0.5) or 0.5)
        health_index     = float(color_result.get('health_index', 50.0) or 50.0)
        severity         = clf_result.get('severity', 'mild')
        severity_penalty = _SEVERITY_PENALTY.get(severity, 15)
        crop_health_score = round(
            max(0.0, min(100.0, (confidence * 50) + (health_index * 0.4) - severity_penalty)),
            2,
        )

        # 7. Persist Prediction
        prediction = Prediction(
            user_id       = user_id,
            image_path    = image_path,
            plant_part    = plant_part,
            disease_name  = clf_result.get('disease_name'),
            confidence    = clf_result.get('confidence'),
            severity      = clf_result.get('severity'),
            affected_part = clf_result.get('affected_part'),
            color_analysis = color_result,
            bounding_boxes = yolo_result.get('disease_regions', []),
            heatmap_path  = None,
            status        = 'completed',
            crop_health_score = crop_health_score,
        )
        db.session.add(prediction)
        db.session.flush()   # obtain prediction.id before committing

        # 8. Persist DiseaseHistory
        history = DiseaseHistory(
            prediction_id = prediction.id,
            user_id       = user_id,
            disease_name  = clf_result.get('disease_name', 'Unknown'),
            plant_part    = plant_part,
            severity      = clf_result.get('severity'),
            confidence    = clf_result.get('confidence'),
            notes         = f"Swin Verification: {swin_info.get('verification')}",
        )
        db.session.add(history)
        db.session.commit()

        return jsonify({
            'message':          'Detection complete.',
            'prediction':       prediction.to_dict(),
            'yolo':             yolo_result,
            'classification':   clf_result,
            'swin_verification': swin_info,
            'color_analysis':   color_result,
            'crop_health_score': crop_health_score,
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Detection failed: {str(e)}'}), 500


@detection_bp.route('/result/<int:id>', methods=['GET'])
@jwt_required()
def get_result(id):
    try:
        user_id    = get_user_from_jwt()
        prediction = Prediction.query.filter_by(id=id, user_id=user_id).first()
        if not prediction:
            return jsonify({'error': 'Prediction not found or access denied.'}), 404
        return jsonify({'prediction': prediction.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@detection_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    try:
        user_id  = get_user_from_jwt()
        page     = request.args.get('page',     1,  type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)

        paginated = (
            Prediction.query.filter_by(user_id=user_id)
            .order_by(Prediction.created_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )
        return jsonify({
            'predictions':   [p.to_dict() for p in paginated.items],
            'total':         paginated.total,
            'pages':         paginated.pages,
            'current_page':  paginated.page,
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@detection_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_prediction(id):
    try:
        user_id    = get_user_from_jwt()
        prediction = Prediction.query.filter_by(id=id, user_id=user_id).first()
        if not prediction:
            return jsonify({'error': 'Prediction not found or access denied.'}), 404

        # Best-effort cleanup of image files
        for path in [prediction.image_path, prediction.heatmap_path]:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except OSError:
                    pass

        db.session.delete(prediction)
        db.session.commit()
        return jsonify({'message': 'Prediction deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
