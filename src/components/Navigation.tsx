import React from 'react';
import { PlusCircle, Calendar as CalendarIcon, BarChart2, History } from 'lucide-react';
import type { Tab } from '../types';

interface Props {
  activeTab: Tab;
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
}

const Navigation: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  return (
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
  );
};

export default Navigation;
