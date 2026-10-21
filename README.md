# RescueVision AI

RescueVision processes uploaded videos with a frame-by-frame U-Net enhancement and YOLO object-detection pipeline. The React dashboard uploads a video, displays processing metrics, and plays or downloads the annotated MP4.

## Requirements

- Python 3.11 is recommended. The pinned PyTorch 2.2.2 dependency is not compatible with Python 3.14.
- Node.js and npm.
- The checkpoints `backend/unet_training/models/unet_best.pth` and `backend/yolov8m.pt` are included in this workspace.

## Run locally

From the repository root, create and install the backend environment:

```sh
python3.11 -m venv backend/venv
backend/venv/bin/python -m pip install -r backend/requirements.txt
```

Install the frontend and root development runner, then start both services together:

```sh
npm --prefix frontend install
npm install
npm run dev
```

On the development computer, open `http://127.0.0.1:5173`. To test on a phone, connect it to the same Wi-Fi network, find the computer's private IP address (on macOS, run `ipconfig getifaddr en0`), then open `http://<computer-ip>:5173` on the phone. The frontend will use that same host for the API at port `8000`. If macOS asks, allow incoming connections for the development processes. Stop both services together with `Ctrl+C`.

## Pipeline

The API validates video extensions and a 500 MB size limit, extracts frames, enhances each frame with the saved U-Net checkpoint, runs YOLO, then saves a uniquely named result under `backend/outputs/`. Processed MP4 files are served from `/outputs/` and temporary upload/frame files are removed after processing.

## Model status

The running detector currently uses the included pretrained `yolov8m.pt`. The custom 53-class training dataset and training script are present, but no trained `best.pt` checkpoint is included or selected by the application. Train and evaluate a custom checkpoint before relying on project-specific classes or detection accuracy. The U-Net checkpoint is used for image enhancement; its training code uses paired hazy/clear images.
