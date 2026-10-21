import { ArrowRight, Check, Cpu, ScanLine, Video } from "lucide-react";

export default function Alerts({ isProcessing }) {
  const stages = [
    { icon: Video, title: "Extract frames", model: "VIDEO INPUT" },
    { icon: Cpu, title: "Enhance visibility", model: "U-NET" },
    { icon: ScanLine, title: "Detect objects", model: "YOLO" },
    { icon: Check, title: "Build result", model: "MP4 OUTPUT" },
  ];

  return (
    <section id="pipeline" className="relative overflow-hidden rounded-[8px] border border-[#263b2d] bg-[#1c3024] p-5 text-white shadow-[0_12px_32px_rgba(25,45,31,0.12)] sm:p-6">
      <div className="absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-16 rounded-full border border-[#49634c]/40" aria-hidden="true" />
      <div className="relative mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase text-[#c8ee7a]">Model workflow</p>
          <h2 className="mt-1 text-xl font-bold">From raw footage to insight</h2>
          <p className="mt-1 text-sm text-[#b3c1b4]">Each frame passes through the same four stages.</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold uppercase ${isProcessing ? "bg-[#f5c56d] text-[#382b13]" : "bg-[#2b4332] text-[#c8ee7a]"}`}>
          <span className={`size-1.5 rounded-full ${isProcessing ? "animate-pulse bg-[#805d1d]" : "bg-[#c8ee7a]"}`} />
          {isProcessing ? "Processing" : "Ready"}
        </span>
      </div>
      <ol className="relative grid gap-2 sm:grid-cols-2">
        {stages.map(({ icon: Icon, title }, index) => (
          <li key={title} className="flex min-w-0 items-center gap-3 rounded-[8px] border border-[#3c5140] bg-[#25392c] p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[7px] bg-[#c8ee7a] text-[#1c3024]">
              <Icon size={17} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{title}</p>
              <p className="mt-0.5 text-[9px] font-bold text-[#a9b9aa]">{stages[index].model}</p>
            </div>
            {index < stages.length - 1 && <ArrowRight size={13} aria-hidden="true" className="hidden text-[#839585] xl:block" />}
          </li>
        ))}
      </ol>
      <div className="relative mt-4 flex items-center justify-between border-t border-[#3c5140] pt-3 text-xs text-[#a9b9aa]">
        <span>Runs locally on this machine</span>
        <span className="font-semibold text-[#c8ee7a]">No cloud upload</span>
      </div>
    </section>
  );
}