import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowDownRight, ArrowUpRight, ChevronRight, Search, ScanLine, Timer, Trash2, Video } from "lucide-react";

import StatCard from "../components/StatCard";
import UploadCard from "../components/UploadCard";
import ResultViewer from "../components/ResultViewer";

export default function Dashboard() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("rescuevision-runs") || "[]");
    } catch {
      return [];
    }
  });
  const [selectedRunId, setSelectedRunId] = useState(() => sessionStorage.getItem("rescuevision-selected-run"));
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedRun = runs.find((run) => run.id === selectedRunId) || null;
  const visibleRuns = runs.filter((run) => run.sourceName.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleResult = (analysis, sourceName) => {
    const run = {
      ...analysis,
      id: analysis.output_video?.split("/").pop() || `run-${Date.now()}`,
      sourceName,
      createdAt: new Date().toISOString(),
    };
    setRuns((currentRuns) => [run, ...currentRuns]);
    setSelectedRunId(run.id);
    sessionStorage.setItem("rescuevision-selected-detection-run", JSON.stringify(run));
  };

  const selectRun = (runId) => {
    setSelectedRunId(runId);
    const run = runs.find((item) => item.id === runId);
    if (run) sessionStorage.setItem("rescuevision-selected-detection-run", JSON.stringify(run));
  };

  const viewDetectedObjects = (run) => {
    if (!run) return;
    sessionStorage.setItem("rescuevision-selected-detection-run", JSON.stringify(run));
    navigate("/detections", { state: { run } });
  };

  useEffect(() => {
    sessionStorage.setItem("rescuevision-runs", JSON.stringify(runs));
    sessionStorage.setItem("rescuevision-selected-run", selectedRunId || "");
  }, [runs, selectedRunId]);

  return (
    <div id="dashboard" className="space-y-6">
      <section className="border-l-4 border-[#b53d32] bg-white px-5 py-5 shadow-[0_2px_8px_rgba(23,41,54,0.04)] sm:px-6">
        <p className="text-[10px] font-bold uppercase text-[#687682]">Emergency response / video review</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
          <h1 className="text-2xl font-bold text-[#172936] sm:text-3xl">Fireground video analysis</h1>
        </div>
        <p className="mt-2 text-sm text-[#596975]">Review incident footage and annotated results.</p>
      </section>

      <section aria-label="Current session metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Videos processed"
          value={runs.length}
          subtitle="Current session"
          tone="green"
          icon={<Video size={19} />}
        />
        <StatCard
          title="Objects detected"
          value={selectedRun?.detections_count ?? "—"}
          subtitle="Selected analysis"
          tone="coral"
          icon={<ScanLine size={19} />}
        />
        <StatCard
          title="Frames analyzed"
          value={selectedRun?.frames_processed ?? "—"}
          subtitle="Selected analysis"
          tone="teal"
          icon={<Activity size={19} />}
        />
        <StatCard
          title="Processing time"
          value={selectedRun ? `${selectedRun.processing_seconds}s` : "—"}
          subtitle="Selected analysis"
          tone="amber"
          icon={<Timer size={19} />}
        />
      </section>

      <section id="upload" aria-label="Submit fireground footage" className="scroll-mt-24">
        <UploadCard onResult={handleResult} onProcessingChange={setIsProcessing} />
      </section>

      <section id="recent" className="grid scroll-mt-24 gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <RecentRuns
          runs={visibleRuns}
          totalRuns={runs.length}
          selectedRunId={selectedRunId}
          selectedRun={selectedRun}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectRun={selectRun}
          onViewObjects={viewDetectedObjects}
          onClear={() => {
            setRuns([]);
            setSelectedRunId(null);
            sessionStorage.removeItem("rescuevision-selected-detection-run");
          }}
        />
        <ResultViewer result={selectedRun} isProcessing={isProcessing} />
      </section>
    </div>
  );
}

