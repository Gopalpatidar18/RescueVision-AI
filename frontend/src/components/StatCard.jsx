import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  icon,
  subtitle,
  tone,
}) {
  const tones = {
    green: "bg-[#eaf4d5] text-[#446b24]",
    coral: "bg-[#fae7df] text-[#a84d38]",
    teal: "bg-[#dff0eb] text-[#23745e]",
    amber: "bg-[#f8efd9] text-[#9a6b1d]",
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="rounded-[8px] border border-[#e1e5dd] bg-white p-4 shadow-[0_4px_18px_rgba(31,48,35,0.04)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#78867a]">{title}</p>
          <motion.p
            key={value}
            initial={{ opacity: 0.55, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 truncate text-3xl font-bold tabular-nums text-[#1b2a20]"
          >
            {value}
          </motion.p>
          <p className="mt-1 text-xs text-[#8b968b]">{subtitle}</p>
        </div>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-[8px] ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}