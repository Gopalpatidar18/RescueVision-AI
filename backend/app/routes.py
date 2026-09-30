from fastapi import APIRouter, UploadFile, File
from app.inference import process_video

router = APIRouter()

@router.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    output = process_video(file)
    return {
        "message": "Processing Complete",
        "output": output
    }