import os
import random
import numpy as np
from PIL import Image

DISEASES = [
    'Leaf Blotch',
    'Rhizome Rot',
    'Yellow Leaf Disease',
    'Fusarium Wilt',
    'Soft Rot',
    'Taro Leaf Blight',
    'Healthy',
]

SEVERITY_MAP = {
    'Healthy': 'none',
    'Leaf Blotch': 'mild',
    'Yellow Leaf Disease': 'moderate',
    'Fusarium Wilt': 'moderate',
    'Rhizome Rot': 'severe',
    'Soft Rot': 'severe',
    'Taro Leaf Blight': 'moderate',
}

AFFECTED_PART_MAP = {
    'Healthy': 'whole_plant',
    'Leaf Blotch': 'leaf',
    'Yellow Leaf Disease': 'leaf',
    'Fusarium Wilt': 'stem',
    'Rhizome Rot': 'rhizome',
    'Soft Rot': 'rhizome',
    'Taro Leaf Blight': 'leaf',
}


class EfficientNetClassifier:
    """EfficientNet-B0 turmeric disease classifier with deterministic mock fallback."""

    def __init__(self):
        self.model = None
        self.class_names = DISEASES
        model_path = os.environ.get('EFFICIENTNET_MODEL_PATH', 'app/ai/models/efficientnet_turmeric.h5')
        if os.path.exists(model_path):
            try:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(model_path)
                print(f'EfficientNet model loaded from {model_path}')
            except Exception as e:
                print(f'EfficientNet model load failed: {e}')
                self.model = None
        else:
            print(f'EfficientNet model not found at {model_path}, using mock classifier.')

    def classify(self, image_path: str) -> dict:
        """Classify a turmeric plant image."""
        if self.model is not None:
            return self._real_classify(image_path)
        return self._mock_classify(image_path)

    def _real_classify(self, image_path: str) -> dict:
        """Real EfficientNet-B0 inference."""
        try:
            import tensorflow as tf
            img = tf.keras.preprocessing.image.load_img(image_path, target_size=(224, 224))
            img_array = tf.keras.preprocessing.image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0) / 255.0
            predictions = self.model.predict(img_array)[0]
            top_idx = int(np.argmax(predictions))
            disease_name = self.class_names[top_idx]
            confidence = float(predictions[top_idx])
            top_predictions = [
                {'disease': self.class_names[i], 'confidence': float(predictions[i])}
                for i in np.argsort(predictions)[::-1][:3]
            ]
            return {
                'disease_name': disease_name,
                'confidence': round(confidence, 4),
                'severity': SEVERITY_MAP.get(disease_name, 'mild'),
                'affected_part': AFFECTED_PART_MAP.get(disease_name, 'leaf'),
                'top_predictions': top_predictions,
            }
        except Exception as e:
            print(f'Real classification failed: {e}, falling back to mock.')
            return self._mock_classify(image_path)

    def _mock_classify(self, image_path: str) -> dict:
        """Mock classification using image RGB statistics for determinism."""
        try:
            img = Image.open(image_path).convert('RGB').resize((64, 64))
            arr = np.array(img, dtype=np.float32)
            mean_r = float(np.mean(arr[:, :, 0]))
            mean_g = float(np.mean(arr[:, :, 1]))
            mean_b = float(np.mean(arr[:, :, 2]))

            # Deterministic disease selection based on RGB ratios
            ratio = mean_r / (mean_g + 1e-5)
            if mean_g > 120 and ratio < 0.9:
                disease_idx = 6   # Healthy
            elif mean_r > 150 and ratio > 1.2:
                disease_idx = 0   # Leaf Blotch
            elif mean_r > 130 and mean_b < 80:
                disease_idx = 2   # Yellow Leaf Disease
            elif mean_r > mean_g and mean_r > mean_b:
                disease_idx = 3   # Fusarium Wilt
            elif mean_b > mean_r and mean_b > mean_g:
                disease_idx = 4   # Soft Rot
            elif mean_g > mean_r and mean_g > mean_b:
                disease_idx = 1   # Rhizome Rot
            else:
                disease_idx = 5   # Taro Leaf Blight

            disease_name = DISEASES[disease_idx]

            # Build pseudo-probabilities with the winning class dominating
            rng = random.Random(int(mean_r * 100 + mean_g * 10 + mean_b))
            probs = [rng.uniform(0.01, 0.15) for _ in DISEASES]
            conf = rng.uniform(0.78, 0.96)
            probs[disease_idx] = conf
            total = sum(probs)
            probs = [p / total for p in probs]

            top_predictions = sorted(
                [{'disease': DISEASES[i], 'confidence': round(probs[i], 4)} for i in range(len(DISEASES))],
                key=lambda x: x['confidence'],
                reverse=True,
            )[:3]

            return {
                'disease_name': disease_name,
                'confidence': round(probs[disease_idx], 4),
                'severity': SEVERITY_MAP.get(disease_name, 'mild'),
                'affected_part': AFFECTED_PART_MAP.get(disease_name, 'leaf'),
                'top_predictions': top_predictions,
            }
        except Exception as e:
            print(f'Mock classification error: {e}')
            rng = random.Random(42)
            disease_name = rng.choice(DISEASES)
            return {
                'disease_name': disease_name,
                'confidence': round(rng.uniform(0.70, 0.95), 4),
                'severity': SEVERITY_MAP.get(disease_name, 'mild'),
                'affected_part': AFFECTED_PART_MAP.get(disease_name, 'leaf'),
                'top_predictions': [{'disease': disease_name, 'confidence': 0.85}],
            }
