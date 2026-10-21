import os

import cv2
import imageio_ffmpeg

def frames_to_video(frame_folder, output_video, fps=30):
    os.makedirs(os.path.dirname(output_video), exist_ok=True)

    frames = sorted([
        f for f in os.listdir(frame_folder)
        if f.endswith(".jpg") or f.endswith(".png")
    ])

    if not frames:
        raise ValueError("No processed frames were available for video output.")

    first = cv2.imread(os.path.join(frame_folder, frames[0]))
    if first is None:
        raise ValueError("Could not read the first processed frame.")
    h, w = first.shape[:2]
    output_size = (w + w % 2, h + h % 2)
    writer = imageio_ffmpeg.write_frames(
        output_video,
        output_size,
        fps=fps,
        codec="libx264",
        pix_fmt_in="bgr24",
        pix_fmt_out="yuv420p",
        output_params=["-movflags", "+faststart"],
    )
    writer.send(None)

    try:
        for frame in frames:
            img = cv2.imread(os.path.join(frame_folder, frame))
            if img is None:
                raise ValueError(f"Could not read processed frame {frame}.")
            if img.shape[1] != output_size[0] or img.shape[0] != output_size[1]:
                img = cv2.copyMakeBorder(
                    img,
                    0,
                    output_size[1] - img.shape[0],
                    0,
                    output_size[0] - img.shape[1],
                    cv2.BORDER_REPLICATE,
                )
            writer.send(img)
    finally:
        writer.close()