import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, CameraOff, CircleStop, LoaderCircle, Radio, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { detectLiveFrame } from "../services/api";

export default function LiveFeed() {
  const [stream, setStream] = useState(null);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [annotatedFrame, setAnnotatedFrame] = useState("");
  const [detections, setDetections] = useState([]);
  const [detectionGroups, setDetectionGroups] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [frameCount, setFrameCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameSequence = useRef(0);

  const startFeed = async (deviceId = selectedCameraId) => {
    setError("");
    setAnnotatedFrame("");
    setDetections([]);
    setDetectionGroups([]);
    setSelectedLabel("");
    setFrameCount(0);
    frameSequence.current = 0;

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(window.isSecureContext
        ? "Camera access is not available in this browser."
        : "Camera access requires HTTPS on a phone. Open this page over a trusted HTTPS connection, or use localhost on this computer.");
      return;
    }

    try {
      const preferredConstraints = {
        facingMode: { ideal: "environment" },
        width: { ideal: 640 },
        height: { ideal: 480 },
      };
      const attempts = [
        ...(deviceId ? [{ deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }] : []),
        preferredConstraints,
        true,
      ];
      let cameraStream = null;
      let lastCameraError = null;

      for (const videoConstraints of attempts) {
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: videoConstraints });
          break;
        } catch (cameraError) {
          lastCameraError = cameraError;
          if (["NotAllowedError", "SecurityError"].includes(cameraError.name)) throw cameraError;
        }
      }
      if (!cameraStream) throw lastCameraError || new Error("No camera could be opened.");

      const availableCameras = (await navigator.mediaDevices.enumerateDevices())
        .filter((device) => device.kind === "videoinput");
      const activeCameraId = cameraStream.getVideoTracks()[0]?.getSettings().deviceId || "";
      setCameraDevices(availableCameras);
      setSelectedCameraId(activeCameraId);
      setStream(cameraStream);
    } catch (cameraError) {
      setError(cameraError.name === "NotAllowedError"
        ? "Camera permission was denied. Allow camera access for this site in your browser settings, then try again."
        : cameraError.name === "NotFoundError"
          ? "This browser cannot access a camera. Connect or enable a camera, then check browser permissions."
          : cameraError.name === "OverconstrainedError"
            ? "The selected camera mode is unavailable. Choose another camera or use the device's default camera."
            : "The camera could not be started. Check browser permissions and try again.");
    }
  };

  const changeCamera = async (deviceId) => {
    if (!deviceId || deviceId === selectedCameraId) return;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStream(null);
    setSelectedCameraId(deviceId);
    await startFeed(deviceId);
  };

  const stopFeed = () => {
    const activeStream = videoRef.current?.srcObject || stream;
    activeStream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStream(null);
  };

  useEffect(() => {
    if (!stream || !videoRef.current) return undefined;

    const video = videoRef.current;
    let stopped = false;
    let timerId;
    video.srcObject = stream;

    const analyzeNextFrame = async () => {
      if (stopped) return;
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) {
        timerId = window.setTimeout(analyzeNextFrame, 250);
        return;
      }

      setIsAnalyzing(true);
      try {
        const canvas = canvasRef.current;
        const scale = Math.min(1, 640 / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

        const frame = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.78));
        if (!frame) throw new Error("Could not capture a frame from the camera.");

        const result = await detectLiveFrame(frame);
        if (!stopped) {
          const imageData = `data:image/jpeg;base64,${result.annotated_frame}`;
          const currentFrame = frameSequence.current + 1;
          const captures = await extractObjectCaptures(imageData, result.detections, currentFrame);
          if (stopped) return;
          frameSequence.current = currentFrame;
          setAnnotatedFrame(imageData);
          setDetections(result.detections);
          setDetectionGroups((groups) => addCapturesToGroups(groups, captures));
          setFrameCount((count) => count + 1);
        }
      } catch (frameError) {
        if (!stopped) {
          setError(frameError.response?.data?.detail || "Live analysis failed. Check that the backend is running.");
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      } finally {
        if (!stopped) {
          setIsAnalyzing(false);
          timerId = window.setTimeout(analyzeNextFrame, 250);
        }
      }
    };

    video.play().then(analyzeNextFrame).catch(() => {
      if (!stopped) setError("Camera preview could not be started.");
    });

    return () => {
      stopped = true;
      window.clearTimeout(timerId);
      stream.getTracks().forEach((track) => track.stop());
      if (video.srcObject === stream) video.srcObject = null;
      setIsAnalyzing(false);
    };
  }, [stream]);

  const detectionClasses = [...new Set(detectionGroups.map((group) => group.label))].sort();
  const selectedCaptures = detectionGroups
    .filter((group) => group.label === selectedLabel)
    .flatMap((group) => group.samples);

  return (
    <div className="space-y-5">
      <Link to="/#dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#344957] hover:text-[#a3372e]">
        <ArrowLeft size={17} aria-hidden="true" />
        Back to dashboard
      </Link>

      <section className="border-l-4 border-[#b53d32] bg-white px-5 py-5 shadow-[0_2px_8px_rgba(23,41,54,0.04)] sm:px-6">
        <p className="text-[10px] font-bold uppercase text-[#687682]">Camera input / live inference</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#172936] sm:text-3xl">Live feed analysis</h1>
            <p className="mt-2 text-sm text-[#596975]">Analyze camera frames with the existing U-Net and YOLO models.</p>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-[6px] px-3 py-2 text-xs font-bold ${stream ? "bg-[#f8e9e7] text-[#a3372e]" : "bg-[#edf1f4] text-[#596975]"}`}>
            <span className={`size-2 rounded-full ${stream ? "animate-pulse bg-[#b53d32]" : "bg-[#84919a]"}`} />
            {stream ? "LIVE" : "STOPPED"}
          </span>
        </div>
      </section>

      {error && (
        <div role="alert" className="flex items-start gap-3 border border-[#e7c8c4] bg-[#fff6f5] p-4 text-sm text-[#8d3029]">
          <ShieldAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-2">
        <FeedPanel title="Camera" status={stream ? "Live source" : "No camera active"}>
          {stream ? (
            <>
              <video ref={videoRef} muted playsInline className="aspect-video w-full bg-[#111c24] object-contain" />
              {cameraDevices.length > 1 && (
                <label className="flex items-center justify-between gap-3 border-t border-[#e4e9ed] px-3 py-2 text-xs font-semibold text-[#596975]">
                  Camera source
                  <select
                    value={selectedCameraId}
                    onChange={(event) => changeCamera(event.target.value)}
                    className="max-w-[70%] rounded-[5px] border border-[#d8dfe4] bg-white px-2 py-1.5 text-xs text-[#243542]"
                  >
                    {cameraDevices.map((device, index) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center bg-[#edf1f4] text-center">
              <CameraOff size={28} aria-hidden="true" className="text-[#84919a]" />
              <p className="mt-3 text-sm font-semibold text-[#344957]">Camera preview is stopped</p>
            </div>
          )}
        </FeedPanel>

        <FeedPanel title="Analyzed frame" status={isAnalyzing ? "Processing" : `${frameCount} frames analyzed`}>
          {annotatedFrame ? (
            <img src={annotatedFrame} alt="Latest annotated live camera frame" className="aspect-video w-full bg-[#111c24] object-contain" />
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center bg-[#edf1f4] text-center">
              <Radio size={28} aria-hidden="true" className="text-[#84919a]" />
              <p className="mt-3 text-sm font-semibold text-[#344957]">Waiting for analyzed frame</p>
            </div>
          )}
        </FeedPanel>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 border border-[#d8dfe4] bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tabular-nums text-[#172936]">{detections.length}</span>
          <div>
            <p className="text-sm font-bold text-[#243542]">Objects in latest frame</p>
            <p className="text-xs text-[#687682]">Frames are submitted sequentially to avoid queue buildup.</p>
          </div>
        </div>
        {stream ? (
          <button type="button" onClick={stopFeed} className="inline-flex items-center gap-2 rounded-[6px] bg-[#b53d32] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#963329]">
            <CircleStop size={17} aria-hidden="true" />
            Stop live analysis
          </button>
        ) : (
          <button type="button" onClick={startFeed} className="inline-flex items-center gap-2 rounded-[6px] bg-[#172936] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#294251]">
            <Camera size={17} aria-hidden="true" />
            Start live analysis
          </button>
        )}
      </section>

      <section className="border border-[#d8dfe4] bg-white">
        <div className="flex items-center justify-between border-b border-[#e4e9ed] px-4 py-3">
          <h2 className="text-sm font-bold text-[#172936]">Current detections</h2>
          {isAnalyzing && <LoaderCircle size={16} aria-label="Analyzing frame" className="animate-spin text-[#b53d32]" />}
        </div>
        {detectionClasses.length > 0 ? (
          <ul className="divide-y divide-[#e8ecef]">
            {detectionClasses.map((label) => {
              const latestCount = detections.filter((detection) => detection.label === label).length;
              const matchingGroups = detectionGroups.filter((group) => group.label === label);
              const savedCount = matchingGroups.reduce((count, group) => count + group.samples.length, 0);
              const isSelected = selectedLabel === label;

              return (
                <li key={label}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedLabel(isSelected ? "" : label)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${isSelected ? "bg-[#fff6f5]" : "hover:bg-[#f6f8f9]"}`}
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold capitalize text-[#243542]">{label}</span>
                      <span className="mt-0.5 block text-xs text-[#687682]">
                        {latestCount} in latest frame · {savedCount} saved images across {matchingGroups.length} locations
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-bold text-[#a3372e]">
                      {isSelected ? "Hide images" : "View images"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-4 py-5 text-sm text-[#687682]">No objects detected in the latest frame.</p>
        )}
      </section>

      {selectedLabel && (
        <section className="border border-[#d8dfe4] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#e4e9ed] px-4 py-3">
            <div>
              <h2 className="text-sm font-bold capitalize text-[#172936]">{selectedLabel} detections</h2>
              <p className="mt-0.5 text-xs text-[#687682]">Up to five images per location, from different frames.</p>
            </div>
            <span className="text-xs font-semibold text-[#687682]">{selectedCaptures.length} images</span>
          </div>
          {selectedCaptures.length > 0 ? (
            <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
              {selectedCaptures.map((capture) => (
                <article key={`${capture.groupId}-${capture.frameNumber}`} className="overflow-hidden border border-[#e4e9ed]">
                  <img
                    src={capture.image}
                    alt={`${selectedLabel} detected in live frame ${capture.frameNumber}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full bg-[#edf1f4] object-contain"
                  />
                  <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                    <span className="text-[#687682]">Location {capture.groupId} · frame {capture.frameNumber}</span>
                    <span className="shrink-0 font-bold text-[#344957]">{Math.round(capture.confidence * 100)}%</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="px-4 py-5 text-sm text-[#687682]">Capturing the first image for this class.</p>
          )}
        </section>
      )}

      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}

async function extractObjectCaptures(imageData, detections, frameNumber) {
  if (detections.length === 0) return [];

  const sourceImage = new Image();
  sourceImage.src = imageData;
  await sourceImage.decode();

  return detections.map((detection) => {
    const [x1, y1, x2, y2] = detection.box;
    const paddingX = (x2 - x1) * 0.12;
    const paddingY = (y2 - y1) * 0.12;
    const cropX = Math.max(0, x1 - paddingX);
    const cropY = Math.max(0, y1 - paddingY);
    const cropWidth = Math.min(sourceImage.naturalWidth - cropX, x2 - x1 + paddingX * 2);
    const cropHeight = Math.min(sourceImage.naturalHeight - cropY, y2 - y1 + paddingY * 2);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(cropWidth));
    canvas.height = Math.max(1, Math.round(cropHeight));
    canvas.getContext("2d").drawImage(
      sourceImage,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    return {
      label: detection.label,
      confidence: detection.confidence,
      frameNumber,
      box: [
        cropX / sourceImage.naturalWidth,
        cropY / sourceImage.naturalHeight,
        (cropX + cropWidth) / sourceImage.naturalWidth,
        (cropY + cropHeight) / sourceImage.naturalHeight,
      ],
      image: canvas.toDataURL("image/jpeg", 0.82),
    };
  });
}

function addCapturesToGroups(currentGroups, captures) {
  const nextGroups = currentGroups.map((group) => ({
    ...group,
    samples: [...group.samples],
  }));

  captures.forEach((capture) => {
    let group = nextGroups.find((candidate) => (
      candidate.label === capture.label && sameLocation(candidate.box, capture.box)
    ));

    if (!group) {
      group = {
        id: nextGroups.length + 1,
        label: capture.label,
        box: capture.box,
        observations: 0,
        lastFrame: null,
        samples: [],
      };
      nextGroups.push(group);
    }

    if (group.lastFrame === capture.frameNumber) return;
    group.lastFrame = capture.frameNumber;
    group.observations += 1;
    const sample = { ...capture, groupId: group.id };
    if (group.samples.length < 5) {
      group.samples.push(sample);
      return;
    }

    const replacementIndex = Math.floor(Math.random() * group.observations);
    if (replacementIndex < 5) group.samples[replacementIndex] = sample;
  });

  return nextGroups;
}

function sameLocation(firstBox, secondBox) {
  const [firstX1, firstY1, firstX2, firstY2] = firstBox;
  const [secondX1, secondY1, secondX2, secondY2] = secondBox;
  const intersectionWidth = Math.max(0, Math.min(firstX2, secondX2) - Math.max(firstX1, secondX1));
  const intersectionHeight = Math.max(0, Math.min(firstY2, secondY2) - Math.max(firstY1, secondY1));
  const intersection = intersectionWidth * intersectionHeight;
  const firstArea = (firstX2 - firstX1) * (firstY2 - firstY1);
  const secondArea = (secondX2 - secondX1) * (secondY2 - secondY1);
  const union = firstArea + secondArea - intersection;
  const overlap = union > 0 ? intersection / union : 0;
  const centerDistance = Math.hypot(
    (firstX1 + firstX2 - secondX1 - secondX2) / 2,
    (firstY1 + firstY2 - secondY1 - secondY2) / 2,
  );
  return overlap >= 0.25 || centerDistance <= 0.075;
}

function FeedPanel({ title, status, children }) {
  return (
    <section className="overflow-hidden border border-[#d8dfe4] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#e4e9ed] px-4 py-3">
        <h2 className="text-sm font-bold text-[#172936]">{title}</h2>
        <span className="text-xs text-[#687682]">{status}</span>
      </div>
      {children}
    </section>
  );
}