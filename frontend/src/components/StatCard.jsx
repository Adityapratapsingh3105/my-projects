import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'emerald', 
  onClick 
}) {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      text: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300'
    },
    blue: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20 hover:border-sky-500/40',
      text: 'text-sky-400',
      iconBg: 'bg-sky-500/20 text-sky-300'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      text: 'text-rose-400',
      iconBg: 'bg-rose-500/20 text-rose-300'
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      text: 'text-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-300'
    }
  };

  const current = colorStyles[color] || colorStyles.emerald;

  return (
    <div 
      onClick={onClick}
      className={`glass-panel p-5 rounded-2xl border ${current.border} transition-all duration-200 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${current.iconBg} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
