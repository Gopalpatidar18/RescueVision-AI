import { useMemo, useState } from "react";
import { ArrowLeft, ImageOff, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { mediaUrl } from "../services/api";

function loadStoredRun() {
  try {
    return JSON.parse(sessionStorage.getItem("rescuevision-selected-detection-run") || "null");
  } catch {
    return null;
  }
}

export default function DetectedObjects() {
  const location = useLocation();
  const run = location.state?.run || loadStoredRun();
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("All classes");
  const objects = useMemo(
    () => Array.isArray(run?.detected_objects) ? run.detected_objects : [],
    [run],
  );
  const classes = useMemo(() => [...new Set(objects.map((object) => object.label))].sort(), [objects]);
  const visibleObjects = objects.filter((object) => {
    const matchesSearch = object.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "All classes" || object.label === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-5">
      <Link to="/#recent" className="inline-flex items-center gap-2 text-sm font-semibold text-[#344957] hover:text-[#a3372e]">
        <ArrowLeft size={17} aria-hidden="true" />
        Back to analysis history
      </Link>

      <section className="border-l-4 border-[#b53d32] bg-white px-5 py-5 shadow-[0_2px_8px_rgba(23,41,54,0.04)] sm:px-6">
        <p className="text-[10px] font-bold uppercase text-[#687682]">Object detections / image review</p>
        <h1 className="mt-1 truncate text-2xl font-bold text-[#172936] sm:text-3xl">Detected objects</h1>
        <p className="mt-2 truncate text-sm text-[#596975]">{run?.sourceName || "No analysis selected"}</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#e4e9ed] pt-3 text-sm">
          <span><strong className="text-[#172936]">{objects.length}</strong> <span className="text-[#687682]">object images</span></span>
          <span><strong className="text-[#172936]">{run?.frames_processed ?? 0}</strong> <span className="text-[#687682]">frames analyzed</span></span>
          <span><strong className="text-[#172936]">{classes.length}</strong> <span className="text-[#687682]">object classes</span></span>
        </div>
      </section>

      {objects.length > 0 ? (
        <>
          <section aria-label="Filter detected objects" className="flex flex-col gap-3 border border-[#d8dfe4] bg-white p-3 sm:flex-row sm:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-[5px] border border-[#d8dfe4] px-3 py-2">
              <Search size={16} aria-hidden="true" className="shrink-0 text-[#687682]" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search object classes"
                className="w-full bg-transparent text-sm text-[#243542] outline-none placeholder:text-[#87939b]"
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#596975]">
              <span>Class</span>
              <select
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
                className="min-w-36 rounded-[5px] border border-[#d8dfe4] bg-white px-3 py-2 text-sm text-[#243542]"
              >
                <option>All classes</option>
                {classes.map((className) => <option key={className}>{className}</option>)}
              </select>
            </label>
            <span className="text-xs text-[#687682] sm:min-w-24 sm:text-right">Showing {visibleObjects.length} of {objects.length}</span>
          </section>

          {visibleObjects.length > 0 ? (
            <section aria-label="Detected object images" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleObjects.map((object, index) => (
                <article key={`${object.image_url}-${index}`} className="overflow-hidden border border-[#d8dfe4] bg-white shadow-[0_2px_8px_rgba(23,41,54,0.04)]">
                  <a href={mediaUrl(object.image_url)} target="_blank" rel="noreferrer" aria-label={`Open ${object.label} crop from frame ${object.frame_number}`} className="block aspect-[4/3] bg-[#e9eef1]">
                    <img src={mediaUrl(object.image_url)} alt={`${object.label} detected in frame ${object.frame_number}`} loading="lazy" className="h-full w-full object-contain" />
                  </a>
                  <div className="flex items-center justify-between gap-3 border-t border-[#e4e9ed] px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold capitalize text-[#243542]">{object.label}</p>
                      <p className="mt-0.5 text-[10px] uppercase text-[#687682]">Frame {object.frame_number}</p>
                    </div>
                    <span className="shrink-0 border border-[#d8e3dc] bg-[#f3f8f4] px-2 py-1 text-xs font-bold text-[#36835d]">
                      {Math.round(object.confidence * 100)}%
                    </span>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <p className="border border-[#d8dfe4] bg-white px-4 py-8 text-center text-sm text-[#687682]">No detections match these filters.</p>
          )}
        </>
      ) : (
        <section className="flex min-h-56 flex-col items-center justify-center border border-dashed border-[#c9d3db] bg-white px-5 text-center">
          <ImageOff size={26} aria-hidden="true" className="text-[#87939b]" />
          <h2 className="mt-3 font-bold text-[#243542]">No detected-object images</h2>
          <p className="mt-1 max-w-md text-sm leading-6 text-[#687682]">
            {run ? "This analysis did not return any object crops." : "Select an analysis from the dashboard to review its detections."}
          </p>
          <Link to="/#recent" className="mt-4 text-sm font-bold text-[#a3372e] hover:text-[#762a25]">Return to analysis history</Link>
        </section>
      )}
    </div>
  );
}