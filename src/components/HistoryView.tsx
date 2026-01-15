import React from 'react';
import type { RefObject } from 'react';
import { Download, Upload, Trash2, History, Clock, Heart } from 'lucide-react';
import { format } from 'date-fns';
import type { Session } from '../types';

interface Props {
  sessions: Session[];
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

const HistoryView: React.FC<Props> = ({ sessions, onDelete, onExport, onImport, fileInputRef }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent History</h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onExport}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Upload size={14} /> Import
          </button>
          <button
            onClick={() => {
              if (confirm('Clear all logs? This cannot be undone.')) onDelete('__ALL__');
            }}
            disabled={sessions.length === 0}
            className="bg-slate-800 hover:bg-red-900/30 text-red-400 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} /> Clear All
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImport}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
          <History className="mx-auto text-slate-700 mb-2" size={48} />
          <p className="text-slate-500">No entries yet.</p>
        </div>
      ) : (
        sessions.map(session => (
          <div key={session.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center group">
            <div>
              <p className="font-semibold text-sm">{format(session.timestamp, 'MMM d, h:mm a')}</p>
              <div className="flex gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1"><Clock size={12} /> {session.duration} min</span>
                {session.rating && (
                  <span className="flex items-center gap-1 text-pink-400"><Heart size={10} className="fill-pink-400" /> {session.rating}</span>
                )}
              </div>
              {session.notes && <p className="text-[10px] text-slate-500 mt-2 italic bg-slate-800/30 p-1.5 rounded">"{session.notes}"</p>}
            </div>
            <button
              onClick={() => onDelete(session.id)}
              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default HistoryView;
