import cv2
import logging
import numpy as np
import os
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.config import OUTPUT_FOLDER, TEMP_FOLDER, UPLOAD_FOLDER
from app.inference import process_video
from app.services.video_processor import process_live_frame

router = APIRouter()

ALLOWED_EXTENSIONS = {".avi", ".mkv", ".mov", ".mp4", ".webm"}
MAX_UPLOAD_BYTES = 500 * 1024 * 1024
MAX_LIVE_FRAME_BYTES = 5 * 1024 * 1024


@router.post("/upload-video")
def upload_video(file: UploadFile = File(...)):
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Upload a supported video file.")

    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size == 0:
        raise HTTPException(status_code=400, detail="The uploaded video is empty.")
    if file_size > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="The maximum video size is 500 MB.")

    job_id = uuid.uuid4().hex
    file_path = UPLOAD_FOLDER / f"{job_id}{extension}"

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = process_video(str(file_path), job_id)
        return {"message": "Analysis complete", **result}
    except FileNotFoundError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        logging.exception("Video processing failed for job %s", job_id)
        output_path = OUTPUT_FOLDER / f"{job_id}.mp4"
        output_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail="Video processing failed. Check the backend logs for details.",
        ) from error
    finally:
        file.file.close()
        file_path.unlink(missing_ok=True)
        shutil.rmtree(TEMP_FOLDER / job_id, ignore_errors=True)


@router.post("/live-frame")
def analyze_live_frame(file: UploadFile = File(...)):
    try:
        image_bytes = file.file.read(MAX_LIVE_FRAME_BYTES + 1)
        if len(image_bytes) > MAX_LIVE_FRAME_BYTES:
            raise HTTPException(status_code=413, detail="Camera frames must be 5 MB or smaller.")

        frame = cv2.imdecode(np.frombuffer(image_bytes, dtype=np.uint8), cv2.IMREAD_COLOR)
        if frame is None:
            raise HTTPException(status_code=422, detail="The uploaded camera frame is not a valid image.")

        return process_live_frame(frame)
    except FileNotFoundError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    finally:
        file.file.close()