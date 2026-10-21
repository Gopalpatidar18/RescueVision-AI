import { History, LayoutDashboard, ShieldCheck, Upload } from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="border-b border-[#263b4a] bg-[#172936] px-4 py-3 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-[248px] lg:flex-col lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <a href="#dashboard" className="flex items-center gap-3" aria-label="RescueVision dashboard">
        <span className="flex size-10 items-center justify-center rounded-[6px] bg-[#b53d32] text-white">
          <ShieldCheck size={22} aria-hidden="true" />
        </span>
        <span>
          <span className="block font-bold text-white">RescueVision</span>
          <span className="block text-xs text-[#b7c3cb]">FIREGROUND VIDEO REVIEW</span>
        </span>
      </a>

      <nav aria-label="Dashboard sections" className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:flex-col lg:overflow-visible">
        <NavLink to="/#dashboard" icon={<LayoutDashboard size={17} aria-hidden="true" />} label="Overview" active />
        <NavLink to="/#upload" icon={<Upload size={17} aria-hidden="true" />} label="New analysis" />
        <NavLink to="/#recent" icon={<History size={17} aria-hidden="true" />} label="Recent runs" />
      </nav>

    </aside>
  );
}

function NavLink({ to, icon, label, active = false }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`inline-flex shrink-0 items-center gap-3 rounded-[6px] px-3 py-2.5 text-sm font-semibold transition-colors lg:w-full ${active ? "bg-white text-[#172936]" : "text-[#c1cbd1] hover:bg-[#263b4a] hover:text-white"}`}
    >
      {icon}
      {label}
    </Link>
  );
}