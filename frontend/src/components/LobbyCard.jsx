import React from 'react';
import { MapPin, Trophy, Pencil, Trash2, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from './UI';
import { getCategoryStyle } from '../constants';

export const LobbySkeleton = () => (
  <div className="bg-white p-5 rounded-[2rem] border border-stone-100 shadow-sm h-[280px] animate-pulse flex flex-col">
    <div className="flex justify-between mb-4">
      <div className="w-24 h-6 bg-stone-100 rounded-lg"></div>
      <div className="w-16 h-6 bg-stone-100 rounded-lg"></div>
    </div>
    <div className="w-3/4 h-8 bg-stone-100 rounded-xl mb-3"></div>
    <div className="w-full h-16 bg-stone-50 rounded-xl mb-auto"></div>
    <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-50">
      <div className="w-24 h-8 bg-stone-100 rounded-full"></div>
      <div className="w-24 h-10 bg-stone-100 rounded-xl"></div>
    </div>
  </div>
);

const LobbyCard = ({ lobby, userId, onViewDetails, onDelete, onEdit }) => {
  const catStyle = getCategoryStyle(lobby.category);
  const isHost = lobby.hostId === userId;
  const isMember = lobby.players.some(p => p.uid === userId);
  const isFull = lobby.players.length >= lobby.maxPlayers;

  return (
    <div className="group bg-white p-1 rounded-[2.5rem] border border-stone-100 hover:border-violet-200 transition-all duration-300 hover:shadow-xl hover:shadow-violet-100/50 flex flex-col h-full relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
       
       <div className="p-6 pb-2 flex-1">
          <div className="flex justify-between items-start mb-4">
             <Badge className={catStyle.badge}>
                <div className="flex items-center gap-1.5"><catStyle.icon size={12} /> {catStyle.label}</div>
             </Badge>
             {lobby.skill && <span className="text-[10px] font-extrabold bg-stone-100 text-stone-500 px-2 py-1 rounded-md uppercase tracking-wider">{lobby.skill}</span>}
          </div>
          
          <h3 className="text-xl font-black text-stone-800 mb-2 leading-tight group-hover:text-violet-700 transition-colors line-clamp-2">{lobby.title}</h3>
          <div className="flex items-center gap-2 text-xs font-bold text-stone-400 mb-4">
             <MapPin size={14} className="text-stone-300" /> 
             <span className="truncate max-w-[150px]">{lobby.location}</span>
             <span className="w-1 h-1 rounded-full bg-stone-300"></span>
             <span>{new Date(lobby.eventDate).toLocaleDateString()}</span>
          </div>
       </div>

       <div className="mt-auto bg-stone-50/50 p-4 rounded-[2rem] flex items-center justify-between border-t border-stone-50 group-hover:bg-white group-hover:border-stone-100 transition-all">
          <div className="flex -space-x-2 overflow-hidden pl-1">
             {lobby.players.slice(0, 3).map((p, i) => (
               <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center text-[10px] font-black text-violet-600 shadow-sm ring-1 ring-stone-100" style={{ backgroundColor: `hsl(${p.name.length * 40}, 70%, 95%)` }}>
                 {p.name[0]}
               </div>
             ))}
             {lobby.players.length > 3 && (
               <div className="w-8 h-8 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-stone-500 shadow-sm">+{lobby.players.length - 3}</div>
             )}
          </div>

          <div className="flex items-center gap-2">
             {isHost && (
               <>
                 <button onClick={(e) => { e.stopPropagation(); onEdit(lobby); }} className="w-9 h-9 rounded-xl bg-white text-stone-400 hover:text-violet-600 hover:bg-violet-50 border border-stone-200 hover:border-violet-100 flex items-center justify-center transition-all"><Pencil size={16}/></button>
                 <button onClick={(e) => { e.stopPropagation(); onDelete(lobby._id); }} className="w-9 h-9 rounded-xl bg-white text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 hover:border-rose-100 flex items-center justify-center transition-all"><Trash2 size={16}/></button>
               </>
             )}
             <button onClick={() => onViewDetails(lobby)} className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 ${isMember ? 'bg-emerald-100 text-emerald-700' : isFull ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-stone-900 text-white hover:bg-black'}`}>
                {isMember ? 'View' : isFull ? 'Full' : 'Join'}
             </button>
          </div>
       </div>
    </div>
  );
};

export default LobbyCard;