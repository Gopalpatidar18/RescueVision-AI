import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = Path(os.environ.get("MODEL_DIR", BASE_DIR))

UPLOAD_FOLDER = BASE_DIR / "uploads"
OUTPUT_FOLDER = Path(os.environ.get("OUTPUT_DIR", BASE_DIR / "outputs"))
TEMP_FOLDER = Path(os.environ.get("TEMP_DIR", BASE_DIR / "temp"))

UNET_DEFAULT = MODEL_DIR / "unet_best.pth" if "MODEL_DIR" in os.environ else BASE_DIR / "unet_training" / "models" / "unet_best.pth"
YOLO_DEFAULT = MODEL_DIR / "yolov8m.pt" if "MODEL_DIR" in os.environ else BASE_DIR / "yolov8m.pt"
UNET_MODEL = Path(os.environ.get("UNET_MODEL_PATH", UNET_DEFAULT))
YOLO_MODEL = Path(os.environ.get("YOLO_MODEL_PATH", YOLO_DEFAULT))

for folder in (UPLOAD_FOLDER, OUTPUT_FOLDER, TEMP_FOLDER, MODEL_DIR):
	folder.mkdir(parents=True, exist_ok=True)