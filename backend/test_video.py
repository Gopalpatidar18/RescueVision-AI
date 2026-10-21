from app.utils.video_utils import extract_frames

frames, fps = extract_frames(
    "uploads/test.mp4",
    "temp/frames"
)

print(f"Extracted {frames} frames at {fps:.2f} FPS")