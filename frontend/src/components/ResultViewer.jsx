import { Activity, Download, ScanLine, Video } from "lucide-react";
import { mediaUrl } from "../services/api";

export default function ResultViewer({ result, isProcessing }) {
  if (!result && !isProcessing) {
    return (
      <section className="flex min-h-[290px] flex-col items-center justify-center rounded-[6px] border border-dashed border-[#c9d3db] bg-white p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-[6px] bg-[#edf1f4] text-[#617381]">
          <Video size={22} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-[#243542]">Processed video</h2>
        <p className="mt-1 max-w-xs text-sm leading-6 text-[#687682]">Select a completed analysis to review the annotated footage.</p>
        <a href="#upload" className="mt-4 text-sm font-bold text-[#a3372e] hover:text-[#762a25]">Submit incident video</a>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[6px] border border-[#d8dfe4] bg-white shadow-[0_2px_8px_rgba(23,41,54,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e4e9ed] p-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase text-[#687682]">Selected analysis</p>
          <h2 className="mt-1 truncate text-lg font-bold text-[#172936]">{result?.sourceName || "Processed video"}</h2>
          <p className="mt-1 text-xs text-[#687682]">
            {isProcessing ? "The model pipeline is running" : result?.message}
            {result?.createdAt && ` · ${new Date(result.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
          </p>
        </div>
        {result?.output_video && (
          <a
            href={mediaUrl(result.output_video)}
            download
            className="inline-flex shrink-0 items-center gap-2 rounded-[6px] border border-[#c9d3db] px-3 py-2 text-xs font-bold text-[#344957] transition hover:border-[#b53d32] hover:bg-[#fff5f4] sm:text-sm"
          >
            <Download size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Download result</span>
          </a>
        )}
      </div>

      {isProcessing ? (
        <div className="flex min-h-64 flex-col items-center justify-center bg-[#f5f7f8] text-center" role="status">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#f8e9e7] text-[#b53d32]">
            <Activity aria-hidden="true" className="animate-pulse" />
          </span>
          <span className="mt-3 font-semibold text-[#243542]">Processing incident footage</span>
          <span className="mt-1 text-sm text-[#687682]">The annotated video will appear here when complete.</span>
        </div>
      ) : result?.output_video && (
        <>
          <video key={result.output_video} controls preload="metadata" className="max-h-[34rem] w-full bg-[#111c24]">
            <source src={mediaUrl(result.output_video)} type="video/mp4" />
            Your browser does not support video playback.
          </video>
          <div className="grid gap-px border-t border-[#e4e9ed] bg-[#e4e9ed] sm:grid-cols-3">
            <Metric label="Frames analyzed" value={result.frames_processed} icon={<Video size={16} />} tone="green" />
            <Metric label="Objects detected" value={result.detections_count} icon={<ScanLine size={16} />} tone="coral" />
            <Metric label="Processing time" value={`${result.processing_seconds}s`} icon={<Activity size={16} />} tone="teal" />
          </div>
        </>
      )}
    </section>
  );
}

function Metric({ label, value, icon, tone }) {
  const tones = {
    green: "text-[#36835d]",
    coral: "text-[#b53d32]",
    teal: "text-[#28718b]",
  };

  return (
    <div className="flex items-center gap-3 bg-white p-4">
      <span className={tones[tone]} aria-hidden="true">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase text-[#687682]">{label}</p>
        <p className="mt-0.5 text-lg font-bold text-[#243542]">{value ?? "—"}</p>
      </div>
    </div>
  );
}