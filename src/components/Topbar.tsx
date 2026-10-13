import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, Search, Bell, Sun, Moon, LogOut, 
  CheckCheck, Trash2, X, Calendar, UserCheck, 
  IndianRupee, Clock, Info, CheckCircle2 
} from 'lucide-react';
import { useAuthStore, useThemeStore, useNotificationStore } from '../store';
import { useLeaveStore } from '../store/leaveStore';
import { cn } from '../utils/cn';

export const Topbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotificationStore();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'leave':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Calendar size={15} />
          </div>
        );
      case 'employee':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <UserCheck size={15} />
          </div>
        );
      case 'payroll':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <IndianRupee size={15} />
          </div>
        );
      case 'attendance':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock size={15} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
            <Info size={15} />
          </div>
        );
    }
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    setShowNotifications(false);
    if (link) {
      navigate(link);
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 w-64 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
          <Search size={18} className="text-slate-400 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search employees, leaves..." 
            className="bg-transparent border-none outline-none w-full text-sm placeholder:text-slate-400 text-slate-700 dark:text-slate-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark/Light Mode Switch */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        {/* Notification Bell with Functional Popover */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className={cn(
              "p-2 rounded-xl transition-all relative",
              showNotifications 
                ? "bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400" 
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Modal */}
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              ></div>
              <div className="absolute right-0 top-12 w-[340px] sm:w-[410px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/40 font-medium transition-colors"
                        title="Mark all as read"
                      >
                        <CheckCheck size={14} />
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={() => clearAll()}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Clear all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex border-b border-border px-4 text-xs font-medium">
                  <button
                    onClick={() => setFilter('all')}
                    className={cn(
                      "py-2.5 px-3 border-b-2 transition-colors",
                      filter === 'all'
                        ? "border-primary-600 text-primary-600 dark:text-primary-400 font-semibold"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    )}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={cn(
                      "py-2.5 px-3 border-b-2 transition-colors",
                      filter === 'unread'
                        ? "border-primary-600 text-primary-600 dark:text-primary-400 font-semibold"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    )}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {/* Notification Items List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-12 px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2.5">
                        <CheckCircle2 size={24} />
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">All caught up!</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {filter === 'unread' ? 'No unread notifications right now.' : 'No notifications in your inbox.'}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative",
                          !notif.read 
                            ? "bg-primary-50/30 dark:bg-primary-950/20 hover:bg-primary-50/60 dark:hover:bg-primary-950/40" 
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        )}
                        onClick={() => handleNotificationClick(notif.id, notif.link)}
                      >
                        {getNotificationIcon(notif.type)}

                        <div className="flex-1 min-w-0 pr-6">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className={cn(
                              "text-xs font-semibold truncate",
                              !notif.read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                            )}>
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                            {notif.timestamp}
                          </span>
                        </div>

                        {/* Individual dismiss action */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="absolute right-3 top-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Dismiss"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-2.5 border-t border-border bg-slate-50/50 dark:bg-slate-800/30 text-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/leaves');
                      }}
                      className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      View all leave approvals & activities →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
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
