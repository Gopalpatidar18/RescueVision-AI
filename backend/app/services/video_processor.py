import base64
import math
import os
import random

import cv2
from ultralytics import YOLO

from app.config import YOLO_MODEL
from app.services.unet_service import enhance_image

model = None
MAX_IMAGES_PER_LOCATION = 5
LOCATION_CENTER_DISTANCE = 0.075


def load_yolo_model():
        global model
        if model is None:
                if not YOLO_MODEL.is_file():
                        raise FileNotFoundError(f"YOLO checkpoint is missing: {YOLO_MODEL}")
                model = YOLO(str(YOLO_MODEL))
        return model


def process_frames(input_folder, output_folder, detection_folder, detection_url_prefix):
        os.makedirs(output_folder, exist_ok=True)
        os.makedirs(detection_folder, exist_ok=True)
        frames = sorted(
                name for name in os.listdir(input_folder)
                if name.lower().endswith((".jpg", ".jpeg", ".png"))
        )
        if not frames:
                raise ValueError("No frames were available for analysis.")

        detections_count = 0
        location_groups = []
        sample_random = random.Random(0)

        for frame_name in frames:
                frame_path = os.path.join(input_folder, frame_name)
                image = cv2.imread(frame_path)
                if image is None:
                        raise ValueError(f"Could not read extracted frame {frame_name}.")

                enhanced = enhance_image(image)
                detection_result = load_yolo_model()(enhanced, verbose=False)[0]
                detections_count += len(detection_result.boxes)
                frame_number = int(os.path.splitext(frame_name)[0].split("_")[-1]) + 1
                height, width = enhanced.shape[:2]

                for detection in detection_result.boxes:
                        class_id = int(detection.cls[0].item())
                        class_name = detection_result.names.get(class_id, str(class_id))
                        x1, y1, x2, y2 = detection.xyxy[0].tolist()
                        normalized_box = (
                                max(0.0, x1 / width),
                                max(0.0, y1 / height),
                                min(1.0, x2 / width),
                                min(1.0, y2 / height),
                        )

                        group = next(
                                (
                                        candidate for candidate in location_groups
                                        if candidate["label"] == class_name
                                        and _same_location(candidate["box"], normalized_box)
                                ),
                                None,
                        )
                        if group is None:
                                group = {
                                        "label": class_name,
                                        "box": normalized_box,
                                        "seen": 0,
                                        "last_frame": None,
                                        "samples": [],
                                }
                                location_groups.append(group)

                        if group["last_frame"] == frame_number:
                                continue
                        group["last_frame"] = frame_number
                        group["seen"] += 1

                        padding_x = int((x2 - x1) * 0.12)
                        padding_y = int((y2 - y1) * 0.12)
                        crop_x1 = max(0, int(x1) - padding_x)
                        crop_y1 = max(0, int(y1) - padding_y)
                        crop_x2 = min(width, int(x2) + padding_x)
                        crop_y2 = min(height, int(y2) + padding_y)
                        crop = enhanced[crop_y1:crop_y2, crop_x1:crop_x2]
                        if crop.size == 0:
                                continue

                        sample = {
                                "crop": crop.copy(),
                                "confidence": round(float(detection.conf[0].item()), 4),
                                "frame_number": frame_number,
                        }
                        if len(group["samples"]) < MAX_IMAGES_PER_LOCATION:
                                group["samples"].append(sample)
                        else:
                                replacement_index = sample_random.randrange(group["seen"])
                                if replacement_index < MAX_IMAGES_PER_LOCATION:
                                        group["samples"][replacement_index] = sample

                annotated = detection_result.plot()
                if not cv2.imwrite(os.path.join(output_folder, frame_name), annotated):
                        raise RuntimeError(f"Could not save processed frame {frame_name}.")

        detected_objects = []
        for group_number, group in enumerate(location_groups, start=1):
                for sample_number, sample in enumerate(
                        sorted(group["samples"], key=lambda item: item["frame_number"]),
                        start=1,
                ):
                        image_name = f"location_{group_number:04d}_sample_{sample_number:02d}.jpg"
                        image_path = os.path.join(detection_folder, image_name)
                        if not cv2.imwrite(image_path, sample["crop"]):
                                raise RuntimeError(f"Could not save detected object image {image_name}.")
                        detected_objects.append({
                                "label": group["label"],
                                "location_group": group_number,
                                "confidence": sample["confidence"],
                                "frame_number": sample["frame_number"],
                                "image_url": f"{detection_url_prefix}/{image_name}",
                        })

        return {
                "frames_processed": len(frames),
                "detections_count": detections_count,
                "detected_objects": detected_objects,
        }


def _same_location(first_box, second_box):
        first_x1, first_y1, first_x2, first_y2 = first_box
        second_x1, second_y1, second_x2, second_y2 = second_box

        intersection_width = max(0.0, min(first_x2, second_x2) - max(first_x1, second_x1))
        intersection_height = max(0.0, min(first_y2, second_y2) - max(first_y1, second_y1))
        intersection = intersection_width * intersection_height
        first_area = max(0.0, first_x2 - first_x1) * max(0.0, first_y2 - first_y1)
        second_area = max(0.0, second_x2 - second_x1) * max(0.0, second_y2 - second_y1)
        union = first_area + second_area - intersection
        overlap = intersection / union if union else 0.0

        first_center = ((first_x1 + first_x2) / 2, (first_y1 + first_y2) / 2)
        second_center = ((second_x1 + second_x2) / 2, (second_y1 + second_y2) / 2)
        center_distance = math.hypot(
                first_center[0] - second_center[0],
                first_center[1] - second_center[1],
        )
        return overlap >= 0.25 or center_distance <= LOCATION_CENTER_DISTANCE


def process_live_frame(frame):
        enhanced = enhance_image(frame)
        detection_result = load_yolo_model()(enhanced, verbose=False)[0]
        annotated = detection_result.plot()
        encoded_successfully, encoded_frame = cv2.imencode(
                ".jpg",
                annotated,
                [int(cv2.IMWRITE_JPEG_QUALITY), 82],
        )
        if not encoded_successfully:
                raise RuntimeError("Could not encode the analyzed camera frame.")

        detections = []
        for detection in detection_result.boxes:
                class_id = int(detection.cls[0].item())
                detections.append({
                        "label": detection_result.names.get(class_id, str(class_id)),
                        "confidence": round(float(detection.conf[0].item()), 4),
                        "box": [round(float(value), 1) for value in detection.xyxy[0].tolist()],
                })

        return {
                "annotated_frame": base64.b64encode(encoded_frame.tobytes()).decode("ascii"),
                "detections": detections,
                "detections_count": len(detections),
        }