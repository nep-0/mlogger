import React from 'react';
import { PlusCircle, Heart } from 'lucide-react';
import type { NewSession } from '../types';

interface Props {
  newSession: NewSession;
  setNewSession: React.Dispatch<React.SetStateAction<NewSession>>;
  onSubmit: (e: React.FormEvent) => void;
}

const QuickLogForm: React.FC<Props> = ({ newSession, setNewSession, onSubmit }) => {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <PlusCircle className="text-purple-400" /> Quick Log
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Date</label>
            <input
              type="date"
              className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm"
              value={newSession.date}
              onChange={e => setNewSession({ ...newSession, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Time</label>
            <input
              type="time"
              className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm"
              value={newSession.time}
              onChange={e => setNewSession({ ...newSession, time: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Duration (min)</label>
          <input
            type="number"
            className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm"
            value={newSession.duration}
            onChange={e => setNewSession({ ...newSession, duration: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-2">Rating</label>
          <div className="flex gap-4 justify-center bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setNewSession({ ...newSession, rating: level })}
                className="transition-transform active:scale-95 focus:outline-none"
              >
                <Heart
                  size={28}
                  className={`${
                    level <= (newSession.rating || 0)
                      ? 'fill-pink-500 text-pink-500'
                      : 'text-slate-600'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 px-1 mt-1">
            <span>Poor</span>
            <span>Great</span>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Notes (Optional)</label>
          <textarea
            className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm h-16 resize-none"
            placeholder="How was it? Tags, feelings..."
            value={newSession.notes}
            onChange={e => setNewSession({ ...newSession, notes: e.target.value })}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20"
        >
          Save Entry
        </button>
      </form>
    </div>
  );
};

export default QuickLogForm;
