import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, Vote, Sparkles, Pin, CheckCircle2, 
  Clock, Calendar, Plus, MessageSquare, Heart, ThumbsUp,
  Share2, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { cn } from '../../utils/cn';

interface AnnouncementItem {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  date: string;
  isPinned: boolean;
  category: 'Company Update' | 'Holiday' | 'Townhall' | 'Wellness';
  content: string;
  likes: number;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollItem {
  id: string;
  question: string;
  totalVotes: number;
  options: PollOption[];
  hasVoted?: boolean;
  selectedOptionId?: string;
}

const initialAnnouncements: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Diwali Festive Holiday Schedule & Annual Gift Hampers Distribution',
    author: 'Sarah Jenkins',
    authorRole: 'HR Administration',
    date: 'October 24, 2026',
    isPinned: true,
    category: 'Holiday',
    content: 'All PeopleHub offices will observe statutory holidays from Nov 01 to Nov 04. Festive gift hampers and confectionery packages can be collected from the HR desk or dispatched to remote personnel addresses.',
    likes: 38,
  },
  {
    id: 'ann-2',
    title: 'All-Hands Q4 Company Townhall & Strategic Product Roadmap Briefing',
    author: 'Executive Leadership',
    authorRole: 'PeopleHub Board',
    date: 'October 22, 2026',
    isPinned: true,
    category: 'Townhall',
    content: 'Join us this Friday at 4:00 PM IST on Google Meet for our global townhall. We will celebrate milestone deliveries, recognize star performers, and outline Q1 revenue targets.',
    likes: 24,
  },
  {
    id: 'ann-3',
    title: 'New Wellness Reimbursement & Ergonomic Workspace Allowance',
    author: 'People & Culture Desk',
    authorRole: 'HR Team',
    date: 'October 18, 2026',
    isPinned: false,
    category: 'Wellness',
    content: 'Starting November, employees can submit claims of up to ₹5,000 for gym memberships, mental health counseling, or home office ergonomic chairs via the reimbursement portal.',
    likes: 45,
  },
];

const initialPolls: PollItem[] = [
  {
    id: 'poll-1',
    question: 'Where should we organize the Annual PeopleHub Winter Team Offsite?',
    totalVotes: 64,
    options: [
      { id: 'opt-1', text: 'Goa (Beach Retreat & Water Sports)', votes: 32 },
      { id: 'opt-2', text: 'Manali / Kasol (Himalayan Mountains)', votes: 20 },
      { id: 'opt-3', text: 'Rishikesh (Camping & River Rafting)', votes: 12 },
    ],
  },
  {
    id: 'poll-2',
    question: 'Preferred Core Timing for Hybrid Friday Collaboration:',
    totalVotes: 52,
    options: [
      { id: 'p2-1', text: '09:00 AM - 03:00 PM (Early wrap-up)', votes: 36 },
      { id: 'p2-2', text: '10:00 AM - 04:00 PM (Standard flex)', votes: 16 },
    ],
  },
];

export const AnnouncementsPage = () => {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [polls, setPolls] = useState<PollItem[]>(initialPolls);
  const [likedAnnouncements, setLikedAnnouncements] = useState<string[]>([]);

  // Vote on poll
  const handleVote = (pollId: string, optionId: string) => {
    setPolls(polls.map(p => {
      if (p.id === pollId) {
        if (p.hasVoted) {
          toast.error('You have already submitted your vote for this poll');
          return p;
        }

        const updatedOpts = p.options.map(opt => 
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );

        toast.success('Your vote has been cast successfully!', { icon: '🗳️' });
        return {
          ...p,
          totalVotes: p.totalVotes + 1,
          hasVoted: true,
          selectedOptionId: optionId,
          options: updatedOpts,
        };
      }
      return p;
    }));
  };

  const handleLike = (id: string) => {
    if (likedAnnouncements.includes(id)) {
      setLikedAnnouncements(likedAnnouncements.filter(i => i !== id));
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, likes: a.likes - 1 } : a));
    } else {
      setLikedAnnouncements([...likedAnnouncements, id]);
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, likes: a.likes + 1 } : a));
      toast.success('Liked announcement!', { icon: '❤️' });
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Megaphone size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Announcements & Interactive Team Polls
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Company-wide updates from HR Administration and real-time interactive polls for team decisions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Announcements Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Pin size={18} className="text-indigo-600" />
            Official HR Bulletins & Company Updates
          </h3>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <Card key={ann.id} className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardContent className="p-6 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {ann.isPinned && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                            <Pin size={10} /> PINNED
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                          {ann.category}
                        </span>
                      </div>
                      <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                        {ann.title}
                      </h4>
                    </div>

                    <span className="text-xs text-slate-400 shrink-0 font-medium">{ann.date}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ann.content}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Published by: <strong className="text-slate-700 dark:text-slate-300">{ann.author}</strong> ({ann.authorRole})</span>
                    <button
                      onClick={() => handleLike(ann.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all font-bold",
                        likedAnnouncements.includes(ann.id)
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      )}
                    >
                      <Heart size={14} className={likedAnnouncements.includes(ann.id) ? "fill-rose-500 text-rose-500" : ""} />
                      <span>{ann.likes}</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Live Team Polls */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Vote size={18} className="text-indigo-600" />
            Live Workforce Polls (Vote Now)
          </h3>

          <div className="space-y-4">
            {polls.map((poll) => (
              <Card key={poll.id} className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                      Active Poll
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {poll.question}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {poll.options.map((opt) => {
                      const percentage = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                      const isChosen = poll.selectedOptionId === opt.id;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleVote(poll.id, opt.id)}
                          className={cn(
                            "relative overflow-hidden p-3 rounded-xl border transition-all cursor-pointer group",
                            isChosen
                              ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-300"
                          )}
                        >
                          {/* Percentage Progress Bar Background */}
                          <div
                            className={cn(
                              "absolute left-0 top-0 bottom-0 opacity-20 transition-all",
                              isChosen ? "bg-indigo-600" : "bg-slate-400 dark:bg-slate-600"
                            )}
                            style={{ width: `${percentage}%` }}
                          />

                          <div className="relative z-10 flex items-center justify-between text-xs font-semibold">
                            <span className={cn(isChosen ? "text-indigo-900 dark:text-indigo-200 font-bold" : "text-slate-800 dark:text-slate-200")}>
                              {opt.text}
                            </span>
                            <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
                              {percentage}% ({opt.votes})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>{poll.totalVotes} Total Votes Cast</span>
                    {poll.hasVoted && (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Vote Recorded
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
