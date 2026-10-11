export const mockStats = {
  totalEmployees: 248,
  presentToday: 215,
  onLeave: 12,
  pendingRequests: 8
};

export const attendanceData = [
  { name: 'Mon', present: 220, absent: 28 },
  { name: 'Tue', present: 232, absent: 16 },
  { name: 'Wed', present: 215, absent: 33 },
  { name: 'Thu', present: 228, absent: 20 },
  { name: 'Fri', present: 210, absent: 38 },
];

export const departmentData = [
  { name: 'Engineering', value: 85, color: '#4f46e5' },
  { name: 'Sales', value: 45, color: '#06b6d4' },
  { name: 'Marketing', value: 35, color: '#f59e0b' },
  { name: 'HR', value: 15, color: '#ec4899' },
  { name: 'Operations', value: 68, color: '#10b981' },
];

export const leaveOverviewData = [
  { name: 'Jan', approved: 24, rejected: 4 },
  { name: 'Feb', approved: 18, rejected: 2 },
  { name: 'Mar', approved: 35, rejected: 8 },
  { name: 'Apr', approved: 20, rejected: 3 },
  { name: 'May', approved: 42, rejected: 10 },
];

export const recentEmployees = [
  { id: 'EMP001', name: 'Sarah Jenkins', role: 'Senior Frontend Engineer', department: 'Engineering', status: 'Active', avatar: 'S' },
  { id: 'EMP002', name: 'Michael Chen', role: 'Product Manager', department: 'Operations', status: 'Active', avatar: 'M' },
  { id: 'EMP003', name: 'Emily Davis', role: 'UX Designer', department: 'Engineering', status: 'On Leave', avatar: 'E' },
  { id: 'EMP004', name: 'James Wilson', role: 'Sales Rep', department: 'Sales', status: 'Active', avatar: 'J' },
];

export const pendingLeaves = [
  { id: 'LR001', employee: 'David Miller', type: 'Annual Leave', dates: 'Oct 15 - Oct 20', days: 5 },
  { id: 'LR002', employee: 'Lisa Taylor', type: 'Sick Leave', dates: 'Oct 10 - Oct 11', days: 2 },
  { id: 'LR003', employee: 'Robert Fox', type: 'Personal', dates: 'Oct 18', days: 1 },
];

export const upcomingHolidays = [
  { name: 'Thanksgiving', date: 'Nov 23, 2026' },
  { name: 'Christmas Day', date: 'Dec 25, 2026' },
  { name: 'New Year', date: 'Jan 1, 2027' },
];
