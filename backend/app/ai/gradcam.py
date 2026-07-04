import os
import cv2
import numpy as np
from datetime import datetime, timezone

EXPLANATIONS = {
    'Leaf Blotch': 'High activation detected in leaf blade regions showing necrotic spots with irregular margins.',
    'Rhizome Rot': 'Activation concentrated in lower stem and rhizome interface indicating fungal colonization.',
    'Yellow Leaf Disease': 'Widespread chloroplast degradation detected across entire leaf lamina.',
    'Fusarium Wilt': 'Vascular tissue activation patterns indicate xylem blockage from Fusarium infection.',
    'Soft Rot': 'Model attention focused on water-soaked lesions with bacterial exudate zones.',
    'Taro Leaf Blight': 'Activation map highlights angular lesions bounded by leaf veins with yellow halos.',
    'Healthy': 'Uniform activation across leaf surface. No significant disease markers detected.',
}


class GradCAMGenerator:
    """Grad-CAM heatmap generator for model explainability (with realistic mock)."""

    def __init__(self, upload_folder: str = 'uploads'):
        self.heatmap_dir = os.path.join(upload_folder, 'heatmaps')
        os.makedirs(self.heatmap_dir, exist_ok=True)

    def generate(self, image_path: str, disease_name: str = 'Unknown') -> dict:
        """Generate a Grad-CAM heatmap for the given image and disease."""
        try:
            return self._generate_mock_heatmap(image_path, disease_name)
        except Exception as e:
            print(f'Grad-CAM generation failed: {e}')
            return {
                'heatmap_path': image_path,
                'explanation_text': EXPLANATIONS.get(disease_name, 'Analysis complete.'),
            }

    def _generate_mock_heatmap(self, image_path: str, disease_name: str) -> dict:
        """Generate a realistic-looking Grad-CAM heatmap using Gaussian blobs."""
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f'Cannot read image: {image_path}')

        h, w = img.shape[:2]

        # Primary hotspot location varies by disease
        disease_hotspots = {
            'Leaf Blotch':         (0.5, 0.4),
            'Rhizome Rot':         (0.5, 0.8),
            'Yellow Leaf Disease': (0.5, 0.3),
            'Fusarium Wilt':       (0.5, 0.6),
            'Soft Rot':            (0.4, 0.7),
            'Taro Leaf Blight':    (0.6, 0.35),
            'Healthy':             (0.5, 0.5),
        }
        cx_ratio, cy_ratio = disease_hotspots.get(disease_name, (0.5, 0.5))
        cx = int(cx_ratio * w)
        cy = int(cy_ratio * h)

        # Build primary Gaussian activation map
        sigma_x = w * 0.25
        sigma_y = h * 0.25
        y_coords, x_coords = np.mgrid[0:h, 0:w]
        heatmap = np.exp(
            -((x_coords - cx) ** 2 / (2 * sigma_x ** 2) + (y_coords - cy) ** 2 / (2 * sigma_y ** 2))
        ).astype(np.float32)

        # Add secondary hotspots for visual realism
        rng = np.random.RandomState(seed=int(cx + cy + h + w))
        for _ in range(2):
            sx = int(rng.uniform(0.2, 0.8) * w)
            sy = int(rng.uniform(0.2, 0.8) * h)
            strength = float(rng.uniform(0.3, 0.7))
            sigma_s = min(w, h) * 0.1
            heatmap += strength * np.exp(
                -((x_coords - sx) ** 2 + (y_coords - sy) ** 2) / (2 * sigma_s ** 2)
            ).astype(np.float32)

        # Normalize → uint8 → jet colormap
        heatmap = heatmap / (heatmap.max() + 1e-8)
        heatmap_uint8 = np.uint8(255 * heatmap)
        heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

        # Blend with original image
        blended = cv2.addWeighted(img, 0.5, heatmap_colored, 0.5, 0)

        # Save heatmap
        timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S_%f')
        filename = f'heatmap_{timestamp}.jpg'
        heatmap_path = os.path.join(self.heatmap_dir, filename)
        cv2.imwrite(heatmap_path, blended)

        return {
            'heatmap_path': heatmap_path,
            'explanation_text': EXPLANATIONS.get(disease_name, 'Model activation analysis complete.'),
        }
