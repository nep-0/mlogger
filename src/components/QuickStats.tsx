import React from 'react';
import type { Session } from '../types';

interface Props {
  sessions: Session[];
}

const QuickStats: React.FC<Props> = ({ sessions }) => {
  const total = sessions.length;
  const avg = total > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / total)
    : 0;

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Quick Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-xl">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-slate-500">Total Entries</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl">
          <p className="text-2xl font-bold">{avg}m</p>
          <p className="text-xs text-slate-500">Avg Duration</p>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
