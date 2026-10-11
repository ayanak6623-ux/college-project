import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore, useThemeStore } from '../store';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null; // Return null while redirecting
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-500/20 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 flex flex-col items-center text-center px-4 max-w-3xl"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center mb-8 border border-border relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-500 opacity-10 rounded-2xl"></div>
          <ShieldCheck size={40} className="text-primary-600 dark:text-primary-400" />
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
          Welcome to <br />
          <span className="text-gradient">PeopleHub HRMS</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed">
          The premium HR administration portal. Manage employees, track attendance, and handle leave requests with an intuitive, modern experience.
        </p>

        <Button 
          size="lg" 
          onClick={() => navigate('/login')}
          className="group text-lg px-8 py-6 rounded-2xl shadow-lg shadow-primary-500/25"
        >
          Login as HR Admin
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </div>
  );
};
