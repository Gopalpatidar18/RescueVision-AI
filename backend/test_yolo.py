from app.services.yolo_service import detect_objects
import os

files = os.listdir("app/uploads")

if not files:
    print("No images found in app/uploads")
    exit()

image_path = os.path.join("app/uploads", files[0])

print("Testing:", image_path)

results = detect_objects(image_path)

for r in results:
    print(r.boxes)