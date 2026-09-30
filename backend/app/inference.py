import os
import shutil
from app.config import UPLOAD_FOLDER

def process_video(file):

    save_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return save_path