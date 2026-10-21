import cv2
import os


def extract_frames(video_path, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        fps = 30
    frame_count = 0

    try:
        while True:
            success, frame = cap.read()
            if not success:
                break

            frame_path = os.path.join(
                output_folder,
                f"frame_{frame_count:05d}.jpg"
            )
            if not cv2.imwrite(frame_path, frame):
                raise RuntimeError(f"Could not save extracted frame {frame_count}.")

            frame_count += 1
    finally:
        cap.release()

    return frame_count, fps