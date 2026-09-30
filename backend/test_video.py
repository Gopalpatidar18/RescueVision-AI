from app.utils.video_utils import extract_frames

frames = extract_frames(
    "uploads/test.mp4",
    "temp/frames"
)

print(f"Extracted {frames} frames")