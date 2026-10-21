# RescueVision AI

RescueVision analyzes uploaded videos and browser camera frames with U-Net enhancement and YOLO object detection. The dashboard displays detections, annotated video, and live camera results.

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

## Live camera

Open **Live feed** in the dashboard and allow camera access. The browser sends one JPEG frame at a time to `POST /live-frame`; the backend returns an annotated frame and detections. This reuses the existing models and does not record or save the camera stream. On the development computer, `localhost` is a secure browser context and camera access should work. Mobile browsers block camera access over plain HTTP, so phone live-feed testing requires serving both the frontend and API over a trusted HTTPS origin; the default LAN development command is HTTP-only.

## Deploy to Render

The root `render.yaml` defines a Render Blueprint with a Python API service and a static frontend. In Render, create a new Blueprint and connect this GitHub repository. The API uses a paid Standard instance and a 1 GB persistent disk mounted at `/var/data`; review the plan and estimated cost before approving creation.

Model checkpoints are intentionally excluded from Git. After the Blueprint creates the API and disk, place these files under `/var/data/models/`:

- `unet_best.pth`
- `yolov8m.pt`

The API can start without the checkpoints, but video and live-frame inference returns HTTP 503 until both files are present. Copy the files from your private model storage using a secure transfer method; do not commit the 119 MB U-Net checkpoint to ordinary Git history. Restart the API after installing them. The frontend URL is `https://rescuevision-dashboard.onrender.com` and the API URL is `https://rescuevision-api.onrender.com`; if Render assigns different service URLs, update `FRONTEND_ORIGINS` and `VITE_API_BASE_URL` in the service settings and redeploy.

## Pipeline

The API validates video extensions and a 500 MB size limit, extracts frames, enhances each frame with the saved U-Net checkpoint, runs YOLO, then saves a uniquely named result under `backend/outputs/`. Processed MP4 files are served from `/outputs/` and temporary upload/frame files are removed after processing.

## Model status

The running detector currently uses the included pretrained `yolov8m.pt`. The custom 53-class training dataset and training script are present, but no trained `best.pt` checkpoint is included or selected by the application. Train and evaluate a custom checkpoint before relying on project-specific classes or detection accuracy. The U-Net checkpoint is used for image enhancement; its training code uses paired hazy/clear images.
