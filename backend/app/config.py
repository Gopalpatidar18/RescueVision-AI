import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "outputs")
TEMP_FOLDER = os.path.join(BASE_DIR, "temp")

UNET_MODEL = os.path.join(BASE_DIR, "models", "unet_best.pth")
YOLO_MODEL = os.path.join(BASE_DIR, "models", "yolov8s.pt")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)