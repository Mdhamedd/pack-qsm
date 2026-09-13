import React from 'react';

export default function KpiCard({ icon: Icon, label, value, colorClass = 'text-steel-50', accent = 'bg-steel-800' }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`${accent} rounded-xl p-3`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div className="min-w-0">
        <p className="text-steel-400 text-xs md:text-sm font-semibold truncate">{label}</p>
        <p className={`text-2xl font-black ${colorClass}`}>{value}</p>
      </div>
    </div>
  );
}
