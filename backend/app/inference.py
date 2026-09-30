import os

from app.utils.video_utils import extract_frames
from app.services.video_processor import process_frames
from app.utils.video_writer import frames_to_video

def process_video(video_path):

    raw_frames = "temp/raw_frames"
    processed_frames = "temp/processed_frames"
    output_video = "outputs/result.mp4"

    extract_frames(video_path, raw_frames)

    process_frames(raw_frames, processed_frames)

    frames_to_video(
        processed_frames,
        output_video
    )

    return output_video