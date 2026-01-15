import React, { useState, useEffect, useRef } from 'react';
import { format, isSameDay, subDays, startOfDay, subMonths, isSameMonth } from 'date-fns';
import Header from './components/Header';
import QuickLogForm from './components/QuickLogForm';
import QuickStats from './components/QuickStats';
import HistoryView from './components/HistoryView';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import Navigation from './components/Navigation';
import type { Session, NewSession, Tab, StatsScope, StatsPoint } from './types';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('log');
  const [statsScope, setStatsScope] = useState<StatsScope>('week');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newSession, setNewSession] = useState<NewSession>({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    duration: 15,
    rating: 3,
    notes: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('masturbation_logs');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse logs', e);
      }
    }
  }, []);

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
      notes: newSession.notes,
    };
    setSessions(prev => [session, ...prev].sort((a, b) => b.timestamp - a.timestamp));
    setNewSession({
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      duration: 15,
      rating: 3,
      notes: '',
    });
  };

  const deleteSession = (id: string) => {
    if (id === '__ALL__') {
      if (confirm('Clear all logs? This cannot be undone.')) setSessions([]);
      return;
    }
    if (confirm('Are you sure you want to delete this entry?')) {
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  const getStreak = () => {
    if (sessions.length === 0) return 0;
    let streak = 0;
    let current = startOfDay(new Date());
    const sessionDays = new Set(sessions.map(s => format(s.timestamp, 'yyyy-MM-dd')));
    while (sessionDays.has(format(current, 'yyyy-MM-dd'))) {
      streak++;
      current = subDays(current, 1);
    }
    return streak;
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
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
          const valid = parsed.every((s: any) => s.timestamp && typeof s.duration === 'number');
          if (valid) {
            if (confirm(`Found ${parsed.length} entries. Replace current data (Cancel to merge)?`)) {
              setSessions(parsed as Session[]);
            } else {
              setSessions(prev => {
                const existingIds = new Set(prev.map(s => s.id));
                const newEntries = (parsed as Session[]).filter((s: Session) => !existingIds.has(s.id));
                return [...newEntries, ...prev].sort((a, b) => b.timestamp - a.timestamp);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getStatsData = (): StatsPoint[] => {
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
      <Header streak={getStreak()} />

      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'log' && (
          <div className="space-y-6">
            <QuickLogForm newSession={newSession} setNewSession={setNewSession} onSubmit={handleAddSession} />
            <QuickStats sessions={sessions} />
          </div>
        )}

        {activeTab === 'history' && (
          <HistoryView
            sessions={sessions}
            onDelete={deleteSession}
            onExport={handleExport}
            onImport={handleImport}
            fileInputRef={fileInputRef}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView sessions={sessions} />
        )}

        {activeTab === 'stats' && (
          <StatsView statsScope={statsScope} setStatsScope={setStatsScope} data={statsData} />
        )}
      </main>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
