import cv2
import numpy as np


class ColorAnalyzer:
    """HSV-based color analyzer for turmeric plant health assessment."""

    # OpenCV HSV ranges: H=0-179, S=0-255, V=0-255
    COLOR_RANGES = {
        'green': {
            'lower': np.array([35, 40, 40]),
            'upper': np.array([85, 255, 255]),
        },
        'yellow': {
            'lower': np.array([20, 100, 100]),
            'upper': np.array([35, 255, 255]),
        },
        'brown': {
            'lower': np.array([10, 80, 30]),
            'upper': np.array([20, 255, 180]),
        },
    }

    def analyze(self, image_path: str) -> dict:
        """Analyze color distribution and determine plant health condition."""
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f'Cannot read image: {image_path}')

            img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            total_pixels = img_hsv.shape[0] * img_hsv.shape[1]

            pixel_counts = {}
            for color, ranges in self.COLOR_RANGES.items():
                mask = cv2.inRange(img_hsv, ranges['lower'], ranges['upper'])
                pixel_counts[color] = int(np.sum(mask > 0))

            other_pixels = max(0, total_pixels - sum(pixel_counts.values()))

            green_pct  = round(pixel_counts['green']  / total_pixels * 100, 2)
            yellow_pct = round(pixel_counts['yellow'] / total_pixels * 100, 2)
            brown_pct  = round(pixel_counts['brown']  / total_pixels * 100, 2)
            other_pct  = round(other_pixels           / total_pixels * 100, 2)

            condition    = self._determine_condition(green_pct, yellow_pct, brown_pct)
            health_index = self._compute_health_index(green_pct, yellow_pct, brown_pct)
            color_report = self._build_report(green_pct, yellow_pct, brown_pct, condition)

            return {
                'green_pct':    green_pct,
                'yellow_pct':   yellow_pct,
                'brown_pct':    brown_pct,
                'other_pct':    other_pct,
                'condition':    condition,
                'health_index': health_index,
                'color_report': color_report,
            }
        except Exception as e:
            print(f'Color analysis error: {e}')
            return {
                'green_pct':    0.0,
                'yellow_pct':   0.0,
                'brown_pct':    0.0,
                'other_pct':    100.0,
                'condition':    'unknown',
                'health_index': 50.0,
                'color_report': f'Color analysis failed: {str(e)}',
            }

    def _determine_condition(self, green_pct: float, yellow_pct: float, brown_pct: float) -> str:
        """Map color percentages to a plant condition label."""
        if green_pct > 60:
            return 'healthy'
        elif yellow_pct > 40:
            return 'leaf_yellowing'
        elif 30 <= yellow_pct <= 40:
            return 'chlorosis'
        elif 20 <= yellow_pct < 30:
            return 'nutrient_deficiency'
        elif brown_pct > 25:
            return 'browning'
        else:
            return 'mixed_stress'

    def _compute_health_index(self, green_pct: float, yellow_pct: float, brown_pct: float) -> float:
        """Compute a 0-100 health index weighted by color contribution."""
        health = (green_pct * 1.0) - (yellow_pct * 0.7) - (brown_pct * 1.5)
        return round(max(0.0, min(100.0, health)), 2)

    def _build_report(self, green_pct: float, yellow_pct: float, brown_pct: float, condition: str) -> str:
        """Build a human-readable color analysis report string."""
        condition_labels = {
            'healthy':              'Plant appears healthy with dominant green coloration.',
            'leaf_yellowing':       'Significant yellowing detected. Possible water stress or nitrogen deficiency.',
            'chlorosis':            'Moderate chlorosis observed. Check iron and magnesium levels.',
            'nutrient_deficiency':  'Early stage nutrient deficiency. Consider soil testing.',
            'browning':             'Browning indicates tissue necrosis or fungal infection.',
            'mixed_stress':         'Mixed stress symptoms. Multiple stressors may be affecting the plant.',
            'unknown':              'Analysis inconclusive due to image quality.',
        }
        return (
            f'Color Distribution: Green={green_pct}%, Yellow={yellow_pct}%, Brown={brown_pct}%. '
            f'{condition_labels.get(condition, "No assessment available.")}'
        )
