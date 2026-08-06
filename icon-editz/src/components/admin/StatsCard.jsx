import React from 'react'

export default function StatsCard({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  accentColor = 'primary',
  subtitle,
}) {
  const isPositive = changeType === 'positive'

  const colorStyles = {
    primary: 'from-primary/20 to-primary/5 text-primary border-primary/30',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30',
    indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/30',
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30',
  }[accentColor] || 'from-primary/20 to-primary/5 text-primary border-primary/30'

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#120c24]/80 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:scale-[1.01]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br border ${colorStyles}`}>
            <Icon className="text-xl" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">{value}</span>
        {change && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
              isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-2 text-xs text-text-muted">{subtitle}</p>}
    </div>
  )
}
