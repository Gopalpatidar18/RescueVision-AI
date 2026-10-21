import { useState } from "react";
import { CheckCircle2, FileVideo2, Loader2, UploadCloud, X } from "lucide-react";
import { uploadVideo } from "../services/api";

const MAX_FILE_BYTES = 500 * 1024 * 1024;
const VIDEO_EXTENSIONS = /\.(avi|mkv|mov|mp4|webm)$/i;

export default function UploadCard({ onResult, onProcessingChange }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const selectFile = (candidate) => {
    if (!candidate) return;
    if (!VIDEO_EXTENSIONS.test(candidate.name)) {
      setError("Choose an MP4, MOV, AVI, MKV, or WebM video.");
      setFile(null);
      return;
    }
    if (candidate.size > MAX_FILE_BYTES) {
      setError("Video files must be 500 MB or smaller.");
      setFile(null);
      return;
    }
    setError("");
    setFile(candidate);
    setUploadProgress(0);
  };

  const analyzeVideo = async () => {
    if (!file || loading) return;
    setError("");
    setLoading(true);
    setUploadProgress(0);
    onProcessingChange(true);
    try {
      const result = await uploadVideo(file, (event) => {
        if (event.total) {
          setUploadProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
        }
      });
      onResult(result, file.name);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Analysis failed. Check that the backend is running and try again."
      );
    } finally {
      setLoading(false);
      onProcessingChange(false);
    }
  };

  return (
    <section className="rounded-[6px] border border-[#d8dfe4] bg-white p-5 shadow-[0_2px_8px_rgba(23,41,54,0.04)] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase text-[#687682]">Incident footage</p>
          <h2 className="mt-1 text-xl font-bold text-[#172936]">Submit video for analysis</h2>
          <p className="mt-1 text-sm text-[#687682]">Maximum 500 MB · MP4, MOV, AVI, MKV, WebM</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-[#f8e9e7] text-[#b53d32]">
          <FileVideo2 size={20} aria-hidden="true" />
        </span>
      </div>

      <label
        htmlFor="video-upload"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          selectFile(event.dataTransfer.files[0]);
        }}
        className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[6px] border-2 border-dashed px-5 text-center transition ${dragging ? "border-[#b53d32] bg-[#fff5f4]" : "border-[#c9d3db] bg-[#f6f8f9] hover:border-[#b53d32] hover:bg-[#fffafa]"}`}
      >
        <span className="mb-3 flex size-12 items-center justify-center rounded-[6px] bg-[#f8e9e7] text-[#b53d32]">
          <UploadCloud size={23} aria-hidden="true" />
        </span>
        <span className="font-bold text-[#243542]">Drop incident video or browse files</span>
        <span className="mt-1 text-sm text-[#687682]">Accepted video formats only</span>
        <input
          id="video-upload"
          type="file"
          accept=".mp4,.mov,.avi,.mkv,.webm,video/*"
          className="sr-only"
          onChange={(event) => selectFile(event.target.files[0])}
        />
      </label>

      {file && (
        <div className="mt-4 flex min-w-0 items-center gap-3 rounded-[6px] border border-[#d8e3dc] bg-[#f3f8f4] p-3">
          <CheckCircle2 aria-hidden="true" className="shrink-0 text-[#36835d]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#24352a]">{file.name}</p>
            <p className="text-xs text-[#78867a]">{(file.size / 1024 / 1024).toFixed(2)} MB selected</p>
          </div>
          <button type="button" onClick={() => setFile(null)} aria-label="Remove selected video" className="rounded-[6px] p-2 text-[#78867a] transition hover:bg-white hover:text-[#ad533d]">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {error && <p role="alert" className="mt-4 rounded-[7px] border border-[#f0c9bd] bg-[#fff3ef] px-3 py-2 text-sm text-[#a43e31]">{error}</p>}

      {loading && (
        <div className="mt-4" aria-live="polite">
          <div className="mb-1.5 flex justify-between text-xs font-semibold text-[#58675b]">
            <span>{uploadProgress >= 100 ? "Analyzing frames" : "Uploading video"}</span>
            <span>{uploadProgress >= 100 ? "U-Net + YOLO" : `${uploadProgress}%`}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#e8ece5]">
            <div className={`h-full rounded-full bg-[#87a944] transition-all duration-300 ${uploadProgress >= 100 ? "w-full animate-pulse" : ""}`} style={{ width: uploadProgress >= 100 ? undefined : `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={analyzeVideo}
        disabled={!file || loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#b53d32] px-4 py-3 font-bold text-white transition hover:bg-[#963329] disabled:cursor-not-allowed disabled:bg-[#e3e7e9] disabled:text-[#7e8990]"
      >
        {loading ? (
          <>
            <Loader2 aria-hidden="true" className="animate-spin" />
            Uploading and analyzing...
          </>
        ) : (
          <>
            <UploadCloud aria-hidden="true" />
            Analyze video
          </>
        )}
      </button>
    </section>
  );
}