import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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

export const Sidebar = ({ 
  isOpen, 
  setIsOpen, 
  isMobile 
}: { 
  isOpen: boolean; 
  setIsOpen: (v: boolean) => void; 
  isMobile: boolean; 
}) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isManager = user?.role === 'Manager';

  // Smart slide toggle: clicking header toggles, clicking collapsed expands
  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSidebarClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // --- Manager Workspace Sidebar Content (Adaptive Light & Dark Theme) ---
  const renderManagerSidebar = () => (
    <div 
      onClick={handleSidebarClick}
      className={cn(
        "flex h-full flex-col bg-white dark:bg-[#0b0f19] text-slate-800 dark:text-slate-200 border-r border-slate-200/80 dark:border-slate-800/80 shadow-sm relative select-none transition-colors duration-200",
        !isOpen && "cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-900/60"
      )}
    >
      {/* Brand Header */}
      <div 
        onClick={handleHeaderClick}
        className="flex h-16 items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
        title={isOpen ? "Click to collapse sidebar" : "Click to expand sidebar"}
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center text-white font-black text-base shrink-0 group-hover:scale-105 transition-transform shadow-sm shadow-indigo-500/20">
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
                  <span className="font-bold text-base tracking-tight text-[#6366F1] dark:text-indigo-400">PeopleHub</span>
                </div>
                <p className="text-[10px] font-bold tracking-wider text-indigo-500 dark:text-indigo-400 uppercase">
                  Manager Portal
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav List with Sections (TODAY & ME) in Light & Dark Mode */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 text-xs">
        {/* SECTION 1: TODAY */}
        <div className="space-y-1">
          {isOpen && (
            <p className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              TODAY
            </p>
          )}

          <NavLink
            to="/dashboard"
            end
            title={!isOpen ? "Home" : undefined}
            className={({ isActive }) => cn(
              "group relative flex items-center rounded-xl transition-all duration-150 font-medium",
              isOpen ? "px-3 py-2 text-[13px]" : "px-2 py-2 justify-center",
              isActive && location.pathname === '/dashboard'
                ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold dark:border dark:border-indigo-800/40"
                : "text-[#334155] dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            {location.pathname === '/dashboard' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#4338CA] dark:bg-indigo-500 rounded-r-md" />
            )}
            <Home size={17} className={cn("shrink-0 transition-colors", location.pathname === '/dashboard' ? "text-[#4F46E5] dark:text-indigo-400" : "text-[#475569] dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200", isOpen && "mr-3")} />
            {isOpen && <span>Home</span>}
          </NavLink>

          <NavLink
            to="/attendance"
            title={!isOpen ? "Attendance" : undefined}
            className={({ isActive }) => cn(
              "group relative flex items-center rounded-xl transition-all duration-150 font-medium",
              isOpen ? "px-3 py-2 text-[13px]" : "px-2 py-2 justify-center",
              isActive
                ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold dark:border dark:border-indigo-800/40"
                : "text-[#334155] dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            {location.pathname === '/attendance' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#4338CA] dark:bg-indigo-500 rounded-r-md" />
            )}
            <Camera size={17} className={cn("shrink-0 transition-colors", location.pathname === '/attendance' ? "text-[#4F46E5] dark:text-indigo-400" : "text-[#475569] dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200", isOpen && "mr-3")} />
            {isOpen && <span>Attendance</span>}
          </NavLink>

          <NavLink
            to="/tasks"
            title={!isOpen ? "My tasks" : undefined}
            className={({ isActive }) => cn(
              "group relative flex items-center rounded-xl transition-all duration-150 font-medium",
              isOpen ? "px-3 py-2 text-[13px]" : "px-2 py-2 justify-center",
              isActive
                ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold dark:border dark:border-indigo-800/40"
                : "text-[#334155] dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            {location.pathname === '/tasks' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#4338CA] dark:bg-indigo-500 rounded-r-md" />
            )}
            <ClipboardList size={17} className={cn("shrink-0 transition-colors", location.pathname === '/tasks' ? "text-[#4F46E5] dark:text-indigo-400" : "text-[#475569] dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200", isOpen && "mr-3")} />
            {isOpen && <span>My tasks</span>}
          </NavLink>

          <NavLink
            to="/meetings"
            title={!isOpen ? "Meetings" : undefined}
            className={({ isActive }) => cn(
              "group relative flex items-center rounded-xl transition-all duration-150 font-medium",
              isOpen ? "px-3 py-2 text-[13px]" : "px-2 py-2 justify-center",
              isActive
                ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold dark:border dark:border-indigo-800/40"
                : "text-[#334155] dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            {location.pathname === '/meetings' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#4338CA] dark:bg-indigo-500 rounded-r-md" />
            )}
            <CalendarClock size={17} className={cn("shrink-0 transition-colors", location.pathname === '/meetings' ? "text-[#4F46E5] dark:text-indigo-400" : "text-[#475569] dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200", isOpen && "mr-3")} />
            {isOpen && <span>Meetings</span>}
          </NavLink>
        </div>

        {/* SECTION 2: ME */}
        <div className="space-y-1">
          {isOpen && (
            <p className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              ME
            </p>
          )}

          <NavLink
            to="/leaves"
            title={!isOpen ? "Leave" : undefined}
            className={({ isActive }) => cn(
              "group relative flex items-center rounded-xl transition-all duration-150 font-medium",
              isOpen ? "px-3 py-2 text-[13px]" : "px-2 py-2 justify-center",
              isActive
                ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold dark:border dark:border-indigo-800/40"
                : "text-[#334155] dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            {location.pathname === '/leaves' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#4338CA] dark:bg-indigo-500 rounded-r-md" />
            )}
            <Calendar size={17} className={cn("shrink-0 transition-colors", location.pathname === '/leaves' ? "text-[#4F46E5] dark:text-indigo-400" : "text-[#475569] dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200", isOpen && "mr-3")} />
            {isOpen && <span>Leave</span>}
          </NavLink>

          <NavLink
            to="/rewards"
            title={!isOpen ? "Rewards" : undefined}
            className={({ isActive }) => cn(
              "group relative flex items-center rounded-xl transition-all duration-150 font-medium",
              isOpen ? "px-3 py-2 text-[13px]" : "px-2 py-2 justify-center",
              isActive
                ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold dark:border dark:border-indigo-800/40"
                : "text-[#334155] dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            {location.pathname === '/rewards' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#4338CA] dark:bg-indigo-500 rounded-r-md" />
            )}
            <Gift size={17} className={cn("shrink-0 transition-colors", location.pathname === '/rewards' ? "text-[#4F46E5] dark:text-indigo-400" : "text-[#475569] dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200", isOpen && "mr-3")} />
            {isOpen && <span>Rewards</span>}
          </NavLink>

          <NavLink
            to="/payslips"
            title={!isOpen ? "Payslips" : undefined}
            className={({ isActive }) => cn(
              "group relative flex items-center rounded-xl transition-all duration-150 font-medium",
              isOpen ? "px-3 py-2 text-[13px]" : "px-2 py-2 justify-center",
              isActive
                ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold dark:border dark:border-indigo-800/40"
                : "text-[#334155] dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            {location.pathname === '/payslips' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#4338CA] dark:bg-indigo-500 rounded-r-md" />
            )}
            <Receipt size={17} className={cn("shrink-0 transition-colors", location.pathname === '/payslips' ? "text-[#4F46E5] dark:text-indigo-400" : "text-[#475569] dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200", isOpen && "mr-3")} />
            {isOpen && <span>Payslips</span>}
          </NavLink>

          <NavLink
            to="/policies"
            title={!isOpen ? "Company Policies" : undefined}
            className={({ isActive }) => cn(
              "group relative flex items-center rounded-xl transition-all duration-150 font-medium",
              isOpen ? "px-3 py-2 text-[13px]" : "px-2 py-2 justify-center",
              isActive
                ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold dark:border dark:border-indigo-800/40"
                : "text-[#334155] dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            {location.pathname === '/policies' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#4338CA] dark:bg-indigo-500 rounded-r-md" />
            )}
            <FileText size={17} className={cn("shrink-0 transition-colors", location.pathname === '/policies' ? "text-[#4F46E5] dark:text-indigo-400" : "text-[#475569] dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200", isOpen && "mr-3")} />
            {isOpen && <span>Company Policies</span>}
          </NavLink>

          <NavLink
            to="/announcements"
            title={!isOpen ? "Announcements & Polls" : undefined}
            className={({ isActive }) => cn(
              "group relative flex items-center rounded-xl transition-all duration-150 font-medium",
              isOpen ? "px-3 py-2 text-[13px]" : "px-2 py-2 justify-center",
              isActive
                ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold dark:border dark:border-indigo-800/40"
                : "text-[#334155] dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            {location.pathname === '/announcements' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#4338CA] dark:bg-indigo-500 rounded-r-md" />
            )}
            <Megaphone size={17} className={cn("shrink-0 transition-colors", location.pathname === '/announcements' ? "text-[#4F46E5] dark:text-indigo-400" : "text-[#475569] dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200", isOpen && "mr-3")} />
            {isOpen && <span>Announcements & Polls</span>}
          </NavLink>
        </div>
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={handleLogout}
          title={!isOpen ? "Logout" : undefined}
          className={cn(
            "group flex w-full items-center rounded-xl py-2.5 text-[#334155] dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors",
            isOpen ? "px-3" : "px-2 justify-center"
          )}
        >
          <LogOut size={18} className={cn("shrink-0 text-[#475569] dark:text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors", isOpen && "mr-3")} />
          {isOpen && <span className="font-semibold text-xs">Logout ({user?.name || 'Manager'})</span>}
        </button>
      </div>
    </div>
  );

  // --- HR Admin & Employee Default Sidebar Content (Adaptive Light & Dark Theme) ---
  const currentMenu = user?.role === 'Employee' ? employeeMenuItems : adminMenuItems;

  const renderDefaultSidebar = () => (
    <div 
      onClick={handleSidebarClick}
      className={cn(
        "flex h-full flex-col bg-white dark:bg-[#0b0f19] text-slate-800 dark:text-slate-200 border-r border-slate-200/80 dark:border-slate-800/80 shadow-sm relative select-none transition-colors duration-200",
        !isOpen && "cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-900/60"
      )}
    >
      {/* Brand Header */}
      <div 
        onClick={handleHeaderClick}
        className="flex h-16 items-center px-4 md:px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
        title={isOpen ? "Click to collapse" : "Click to expand"}
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center text-white font-black text-base shrink-0 group-hover:scale-105 transition-transform shadow-sm shadow-indigo-500/20">
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
                  <span className="font-bold text-base tracking-tight text-[#6366F1] dark:text-indigo-400">PeopleHub</span>
                </div>
                <p className="text-[10px] font-bold tracking-wider text-indigo-500 dark:text-indigo-400 uppercase">
                  {user?.role === 'Employee' ? 'EMPLOYEE PORTAL' : 'HR ADMIN PORTAL'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {currentMenu.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={!isOpen ? item.label : undefined}
              className={cn(
                "group relative flex items-center rounded-xl transition-all duration-150 font-normal",
                isOpen ? "px-3.5 py-2.5" : "px-3 py-2.5 justify-center",
                isActive 
                  ? "bg-[#EEF2FF] text-[#4F46E5] dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold dark:border dark:border-indigo-800/40" 
                  : "text-[#334155] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#4338CA] dark:bg-indigo-500 rounded-r-md" />
              )}
              
              <Icon 
                size={20} 
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-[#4F46E5] dark:text-indigo-400" : "text-[#475569] dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200",
                  isOpen && "mr-3.5"
                )} 
              />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className={cn(
                      "whitespace-nowrap overflow-hidden text-[15px]",
                      isActive ? "text-[#4F46E5] dark:text-indigo-300 font-semibold" : "text-[#334155] dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100"
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={handleLogout}
          title={!isOpen ? "Logout" : undefined}
          className={cn(
            "group flex w-full items-center rounded-xl py-2.5 text-[#334155] dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-normal text-[15px]",
            isOpen ? "px-3.5" : "px-3 justify-center"
          )}
        >
          <LogOut 
            size={20} 
            className={cn(
              "shrink-0 text-[#475569] dark:text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors", 
              isOpen && "mr-3.5"
            )} 
          />
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden font-medium"
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
              className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs z-40 md:hidden"
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
    <motion.aside 
      animate={{ width: isOpen ? 256 : 76 }} 
      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
      className="h-screen hidden md:block shrink-0 z-20"
    >
      {sidebarNode}
    </motion.aside>
  );
};
