import React from 'react';
import { Atom, Award, CheckCircle2, LogOut, Sparkles, Trophy, User } from 'lucide-react';
import { StudentProfile } from '../types/physics';

interface NavbarProps {
  user: StudentProfile;
  activeTab: 'tasks' | 'leaderboard';
  onTabChange: (tab: 'tasks' | 'leaderboard') => void;
  onLogout: () => void;
  solvedCount: number;
  totalTasks: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onTabChange,
  onLogout,
  solvedCount,
  totalTasks,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Atom className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Fizika Kihívás</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Supabase Backend
                </span>
              </div>
              <p className="text-xs text-slate-700 hidden sm:block">Középiskolai fizika feladatok és valós idejű rangsor</p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="tab-tasks-button"
              onClick={() => onTabChange('tasks')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tasks'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : 'text-slate-800 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Feladatok</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === 'tasks' ? 'bg-blue-200/70 text-blue-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {solvedCount}/{totalTasks}
              </span>
            </button>

            <button
              id="tab-leaderboard-button"
              onClick={() => onTabChange('leaderboard')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : 'text-slate-800 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Rangsor</span>
            </button>
          </nav>

          {/* User profile & Score pill & Logout */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 rounded-full py-1 px-2.5">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="hidden md:block text-left pr-1">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{user.full_name}</p>
                <p className="text-[11px] text-slate-700 leading-tight truncate max-w-[120px]">{user.email}</p>
              </div>

              {/* Live Points Badge */}
              <div className="flex items-center space-x-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-300">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>{user.score} pont</span>
              </div>
            </div>

            <button
              id="user-logout-button"
              onClick={onLogout}
              title="Kijelentkezés"
              className="p-2 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
