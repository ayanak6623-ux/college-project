import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Shift, WorkSettings, Holiday, AttendanceRecord, AttendanceStatus } from '../types/attendance';

export interface ActiveSession {
  employeeId: string;
  checkInTimestamp: number; // Unix epoch ms
  checkInTimeStr: string;   // e.g. "09:15 AM"
  date: string;             // YYYY-MM-DD
  shiftId: string;
}

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
      if (isWeekend) continue;
      
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
  activeSessions: Record<string, ActiveSession>; // Persisted active punch sessions per employeeId
  isLoading: boolean;
  
  fetchAttendance: () => Promise<void>;
  saveAttendanceRecord: (record: Omit<AttendanceRecord, 'id'> & { id?: string }) => Promise<void>;
  
  // Continuous punch clock session methods
  clockInEmployee: (employeeId: string, shiftId?: string) => Promise<{ checkInTimeStr: string }>;
  clockOutEmployee: (employeeId: string, isAuto?: boolean) => Promise<{ checkOutTimeStr: string; totalHours: number }>;
  getActiveSession: (employeeId: string) => ActiveSession | null;
  
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
      activeSessions: {},
      isLoading: false,

      fetchAttendance: async () => {
        try {
          set({ isLoading: true });
          const res = await fetch(API_URL);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              set((state) => {
                // Merge DB records with existing records (DB records take priority)
                const dbKeys = new Set(data.map((r: any) => `${r.employeeId}_${r.date}`));
                const remaining = state.attendanceRecords.filter(
                  r => !dbKeys.has(`${r.employeeId}_${r.date}`)
                );
                return { attendanceRecords: [...data, ...remaining] };
              });
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
          // Fallback optimistic update
          set((state) => ({
            attendanceRecords: [
              { ...record, id: record.id || `att-${Date.now()}` } as AttendanceRecord,
              ...state.attendanceRecords.filter(r => !(r.employeeId === record.employeeId && r.date === record.date))
            ]
          }));
        }
      },

      // Clock in: saves persistent timestamp and syncs to DB
      clockInEmployee: async (employeeId: string, shiftId = 'shift-1') => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const checkIn24 = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const timestamp = now.getTime();

        const session: ActiveSession = {
          employeeId,
          checkInTimestamp: timestamp,
          checkInTimeStr: timeStr,
          date: dateStr,
          shiftId,
        };

        set((state) => ({
          activeSessions: {
            ...state.activeSessions,
            [employeeId]: session,
          },
        }));

        await get().saveAttendanceRecord({
          employeeId,
          date: dateStr,
          checkIn: checkIn24,
          status: 'Present',
          shiftId,
          totalHours: 0,
        });

        return { checkInTimeStr: timeStr };
      },

      // Clock out: calculates duration, removes active session, and syncs
      clockOutEmployee: async (employeeId: string, isAuto = false) => {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const checkOut24 = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const session = get().activeSessions?.[employeeId];

        let totalHours = 8.5;
        let checkIn24 = '09:00';
        if (session) {
          const elapsedMs = now.getTime() - session.checkInTimestamp;
          totalHours = Math.max(0.1, Number((elapsedMs / (1000 * 60 * 60)).toFixed(1)));
          if (isAuto) {
            totalHours = 8.5;
          }
          const inDate = new Date(session.checkInTimestamp);
          checkIn24 = inDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }

        set((state) => {
          const updated = { ...state.activeSessions };
          delete updated[employeeId];
          return { activeSessions: updated };
        });

        await get().saveAttendanceRecord({
          employeeId,
          date: session?.date || dateStr,
          checkIn: checkIn24,
          checkOut: isAuto ? '18:00' : checkOut24,
          status: 'Present',
          shiftId: session?.shiftId || 'shift-1',
          totalHours,
          notes: isAuto ? 'Shift concluded - Auto logged out' : undefined,
        });

        return { checkOutTimeStr: timeStr, totalHours };
      },

      // Get active session with auto shift end check
      getActiveSession: (employeeId: string) => {
        const session = get().activeSessions?.[employeeId];
        if (!session) return null;

        const todayStr = new Date().toISOString().split('T')[0];
        // If session is from previous date, auto finalize it
        if (session.date !== todayStr) {
          get().clockOutEmployee(employeeId, true);
          return null;
        }

        // Check if shift duration completed (e.g. 9 hours = 32400 sec) OR shift end time has passed
        const shift = get().shifts.find(s => s.id === session.shiftId) || get().shifts[0];
        const maxShiftSec = ((shift.fullDayHours || 8) + 1) * 3600; // 9 hrs
        const elapsedSec = Math.floor((Date.now() - session.checkInTimestamp) / 1000);

        const [endH, endM] = (shift.endTime || '18:00').split(':').map(Number);
        const now = new Date();
        const shiftEndDate = new Date();
        shiftEndDate.setHours(endH, endM, 0, 0);

        // If elapsed time exceeded shift limit or current time passed shift end time
        if (elapsedSec >= maxShiftSec || (now > shiftEndDate && new Date(session.checkInTimestamp) < shiftEndDate)) {
          get().clockOutEmployee(employeeId, true);
          return null;
        }

        return session;
      },
      
      addShift: (shift) => set((state) => ({ shifts: [...state.shifts, { ...shift, id: uuidv4() }] })),
      updateShift: (id, updated) => set((state) => ({ shifts: state.shifts.map(s => s.id === id ? { ...s, ...updated } : s) })),
      deleteShift: (id) => set((state) => ({ shifts: state.shifts.filter(s => s.id !== id) })),
      
      updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
      
      addHoliday: (holiday) => set((state) => ({ holidays: [...state.holidays, { ...holiday, id: uuidv4() }] })),
      deleteHoliday: (id) => set((state) => ({ holidays: state.holidays.filter(h => h.id !== id) })),
      
      updateAttendance: async (id, record) => {
        const existing = get().attendanceRecords.find(a => a.id === id);
        const employeeId = (record as any).employeeId || existing?.employeeId;
        const date = (record as any).date || existing?.date;

        if (employeeId && date) {
          await get().saveAttendanceRecord({
            id: (id.startsWith('new-') || id.startsWith('att-')) ? existing?.id : id,
            shiftId: existing?.shiftId || 'shift-1',
            totalHours: existing?.totalHours || 0,
            status: existing?.status || 'Present',
            ...existing,
            ...record,
            employeeId,
            date,
          });
          return;
        }

        // Fallback optimistic update
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
          const existingIdx = newRecords.findIndex(r => r.employeeId === employeeId && r.date === dateStr);
          if (existingIdx >= 0) {
            newRecords[existingIdx] = { ...newRecords[existingIdx], status: 'On Leave', checkIn: undefined, checkOut: undefined, totalHours: 0 };
          } else {
            newRecords.push({
              id: `att-${dateStr}-${employeeId}`,
              employeeId,
              date: dateStr,
              shiftId: 'shift-1',
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
