import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Settings, Calendar as CalendarIcon, Plus, Trash2, Edit2, Info, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Tabs } from '../../components/Tabs';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Switch } from '../../components/Switch';
import { Button } from '../../components/Button';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useEmployeeStore } from '../../store/employeeStore';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AttendanceConfigPage = () => {
  const [activeTab, setActiveTab] = useState('shifts');
  const { 
    shifts, settings, holidays, 
    updateSettings, addShift, deleteShift, updateShift, 
    addHoliday, deleteHoliday 
  } = useAttendanceStore();
  const { employees } = useEmployeeStore();
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSettingsDirty, setIsSettingsDirty] = useState(false);

  // New Shift Form State
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [newShift, setNewShift] = useState({
    name: '', startTime: '09:00', endTime: '18:00',
    breakDuration: 60, gracePeriod: 15, halfDayHours: 4, fullDayHours: 8,
    workingDays: [1, 2, 3, 4, 5], color: '#3b82f6'
  });

  // New Holiday Form State
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', type: 'Public' as any });

  const handleSettingsChange = (key: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setIsSettingsDirty(true);
  };

  const saveSettings = () => {
    updateSettings(localSettings);
    setIsSettingsDirty(false);
    toast.success('Work settings updated successfully');
  };

  const toggleWorkingDay = (dayIndex: number) => {
    setNewShift(prev => {
      const days = prev.workingDays.includes(dayIndex) 
        ? prev.workingDays.filter(d => d !== dayIndex)
        : [...prev.workingDays, dayIndex].sort();
      return { ...prev, workingDays: days };
    });
  };

  const handleSaveShift = () => {
    if (!newShift.name) return toast.error('Shift name is required');
    addShift(newShift as any);
    setIsAddingShift(false);
    setNewShift({
      name: '', startTime: '09:00', endTime: '18:00',
      breakDuration: 60, gracePeriod: 15, halfDayHours: 4, fullDayHours: 8,
      workingDays: [1, 2, 3, 4, 5], color: '#3b82f6'
    });
    toast.success('Shift created successfully');
  };

  const handleDeleteShift = (id: string) => {
    const assignedCount = employees.filter(e => e.shiftId === id).length;
    if (assignedCount > 0) {
      toast.error(`Cannot delete shift. ${assignedCount} employees are assigned to it.`);
      return;
    }
    if (window.confirm('Are you sure you want to delete this shift?')) {
      deleteShift(id);
      toast.success('Shift deleted');
    }
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoliday.name || !newHoliday.date) return toast.error('Please fill all fields');
    addHoliday(newHoliday);
    setNewHoliday({ name: '', date: '', type: 'Public' });
    toast.success('Holiday added to calendar');
  };

  const renderShifts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active Shifts</h3>
        <Button onClick={() => setIsAddingShift(!isAddingShift)}>
          {isAddingShift ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add New Shift</>}
        </Button>
      </div>

      <AnimatePresence>
        {isAddingShift && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <Card className="mb-6 border-primary-200 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-900/10">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Shift Name" value={newShift.name} onChange={e => setNewShift({...newShift, name: e.target.value})} placeholder="e.g. Morning Shift" />
                  <Input label="Start Time" type="time" value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} />
                  <Input label="End Time" type="time" value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} />
                  <Input label="Break Duration (mins)" type="number" value={newShift.breakDuration} onChange={e => setNewShift({...newShift, breakDuration: Number(e.target.value)})} />
                  <Input label="Grace Period (mins)" type="number" value={newShift.gracePeriod} onChange={e => setNewShift({...newShift, gracePeriod: Number(e.target.value)})} />
                  <Input label="Color Code" type="color" value={newShift.color} onChange={e => setNewShift({...newShift, color: e.target.value})} className="h-11 cursor-pointer" />
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Working Days</p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day, i) => {
                      const isSelected = newShift.workingDays.includes(i);
                      return (
                        <button
                          key={day}
                          onClick={() => toggleWorkingDay(i)}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                            isSelected ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Button variant="outline" onClick={() => setIsAddingShift(false)}>Cancel</Button>
                  <Button onClick={handleSaveShift}>Save Shift</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.map(shift => {
          const assignedEmployees = employees.filter(e => e.shiftId === shift.id).length;
          return (
            <motion.div key={shift.id} whileHover={{ y: -4 }}>
              <Card className="h-full overflow-hidden border-t-4" style={{ borderTopColor: shift.color }}>
                <CardContent className="p-6 relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        {shift.name}
                      </h4>
                      <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-2 flex items-center gap-2">
                        <Clock size={20} className="text-slate-400" />
                        {shift.startTime} - {shift.endTime}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteShift(shift.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Break Duration</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{shift.breakDuration} mins</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Grace Period</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{shift.gracePeriod} mins</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Assigned</span>
                      <span className="font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {assignedEmployees} employees
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex gap-1 mt-4">
                        {DAYS.map((day, i) => {
                          const isWorking = shift.workingDays.includes(i);
                          return (
                            <div 
                              key={day} 
                              className={cn(
                                "flex-1 text-center text-[10px] py-1 rounded-md font-medium",
                                isWorking ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                              )}
                            >
                              {day.charAt(0)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-3xl space-y-6">
      {isSettingsDirty && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 flex justify-between items-center animate-in fade-in">
          <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
            <AlertTriangle size={20} />
            <span className="font-medium">You have unsaved changes</span>
          </div>
          <Button onClick={saveSettings} className="bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-amber-500/30 shadow-lg">
            Save Changes
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Time & Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Default Start Time" type="time" value={localSettings.defaultStartTime} onChange={(e) => handleSettingsChange('defaultStartTime', e.target.value)} />
            <Input label="Default End Time" type="time" value={localSettings.defaultEndTime} onChange={(e) => handleSettingsChange('defaultEndTime', e.target.value)} />
            <Input label="Late Mark After (mins)" type="number" value={localSettings.lateMarkAfter} onChange={(e) => handleSettingsChange('lateMarkAfter', Number(e.target.value))} />
            <Input label="Early Leave Before (mins)" type="number" value={localSettings.earlyLeaveBefore} onChange={(e) => handleSettingsChange('earlyLeaveBefore', Number(e.target.value))} />
            <Input label="Half Day Rule (Hours < X)" type="number" step="0.5" value={localSettings.halfDayRuleHours} onChange={(e) => handleSettingsChange('halfDayRuleHours', Number(e.target.value))} />
          </div>
          
          <hr className="border-border" />
          
          <div className="space-y-4">
            <Switch 
              checked={localSettings.overtimeEnabled} 
              onCheckedChange={(v) => handleSettingsChange('overtimeEnabled', v)}
              label="Enable Overtime Calculation" 
              description="Automatically calculate overtime for hours logged beyond the full day hours."
            />
            {localSettings.overtimeEnabled && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-2">
                <Input label="Overtime Multiplier" type="number" step="0.1" value={localSettings.overtimeMultiplier} onChange={(e) => handleSettingsChange('overtimeMultiplier', Number(e.target.value))} />
              </motion.div>
            )}
            
            <Switch 
              checked={localSettings.autoAbsentRule} 
              onCheckedChange={(v) => handleSettingsChange('autoAbsentRule', v)}
              label="Auto Absent on No-Show" 
              description="Automatically mark employee as absent if no clock-in is registered by end of shift."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHolidays = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Holiday</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddHoliday} className="space-y-4">
              <Input label="Holiday Name" placeholder="e.g. New Year" value={newHoliday.name} onChange={e => setNewHoliday({...newHoliday, name: e.target.value})} required />
              <Input label="Date" type="date" value={newHoliday.date} onChange={e => setNewHoliday({...newHoliday, date: e.target.value})} required />
              <Select label="Type" options={['Public', 'Restricted', 'Company'].map(t=>({label:t,value:t}))} value={newHoliday.type} onChange={e => setNewHoliday({...newHoliday, type: e.target.value as any})} />
              <Button type="submit" className="w-full mt-2">Add to Calendar</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30">
          <CardContent className="p-4 flex gap-3 text-primary-800 dark:text-primary-300">
            <Info size={24} className="flex-shrink-0" />
            <p className="text-sm">Holidays added here will automatically mark employees as 'Holiday' instead of 'Absent' if they don't check in on that date.</p>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {holidays.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((holiday) => {
                const dateObj = new Date(holiday.date);
                const isPast = dateObj < new Date();
                return (
                  <div key={holiday.id} className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-colors",
                    isPast ? "bg-slate-50 dark:bg-slate-800/30 border-transparent opacity-60" : "bg-white dark:bg-slate-900 border-border hover:shadow-sm"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold",
                        isPast ? "bg-slate-200 text-slate-500 dark:bg-slate-800" : "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400"
                      )}>
                        <span className="text-xs font-normal uppercase leading-none">{dateObj.toLocaleString('en-US', { month: 'short' })}</span>
                        <span className="text-lg leading-none mt-1">{dateObj.getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{holiday.name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-1 inline-block">
                          {holiday.type} Holiday
                        </span>
                      </div>
                    </div>
                    <button onClick={() => deleteHoliday(holiday.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )
              })}
              {holidays.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No holidays configured yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Configuration</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage shifts, working hours, and organizational holidays.</p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'shifts', label: 'Shift Management', icon: <Clock size={16} /> },
          { id: 'settings', label: 'Work Time Settings', icon: <Settings size={16} /> },
          { id: 'holidays', label: 'Holiday Calendar', icon: <CalendarIcon size={16} /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'shifts' && renderShifts()}
            {activeTab === 'settings' && renderSettings()}
            {activeTab === 'holidays' && renderHolidays()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
