import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, ShieldCheck, AlertCircle, User, MapPin, 
  Users, Briefcase, ChevronDown, Lock, ArrowRight, 
  CheckCircle2, TrendingUp, Sparkles, Building2, Clock, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/Button';
import { useAuthStore } from '../store';
import { useEmployeeStore } from '../store/employeeStore';
import { cn } from '../utils/cn';

const loginSchema = z.object({
  email: z.string().min(1, 'Email or Employee ID is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { id: 'hr', label: 'HR Admin', email: 'hr@company.com', password: 'Admin@123', role: 'HR Admin', icon: ShieldCheck, badge: 'Full Admin' },
  { id: 'presales', label: 'Pre Sales', email: 'presales@company.com', password: 'Admin@123', role: 'Employee', icon: User, badge: 'Employee' },
  { id: 'sales', label: 'Sales', email: 'sales@company.com', password: 'Admin@123', role: 'Employee', icon: MapPin, badge: 'Field Rep' },
  { id: 'hybrid', label: 'Hybrid', email: 'hybrid@company.com', password: 'Admin@123', role: 'Employee', icon: Users, badge: 'Hybrid Staff' },
  { id: 'manager', label: 'Manager', email: 'manager@company.com', password: 'Admin@123', role: 'Manager', icon: Briefcase, badge: 'Manager' },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const { employees, fetchEmployees } = useEmployeeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  React.useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  
  const allAccounts = React.useMemo(() => {
    const dynamicAccounts = employees
      .filter((emp: any) => emp.password)
      .map((emp: any) => ({
        id: emp.id,
        label: `${emp.firstName} ${emp.lastName}`,
        email: emp.loginEmail || emp.email,
        password: emp.password,
        role: emp.role,
        badge: emp.empId || emp.role,
        icon: emp.role === 'HR Admin' ? ShieldCheck : emp.role === 'Manager' ? Briefcase : User,
      }));
    return [...DEMO_ACCOUNTS, ...dynamicAccounts];
  }, [employees]);

  const [selectedAccount, setSelectedAccount] = useState(allAccounts[0]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: allAccounts[0].email,
      password: allAccounts[0].password,
      rememberMe: true,
    }
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const inputVal = data.email.trim().toLowerCase();

    // Check against demo accounts
    const defaultAcc = DEMO_ACCOUNTS.find(
      acc => acc.email.toLowerCase() === inputVal || acc.id.toLowerCase() === inputVal
    );
    const isDefaultAuth = data.password === 'Admin@123' && Boolean(defaultAcc);
    
    // Check against employee records in MongoDB
    const employeeMatch = employees.find(
      (emp) =>
        ((emp.loginEmail && emp.loginEmail.toLowerCase() === inputVal) ||
         (emp.email && emp.email.toLowerCase() === inputVal) ||
         (emp.empId && emp.empId.toLowerCase() === inputVal)) &&
        emp.password === data.password
    );

    if (isDefaultAuth || employeeMatch) {
      let loginName = 'HR Admin';
      let loginRole = 'admin';
      
      if (employeeMatch) {
        loginName = `${employeeMatch.firstName} ${employeeMatch.lastName}`;
        loginRole = employeeMatch.role;
      } else if (defaultAcc) {
        loginName = defaultAcc.label;
        loginRole = defaultAcc.role;
      }
      
      login(data.email, loginName, loginRole);
      toast.success(`Welcome back, ${loginName}!`, { icon: '👋' });
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials. Please enter valid Email or Employee ID.', {
        icon: <AlertCircle className="text-rose-500" />,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row overflow-hidden select-none">
      {/* Left side - Login Form (Standard size, zero overflow) */}
      <div className="w-full md:w-[460px] lg:w-[490px] xl:w-[520px] shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-y-auto z-20 shadow-xl">
        
        {/* Top Logo / Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 font-bold text-lg">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">PeopleHub</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/40 uppercase tracking-wider">
                  HRMS
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Enterprise Workforce Cloud</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            MongoDB Online
          </div>
        </div>

        {/* Center Main Form Body */}
        <div className="my-auto py-4 space-y-5">
          {/* Title & dynamic greeting */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sign in to continue to <span className="font-semibold text-primary-600 dark:text-primary-400">{selectedAccount.label}</span> portal
            </p>
          </div>

          {/* Quick Portal / Role Switcher Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Portal / Account
            </label>
            <div className="relative">
              <button 
                type="button" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border rounded-xl focus:outline-none transition-all text-xs sm:text-sm font-semibold",
                  isDropdownOpen 
                    ? "border-primary-500 ring-2 ring-primary-500/20 text-slate-900 dark:text-white bg-white dark:bg-slate-800" 
                    : "border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                    <selectedAccount.icon size={15} />
                  </div>
                  <span className="truncate">{selectedAccount.label}</span>
                  {selectedAccount.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {selectedAccount.badge}
                    </span>
                  )}
                </div>
                <ChevronDown size={16} className={cn("text-slate-400 transition-transform shrink-0 ml-2", isDropdownOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-1 max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                      {allAccounts.map((account) => (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => {
                            setSelectedAccount(account);
                            setIsDropdownOpen(false);
                            setValue('email', account.email, { shouldValidate: true });
                            setValue('password', account.password, { shouldValidate: true });
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm font-medium transition-colors rounded-lg",
                            selectedAccount.id === account.id 
                              ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold" 
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          )}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className={cn(
                              "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                              selectedAccount.id === account.id ? "bg-primary-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            )}>
                              <account.icon size={13} />
                            </div>
                            <span className="truncate">{account.label}</span>
                          </div>
                          {selectedAccount.id === account.id && (
                            <Check size={14} className="text-primary-600 dark:text-primary-400 shrink-0 ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Email / ID field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address or Employee ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="presales@company.com or EMP-002"
                  className={cn(
                    "flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all",
                    errors.email && "border-rose-500 focus:border-rose-500"
                  )}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] font-medium text-rose-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn(
                    "flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-3.5 pr-10 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all",
                    errors.password && "border-rose-500 focus:border-rose-500"
                  )}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] font-medium text-rose-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:checked:bg-primary-600"
                  {...register('rememberMe')}
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
              
              <button 
                type="button"
                onClick={() => toast('Demo mode active: Use Admin@123 as default password', { icon: 'ℹ️' })}
                className="text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-11 text-sm font-bold shadow-lg shadow-primary-500/25 mt-2" 
              isLoading={isLoading}
            >
              Sign In to Portal
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>
        </div>

        {/* Bottom Footer Note */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock size={12} className="text-emerald-500" />
            <span>256-bit SSL Encrypted</span>
          </div>
          <span>v2.4 Enterprise Edition</span>
        </div>
      </div>

      {/* Right side - Enterprise Showcase Visual (Full Professional Presentation) */}
      <div className="hidden md:flex flex-1 relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white overflow-hidden flex-col justify-between p-8 lg:p-12 xl:p-14">
        {/* Decorative Ambient Glow Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />

        {/* Right Top Header Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-primary-200">
            <Sparkles size={14} className="text-amber-300" />
            <span>Next-Gen HR & Attendance Platform</span>
          </div>
          <div className="text-xs font-medium text-slate-400">
            Enterprise Cloud v2.4
          </div>
        </div>

        {/* Right Center Hero Showcase Card */}
        <div className="relative z-10 my-auto py-6 max-w-xl">
          <div className="space-y-3 mb-6">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Empowering High-Performance <span className="bg-gradient-to-r from-primary-400 via-indigo-300 to-secondary-400 bg-clip-text text-transparent">Workforces.</span>
            </h2>
            <p className="text-sm text-slate-300/90 leading-relaxed max-w-lg">
              Unified human capital management system featuring real-time attendance punch, leave workflows, employee directories, and departmental intelligence.
            </p>
          </div>

          {/* Interactive Glassmorphism Preview Dashboard Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/15 p-5 shadow-2xl space-y-4"
          >
            {/* Widget Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-slate-300 font-semibold ml-2">Live Operations Monitor</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                System Live
              </div>
            </div>

            {/* 3 Metric Tiles */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/[0.05] border border-white/10 p-3">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span>Workforce</span>
                  <Users size={13} className="text-primary-400" />
                </div>
                <div className="text-xl font-bold text-white">248</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp size={10} /> +12% this month
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.05] border border-white/10 p-3">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span>Attendance</span>
                  <Clock size={13} className="text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-white">96.4%</div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  215 Present Today
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.05] border border-white/10 p-3">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span>Database</span>
                  <Building2 size={13} className="text-amber-400" />
                </div>
                <div className="text-sm font-bold text-white truncate">MongoDB Atlas</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">
                  ✓ Synchronized
                </div>
              </div>
            </div>

            {/* Activity Ticker Stream */}
            <div className="rounded-xl bg-black/20 p-2.5 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Aman Verma (Pre Sales) clocked in on time</span>
                </div>
                <span className="text-slate-500 text-[10px]">Just now</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  <span>Sarah Jenkins approved 2 pending leave requests</span>
                </div>
                <span className="text-slate-500 text-[10px]">12m ago</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Bottom Trust & Compliance Row */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-primary-400" />
              <span>99.99% Uptime SLA</span>
            </div>
          </div>
          <div className="text-slate-400 text-[11px]">
            Trusted by 500+ Enterprises
          </div>
        </div>
      </div>
    </div>
  );
};

