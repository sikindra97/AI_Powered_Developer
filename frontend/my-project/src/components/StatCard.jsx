export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  index = 0,
}) {
  const colors = {
    blue: {
      icon: "bg-blue-500/10 text-blue-600",
      glow: "group-hover:shadow-blue-500/10",
      line: "from-blue-500 to-cyan-400",
    },
    violet: {
      icon: "bg-violet-500/10 text-violet-600",
      glow: "group-hover:shadow-violet-500/10",
      line: "from-violet-500 to-fuchsia-400",
    },
    amber: {
      icon: "bg-amber-500/10 text-amber-600",
      glow: "group-hover:shadow-amber-500/10",
      line: "from-amber-500 to-orange-400",
    },
    rose: {
      icon: "bg-rose-500/10 text-rose-600",
      glow: "group-hover:shadow-rose-500/10",
      line: "from-rose-500 to-pink-400",
    },
    emerald: {
      icon: "bg-emerald-500/10 text-emerald-600",
      glow: "group-hover:shadow-emerald-500/10",
      line: "from-emerald-500 to-cyan-400",
    },
  };

  const theme = colors[color] || colors.blue;

  return (
    <>
      <style>{`
        @keyframes statReveal {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        style={{
          animation: `statReveal 0.55s ease-out ${index * 90}ms both`,
        }}
        className={`group relative h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_35px_-20px_rgba(15,23,42,0.3)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl ${theme.glow}`}
      >
        {/* Top gradient line */}
        <div
          className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${theme.line} opacity-70`}
        />

        {/* Background glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-slate-100 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              {title}
            </p>

            <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              {value}
            </p>

            {subtitle && (
              <p className="mt-1.5 text-xs font-medium text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.icon} shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
            {icon}
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full w-2/3 rounded-full bg-gradient-to-r ${theme.line} transition-all duration-700 group-hover:w-full`}
          />
        </div>
      </div>
    </>
  );
}