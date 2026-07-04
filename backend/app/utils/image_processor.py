import os
import cv2
import numpy as np
from PIL import Image


def resize_image(img: np.ndarray, size: tuple = (224, 224)) -> np.ndarray:
    """Resize image to target size using INTER_AREA (best for shrinking)."""
    return cv2.resize(img, size, interpolation=cv2.INTER_AREA)


def remove_noise(img: np.ndarray) -> np.ndarray:
    """Remove high-frequency noise using a mild Gaussian blur."""
    return cv2.GaussianBlur(img, (3, 3), 0)


def enhance_image(img: np.ndarray) -> np.ndarray:
    """Enhance contrast using CLAHE on the L channel in LAB color space."""
    try:
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l_channel, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l_enhanced = clahe.apply(l_channel)
        lab_enhanced = cv2.merge([l_enhanced, a, b])
        enhanced = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)
        return enhanced
    except Exception as e:
        print(f'Image enhancement warning: {e}')
        return img


def preprocess_pipeline(image_path: str, size: tuple = (224, 224)) -> np.ndarray:
    """Full preprocessing pipeline: load → denoise → enhance → resize.

    Returns a float32 numpy array normalised to [0, 1].
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f'Cannot read image: {image_path}')
    img = remove_noise(img)
    img = enhance_image(img)
    img = resize_image(img, size)
    return img.astype(np.float32) / 255.0


def save_processed_image(array: np.ndarray, output_path: str) -> str:
    """Save a float32 [0, 1] numpy array to disk as a JPEG/PNG image."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    img_uint8 = (array * 255).clip(0, 255).astype(np.uint8)
    cv2.imwrite(output_path, img_uint8)
    return output_path
