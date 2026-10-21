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

The root `render.yaml` defines a free Render Blueprint with a Python API service and a static frontend. In Render, create a new Blueprint and connect this GitHub repository.

Free mode deliberately uses a smaller pretrained YOLOv8n model downloaded on first inference and OpenCV detail enhancement instead of the U-Net checkpoint. The local U-Net and YOLOv8m files remain excluded from Git and are not needed by the free fallback.

The free web service can sleep while idle, inference runs on CPU and may be slow, and uploaded videos/results are stored on ephemeral service storage. They can disappear when the instance restarts. This setup is for testing, not emergency-response or production use. Mobile live-camera access works on the Render HTTPS domain; the local LAN HTTP URL does not grant camera permission on phones.

The frontend URL is `https://rescuevision-dashboard.onrender.com` and the API URL is `https://rescuevision-api.onrender.com`; if Render assigns different service URLs, update `FRONTEND_ORIGINS` and `VITE_API_BASE_URL` in the service settings and redeploy.

## Pipeline

The API validates video extensions and a 500 MB size limit, extracts frames, enhances each frame with the saved U-Net checkpoint, runs YOLO, then saves a uniquely named result under `backend/outputs/`. Processed MP4 files are served from `/outputs/` and temporary upload/frame files are removed after processing.

## Model status

Local development uses the pretrained `yolov8m.pt` and saved U-Net checkpoint when available. Free Render mode uses pretrained YOLOv8n and the OpenCV enhancement fallback. The custom 53-class training dataset and training script are present, but no trained `best.pt` checkpoint is included or selected by the application. Neither detector's accuracy has been validated for operational emergency response.
