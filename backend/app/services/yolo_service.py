from ultralytics import YOLO
import os

model = None

def load_model():
    global model
    if model is None:
        model = YOLO("app/models/yolo/yolov8m.pt")
    return model

def detect_objects(image_path):
    model = load_model()

    results = model(image_path)

    output_folder = "app/outputs"
    os.makedirs(output_folder, exist_ok=True)

    for r in results:
        r.save(filename=os.path.join(output_folder, "detected.jpg"))

    return results