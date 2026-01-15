import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, LineChart, Line } from 'recharts';
import type { StatsScope, StatsPoint } from '../types';

interface Props {
  statsScope: StatsScope;
  setStatsScope: React.Dispatch<React.SetStateAction<StatsScope>>;
  data: StatsPoint[];
}

const StatsView: React.FC<Props> = ({ statsScope, setStatsScope, data }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-center bg-slate-900 p-1 rounded-xl border border-slate-800 mx-auto max-w-[240px]">
        {(['week', 'month', 'year'] as const).map((scope) => (
          <button
            key={scope}
            onClick={() => setStatsScope(scope)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all w-full ${
              statsScope === scope ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {scope}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 h-64">
        <h3 className="text-sm font-medium text-slate-400 mb-4">Activity ({
          statsScope === 'week' ? 'Last 7 Days' : statsScope === 'month' ? 'Last 30 Days' : 'Last 12 Months'
        })</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={statsScope === 'month' ? 4 : 0}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
              itemStyle={{ color: '#a855f7' }}
              labelFormatter={(label, payload) => {
                if (statsScope === 'month' && payload && payload[0]) {
                  return (payload[0] as any).payload.fullDate;
                }
                return label as string;
              }}
            />
            <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 h-64">
        <h3 className="text-sm font-medium text-slate-400 mb-4">Avg Duration Trends</h3>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={statsScope === 'month' ? 4 : 0}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
              labelFormatter={(label, payload) => {
                if (statsScope === 'month' && payload && payload[0]) {
                  return (payload[0] as any).payload.fullDate;
                }
                return label as string;
              }}
            />
            <Line type="monotone" dataKey="avg" stroke="#ec4899" strokeWidth={2} dot={{ r: 4, fill: '#ec4899' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsView;
