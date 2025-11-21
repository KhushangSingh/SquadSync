import { Code, Dumbbell, Gamepad2, Layers, Music, Briefcase, PenTool, GraduationCap, Trophy } from 'lucide-react';

// Previous URLs (for development):
// API_URL: 'http://localhost:5000/api'
// SOCKET_URL: 'http://localhost:5000'

export const API_URL = 'https://squadsync-backend.onrender.com/api';
export const SOCKET_URL = 'https://squadsync-backend.onrender.com';

export const CATEGORIES = [
  { id: 'hackathon', label: 'Hackathon', icon: Code, color: 'text-violet-600 ring-violet-100', badge: 'bg-violet-50 text-violet-700 border-violet-100' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'text-emerald-600 ring-emerald-100', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { id: 'sports', label: 'Sports', icon: Trophy, color: 'text-orange-600 ring-orange-100', badge: 'bg-orange-50 text-orange-700 border-orange-100' },
  { id: 'music', label: 'Jamming', icon: Music, color: 'text-rose-600 ring-rose-100', badge: 'bg-rose-50 text-rose-700 border-rose-100' },
  { id: 'project', label: 'Project', icon: Briefcase, color: 'text-blue-600 ring-blue-100', badge: 'bg-blue-50 text-blue-700 border-blue-100' },
  { id: 'study', label: 'Study', icon: GraduationCap, color: 'text-amber-600 ring-amber-100', badge: 'bg-amber-50 text-amber-700 border-amber-100' },
  { id: 'creative', label: 'Creative', icon: PenTool, color: 'text-fuchsia-600 ring-fuchsia-100', badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100' },
];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];

export const AVATARS = [
  "https://api.dicebear.com/9.x/bottts/svg?seed=Felix&backgroundColor=6d28d9",
  "https://api.dicebear.com/9.x/notionists/svg?seed=TechLead&backgroundColor=e9d5ff",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Ryan&backgroundColor=8b5cf6",
  "https://api.dicebear.com/9.x/pixel-art/svg?seed=Gamer&backgroundColor=c4b5fd",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Amelia&backgroundColor=6366f1",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Designer&backgroundColor=f3e8ff",
  "https://api.dicebear.com/9.x/micah/svg?seed=DevOps&backgroundColor=7c3aed",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Cyborg&backgroundColor=ddd6fe",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Hacker&backgroundColor=a78bfa",
  "https://api.dicebear.com/9.x/shapes/svg?seed=Abstract&backgroundColor=5b21b6",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Smile&backgroundColor=e0e7ff",
  "https://api.dicebear.com/9.x/lorelei/svg?seed=Artist&backgroundColor=fae8ff"
];

export const getCategoryStyle = (catId) => {
  const cat = CATEGORIES.find(c => c.id === catId);
  return cat ? cat : { icon: Layers, label: 'General', color: 'text-stone-600', badge: 'bg-stone-100 text-stone-600' };
};