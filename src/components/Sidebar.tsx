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
  MapPin,
  Send,
  Sparkles,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Users,
  Settings2,
  CalendarDays,
  Tags,
  Settings,
  UserPlus
} from 'lucide-react';
import { useAuthStore } from '../store';
import { useManagerRequestStore } from '../store/managerRequestStore';
import { cn } from '../utils/cn';

// HR Admin menu items
const adminMenuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/attendance', label: 'Attendance', icon: CalendarClock },
  { path: '/attendance-config', label: 'Attendance Config', icon: Settings2 },
  { path: '/leaves', label: 'Leaves', icon: CalendarDays },
  { path: '/leave-types', label: 'Leave Types', icon: Tags },
  { path: '/settings', label: 'Settings', icon: Settings },
];

// Employee personal menu items
const employeeMenuItems = [
  { path: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { path: '/attendance', label: 'My Attendance', icon: CalendarClock },
  { path: '/leaves', label: 'My Leaves', icon: CalendarDays },
];

export const Sidebar = ({ isOpen, setIsOpen, isMobile }: { isOpen: boolean, setIsOpen: (v: boolean) => void, isMobile: boolean }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { getPendingCount } = useManagerRequestStore();
  const pendingRequestsCount = getPendingCount();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isManager = user?.role === 'Manager';

  // --- Manager Workspace Sidebar Content (Matches Reference Image) ---
  const renderManagerSidebar = () => (
    <div className="flex h-full flex-col bg-[#0b0f19] text-slate-200 border-r border-slate-800/80 shadow-2xl relative select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold shrink-0">
            <Crown size={18} className="text-indigo-400" />
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
                  <span className="font-extrabold text-base tracking-tight text-white">crownco</span>
                </div>
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  WORKSPACE · MANAGER
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-7 h-7 rounded-lg bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors shrink-0"
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? <ChevronsLeft size={15} /> : <ChevronRight size={15} />}
        </button>
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
            to="/dashboard"
            className="flex items-center rounded-xl px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all group font-medium"
          >
            <ClipboardList size={17} className={cn("shrink-0", isOpen && "mr-3 text-slate-400 group-hover:text-white")} />
            {isOpen && <span>My tasks</span>}
          </NavLink>

          <NavLink
            to="/dashboard"
            className="flex items-center rounded-xl px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all group font-medium"
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
            to="/dashboard"
            className="flex items-center rounded-xl px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all group font-medium"
          >
            <Gift size={17} className={cn("shrink-0", isOpen && "mr-3 text-slate-400 group-hover:text-white")} />
            {isOpen && <span>Rewards</span>}
          </NavLink>

          <NavLink
            to="/dashboard"
            className="flex items-center rounded-xl px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all group font-medium"
          >
            <Receipt size={17} className={cn("shrink-0", isOpen && "mr-3 text-slate-400 group-hover:text-white")} />
            {isOpen && <span>Payslips</span>}
          </NavLink>

          <NavLink
            to="/dashboard"
            className="flex items-center rounded-xl px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all group font-medium"
          >
            <FileText size={17} className={cn("shrink-0", isOpen && "mr-3 text-slate-400 group-hover:text-white")} />
            {isOpen && <span>Company Policies</span>}
          </NavLink>

          <NavLink
            to="/dashboard"
            className="flex items-center rounded-xl px-3 py-2 text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 hover:bg-indigo-950/70 transition-all group font-bold"
          >
            <Megaphone size={17} className={cn("shrink-0 text-indigo-400", isOpen && "mr-3")} />
            {isOpen && <span>Announcements & Polls</span>}
          </NavLink>
        </div>

        {/* SECTION 3: MY TEAM */}
        <div className="space-y-1">
          {isOpen && (
            <p className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              MY TEAM
            </p>
          )}

          <NavLink
            to="/dashboard"
            className="flex items-center rounded-xl px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all group font-medium"
          >
            <MapPin size={17} className={cn("shrink-0", isOpen && "mr-3 text-slate-400 group-hover:text-white")} />
            {isOpen && <span>Team Geo-fence</span>}
          </NavLink>

          <NavLink
            to="/dashboard"
            className="flex items-center justify-between rounded-xl px-3 py-2 text-indigo-300 hover:text-white bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-800/40 transition-all group font-bold"
          >
            <div className="flex items-center truncate">
              <UserPlus size={17} className={cn("shrink-0 text-indigo-400", isOpen && "mr-3")} />
              {isOpen && <span className="truncate">HR Requests & Add Staff</span>}
            </div>
            {isOpen && pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                {pendingRequestsCount}
              </span>
            )}
          </NavLink>
        </div>

        {/* AI Copilot Widget */}
        {isOpen && (
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/60 border border-indigo-800/40 text-white space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-cyan-300 border border-indigo-400/30 uppercase tracking-wider">
              <Sparkles size={10} className="text-cyan-400" />
              AI COPILOT
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Ask about workforce — leaves, productivity, attrition.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-[11px] shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles size={12} />
              Open Crownco AI
            </button>
          </div>
        )}
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

  // --- HR Admin & Employee Sidebar Content ---
  const currentMenu = isManager ? [] : user?.role === 'Employee' ? employeeMenuItems : adminMenuItems;

  const renderDefaultSidebar = () => (
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
