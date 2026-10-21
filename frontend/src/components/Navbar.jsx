import { useEffect, useState } from "react";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Navbar() {
  const [backendOnline, setBackendOnline] = useState(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    let active = true;
    const checkBackend = async () => {
      try {
        await api.get("/");
        if (active) setBackendOnline(true);
      } catch {
        if (active) setBackendOnline(false);
      }
    };

    checkBackend();
    const interval = window.setInterval(checkBackend, 15000);
    const clockInterval = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.clearInterval(clockInterval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 flex min-h-[68px] items-center justify-between border-b border-[#d8dfe4] bg-[#f5f7f8]/95 px-4 backdrop-blur sm:px-7 xl:px-10">
      <div>
        <p className="text-xs font-semibold uppercase text-[#687682]">Fire service / incident support</p>
        <p className="mt-0.5 text-sm font-bold text-[#172936]">Video analysis console</p>
      </div>
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-2 text-right sm:flex">
          <Clock3 size={16} aria-hidden="true" className="text-[#687682]" />
          <div>
            <p className="text-sm font-bold tabular-nums text-[#172936]">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
            <p className="text-[10px] text-[#687682]">
              {currentTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-[6px] border border-[#d8dfe4] bg-white px-3 py-2 text-xs font-semibold text-[#43515c]" aria-live="polite">
          <span className={`size-2 rounded-full ${backendOnline === null ? "bg-[#d6a341]" : backendOnline ? "bg-[#36835d]" : "bg-[#b53d32]"}`} />
          <span className="hidden sm:inline">{backendOnline === null ? "Checking API" : backendOnline ? "API connected" : "API offline"}</span>
          <span className="sm:hidden">{backendOnline ? "Online" : "API"}</span>
        </div>
        <Link to="/#upload" className="inline-flex items-center gap-2 rounded-[6px] bg-[#b53d32] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#963329] sm:px-4 sm:text-sm">
          Analyze video
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}