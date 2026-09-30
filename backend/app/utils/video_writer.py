import os
import cv2

def frames_to_video(frame_folder, output_video, fps=30):

    os.makedirs(os.path.dirname(output_video), exist_ok=True)

    frames = sorted([
        f for f in os.listdir(frame_folder)
        if f.endswith(".jpg") or f.endswith(".png")
    ])

    if not frames:
        print("No frames found")
        return

    first = cv2.imread(os.path.join(frame_folder, frames[0]))
    h, w = first.shape[:2]

    # Try H.264 codec
    fourcc = cv2.VideoWriter_fourcc(*"avc1")
    writer = cv2.VideoWriter(output_video, fourcc, fps, (w, h))

    # Fallback to mp4v
    if not writer.isOpened():
        print("avc1 not supported, using mp4v")
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(output_video, fourcc, fps, (w, h))

    for frame in frames:
        img = cv2.imread(os.path.join(frame_folder, frame))
        writer.write(img)

    writer.release()

    print("Saved:", output_video)