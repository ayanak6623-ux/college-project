import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown,
  Home,
  Camera,
  ClipboardList,
  CalendarClock,
  Calendar,
  Gift,
  Receipt,
  FileText,
  Megaphone,
  LogOut,
  LayoutDashboard,
  Users,
  Settings2,
  CalendarDays,
  Tags,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../store';
import { cn } from '../utils/cn';

// HR Admin menu items
const adminMenuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/attendance', label: 'Attendance', icon: CalendarClock },
  { path: '/attendance-config', label: 'Attendance Config', icon: Settings2 },
  { path: '/leaves', label: 'Leaves', icon: CalendarDays },
  { path: '/tasks', label: 'Tasks', icon: ClipboardList },
  { path: '/meetings', label: 'Meetings', icon: CalendarClock },
  { path: '/policies', label: 'Policies', icon: FileText },
  { path: '/rewards', label: 'Rewards', icon: Gift },
  { path: '/payslips', label: 'Payslips', icon: Receipt },
  { path: '/announcements', label: 'Announcements', icon: Megaphone },
  { path: '/settings', label: 'Settings', icon: Settings },
];

// Employee personal menu items
const employeeMenuItems = [
  { path: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { path: '/attendance', label: 'My Attendance', icon: CalendarClock },
  { path: '/leaves', label: 'My Leaves', icon: CalendarDays },
  { path: '/tasks', label: 'My Tasks', icon: ClipboardList },
  { path: '/meetings', label: 'Meetings', icon: CalendarClock },
  { path: '/policies', label: 'Company Policies', icon: FileText },
  { path: '/rewards', label: 'Rewards', icon: Gift },
  { path: '/payslips', label: 'My Payslips', icon: Receipt },
  { path: '/announcements', label: 'Announcements', icon: Megaphone },
];

export const Sidebar = ({ isOpen, setIsOpen, isMobile }: { isOpen: boolean, setIsOpen: (v: boolean) => void, isMobile: boolean }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isManager = user?.role === 'Manager';

  // Smart slide toggle: clicking anywhere on the header or clicking when collapsed toggles the sidebar
  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSidebarClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // --- Manager Workspace Sidebar Content (Matches Reference Image with Last 3 Removed) ---
  const renderManagerSidebar = () => (
    <div 
      onClick={handleSidebarClick}
      className={cn(
        "flex h-full flex-col bg-[#0b0f19] text-slate-200 border-r border-slate-800/80 shadow-2xl relative select-none transition-all",
        !isOpen && "cursor-pointer hover:bg-slate-900/90"
      )}
    >
      {/* Brand Header: Toggle on click */}
      <div 
        onClick={handleHeaderClick}
        className="flex h-16 items-center px-4 py-4 border-b border-slate-800/80 cursor-pointer hover:bg-slate-800/40 transition-colors group"
        title={isOpen ? "Click to collapse sidebar" : "Click to expand sidebar"}
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-base shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-indigo-500/25">
            P
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">PeopleHub</span>
                </div>
                <p className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
                  Manager Portal
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav List with Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 scrollbar-hide text-xs">
        {/* SECTION 1: TODAY */}
        <div className="space-y-1">
          {isOpen && (
            <p className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              TODAY
            </p>
          )}

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => cn(
              "flex items-center rounded-xl px-3 py-2 transition-all group font-medium",
              isActive && location.pathname === '/dashboard'
                ? "bg-slate-800/90 text-white font-bold border border-slate-700/60 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            <Home size={17} className={cn("shrink-0", isOpen && "mr-3 text-slate-400 group-hover:text-white")} />
            {isOpen && <span>Home</span>}
          </NavLink>

          <NavLink
            to="/attendance"
            className={({ isActive }) => cn(
              "flex items-center rounded-xl px-3 py-2 transition-all group font-medium",
              isActive
                ? "bg-slate-800/90 text-white font-bold border border-slate-700/60 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            <Camera size={17} className={cn("shrink-0", isOpen && "mr-3 text-slate-400 group-hover:text-white")} />
            {isOpen && <span>Attendance</span>}
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) => cn(
              "flex items-center rounded-xl px-3 py-2 transition-all group font-medium",
              isActive
                ? "bg-slate-800/90 text-white font-bold border border-slate-700/60 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            <ClipboardList size={17} className={cn("shrink-0", isOpen && "mr-3 text-slate-400 group-hover:text-white")} />
            {isOpen && <span>My tasks</span>}
          </NavLink>

          <NavLink
            to="/meetings"
            className={({ isActive }) => cn(
              "flex items-center rounded-xl px-3 py-2 transition-all group font-medium",
              isActive
                ? "bg-slate-800/90 text-white font-bold border border-slate-700/60 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            <CalendarClock size={17} className={cn("shrink-0", isOpen && "mr-3 text-slate-400 group-hover:text-white")} />
            {isOpen && <span>Meetings</span>}
          </NavLink>
        </div>

        {/* SECTION 2: ME */}
        <div className="space-y-1">
          {isOpen && (
            <p className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              ME
            </p>
          )}

          <NavLink
            to="/leaves"
            className={({ isActive }) => cn(
              "flex items-center rounded-xl px-3 py-2 transition-all group font-medium",
              isActive
                ? "bg-slate-800/90 text-white font-bold border border-slate-700/60 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            <Calendar size={17} className={cn("shrink-0", isOpen && "mr-3 text-slate-400 group-hover:text-white")} />
            {isOpen && <span>Leave</span>}
          </NavLink>

          <NavLink
            to="/rewards"
            className={({ isActive }) => cn(
              "flex items-center rounded-xl px-3 py-2 transition-all group font-medium",
              isActive
                ? "bg-slate-800/90 text-white font-bold border border-slate-700/60 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            <Gift size={17} className={cn("shrink-0", isOpen && "mr-3 text-slate-400 group-hover:text-white")} />
            {isOpen && <span>Rewards</span>}
          </NavLink>

          <NavLink
            to="/payslips"
            className={({ isActive }) => cn(
              "flex items-center rounded-xl px-3 py-2 transition-all group font-medium",
              isActive
                ? "bg-slate-800/90 text-white font-bold border border-slate-700/60 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            <Receipt size={17} className={cn("shrink-0", isOpen && "mr-3 text-slate-400 group-hover:text-white")} />
            {isOpen && <span>Payslips</span>}
          </NavLink>

          <NavLink
            to="/policies"
            className={({ isActive }) => cn(
              "flex items-center rounded-xl px-3 py-2 transition-all group font-medium",
              isActive
                ? "bg-slate-800/90 text-white font-bold border border-slate-700/60 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            <FileText size={17} className={cn("shrink-0", isOpen && "mr-3 text-slate-400 group-hover:text-white")} />
            {isOpen && <span>Company Policies</span>}
          </NavLink>

          <NavLink
            to="/announcements"
            className={({ isActive }) => cn(
              "flex items-center rounded-xl px-3 py-2 transition-all group font-medium",
              isActive
                ? "bg-indigo-950/70 text-indigo-300 font-bold border border-indigo-800/60 shadow-sm"
                : "text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/30"
            )}
          >
            <Megaphone size={17} className={cn("shrink-0", isOpen && "mr-3")} />
            {isOpen && <span>Announcements & Polls</span>}
          </NavLink>
        </div>
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-xl px-3 py-2.5 text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 transition-colors"
        >
          <LogOut size={18} className={cn("shrink-0", isOpen && "mr-3")} />
          {isOpen && <span className="font-semibold text-xs">Logout ({user?.name || 'Manager'})</span>}
        </button>
      </div>
    </div>
  );

  // --- HR Admin & Employee Default Sidebar Content ---
  const currentMenu = isManager ? [] : user?.role === 'Employee' ? employeeMenuItems : adminMenuItems;

  const renderDefaultSidebar = () => (
    <div 
      onClick={handleSidebarClick}
      className={cn(
        "flex h-full flex-col bg-white dark:bg-slate-900 border-r border-border shadow-sm transition-all relative",
        !isOpen && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
      )}
    >
      <div 
        onClick={handleHeaderClick}
        className="flex h-16 items-center px-4 md:px-6 py-4 border-b border-border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
        title={isOpen ? "Click to collapse" : "Click to expand"}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center text-white font-bold text-xl mr-3 shrink-0 group-hover:scale-105 transition-transform">
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
        {currentMenu.map((item) => (
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

  const sidebarNode = isManager ? renderManagerSidebar() : renderDefaultSidebar();

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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden shadow-2xl"
            >
              {sidebarNode}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.div 
      animate={{ width: isOpen ? 256 : 76 }} 
      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
      className="h-screen hidden md:block shrink-0 z-20"
    >
      {sidebarNode}
    </motion.div>
  );
};
