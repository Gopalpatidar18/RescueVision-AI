from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]

UPLOAD_FOLDER = BASE_DIR / "uploads"
OUTPUT_FOLDER = BASE_DIR / "outputs"
TEMP_FOLDER = BASE_DIR / "temp"

UNET_MODEL = BASE_DIR / "unet_training" / "models" / "unet_best.pth"
YOLO_MODEL = BASE_DIR / "yolov8m.pt"

for folder in (UPLOAD_FOLDER, OUTPUT_FOLDER, TEMP_FOLDER):
	folder.mkdir(parents=True, exist_ok=True)