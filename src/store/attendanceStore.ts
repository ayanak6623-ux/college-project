import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Shift, WorkSettings, Holiday, AttendanceRecord, AttendanceStatus } from '../types/attendance';

const defaultShifts: Shift[] = [
  { id: 'shift-1', name: 'General', startTime: '09:00', endTime: '18:00', breakDuration: 60, gracePeriod: 15, halfDayHours: 4, fullDayHours: 8, workingDays: [1, 2, 3, 4, 5], color: '#3b82f6' },
  { id: 'shift-2', name: 'Morning', startTime: '06:00', endTime: '14:00', breakDuration: 30, gracePeriod: 15, halfDayHours: 4, fullDayHours: 7.5, workingDays: [1, 2, 3, 4, 5], color: '#10b981' },
  { id: 'shift-3', name: 'Night', startTime: '22:00', endTime: '06:00', breakDuration: 60, gracePeriod: 15, halfDayHours: 4, fullDayHours: 8, workingDays: [1, 2, 3, 4, 5], color: '#8b5cf6' },
];

const defaultSettings: WorkSettings = {
  defaultStartTime: '09:00',
  defaultEndTime: '18:00',
  lateMarkAfter: 15,
  earlyLeaveBefore: 15,
  halfDayRuleHours: 4,
  overtimeEnabled: true,
  overtimeMultiplier: 1.5,
  weeklyOffDays: [0, 6],
  autoAbsentRule: true,
};

const currentYear = new Date().getFullYear();
const defaultHolidays: Holiday[] = [
  { id: 'hol-1', name: 'Republic Day', date: `${currentYear}-01-26`, type: 'Public' },
  { id: 'hol-2', name: 'Holi', date: `${currentYear}-03-25`, type: 'Restricted' },
  { id: 'hol-3', name: 'Independence Day', date: `${currentYear}-08-15`, type: 'Public' },
  { id: 'hol-4', name: 'Diwali', date: `${currentYear}-11-01`, type: 'Public' },
  { id: 'hol-5', name: 'Christmas', date: `${currentYear}-12-25`, type: 'Public' },
];

// Helper to generate mock attendance
const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  // For each of the last 30 days
  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // For 20 mock employees
    for (let empId = 1; empId <= 20; empId++) {
      if (isWeekend) continue; // Skip weekends for simplicity
      
      const rand = Math.random();
      let status: AttendanceStatus = 'Present';
      let checkIn = '09:00';
      let checkOut = '18:00';
      let totalHours = 9;

      if (rand > 0.95) {
        status = 'Absent';
        checkIn = '';
        checkOut = '';
        totalHours = 0;
      } else if (rand > 0.85) {
        status = 'On Leave';
        checkIn = '';
        checkOut = '';
        totalHours = 0;
      } else if (rand > 0.75) {
        status = 'Late';
        checkIn = '09:30';
        totalHours = 8.5;
      } else if (rand > 0.70) {
        status = 'Half-day';
        checkIn = '09:00';
        checkOut = '13:00';
        totalHours = 4;
      }

      records.push({
        id: `att-${dateStr}-${empId}`,
        employeeId: empId.toString(),
        date: dateStr,
        shiftId: 'shift-1',
        checkIn: checkIn ? checkIn : undefined,
        checkOut: checkOut ? checkOut : undefined,
        totalHours,
        status,
      });
    }
  }
  return records;
};

const API_URL = 'http://localhost:5000/api/attendance';

interface AttendanceState {
  shifts: Shift[];
  settings: WorkSettings;
  holidays: Holiday[];
  attendanceRecords: AttendanceRecord[];
  isLoading: boolean;
  
  fetchAttendance: () => Promise<void>;
  saveAttendanceRecord: (record: Omit<AttendanceRecord, 'id'> & { id?: string }) => Promise<void>;
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (id: string, shift: Partial<Shift>) => void;
  deleteShift: (id: string) => void;
  
  updateSettings: (settings: Partial<WorkSettings>) => void;
  
  addHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  deleteHoliday: (id: string) => void;
  
  updateAttendance: (id: string, record: Partial<AttendanceRecord>) => Promise<void>;
  markLeave: (employeeId: string, fromDate: string, toDate: string) => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      shifts: defaultShifts,
      settings: defaultSettings,
      holidays: defaultHolidays,
      attendanceRecords: generateMockAttendance(),
      isLoading: false,

      fetchAttendance: async () => {
        try {
          set({ isLoading: true });
          const res = await fetch(API_URL);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              set({ attendanceRecords: data });
            }
          }
        } catch (err) {
          console.warn('Backend attendance fetch notice:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      saveAttendanceRecord: async (record) => {
        try {
          const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record),
          });
          if (res.ok) {
            const saved = await res.json();
            set((state) => ({
              attendanceRecords: [
                saved,
                ...state.attendanceRecords.filter(r => !(r.employeeId === saved.employeeId && r.date === saved.date))
              ]
            }));
          }
        } catch (err) {
          console.error('Error saving attendance record to database:', err);
        }
      },
      
      addShift: (shift) => set((state) => ({ shifts: [...state.shifts, { ...shift, id: uuidv4() }] })),
      updateShift: (id, updated) => set((state) => ({ shifts: state.shifts.map(s => s.id === id ? { ...s, ...updated } : s) })),
      deleteShift: (id) => set((state) => ({ shifts: state.shifts.filter(s => s.id !== id) })),
      
      updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
      
      addHoliday: (holiday) => set((state) => ({ holidays: [...state.holidays, { ...holiday, id: uuidv4() }] })),
      deleteHoliday: (id) => set((state) => ({ holidays: state.holidays.filter(h => h.id !== id) })),
      
      updateAttendance: async (id, record) => {
        set((state) => ({
          attendanceRecords: state.attendanceRecords.map(a => a.id === id ? { ...a, ...record } : a)
        }));

        try {
          await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record),
          });
        } catch (err) {
          console.warn('Could not sync attendance update to database:', err);
        }
      },

      markLeave: (employeeId, fromDate, toDate) => set((state) => {
        const newRecords = [...state.attendanceRecords];
        const start = new Date(fromDate);
        const end = new Date(toDate);
        
        const cur = new Date(start);
        while (cur <= end) {
          const dateStr = cur.toISOString().split('T')[0];
          // Check if record exists
          const existingIdx = newRecords.findIndex(r => r.employeeId === employeeId && r.date === dateStr);
          if (existingIdx >= 0) {
            newRecords[existingIdx] = { ...newRecords[existingIdx], status: 'On Leave', checkIn: undefined, checkOut: undefined, totalHours: 0 };
          } else {
            newRecords.push({
              id: `att-${dateStr}-${employeeId}`,
              employeeId,
              date: dateStr,
              shiftId: 'shift-1', // Default, should ideally match employee's shift
              status: 'On Leave',
              totalHours: 0,
            });
          }
          cur.setDate(cur.getDate() + 1);
        }
        
        return { attendanceRecords: newRecords };
      })
    }),
    {
      name: 'hrms-attendance-storage'
    }
  )
);
