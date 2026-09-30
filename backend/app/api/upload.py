from fastapi import APIRouter, UploadFile, File
import shutil
import os

from app.services.smoke_service import remove_smoke
from app.services.yolo_service import detect_objects

router = APIRouter()

UPLOAD_FOLDER = "app/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Smoke removal
    enhanced_image = remove_smoke(file_path)

    # Object detection
    results = detect_objects(enhanced_image)

    detections = []

    for r in results:
        for box in r.boxes:
            detections.append({
                "class": int(box.cls[0]),
                "confidence": float(box.conf[0])
            })

    return {
    "message": "Processing Completed",
    "original_image": file.filename,
    "enhanced_image": enhanced_image,
    "objects_detected": len(detections),
    "detections": detections,
    "output_image": "app/outputs/detected.jpg"
}