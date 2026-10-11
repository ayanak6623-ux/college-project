import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  Settings2, 
  CalendarDays, 
  Tags, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useAuthStore } from '../store';
import { cn } from '../utils/cn';

const allMenuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users, adminOnly: true },
  { path: '/attendance', label: 'Attendance', icon: CalendarClock, adminOnly: true },
  { path: '/attendance-config', label: 'Attendance Config', icon: Settings2, adminOnly: true },
  { path: '/leaves', label: 'Leaves', icon: CalendarDays, adminOnly: true },
  { path: '/leave-types', label: 'Leave Types', icon: Tags, adminOnly: true },
  { path: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
];

export const Sidebar = ({ isOpen, setIsOpen, isMobile }: { isOpen: boolean, setIsOpen: (v: boolean) => void, isMobile: boolean }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = allMenuItems.filter(item => {
    if (item.adminOnly && user?.role === 'Employee') return false;
    return true;
  });

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-border shadow-sm transition-all duration-300 relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-16 items-center px-4 md:px-6 py-4 border-b border-border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center text-white font-bold text-xl mr-3 shrink-0">
          P
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold text-xl whitespace-nowrap overflow-hidden text-gradient"
            >
              PeopleHub
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center rounded-xl px-3 py-2.5 transition-colors group relative overflow-hidden",
              isActive 
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r-full"
                  />
                )}
                <item.icon size={20} className={cn("shrink-0", isOpen && "mr-3")} />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-xl px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-colors"
        >
          <LogOut size={20} className={cn("shrink-0", isOpen && "mr-3")} />
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.div 
      animate={{ width: isOpen ? 256 : 80 }} 
      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
      className="h-screen hidden md:block shrink-0 z-20"
    >
      {sidebarContent}
    </motion.div>
  );
};
