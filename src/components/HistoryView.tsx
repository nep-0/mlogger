import React, { useState } from 'react';
import type { RefObject } from 'react';
import { Download, Upload, Trash2, History, Clock, Heart, RefreshCw, ShieldCheck, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import type { Session } from '../types';

interface Props {
  sessions: Session[];
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  syncId: string;
  setSyncId: (id: string) => void;
  onPush: () => void;
  onPull: () => void;
  isSyncing: boolean;
}

const HistoryView: React.FC<Props> = ({ 
  sessions, 
  onDelete, 
  onExport, 
  onImport, 
  fileInputRef,
  syncId,
  setSyncId,
  onPush,
  onPull,
  isSyncing
}) => {
  const [showSync, setShowSync] = useState(false);

  const generateId = () => {
    const newId = crypto.randomUUID().slice(0, 8);
    setSyncId(newId);
  };

  const copyId = () => {
    if (syncId) {
      navigator.clipboard.writeText(syncId);
      alert('Sync ID copied!');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent History</h2>
          <button 
            onClick={() => setShowSync(!showSync)}
            className="text-xs flex items-center gap-1 text-slate-400 hover:text-purple-400 transition-colors"
          >
            {showSync ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showSync ? 'Hide Sync' : 'Cloud Sync'}
          </button>
        </div>

        {showSync && (
          <div className="bg-slate-900 border border-purple-500/30 p-4 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <ShieldCheck size={12} className="text-purple-400" /> Your Secret Sync ID
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={syncId}
                  onChange={(e) => setSyncId(e.target.value)}
                  placeholder="Enter secret key..."
                  className="flex-1 bg-slate-800 border-none rounded-xl p-2.5 text-xs font-mono text-purple-300 placeholder:text-slate-600"
                />
                {!syncId && (
                  <button 
                    onClick={generateId}
                    className="bg-purple-600/20 text-purple-400 px-3 rounded-xl text-[10px] font-bold border border-purple-500/20"
                  >
                    Generate
                  </button>
                )}
                {syncId && (
                  <button 
                    onClick={copyId}
                    className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                )}
              </div>
              <p className="text-[9px] text-slate-500 italic">
                * Treat this as a password. Use the same key on another device to sync.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onPush}
                disabled={!syncId || isSyncing}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-900/20"
              >
                <Upload size={14} className={isSyncing ? 'animate-bounce' : ''} />
                Push to Cloud
              </button>
              <button
                onClick={onPull}
                disabled={!syncId || isSyncing}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-white disabled:opacity-50 disabled:bg-slate-800 text-slate-900 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                Pull from Cloud
              </button>
            </div>
          </div>
        )}

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
