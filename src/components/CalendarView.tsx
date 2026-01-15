import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { isSameDay } from 'date-fns';
import type { Session } from '../types';

interface Props {
  sessions: Session[];
}

const CalendarView: React.FC<Props> = ({ sessions }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center">
        <h3 className="text-sm font-medium text-slate-400 mb-4 w-full px-2">Activity Calendar</h3>
        <style>{`
          .rdp {
            --rdp-accent-color: #a855f7;
            --rdp-background-color: #1e293b;
            color: white;
            margin: 0;
          }
          .rdp-day { border-radius: 8px !important; }
          .rdp-day:hover { background-color: rgba(168, 85, 247, 0.2) !important; }
          .rdp-head_cell { font-size: 0.75rem; font-weight: 600; color: #64748b; }
        `}</style>
        <DayPicker
          modifiers={{
            level1: (date) => sessions.filter(s => isSameDay(new Date(s.timestamp), date)).length === 1,
            level2: (date) => sessions.filter(s => isSameDay(new Date(s.timestamp), date)).length === 2,
            level3: (date) => sessions.filter(s => isSameDay(new Date(s.timestamp), date)).length === 3,
            level4: (date) => sessions.filter(s => isSameDay(new Date(s.timestamp), date)).length >= 4,
          }}
          modifiersStyles={{
            level1: { backgroundColor: '#3b0764', color: '#d8b4fe' },
            level2: { backgroundColor: '#6b21a8', color: 'white' },
            level3: { backgroundColor: '#a855f7', color: 'white' },
            level4: { backgroundColor: '#d8b4fe', color: '#3b0764' }
          }}
        />
        <div className="flex justify-center items-center gap-2 mt-4 text-[10px] text-slate-500 border-t border-slate-800 pt-4 w-full">
          <span>1 Session</span>
          <div className="w-3 h-3 rounded-sm bg-[#3b0764]" />
          <div className="w-3 h-3 rounded-sm bg-[#6b21a8]" />
          <div className="w-3 h-3 rounded-sm bg-[#a855f7]" />
          <div className="w-3 h-3 rounded-sm bg-[#d8b4fe]" />
          <span>4+ Sessions</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
