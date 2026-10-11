export interface Shift {
  id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakDuration: number; // minutes
  gracePeriod: number; // minutes
  halfDayHours: number;
  fullDayHours: number;
  workingDays: number[]; // 0=Sun, 1=Mon...
  color: string;
}

export interface WorkSettings {
  defaultStartTime: string;
  defaultEndTime: string;
  lateMarkAfter: number; // minutes
  earlyLeaveBefore: number; // minutes
  halfDayRuleHours: number;
  overtimeEnabled: boolean;
  overtimeMultiplier: number;
  weeklyOffDays: number[];
  autoAbsentRule: boolean;
}

export type HolidayType = 'Public' | 'Restricted' | 'Company';

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  type: HolidayType;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half-day' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  shiftId: string;
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  totalHours: number;
  status: AttendanceStatus;
  notes?: string;
}
