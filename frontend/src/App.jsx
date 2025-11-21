import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Plus, MapPin, Trophy, User, Layers, Compass, AlertTriangle, UserMinus, 
  Check, Smartphone, Mail, Eye, EyeOff, Phone, IdCard, AtSign, LogOut, Pencil,  
  UserX, Bell, Calendar, MessageCircle, Menu, Crown, ArrowRight, UserCheck, Send
} from 'lucide-react';

import { API_URL, SOCKET_URL, CATEGORIES, SKILL_LEVELS, AVATARS, getCategoryStyle } from './constants';
import { Modal, Badge } from './components/UI';
import Sidebar from './components/Sidebar';
import LobbyCard, { LobbySkeleton } from './components/LobbyCard';
import Auth from './components/Auth'; 

export default function App() {
  const [user, setUser] = useState(null); 
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); 
  const [filter, setFilter] = useState('all');
  
  // Responsive Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isRequestSentOpen, setIsRequestSentOpen] = useState(false);
  const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isTransferConfirmOpen, setIsTransferConfirmOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  
  const [selectedLobby, setSelectedLobby] = useState(null);
  const [lobbyToDelete, setLobbyToDelete] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const [editingLobby, setEditingLobby] = useState(null); 
  const [transferTarget, setTransferTarget] = useState(null);

  const [formData, setFormData] = useState({
    title: '', description: '', category: 'hackathon', location: '', maxPlayers: 4, skill: '', eventDate: ''
  });

  const [joinRequestData, setJoinRequestData] = useState({
    name: '', phone: '', email: '', message: ''
  });

  useEffect(() => {
    const init = async () => {
      const storedUser = JSON.parse(localStorage.getItem('squadsync_user'));
      if (storedUser) setUser(storedUser);
      fetchLobbies();
    };
    init();

    const socket = io(SOCKET_URL);
    
    socket.on('lobbies_updated', () => {
        axios.get(`${API_URL}/lobbies`).then(res => {
            setLobbies(res.data);
            if (selectedLobby) {
                const updatedCurrent = res.data.find(l => l._id === selectedLobby._id);
                if (updatedCurrent) setSelectedLobby(updatedCurrent);
            }
        });
    });
    
    return () => socket.disconnect();
  }, [selectedLobby]);

  const pendingRequestsCount = useMemo(() => {
    if (!user) return 0;
    return lobbies.reduce((count, lobby) => {
        if (lobby.hostId === user.uid && lobby.requests) {
            return count + lobby.requests.length;
        }
        return count;
    }, 0);
  }, [lobbies, user]);

  const displayLobbies = useMemo(() => {
    let data = [];
    const currentUid = user ? user.uid : 'guest'; 
    
    if (activeTab === 'home') { 
        data = lobbies.filter(l => l.hostId !== currentUid); 
        if (filter !== 'all') data = data.filter(l => l.category === filter); 
    } else if (activeTab === 'created') { 
        data = user ? lobbies.filter(l => l.hostId === currentUid) : []; 
    } else if (activeTab === 'joined') { 
        data = user ? lobbies.filter(l => l.players.some(p => p.uid === currentUid) && l.hostId !== currentUid) : []; 
    }
    return data;
  }, [lobbies, activeTab, filter, user]);

  const getEmptyMessage = () => {
    if (!user && (activeTab === 'created' || activeTab === 'joined')) return "Please login to view your squads.";
    if (activeTab === 'created') return "You haven't created any squads yet.";
    if (activeTab === 'joined') return "You haven't joined any squads yet.";
    return "No active squads found.";
  };
  
  const checkAuth = () => {
    if (!user) {
      setIsAuthOpen(true);
      return false;
    }
    return true;
  };

  const handleAuthSuccess = (userData, isNewUser) => {
    setUser(userData);
    localStorage.setItem('squadsync_user', JSON.stringify(userData));
    toast.success(`Welcome, ${userData.name}!`);
    if (isNewUser) setIsProfileModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('squadsync_user');
    setUser(null);
    setActiveTab('home'); 
    setIsLogoutModalOpen(false);
    toast.success("Logged out successfully");
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      await axios.delete(`${API_URL}/users/${user.uid}`);
      localStorage.removeItem('squadsync_user');
      setUser(null);
      setIsDeleteAccountModalOpen(false);
      setIsProfileModalOpen(false);
      setActiveTab('home');
      toast.success("Account deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account");
    }
  };

  const fetchLobbies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/lobbies`);
      setLobbies(res.data);
    } catch (err) { 
      toast.error("Failed to load squads"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const updatedUser = { ...user };
    setUser(updatedUser);
    localStorage.setItem('squadsync_user', JSON.stringify(updatedUser));
    try { 
        await axios.post(`${API_URL}/users`, updatedUser); 
        setIsProfileModalOpen(false);
        toast.success("Profile updated!");
    } catch (err) { toast.error("Update failed"); }
  };

  const handleViewMember = async (player) => {
    if (!checkAuth()) return; 
    if (player.uid === user.uid) { setIsProfileModalOpen(true); return; }
    
    try {
        const res = await axios.get(`${API_URL}/users/${player.uid}`);
        const memberData = res.data;

        setViewingMember({
            name: memberData.name,
            uid: player.uid,
            avatarId: memberData.avatarId !== undefined ? memberData.avatarId : (player.uid.charCodeAt(0) % 8), 
            bio: memberData.bio || "No bio provided.", 
            phone: memberData.phone, 
            email: memberData.email, 
            showContact: memberData.showContact 
        });
    } catch (err) {
        console.error(err);
        setViewingMember({
           name: player.name,
           uid: player.uid,
           avatarId: 0,
           bio: "Could not load profile.",
           showContact: false
        });
    }
  };

  const openCreateModal = () => {
      setEditingLobby(null);
      setFormData({ title: '', description: '', category: 'hackathon', location: '', maxPlayers: 4, skill: '', eventDate: '' });
      setIsHostModalOpen(true);
  };

  const openEditModal = (lobby) => {
      setEditingLobby(lobby);
      const dateStr = lobby.eventDate ? new Date(lobby.eventDate).toISOString().slice(0, 16) : '';
      setFormData({
          title: lobby.title, description: lobby.description, category: lobby.category,
          location: lobby.location, maxPlayers: lobby.maxPlayers, skill: lobby.skill, eventDate: dateStr
      });
      setIsHostModalOpen(true);
  };

  const handleLobbySubmit = async (e) => {
    e.preventDefault();
    if (!checkAuth()) return;

    const payload = {
        ...formData, 
        hostId: user.uid, hostName: user.name,
        hostMeta: { phone: user.showContact ? user.phone : null, email: user.showContact ? user.email : null },
    };

    if (!editingLobby) {
        payload.players = [{ uid: user.uid, name: user.name }];
    }

    try {
      if (editingLobby) {
          await axios.put(`${API_URL}/lobbies/${editingLobby._id}`, payload); 
          toast.success("Squad updated!");
      } else {
          await axios.post(`${API_URL}/lobbies`, payload);
          toast.success("Squad created successfully!");
          setActiveTab('created');
      }
      setIsHostModalOpen(false);
    } catch (err) { toast.error("Operation failed"); }
  };

  const handleDelete = async (id) => {
     if (!checkAuth()) return;
     setLobbyToDelete(id);
  };

  const executeDisband = async () => { 
      if (!lobbyToDelete || !user) return; 
      try { 
          await axios.delete(`${API_URL}/lobbies/${lobbyToDelete}`, { data: { uid: user.uid } }); 
          setLobbyToDelete(null); 
          toast.success("Squad disbanded");
      } catch (err) { toast.error("Error disbanding"); } 
  };

  const handleJoinClick = () => {
    if (!checkAuth()) return;
    setJoinRequestData({ name: user.name, phone: user.phone || '', email: user.email || '', message: `Hi! I'd like to join.` });
    setIsJoinRequestModalOpen(true);
  };

  const submitJoinRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/lobbies/${selectedLobby._id}/request`, { uid: user.uid, ...joinRequestData });
      setIsJoinRequestModalOpen(false); setSelectedLobby(null); 
      toast.success("Request sent to host!");
    } catch (err) { toast.error(err.response?.data?.msg || "Failed"); }
  };

  const handleAcceptRequest = async (e, requestUid, reqName) => {
      e.stopPropagation();
      try { 
          await axios.post(`${API_URL}/lobbies/${selectedLobby._id}/accept`, { requestUid, uid: user.uid });
          toast.success("Member accepted!");
      } catch (err) { toast.error("Error accepting"); }
  };

  const handleRejectRequest = async (e, requestUid) => {
      e.stopPropagation();
      try { 
          await axios.post(`${API_URL}/lobbies/${selectedLobby._id}/reject`, { requestUid }); 
          toast.success("Request rejected");
      } catch (err) { toast.error("Error rejecting"); }
  };

  const handleKickMember = async (e, targetUid) => {
    e.stopPropagation();
    if (!checkAuth()) return;
    try {
      await axios.put(`${API_URL}/lobbies/${selectedLobby._id}/kick`, { 
        uid: user.uid, 
        targetUid 
      });
      toast.success("Member removed");
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  const handleLeaveClick = () => {
    if (!selectedLobby || !user) return;
    if (selectedLobby.hostId === user.uid) {
      if (selectedLobby.players.length === 1) {
        toast.error("You are the only member. Use 'Disband Squad' instead.");
        return;
      }
      setIsTransferModalOpen(true);
    } else {
      setIsLeaveModalOpen(true);
    }
  };

  const handleSelectTransferTarget = (member) => {
    setTransferTarget(member);
    setIsTransferModalOpen(false);
    setIsTransferConfirmOpen(true);
  };

  const executeTransferAndLeave = async () => {
    if (!transferTarget) return;
    try {
      await axios.put(`${API_URL}/lobbies/${selectedLobby._id}/transfer`, {
        uid: user.uid,
        newHostUid: transferTarget.uid
      });
      await axios.put(`${API_URL}/lobbies/${selectedLobby._id}/leave`, { 
        uid: user.uid 
      });
      setIsTransferConfirmOpen(false);
      setSelectedLobby(null);
      toast.success(`Promoted ${transferTarget.name} & Left Squad`);
    } catch (err) {
      toast.error("Transfer failed");
    }
  };

  const confirmLeave = async () => { 
      try { 
          await axios.put(`${API_URL}/lobbies/${selectedLobby._id}/leave`, { uid: user.uid }); 
          setIsLeaveModalOpen(false); setSelectedLobby(null); 
          toast.success("Left squad");
      } catch (err) { toast.error("Error leaving"); } 
  };

  return (
    <div className="min-h-screen bg-[#F8F5FF] text-stone-800 font-sans flex flex-col lg:flex-row">
      <Toaster position="top-center" />
      
      {/* MOBILE HAMBURGER BUTTON */}
      <button 
        onClick={() => setIsSidebarOpen(true)} 
        className="lg:hidden fixed top-4 left-4 z-40 p-3 bg-white rounded-full shadow-md text-stone-600 hover:bg-stone-50 border border-stone-100"
      >
          <Menu size={24} />
      </button>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Responsive) */}
      <Sidebar 
        activeTab={activeTab} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        setActiveTab={(tab) => { 
            if (!user && (tab === 'created' || tab === 'joined')) setIsAuthOpen(true); 
            else {
                setActiveTab(tab);
                setIsSidebarOpen(false); // Auto-close on mobile selection
            }
        }} 
        onLogout={() => setIsLogoutModalOpen(true)} 
        userName={user ? user.name : "Guest User"} 
        userAvatar={user ? user.avatarId : 0} 
        onOpenProfile={() => {
            if(checkAuth()) {
                setIsProfileModalOpen(true);
                setIsSidebarOpen(false);
            }
        }} 
        pendingRequestsCount={pendingRequestsCount}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full transition-all duration-300 mt-16 lg:mt-0">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-stone-800 mb-2 tracking-tight capitalize">
            {activeTab === 'home' && <span>Find your <span className="text-violet-600">Squad</span></span>}
            {activeTab === 'created' && <span>Created <span className="text-violet-600">Squads</span></span>}
            {activeTab === 'joined' && <span>Joined <span className="text-violet-600">Squads</span></span>}
          </h2>
          <p className="text-stone-500 text-base md:text-lg font-medium">
             {activeTab === 'home' && "Browse squads created by other students."}
             {activeTab === 'created' && "Manage the squads you are hosting."}
             {activeTab === 'joined' && "Keep track of the teams you're participating in."}
          </p>
        </div>

        {/* CATEGORY FILTER */}
        {activeTab === 'home' && (
          <div className="flex gap-3 overflow-x-auto p-2 mb-6 no-scrollbar">
            <button onClick={() => setFilter('all')} className={`px-5 py-2.5 md:px-6 md:py-3 rounded-2xl text-sm font-bold transition-all shadow-sm whitespace-nowrap ${filter === 'all' ? 'bg-stone-800 text-white shadow-stone-300' : 'bg-white text-stone-500 hover:bg-stone-50'}`}>All Squads</button>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setFilter(cat.id)} className={`px-5 py-2.5 md:px-6 md:py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm whitespace-nowrap ${filter === cat.id ? `bg-white ${cat.color} ring-2 ring-current shadow-md` : 'bg-white text-stone-500 hover:bg-stone-50'}`}>
                <cat.icon size={18} /> {cat.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
          {loading ? (
             [...Array(6)].map((_, i) => <LobbySkeleton key={i} />)
          ) : displayLobbies.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-[2.5rem] border-2 border-dashed border-stone-200 text-center px-4 min-h-[400px]">
              <div className="w-20 h-20 bg-[#F8F5FF] rounded-full flex items-center justify-center mb-4 shadow-inner">
                {activeTab === 'home' ? <Compass size={40} className="text-violet-400" /> : <Layers size={40} className="text-stone-300" />}
              </div>
              <h3 className="text-2xl font-black text-stone-800 mb-2">{getEmptyMessage()}</h3>
              <p className="text-stone-500 max-w-md mb-6 font-medium text-sm">
                {activeTab === 'home' && "It looks a bit quiet here. Why not start the action?"}
              </p>
              {(activeTab === 'home' || activeTab === 'created') && (
                <button onClick={() => checkAuth() && openCreateModal()} className="px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 hover:-translate-y-1 flex items-center gap-2 text-sm">
                    <Plus size={18} /> Create Your Own
                </button>
              )}
              {!user && activeTab !== 'home' && (
                  <button onClick={() => setIsAuthOpen(true)} className="px-8 py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-black transition-all mt-4">Login to Continue</button>
              )}
            </div>
          ) : (
            displayLobbies.map(lobby => {
                const isHost = user && user.uid === lobby.hostId;
                const hasPending = lobby.requests && lobby.requests.length > 0;
                return (
                    <div key={lobby._id} className="relative group">
                        {isHost && hasPending && (
                            <div className="absolute -top-2 -right-2 z-20 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1 animate-bounce">
                                <Bell size={10} fill="currentColor" />
                                <span>{lobby.requests.length}</span>
                            </div>
                        )}
                        <LobbyCard 
                            lobby={lobby} 
                            userId={user ? user.uid : 'guest'} 
                            onViewDetails={(l) => setSelectedLobby(l)} 
                            onDelete={(id) => { if(!checkAuth()) return; setLobbyToDelete(id); }} 
                            onEdit={(l) => openEditModal(l)} 
                        />
                    </div>
                );
            })
          )}
        </div>
      </main>

      {/* FLOATING BUTTON */}
      <button 
        onClick={() => checkAuth() && openCreateModal()} 
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 group bg-purple-600 text-white rounded-full shadow-2xl shadow-purple-500/50 hover:shadow-purple-600/60 transition-all duration-300 z-40 flex items-center justify-center overflow-hidden w-12 h-12 md:w-14 md:h-14 hover:w-48 shrink-0"
      >
        <div className="absolute left-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shrink-0"> 
          <Plus size={24} />
        </div>
        <span className="font-bold text-sm md:text-m whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-4 pl-12 md:pr-6 md:pl-14">Create Squad</span>
      </button>

      {/* ================= MODALS ================= */}
      
      {isAuthOpen && <Auth onClose={() => setIsAuthOpen(false)} onAuthSuccess={handleAuthSuccess} />}
      
      {/* Create / Edit Squad */}
      <Modal isOpen={isHostModalOpen} onClose={() => setIsHostModalOpen(false)} title={editingLobby ? "Edit Squad" : "Create Squad"}>
        <form onSubmit={handleLobbySubmit} className="space-y-5">
          <div><label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Squad Title</label><input type="text" className="w-full bg-[#F8F5FF] border-transparent p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none font-semibold text-stone-800 focus:bg-white transition-colors" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
          <div><label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Description</label><textarea rows="3" className="w-full bg-[#F8F5FF] border-transparent p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none resize-none text-stone-800 focus:bg-white transition-colors" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required /></div>
          <div><label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Date & Time</label><input type="datetime-local" className="w-full bg-[#F8F5FF] border-transparent p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none font-semibold text-stone-800 focus:bg-white transition-colors" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} required /></div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Category</label><select className="w-full bg-[#F8F5FF] border-transparent p-3 rounded-xl focus:bg-white outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
             <div><label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Max Members</label><input type="number" min="2" max="20" className="w-full bg-[#F8F5FF] border-transparent p-3 rounded-xl focus:bg-white outline-none" value={formData.maxPlayers} onChange={e => setFormData({...formData, maxPlayers: parseInt(e.target.value)})} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Skill Level</label><select className="w-full bg-[#F8F5FF] border-transparent p-3 rounded-xl focus:bg-white outline-none" value={formData.skill} onChange={e => setFormData({...formData, skill: e.target.value})}><option value="">None</option>{SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Location</label><input type="text" className="w-full bg-[#F8F5FF] border-transparent p-3 rounded-xl focus:bg-white outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required /></div>
          </div>
          <button className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200">{editingLobby ? "Update Squad" : "Launch Squad"}</button>
        </form>
      </Modal>

      {/* Squad Details */}
      {selectedLobby && (
        <Modal isOpen={!!selectedLobby} onClose={() => setSelectedLobby(null)} title="Squad Details" maxWidth="max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 h-full">
             <div className="md:col-span-3 flex flex-col gap-6">
                 <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2">{(() => { const cat = getCategoryStyle(selectedLobby.category); return <Badge className={cat.badge}><div className="flex items-center gap-1"><cat.icon size={14}/> {cat.label}</div></Badge> })()}{selectedLobby.skill && <span className="text-xs font-bold bg-stone-100 text-stone-500 px-2 py-1 rounded-lg border border-stone-200">{selectedLobby.skill}</span>}</div><div className="flex items-center gap-1 text-stone-400"><Calendar size={14} /><span className="text-xs font-bold uppercase tracking-widest">{new Date(selectedLobby.createdAt).toLocaleDateString()}</span></div></div>
                 <div><h3 className="text-2xl md:text-3xl font-black text-stone-800 mb-3 leading-tight">{selectedLobby.title}</h3><p className="text-stone-600 leading-relaxed bg-[#F8F5FF] p-4 rounded-2xl border border-transparent text-sm md:text-base">{selectedLobby.description}</p></div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="bg-stone-50 p-3 rounded-xl border border-stone-100"><span className="text-xs font-bold text-stone-400 uppercase block mb-1">Hosted By</span><span className="font-bold text-stone-800 flex items-center gap-2 truncate"><User size={16} className="text-violet-500"/> {selectedLobby.hostName}</span></div><div className="bg-stone-50 p-3 rounded-xl border border-stone-100"><span className="text-xs font-bold text-stone-400 uppercase block mb-1">Location</span><span className="font-bold text-stone-800 flex items-center gap-2 truncate"><MapPin size={16} className="text-violet-500"/> {selectedLobby.location}</span></div></div>
                 {(selectedLobby.hostMeta?.phone || selectedLobby.hostMeta?.email) && (<div className="flex flex-wrap gap-3">{selectedLobby.hostMeta.phone && (<span className="flex items-center gap-1.5 text-sm font-bold text-stone-600 bg-white px-3 py-1.5 rounded-xl border border-stone-200"><Phone size={14} className="text-emerald-500"/> {selectedLobby.hostMeta.phone}</span>)}{selectedLobby.hostMeta.email && (<span className="flex items-center gap-1.5 text-sm font-bold text-stone-600 bg-white px-3 py-1.5 rounded-xl border border-stone-200"><AtSign size={14} className="text-blue-500"/> {selectedLobby.hostMeta.email}</span>)}</div>)}
                 {user && user.uid === selectedLobby.hostId && selectedLobby.requests && selectedLobby.requests.length > 0 && (<div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 shadow-sm mt-2"><h4 className="text-xs font-extrabold text-orange-800 mb-3 flex items-center gap-2 uppercase tracking-wider"><Bell size={14}/> Pending Requests ({selectedLobby.requests.length})</h4><div className="space-y-3 max-h-[150px] overflow-y-auto custom-scrollbar">{selectedLobby.requests.map((req, i) => (<div key={i} className="bg-white p-3 rounded-xl border border-orange-200 shadow-sm flex flex-col gap-2"><div className="flex justify-between items-start"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-sm font-black text-stone-400">{req.name[0]}</div><div><p className="font-bold text-stone-800 text-sm">{req.name}</p><p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Wants to join</p></div></div><div className="flex gap-1"><button onClick={(e) => handleRejectRequest(e, req.uid)} className="p-1.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"><UserX size={14}/></button><button onClick={(e) => handleAcceptRequest(e, req.uid, req.name)} className="p-1.5 text-emerald-500 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"><UserCheck size={14}/></button></div></div>{req.message && <div className="bg-stone-50 p-2 rounded-lg flex gap-2"><MessageCircle size={12} className="text-stone-400 mt-0.5 shrink-0"/><p className="text-[10px] text-stone-600 italic leading-snug">"{req.message}"</p></div>}<div className="flex gap-2 text-[9px] font-bold text-stone-400 px-1">{req.phone && <span>📞 {req.phone}</span>}{req.email && <span>✉️ {req.email}</span>}</div></div>))}</div></div>)}</div>
                 
                 {/* RIGHT SIDE: MEMBERS AND ACTIONS */}
                 <div className="md:col-span-2 flex flex-col gap-6 border-t md:border-t-0 md:border-l border-stone-100 pt-6 md:pt-0 md:pl-8">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-extrabold text-stone-800 uppercase tracking-wider">Squad Members</h4>
                            <span className="text-xs font-bold bg-stone-100 px-2 py-0.5 rounded-md text-stone-500">{selectedLobby.players.length}/{selectedLobby.maxPlayers}</span>
                        </div>
                        
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {selectedLobby.players.map((p, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleViewMember(p)} 
                                  className="flex-1 bg-white border border-stone-200 px-3 py-2 rounded-xl text-sm font-bold text-stone-600 shadow-sm flex items-center gap-3 hover:border-violet-400 hover:shadow-md transition-all text-left"
                                >
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center text-xs border border-white shadow-sm font-black text-violet-600">
                                    {p.name[0]}
                                  </div>
                                  <div className="flex-1 truncate">{p.name}</div>
                                  {p.uid === selectedLobby.hostId && <Trophy size={14} className="text-amber-400 fill-current" />}
                                </button>

                                {user && user.uid === selectedLobby.hostId && p.uid !== user.uid && (
                                  <button 
                                    onClick={(e) => handleKickMember(e, p.uid)}
                                    className="p-3 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors shadow-sm"
                                    title="Remove Member"
                                  >
                                    <UserMinus size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-stone-100">
                        {selectedLobby.players.some(p => p.uid === user?.uid) ? (
                            <button onClick={handleLeaveClick} className="w-full bg-white border-2 border-rose-100 text-rose-600 py-3 rounded-2xl font-extrabold hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-2">
                                <LogOut size={18} /> Leave Squad
                            </button>
                        ) : selectedLobby.players.length >= selectedLobby.maxPlayers ? (
                            <button disabled className="w-full bg-stone-100 text-stone-400 py-3 rounded-2xl font-bold cursor-not-allowed flex items-center justify-center gap-2">Full Squad</button>
                        ) : (
                            <button onClick={handleJoinClick} className="w-full bg-stone-900 text-white py-3 rounded-2xl font-bold hover:bg-black shadow-lg shadow-stone-200 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5">
                                <Plus size={18} /> Join Squad
                            </button>
                        )}
                    </div>
                 </div>
            </div>
        </Modal>
      )}

      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Log Out"><div className="flex flex-col items-center text-center"><div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4"><LogOut size={32} className="text-rose-500" /></div><h3 className="text-xl font-bold text-stone-800 mb-2">Ready to leave?</h3><p className="text-stone-500 mb-8 leading-relaxed">You will be returned to the home screen as a guest.</p><div className="grid grid-cols-2 gap-3 w-full"><button onClick={() => setIsLogoutModalOpen(false)} className="w-full py-3.5 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">Cancel</button><button onClick={confirmLogout} className="w-full py-3.5 rounded-xl font-bold text-white bg-rose-500 shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors">Log Out</button></div></div></Modal>
      
      <Modal isOpen={!!lobbyToDelete} onClose={() => setLobbyToDelete(null)} title="Disband Squad"><div className="flex flex-col items-center text-center"><div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={32} className="text-rose-500" /></div><h3 className="text-xl font-bold text-stone-800 mb-2">Are you sure?</h3><p className="text-stone-500 mb-8 leading-relaxed">This action cannot be undone.</p><div className="grid grid-cols-2 gap-3 w-full"><button onClick={() => setLobbyToDelete(null)} className="w-full py-3.5 rounded-xl font-bold text-stone-600 bg-stone-100">Cancel</button><button onClick={executeDisband} className="w-full py-3.5 rounded-xl font-bold text-white bg-rose-500 shadow-lg shadow-rose-200">Yes, Disband</button></div></div></Modal>
      
      <Modal isOpen={isRequestSentOpen} onClose={() => setIsRequestSentOpen(false)} title="Request Sent"><div className="flex flex-col items-center text-center"><div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4"><Check size={32} className="text-emerald-500" /></div><h3 className="text-xl font-bold text-stone-800 mb-2">Success!</h3><p className="text-stone-500 mb-8 leading-relaxed">The squad leader has been notified of your interest.</p><button onClick={() => setIsRequestSentOpen(false)} className="w-full py-3.5 rounded-xl font-bold text-white bg-stone-900 hover:bg-black transition-colors">Awesome</button></div></Modal>
      
      <Modal isOpen={isJoinRequestModalOpen} onClose={() => setIsJoinRequestModalOpen(false)} title="Request to Join"><form onSubmit={submitJoinRequest} className="space-y-4"><div className="bg-stone-50 p-4 rounded-xl mb-2"><p className="text-sm text-stone-600 mb-1">You are requesting to join:</p><h4 className="text-lg font-black text-stone-800">{selectedLobby?.title}</h4></div><div className="grid grid-cols-1 gap-3"><div><label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Your Name</label><input type="text" value={joinRequestData.name} disabled className="w-full bg-stone-100 border-transparent p-3 rounded-xl font-bold text-stone-500 cursor-not-allowed" /></div><div><label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Phone Number <span className="text-rose-500">*</span></label><input type="text" className="w-full bg-[#F8F5FF] border-transparent p-3 rounded-xl font-bold text-stone-800 focus:bg-white outline-none" value={joinRequestData.phone} onChange={e => setJoinRequestData({...joinRequestData, phone: e.target.value})} required /></div><div><label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Email <span className="text-rose-500">*</span></label><input type="email" className="w-full bg-[#F8F5FF] border-transparent p-3 rounded-xl font-bold text-stone-800 focus:bg-white outline-none" value={joinRequestData.email} onChange={e => setJoinRequestData({...joinRequestData, email: e.target.value})} required /></div><div><label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Message (Optional)</label><textarea rows="2" className="w-full bg-[#F8F5FF] border-transparent p-3 rounded-xl text-sm font-medium text-stone-800 focus:bg-white outline-none resize-none" value={joinRequestData.message} onChange={e => setJoinRequestData({...joinRequestData, message: e.target.value})} /></div></div><button className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2"><Send size={18} /> Send Request</button></form></Modal>
      
      <Modal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title="Leave Squad"><div className="flex flex-col items-center text-center"><div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4"><LogOut size={32} className="text-rose-500" /></div><h3 className="text-xl font-bold text-stone-800 mb-2">Leave this squad?</h3><p className="text-stone-500 mb-8 leading-relaxed">You will lose access to the team details.</p><div className="grid grid-cols-2 gap-3 w-full"><button onClick={() => setIsLeaveModalOpen(false)} className="w-full py-3.5 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">Cancel</button><button onClick={confirmLeave} className="w-full py-3.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200 transition-colors">Yes, Leave</button></div></div></Modal>

      {/* EDIT PROFILE MODAL */}
      <Modal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        title="Edit Profile"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleUpdateProfile} className="flex flex-col md:flex-row gap-6 h-full">
          <div className="w-full md:w-4/12">
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 h-full flex flex-col justify-center">
              <label className="block text-[10px] font-bold text-stone-400 mb-3 uppercase tracking-wider text-center">
                Choose your Look
              </label>
              <div className="grid grid-cols-3 gap-2">
                {AVATARS.map((url, index) => (
                  <div 
                    key={index} 
                    onClick={() => setUser({...user, avatarId: index})} 
                    className={`
                      relative cursor-pointer rounded-xl p-0.5 border-2 transition-all aspect-square group
                      ${user?.avatarId === index 
                        ? 'border-violet-500 bg-violet-50 shadow-md scale-105 z-10' 
                        : 'border-transparent hover:bg-white hover:shadow-sm hover:scale-105'}
                    `}
                  >
                    <img src={url} alt={`Avatar ${index}`} className="w-full h-full rounded-lg object-cover" />
                    {user?.avatarId === index && (
                      <div className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white rounded-full p-0.5 shadow-sm border-2 border-white">
                        <Check size={8} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full md:w-8/12 flex flex-col">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase tracking-wider">Display Name</label>
                <input type="text" value={user?.name || ''} onChange={e => setUser({...user, name: e.target.value})} className="w-full bg-[#F8F5FF] border-transparent px-3 py-2.5 rounded-xl font-bold text-stone-800 text-sm focus:bg-white focus:ring-2 focus:ring-violet-200 outline-none transition-colors"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase tracking-wider">Bio / Tagline</label>
                <textarea rows="2" value={user?.bio || ''} onChange={e => setUser({...user, bio: e.target.value})} placeholder="CS Major, BasketBall Lover..." className="w-full bg-[#F8F5FF] border-transparent px-3 py-2.5 rounded-xl text-xs font-medium text-stone-800 focus:bg-white focus:ring-2 focus:ring-violet-200 outline-none transition-colors resize-none"/>
              </div>
              <div className="bg-white border border-stone-100 p-3 rounded-xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-700 flex items-center gap-2">
                    <IdCard size={16} className="text-violet-500" /> Contact Info
                  </h4>
                  <button type="button" onClick={() => setUser({...user, showContact: !user.showContact})} className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors border ${user?.showContact ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-stone-50 text-stone-500 border-stone-100'}`}>
                    {user?.showContact ? <><Eye size={10}/> Visible to All</> : <><EyeOff size={10}/> Private</>}
                  </button>
                </div>
                <div className="grid grid-cols-[2fr_3fr] gap-2">
                  <div className="relative">
                    <Smartphone size={14} className="absolute left-3 top-2.5 text-stone-400" />
                    <input type="text" placeholder="Phone" value={user?.phone || ''} onChange={e => setUser({...user, phone: e.target.value})} className="w-full bg-stone-50 border border-stone-200 pl-8 pr-2 py-2 rounded-lg text-xs font-semibold focus:bg-white focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none transition-all"/>
                  </div>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-2.5 text-stone-400" />
                    <input type="email" placeholder="Email" value={user?.email || ''} onChange={e => setUser({...user, email: e.target.value})} className="w-full bg-stone-50 border border-stone-200 pl-8 pr-2 py-2 rounded-lg text-xs font-semibold focus:bg-white focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none transition-all"/>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-auto pt-4 flex items-center gap-3 border-t border-stone-50">
              <button className="flex-1 bg-stone-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm">
                <Check size={16} /> Save Changes
              </button>
              <button type="button" onClick={() => setIsDeleteAccountModalOpen(true)} className="px-4 py-3 rounded-xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors flex items-center gap-2 whitespace-nowrap text-sm">
                <UserX size={16} /> Delete User
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {viewingMember && (<Modal isOpen={!!viewingMember} onClose={() => setViewingMember(null)} title="Member Profile"><div className="flex flex-col items-center"><div className="relative mb-4"><img src={AVATARS[viewingMember.avatarId]} alt="Profile" className="w-24 h-24 rounded-full bg-stone-100 border-4 border-white shadow-lg"/></div><h3 className="text-xl font-black text-stone-800 mb-1">{viewingMember.name}</h3><div className="bg-[#F8F5FF] p-4 rounded-2xl w-full mt-4 text-center"><p className="text-sm text-stone-600 italic">"{viewingMember.bio || "No bio provided."}"</p></div>{viewingMember.showContact ? (<div className="w-full mt-6 space-y-3"><h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 text-center">Contact Details</h4>{viewingMember.phone && (<div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-100"><div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600"><Phone size={16}/></div><span className="font-bold text-stone-700">{viewingMember.phone}</span></div>)}{viewingMember.email && (<div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-100"><div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><Mail size={16}/></div><span className="font-bold text-stone-700">{viewingMember.email}</span></div>)}</div>) : (<div className="mt-6 p-4 w-full bg-stone-50 rounded-xl text-center"><p className="text-xs font-bold text-stone-400">Contact details are private.</p></div>)}<button onClick={() => setViewingMember(null)} className="mt-8 w-full bg-stone-100 text-stone-500 py-3 rounded-xl font-bold hover:bg-stone-200 transition-colors">Close</button></div></Modal>)}

      <Modal isOpen={isDeleteAccountModalOpen} onClose={() => setIsDeleteAccountModalOpen(false)} title="Delete Account">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={32} className="text-rose-600" /></div>
          <h3 className="text-xl font-black text-stone-800 mb-2">Permanently delete account?</h3>
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl mb-6 text-left w-full">
            <ul className="space-y-2 text-sm text-rose-800 font-medium">
              <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0"></span>All your hosted squads will be disbanded.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0"></span>You will be removed from all joined teams.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0"></span>This action cannot be undone.</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            <button onClick={() => setIsDeleteAccountModalOpen(false)} className="w-full py-3.5 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">Cancel</button>
            <button onClick={handleDeleteAccount} className="w-full py-3.5 rounded-xl font-bold text-white bg-rose-600 shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors">Yes, Delete</button>
          </div>
        </div>
      </Modal>

      {/* SELECT NEW LEADER MODAL */}
      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Select New Leader">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4"><Crown size={32} className="text-amber-500" /></div>
          <h3 className="text-xl font-black text-stone-800 mb-2">Choose Successor</h3>
          <p className="text-stone-500 mb-6 text-center text-sm max-w-xs">Select a member to promote. You will be asked to confirm in the next step.</p>
          <div className="w-full space-y-2 mb-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
            {selectedLobby?.players.filter(p => p.uid !== user?.uid).map((p) => (
                <button key={p.uid} onClick={() => handleSelectTransferTarget(p)} className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-stone-100 hover:border-violet-500 hover:bg-violet-50 transition-all text-left group">
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold">{p.name[0]}</div>
                  <span className="font-bold text-stone-700 group-hover:text-violet-700">{p.name}</span>
                  <ArrowRight size={16} className="ml-auto text-stone-300 group-hover:text-violet-500" />
                </button>
            ))}
          </div>
          <button onClick={() => setIsTransferModalOpen(false)} className="w-full py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors">Cancel</button>
        </div>
      </Modal>

      {/* CONFIRM TRANSFER MODAL */}
      <Modal isOpen={isTransferConfirmOpen} onClose={() => setIsTransferConfirmOpen(false)} title="Confirm Transfer">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mb-4 border-2 border-violet-100"><UserCheck size={32} className="text-violet-600" /></div>
          <h3 className="text-xl font-black text-stone-800 mb-2">Promote & Leave?</h3>
          <p className="text-stone-500 mb-6 leading-relaxed">You are about to promote <span className="font-bold text-stone-800">{transferTarget?.name}</span> to Squad Leader.<br/><br/>Once confirmed, you will <span className="font-bold text-rose-500">automatically leave the squad</span>. This action cannot be undone.</p>
          <div className="grid grid-cols-2 gap-3 w-full">
            <button onClick={() => setIsTransferConfirmOpen(false)} className="w-full py-3.5 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">Cancel</button>
            <button onClick={executeTransferAndLeave} className="w-full py-3.5 rounded-xl font-bold text-white bg-violet-600 shadow-lg shadow-violet-200 hover:bg-violet-700 transition-colors">Yes, Promote</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}