function RecentRuns({ runs, totalRuns, selectedRunId, selectedRun, searchTerm, onSearchChange, onSelectRun, onViewObjects, onClear }) {
  return (
    <section className="rounded-[8px] border border-[#e1e5dd] bg-white p-4 shadow-[0_4px_18px_rgba(31,48,35,0.04)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase text-[#687682]">Current session</p>
          <h2 className="mt-1 text-lg font-bold text-[#172936]">Analysis history</h2>
          <p className="mt-1 text-xs text-[#899489]">{totalRuns} {totalRuns === 1 ? "video" : "videos"} processed this session</p>
        </div>
        {totalRuns > 0 && (
          <button type="button" onClick={onClear} title="Clear session history" aria-label="Clear session history" className="rounded-[7px] p-2 text-[#899489] transition hover:bg-[#fff0eb] hover:text-[#ad533d]">
            <Trash2 size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {totalRuns > 0 && (
        <label className="mt-4 flex items-center gap-2 rounded-[7px] border border-[#e3e8e0] bg-[#f8f9f6] px-3 py-2">
          <Search size={15} aria-hidden="true" className="text-[#899489]" />
          <input type="search" value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="Find a video" className="w-full bg-transparent text-sm text-[#26392d] outline-none placeholder:text-[#a0aaa0]" />
        </label>
      )}

      <div className="mt-4 space-y-2">
        {runs.map((run) => {
          const selected = run.id === selectedRunId;
          return (
            <button
              type="button"
              key={run.id}
              onClick={() => onSelectRun(run.id)}
              aria-pressed={selected}
              className={`flex w-full items-center gap-3 rounded-[7px] border p-3 text-left transition ${selected ? "border-[#a9c778] bg-[#f2f7e8]" : "border-[#edf0eb] bg-white hover:border-[#cbd6c2] hover:bg-[#f8faf5]"}`}
            >
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-[7px] ${selected ? "bg-[#dcebbd] text-[#547b2c]" : "bg-[#f0f2ed] text-[#78867a]"}`}>
                <Video size={17} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[#26392d]">{run.sourceName}</span>
                <span className="mt-1 block text-[10px] text-[#899489]">{new Date(run.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              </span>
              <span className="hidden shrink-0 text-right sm:block">
                <span className="block text-sm font-bold text-[#26392d]">{run.detections_count}</span>
                <span className="text-[9px] uppercase text-[#899489]">objects</span>
              </span>
              {selected ? <ArrowDownRight size={16} aria-hidden="true" className="text-[#587d2c]" /> : <ArrowUpRight size={15} aria-hidden="true" className="text-[#a3ada2]" />}
            </button>
          );
        })}

        {totalRuns === 0 && (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-[7px] border border-dashed border-[#d8dfd5] bg-[#fafbf9] px-4 text-center">
            <span className="flex size-9 items-center justify-center rounded-[7px] bg-[#f8efd9] text-[#9a6b1d]"><Video size={17} aria-hidden="true" /></span>
            <p className="mt-3 text-sm font-semibold text-[#415246]">No analyses yet</p>
            <p className="mt-1 text-xs text-[#687682]">Processed videos appear here until this page is reloaded.</p>
          </div>
        )}

        {totalRuns > 0 && runs.length === 0 && (
          <p className="rounded-[7px] bg-[#f8f9f6] px-3 py-5 text-center text-sm text-[#78867a]">No videos match “{searchTerm}”.</p>
        )}
      </div>

      {totalRuns > 0 && (
        <button
          type="button"
          onClick={() => onViewObjects(selectedRun)}
          disabled={!selectedRun}
          className="mt-4 flex w-full items-center gap-3 rounded-[6px] border border-[#d8dfe4] bg-[#f5f7f8] p-3 text-left transition hover:border-[#b53d32] hover:bg-[#fff8f7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-[#f8e9e7] text-[#b53d32]">
            <ScanLine size={18} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#243542]">Detected objects</span>
            <span className="mt-0.5 block text-xs text-[#687682]">View images from the selected analysis</span>
          </span>
          <span className="text-sm font-bold text-[#243542]">{selectedRun?.detected_objects?.length ?? 0}</span>
          <ChevronRight size={17} aria-hidden="true" className="text-[#687682]" />
        </button>
      )}
    </section>
  );
}