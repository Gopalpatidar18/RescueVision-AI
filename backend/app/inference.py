import time

from app.config import OUTPUT_FOLDER, TEMP_FOLDER
from app.utils.video_utils import extract_frames
from app.services.video_processor import process_frames
from app.utils.video_writer import frames_to_video


def process_video(video_path, job_id):
    job_folder = TEMP_FOLDER / job_id
    raw_frames = job_folder / "raw_frames"
    processed_frames = job_folder / "processed_frames"
    output_video = OUTPUT_FOLDER / f"{job_id}.mp4"
    detection_folder = OUTPUT_FOLDER / job_id / "objects"
    started_at = time.perf_counter()

    extracted_frames, fps = extract_frames(str(video_path), str(raw_frames))
    if extracted_frames == 0:
        raise ValueError("No readable video frames were found in the uploaded file.")

    metrics = process_frames(
        str(raw_frames),
        str(processed_frames),
        str(detection_folder),
        f"/outputs/{job_id}/objects",
    )

    frames_to_video(str(processed_frames), str(output_video), fps=fps)

    return {
        **metrics,
        "processing_seconds": round(time.perf_counter() - started_at, 2),
        "output_video": f"/outputs/{job_id}.mp4",
    }
