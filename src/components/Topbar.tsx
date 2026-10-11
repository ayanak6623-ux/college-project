import React from 'react';
import { Menu, Search, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useAuthStore, useThemeStore } from '../store';
import { useLeaveStore } from '../store/leaveStore';
import { cn } from '../utils/cn';

export const Topbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { leaveRequests } = useLeaveStore();
  const pendingRequests = leaveRequests.filter(r => r.status === 'Pending').length;
  const [showProfile, setShowProfile] = React.useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 w-64 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
          <Search size={18} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search employees, leaves..." 
            className="bg-transparent border-none outline-none w-full text-sm placeholder:text-slate-400 text-slate-700 dark:text-slate-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
          <Bell size={20} />
          {pendingRequests > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white dark:border-slate-900">
              {pendingRequests}
            </span>
          )}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 font-bold flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-primary-200 transition-all ml-1"
          >
            {user?.name.charAt(0) || 'H'}
          </button>
          
          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)}></div>
              <div className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-border py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button onClick={() => logout()} className="flex items-center w-full px-3 py-2 text-sm text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
