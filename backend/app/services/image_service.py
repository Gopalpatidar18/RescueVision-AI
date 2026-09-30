from app.services.yolo_service import detect_objects
from app.services.smoke_service import detect_smoke


def process_image(image_path):

    yolo_results = detect_objects(image_path)

    smoke_results = detect_smoke(image_path)

    return {
        "objects": str(yolo_results),
        "smoke": smoke_results
    }