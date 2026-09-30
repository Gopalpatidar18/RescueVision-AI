import os
import cv2
from ultralytics import YOLO
from app.services.unet_service import enhance_image

model = YOLO("yolov8m.pt")   # later replace with models/best.pt

def process_frames(input_folder, output_folder):
    os.makedirs(output_folder, exist_ok=True)

    frames = sorted(os.listdir(input_folder))

    for frame_name in frames:
        frame_path = os.path.join(input_folder, frame_name)

        image = cv2.imread(frame_path)

# Step 1: Smoke Removal
        enhanced = enhance_image(image)

# Step 2: YOLO Detection
        results = model(enhanced)

# Step 3: Draw detections
        annotated = results[0].plot()

        cv2.imwrite(
            os.path.join(output_folder, frame_name),
            annotated
        )

    return len(frames)