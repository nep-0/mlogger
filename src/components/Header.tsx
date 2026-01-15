import React from 'react';

interface Props {
  streak: number;
}

const Header: React.FC<Props> = ({ streak }) => {
  return (
    <header className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        MLogger
      </h1>
      <div className="flex items-center gap-2">
        <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <span className="text-orange-500">🔥</span> {streak} Day Streak
        </div>
      </div>
    </header>
  );
};

export default Header;
