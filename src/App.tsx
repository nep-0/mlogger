import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  BarChart2, 
  PlusCircle, 
  History, 
  Trash2,
  Clock,
  Download,
  Upload,
  Heart
} from 'lucide-react';
import { format, isSameDay, subDays, startOfDay, subMonths, isSameMonth } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

// Define Types
interface Session {
  id: string;
  timestamp: number;
  duration: number; // minutes
  rating?: number;
  notes?: string;
}

const App: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<'log' | 'stats' | 'calendar' | 'history'>('log');
  const [statsScope, setStatsScope] = useState<'week' | 'month' | 'year'>('week');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Session Form State
  const [newSession, setNewSession] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    duration: 15,
    rating: 3,
    notes: ''
  });

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('masturbation_logs');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse logs", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('masturbation_logs', JSON.stringify(sessions));
  }, [sessions]);

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date(`${newSession.date}T${newSession.time}`).getTime();
    const session: Session = {
      id: crypto.randomUUID(),
      timestamp,
      duration: Number(newSession.duration),
      rating: newSession.rating,
      notes: newSession.notes
    };
    setSessions(prev => [session, ...prev].sort((a, b) => b.timestamp - a.timestamp));
    // Reset form
    setNewSession({
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      duration: 15,
      rating: 3,
      notes: ''
    });
  };

  const deleteSession = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  // Helper to get streak
  const getStreak = () => {
    if (sessions.length === 0) return 0;
    let streak = 0;
    let current = startOfDay(new Date());
    
    // This is a simple daily streak
    const sessionDays = new Set(sessions.map(s => format(s.timestamp, 'yyyy-MM-dd')));
    
    while (sessionDays.has(format(current, 'yyyy-MM-dd'))) {
      streak++;
      current = subDays(current, 1);
    }
    return streak;
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mlogger-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const parsed = JSON.parse(result);
        if (Array.isArray(parsed)) {
            // Simple validation: check if items have timestamp and duration
            const valid = parsed.every(s => s.timestamp && typeof s.duration === 'number');
            if (valid) {
               if (confirm(`Found ${parsed.length} entries. Replace current data (Cancel to merge)?`)) {
                   setSessions(parsed);
               } else {
                   // Merge logic: avoid duplicates by ID
                   setSessions(prev => {
                       const existingIds = new Set(prev.map(s => s.id));
                       const newEntries = parsed.filter((s: Session) => !existingIds.has(s.id));
                       return [...newEntries, ...prev].sort((a,b) => b.timestamp - a.timestamp);
                   });
               }
               alert('Import successful!');
            } else {
                alert('Invalid data format.');
            }
        }
      } catch (err) {
        alert('Failed to parse file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getStatsData = () => {
    if (statsScope === 'week') {
      return Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i);
        const daySessions = sessions.filter(s => isSameDay(new Date(s.timestamp), d));
        const avg = daySessions.length > 0 
          ? daySessions.reduce((acc, s) => acc + s.duration, 0) / daySessions.length 
          : 0;
        return { name: format(d, 'EEE'), count: daySessions.length, avg };
      });
    } else if (statsScope === 'month') {
      return Array.from({ length: 30 }).map((_, i) => {
        const d = subDays(new Date(), 29 - i);
        const daySessions = sessions.filter(s => isSameDay(new Date(s.timestamp), d));
        const avg = daySessions.length > 0
          ? daySessions.reduce((acc, s) => acc + s.duration, 0) / daySessions.length
          : 0;
        return { name: format(d, 'd'), fullDate: format(d, 'MMM d'), count: daySessions.length, avg };
      });
    } else {
      // Year - last 12 months
      return Array.from({ length: 12 }).map((_, i) => {
        const d = subMonths(new Date(), 11 - i);
        const monthSessions = sessions.filter(s => isSameMonth(new Date(s.timestamp), d));
        const avg = monthSessions.length > 0
          ? monthSessions.reduce((acc, s) => acc + s.duration, 0) / monthSessions.length
          : 0;
        return { name: format(d, 'MMM'), count: monthSessions.length, avg };
      });
    }
  };

  const statsData = getStatsData();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Header */}
      <header className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          MLogger
        </h1>
        <div className="flex items-center gap-2">
          <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span className="text-orange-500">🔥</span> {getStreak()} Day Streak
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'log' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PlusCircle className="text-purple-400" /> Quick Log
              </h2>
              <form onSubmit={handleAddSession} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm"
                      value={newSession.date}
                      onChange={e => setNewSession({...newSession, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Time</label>
                    <input 
                      type="time" 
                      className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm"
                      value={newSession.time}
                      onChange={e => setNewSession({...newSession, time: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Duration (min)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm"
                    value={newSession.duration}
                    onChange={e => setNewSession({...newSession, duration: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Rating</label>
                  <div className="flex gap-4 justify-center bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setNewSession({...newSession, rating: level})}
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
                    onChange={e => setNewSession({...newSession, notes: e.target.value})}
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

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
               <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Quick Stats</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl">
                    <p className="text-2xl font-bold">{sessions.length}</p>
                    <p className="text-xs text-slate-500">Total Entries</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl">
                    <p className="text-2xl font-bold">
                      {sessions.length > 0 
                        ? Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length)
                        : 0}m
                    </p>
                    <p className="text-xs text-slate-500">Avg Duration</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recent History</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleExport}
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
                    if(confirm('Clear all logs? This cannot be undone.')) setSessions([]);
                  }}
                  disabled={sessions.length === 0}
                  className="bg-slate-800 hover:bg-red-900/30 text-red-400 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} /> Clear All
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImport}
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
                      {session.rating && <span className="flex items-center gap-1 text-pink-400"><Heart size={10} className="fill-pink-400" /> {session.rating}</span>}
                    </div>
                    {session.notes && <p className="text-[10px] text-slate-500 mt-2 italic bg-slate-800/30 p-1.5 rounded">"{session.notes}"</p>}
                  </div>
                  <button 
                    onClick={() => deleteSession(session.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
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
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="flex justify-center bg-slate-900 p-1 rounded-xl border border-slate-800 mx-auto max-w-[240px]">
              {(['week', 'month', 'year'] as const).map((scope) => (
                <button
                  key={scope}
                  onClick={() => setStatsScope(scope)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all w-full ${
                    statsScope === scope 
                      ? 'bg-slate-700 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {scope}
                </button>
              ))}
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 h-64">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Activity ({statsScope === 'week' ? 'Last 7 Days' : statsScope === 'month' ? 'Last 30 Days' : 'Last 12 Months'})</h3>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={statsData}>
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
                        return payload[0].payload.fullDate;
                      }
                      return label;
                    }}
                  />
                  <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 h-64">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Avg Duration Trends</h3>
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={statsData}>
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
                        return payload[0].payload.fullDate;
                      }
                      return label;
                    }}
                  />
                  <Line type="monotone" dataKey="avg" stroke="#ec4899" strokeWidth={2} dot={{ r: 4, fill: '#ec4899' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 px-6 py-3 flex justify-between items-center z-20">
        <button 
          onClick={() => setActiveTab('log')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'log' ? 'text-purple-400' : 'text-slate-500'}`}
        >
          <PlusCircle size={24} />
          <span className="text-[10px]">Log</span>
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'calendar' ? 'text-purple-400' : 'text-slate-500'}`}
        >
          <CalendarIcon size={24} />
          <span className="text-[10px]">Calendar</span>
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'stats' ? 'text-purple-400' : 'text-slate-500'}`}
        >
          <BarChart2 size={24} />
          <span className="text-[10px]">Stats</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-purple-400' : 'text-slate-500'}`}
        >
          <History size={24} />
          <span className="text-[10px]">History</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
