import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Moon, Sun, Monitor, Lock, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('system');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your profile, security, and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-sm border border-slate-100 dark:border-slate-700/50">
            <nav className="flex flex-col space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50'
                }`}
              >
                <User size={18} className="mr-3" />
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'security'
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50'
                }`}
              >
                <Shield size={18} className="mr-3" />
                Security & Password
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'preferences'
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50'
                }`}
              >
                <Monitor size={18} className="mr-3" />
                Preferences
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 md:p-8"
          >
            <form onSubmit={handleSave}>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Profile Information</h2>
                  
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      HA
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">HR Admin</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">hr@company.com</p>
                      <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Change Avatar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                      <input type="text" defaultValue="HR" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                      <input type="text" defaultValue="Admin" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                      <input type="email" defaultValue="hr@company.com" disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed" />
                      <p className="text-xs text-slate-500 mt-1">Email cannot be changed as it is used for login.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Security & Password</h2>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 p-4 rounded-xl flex items-start mb-6">
                    <Lock className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Ensure your account is using a long, random password to stay secure. We recommend using a password manager.</p>
                  </div>

                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-8">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">App Preferences</h2>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Appearance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button type="button" onClick={() => setTheme('light')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-primary-200'}`}>
                        <Sun className={theme === 'light' ? 'text-primary-600' : 'text-slate-400'} size={24} />
                        <span className="font-medium text-slate-700 dark:text-slate-300">Light</span>
                      </button>
                      <button type="button" onClick={() => setTheme('dark')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-primary-200'}`}>
                        <Moon className={theme === 'dark' ? 'text-primary-600' : 'text-slate-400'} size={24} />
                        <span className="font-medium text-slate-700 dark:text-slate-300">Dark</span>
                      </button>
                      <button type="button" onClick={() => setTheme('system')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'system' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-primary-200'}`}>
                        <Monitor className={theme === 'system' ? 'text-primary-600' : 'text-slate-400'} size={24} />
                        <span className="font-medium text-slate-700 dark:text-slate-300">System</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-700/50 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h3>
                    <div className="space-y-4">
                      <label className="flex items-start">
                        <div className="flex items-center h-5">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300" />
                        </div>
                        <div className="ml-3">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</span>
                          <p className="text-sm text-slate-500">Receive emails for leave requests and approvals.</p>
                        </div>
                      </label>
                      <label className="flex items-start">
                        <div className="flex items-center h-5">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300" />
                        </div>
                        <div className="ml-3">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">Browser Notifications</span>
                          <p className="text-sm text-slate-500">Get push notifications when you're active on the dashboard.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Save size={18} className="mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
