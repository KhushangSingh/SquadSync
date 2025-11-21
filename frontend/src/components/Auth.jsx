import React, { useState } from 'react';
import axios from 'axios';
import { Loader, Mail, User, Lock, ArrowRight } from 'lucide-react';
import { API_URL } from '../constants';
import { toast } from 'react-hot-toast';
import { Modal } from './UI';

const Auth = ({ onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Ensure backend endpoints are /users/login and /users/register
    const endpoint = isLogin ? '/login' : '/register';

    try {
      const res = await axios.post(`${API_URL}/users${endpoint}`, formData);
      onAuthSuccess(res.data, !isLogin); 
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={isLogin ? "Welcome Back" : "Join SquadSync"} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {!isLogin && (
           <div>
             <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">Full Name</label>
             <div className="relative">
                <User size={16} className="absolute left-3 top-3.5 text-stone-400" />
                <input type="text" className="w-full bg-stone-50 border-transparent pl-9 pr-3 py-3 rounded-xl font-bold text-stone-800 focus:bg-white ring-2 ring-transparent focus:ring-violet-200 outline-none transition-all" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
             </div>
           </div>
        )}
        <div>
           <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">Email Address</label>
           <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-stone-400" />
                <input type="email" className="w-full bg-stone-50 border-transparent pl-9 pr-3 py-3 rounded-xl font-bold text-stone-800 focus:bg-white ring-2 ring-transparent focus:ring-violet-200 outline-none transition-all" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
           </div>
        </div>
        <div>
           <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">Password</label>
           <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-stone-400" />
                <input type="password" className="w-full bg-stone-50 border-transparent pl-9 pr-3 py-3 rounded-xl font-bold text-stone-800 focus:bg-white ring-2 ring-transparent focus:ring-violet-200 outline-none transition-all" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
           </div>
        </div>
        
        <button disabled={loading} className="w-full bg-violet-600 text-white py-3.5 rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200 mt-4 flex items-center justify-center gap-2">
          {loading ? <Loader className="animate-spin" size={20}/> : (isLogin ? 'Log In' : 'Create Account')}
        </button>
      </form>
      <div className="mt-6 text-center">
        <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-xs font-bold text-stone-400 hover:text-violet-600 transition-colors">
           {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    </Modal>
  );
};

export default Auth;