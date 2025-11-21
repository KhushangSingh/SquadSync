import React from 'react';
import { Zap, UserCircle } from 'lucide-react';

const Header = ({ userName, onOpenProfile }) => {
  return (
    // CHANGED: bg-white/90
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg rotate-3 hover:rotate-0 transition-transform">
            <Zap size={24} className="text-white fill-current" />
          </div>
          <h1 className="text-2xl font-black text-stone-800 tracking-tight">
            Squad<span className="text-violet-600">Sync</span>
          </h1>
        </div>
        
        <button onClick={onOpenProfile} className="group flex items-center gap-3 px-4 py-2 bg-white hover:bg-stone-50 rounded-full border border-stone-200 shadow-sm hover:shadow-md transition-all">
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold group-hover:text-violet-500 transition-colors">Player</span>
            <span className="text-sm font-bold text-stone-800 max-w-[120px] truncate">{userName}</span>
          </div>
          <UserCircle size={36} className="text-stone-300 group-hover:text-violet-600 transition-colors" />
        </button>
      </div>
    </header>
  );
};

export default Header;