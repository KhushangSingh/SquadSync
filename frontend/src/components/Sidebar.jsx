import React from 'react';
import { Home, PlusCircle, UserCheck, LogOut, Zap, User, Compass, X } from 'lucide-react';
import { AVATARS } from '../constants';

const Sidebar = ({ activeTab, isOpen, onClose, setActiveTab, onLogout, userName, userAvatar, onOpenProfile, pendingRequestsCount }) => {
  const isGuest = !userName || userName === "Guest User";
  const displayName = isGuest ? "Sign in / Sign up" : userName;

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-stone-100 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
    `}>
      {/* Logo Area */}
      <div className="h-20 flex items-center px-8 border-b border-stone-50 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg rotate-3">
            <Zap size={18} className="text-white fill-current" />
          </div>
          <h1 className="text-xl font-black text-stone-800 tracking-tight">
            Squad<span className="text-violet-600">Sync</span>
          </h1>
        </div>
        {/* Mobile Close Button */}
        <button onClick={onClose} className="lg:hidden text-stone-400 hover:text-stone-600 transition-colors">
           <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        <button 
            onClick={() => setActiveTab('home')} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${activeTab === 'home' ? 'bg-[#F8F5FF] text-violet-700 shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'}`}
        >
            <Compass size={20} /> Find Squads
        </button>
        
        <button 
            onClick={() => setActiveTab('created')} 
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${activeTab === 'created' ? 'bg-[#F8F5FF] text-violet-700 shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'}`}
        >
            <div className="flex items-center gap-3"><PlusCircle size={20} /> My Squads</div>
            {pendingRequestsCount > 0 ? <div className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">{pendingRequestsCount}</div> : isGuest ? <span className="text-[10px] font-bold bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full">Login</span> : null}
        </button>
        
        <button 
            onClick={() => setActiveTab('joined')} 
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${activeTab === 'joined' ? 'bg-[#F8F5FF] text-violet-700 shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'}`}
        >
             <div className="flex items-center gap-3"><UserCheck size={20} /> Joined Squads</div>
             {isGuest && <span className="text-[10px] font-bold bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full">Login</span>}
        </button>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-stone-50 bg-[#FBFBFB]">
        <div 
            onClick={onOpenProfile} 
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer transition-all mb-3 group"
        >
          {isGuest ? (
             <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors"><User size={20} /></div>
          ) : (
             <img src={AVATARS[userAvatar || 0]} alt="Profile" className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 group-hover:border-violet-300 transition-colors" />
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Profile</span>
            <span className={`text-sm font-bold truncate ${isGuest ? 'text-violet-600' : 'text-stone-800'}`}>{displayName}</span>
          </div>
        </div>
        {!isGuest && (
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm">
              <LogOut size={16} /> Logout
            </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;