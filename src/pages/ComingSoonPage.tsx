import React from 'react';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

export const ComingSoonPage = ({ title }: { title: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] animate-in fade-in duration-500">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mb-6"
      >
        <Construction size={48} className="text-primary-600 dark:text-primary-400" />
      </motion.div>
      <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">{title}</h2>
      <p className="text-slate-500 max-w-md text-center">
        This module is currently under development. Check back later for updates to the {title} feature.
      </p>
    </div>
  );
};
