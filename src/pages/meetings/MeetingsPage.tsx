import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarClock, Video, Users, Clock, Plus, ExternalLink,
  CheckCircle2, Calendar, User, Shield, Check, History,
  Sparkles, AlertCircle, Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { cn } from '../../utils/cn';

interface MeetingItem {
  id: string;
  title: string;
  type: '1-on-1' | 'Team Sync' | 'HR Review' | 'Sprint Review';
  host: string;
  participants: string;
  time: string;
  date: string;
  googleMeetUrl: string;
  attendeesCount: number;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

interface AttendanceRecord {
  id: string;
  meetingId: string;
  meetingTitle: string;
  userName: string;
  userRole: string;
  userEmail: string;
  joinedAt: string;
  date: string;
  meetUrl: string;
}

const generateRandomMeetCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${part1}-${part2}-${part3}`;
};

const initialMeetings: MeetingItem[] = [
  {
    id: 'meet-1',
    title: 'Daily Operations & Attendance Review Sync',
    type: 'Team Sync',
    host: 'Michael Chen (Operations Manager)',
    participants: 'Operations Team & Team Leads',
    time: '10:00 AM - 10:30 AM',
    date: '2026-10-26',
    googleMeetUrl: 'https://meet.google.com/zxc-vbnm-qwe',
    attendeesCount: 6,
    status: 'In Progress',
  },
  {
    id: 'meet-2',
    title: 'HR Admin & Manager Staffing Alignment',
    type: 'HR Review',
    host: 'Sarah Jenkins (HR Admin)',
    participants: 'Sarah Jenkins, Michael Chen, Ayaan Khan',
    time: '02:00 PM - 02:45 PM',
    date: '2026-10-26',
    googleMeetUrl: 'https://meet.google.com/hjk-plok-ijn',
    attendeesCount: 3,
    status: 'Scheduled',
  },
  {
    id: 'meet-3',
    title: '1-on-1 Performance Check-in: Aman Verma',
    type: '1-on-1',
    host: 'Michael Chen (Manager)',
    participants: 'Michael Chen, Aman Verma',
    time: '04:00 PM - 04:30 PM',
    date: '2026-10-26',
    googleMeetUrl: 'https://meet.google.com/yui-opas-dfg',
    attendeesCount: 2,
    status: 'Scheduled',
  },
  {
    id: 'meet-4',
    title: 'Monthly Workforce Policy & Appraisal Briefing',
    type: 'HR Review',
    host: 'HR Administration',
    participants: 'All Department Managers',
    time: '11:00 AM - 12:00 PM',
    date: '2026-10-27',
    googleMeetUrl: 'https://meet.google.com/qaz-wsxe-dcr',
    attendeesCount: 8,
    status: 'Scheduled',
  },
];

const initialLogs: AttendanceRecord[] = [
  {
    id: 'log-1',
    meetingId: 'meet-1',
    meetingTitle: 'Daily Operations & Attendance Review Sync',
    userName: 'Michael Chen',
    userRole: 'Manager',
    userEmail: 'manager@company.com',
    joinedAt: '10:02 AM',
    date: '2026-10-26',
    meetUrl: 'https://meet.google.com/zxc-vbnm-qwe',
  },
  {
    id: 'log-2',
    meetingId: 'meet-1',
    meetingTitle: 'Daily Operations & Attendance Review Sync',
    userName: 'Aman Verma',
    userRole: 'Employee',
    userEmail: 'presales@company.com',
    joinedAt: '10:05 AM',
    date: '2026-10-26',
    meetUrl: 'https://meet.google.com/zxc-vbnm-qwe',
  },
];

export const MeetingsPage = () => {
  const { user } = useAuthStore();
  const [meetings, setMeetings] = useState<MeetingItem[]>(initialMeetings);
  const [records, setRecords] = useState<AttendanceRecord[]>(initialLogs);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New meeting form
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MeetingItem['type']>('Team Sync');
  const [time, setTime] = useState('03:00 PM - 03:30 PM');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [participants, setParticipants] = useState('Operations & HR Team');

  // Core feature: Join meeting -> open link & record attendance!
  const handleJoinMeeting = (meeting: MeetingItem) => {
    // 1. Open URL in new window/tab
    window.open(meeting.googleMeetUrl, '_blank', 'noopener,noreferrer');

    // 2. Create and store attendance record
    const newRecord: AttendanceRecord = {
      id: 'rec-' + Date.now().toString().slice(-4),
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      userName: user?.name || 'Michael Chen',
      userRole: user?.role || 'Manager',
      userEmail: user?.email || 'manager@company.com',
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toLocaleDateString(),
      meetUrl: meeting.googleMeetUrl,
    };

    setRecords([newRecord, ...records]);

    // 3. Update meeting attendee counter
    setMeetings(meetings.map(m => m.id === meeting.id ? { ...m, attendeesCount: m.attendeesCount + 1 } : m));

    toast.success(`Meeting opened! Attendance record logged for ${newRecord.userName}.`, {
      icon: '📹',
      duration: 4000,
    });
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a meeting title');
      return;
    }

    const newMeet: MeetingItem = {
      id: 'meet-' + Date.now().toString().slice(-4),
      title: title.trim(),
      type,
      host: `${user?.name || 'Michael Chen'} (${user?.role || 'Manager'})`,
      participants: participants.trim() || 'Team Members',
      time,
      date,
      googleMeetUrl: generateRandomMeetCode(),
      attendeesCount: 1,
      status: 'Scheduled',
    };

    setMeetings([newMeet, ...meetings]);
    toast.success('Meeting scheduled with Google Meet URL!', { icon: '🗓️' });
    setTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <CalendarClock size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Scheduled Meetings & Google Meet Links
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Click any Google Meet link to launch the call — your attendance and timestamp are automatically logged in the audit ledger below.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 text-xs sm:text-sm"
        >
          <Plus size={16} />
          <span>+ Schedule Meeting</span>
        </Button>
      </div>

      {/* Scheduled Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="rounded-2xl border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                      {meeting.type}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      meeting.status === 'In Progress' 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse" 
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      {meeting.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{meeting.title}</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5">
                    <Clock size={13} /> {meeting.date} · {meeting.time}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Video size={20} />
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 border-y py-2.5 border-slate-100 dark:border-slate-800">
                <p><strong className="text-slate-700 dark:text-slate-300">Host:</strong> {meeting.host}</p>
                <p><strong className="text-slate-700 dark:text-slate-300">Participants:</strong> {meeting.participants}</p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users size={14} />
                  <span>{meeting.attendeesCount} Joined/Attended</span>
                </div>

                {/* Direct Join Action */}
                <Button
                  onClick={() => handleJoinMeeting(meeting)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Video size={14} />
                  <span>Join Google Meet</span>
                  <ExternalLink size={12} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance & Activity Ledger (Requested: link click records come here!) */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-0.5">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History size={18} className="text-indigo-600 dark:text-indigo-400" />
              Live Meeting Attendance Records (Auto-Logged on Join)
            </CardTitle>
            <p className="text-xs text-slate-400">
              Every time a meeting link is opened, the user's presence, timestamp, and meeting room are recorded automatically.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
            {records.length} Logs Recorded
          </span>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Attendee</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Meeting Room</th>
                  <th className="px-4 py-3">Joined Time</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                        {rec.userName[0]}
                      </div>
                      <div>
                        <span>{rec.userName}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">{rec.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[10px]">
                        {rec.userRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {rec.meetingTitle}
                    </td>
                    <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      {rec.joinedAt}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{rec.date}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1 w-fit">
                        <Check size={10} /> Attended
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Schedule Meeting */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                    <Video size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Schedule New Meeting</h3>
                    <p className="text-xs text-slate-400">Generates instant Google Meet URL</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>

              <form onSubmit={handleCreateMeeting} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Meeting Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Weekly Workforce & Sprint Planning"
                    required
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Meeting Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                    >
                      <option value="Team Sync">Team Sync</option>
                      <option value="HR Review">HR Review</option>
                      <option value="1-on-1">1-on-1</option>
                      <option value="Sprint Review">Sprint Review</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date</label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time Slot</label>
                  <Input
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 02:00 PM - 02:45 PM"
                    required
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Participants</label>
                  <Input
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="e.g. Operations Team & Sarah Jenkins (HR Admin)"
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border text-xs text-slate-500">
                  A unique Google Meet URL will be created and active immediately.
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs px-5">
                    Schedule & Generate Link
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
