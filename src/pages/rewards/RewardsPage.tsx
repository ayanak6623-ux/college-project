import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, Award, Sparkles, Star, Trophy, HeartHandshake, 
  Send, Plus, CheckCircle2, ChevronRight, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { cn } from '../../utils/cn';

interface RewardItem {
  id: string;
  recipient: string;
  role: string;
  badge: string;
  points: number;
  reason: string;
  awardedBy: string;
  date: string;
  iconColor: string;
}

const initialRewards: RewardItem[] = [
  {
    id: 'rew-1',
    recipient: 'Aman Verma',
    role: 'Pre Sales Executive',
    badge: 'Quarterly Sales Champion',
    points: 1500,
    reason: 'Exceeded regional client acquisition targets by 140% in Q3.',
    awardedBy: 'Michael Chen (Manager)',
    date: '2026-10-20',
    iconColor: 'from-amber-400 to-orange-500'
  },
  {
    id: 'rew-2',
    recipient: 'Michael Chen',
    role: 'Operations Manager',
    badge: 'Operational Excellence Lead',
    points: 2000,
    reason: 'Streamlined cross-functional shift scheduling and reduced overtime by 25%.',
    awardedBy: 'Sarah Jenkins (HR Admin)',
    date: '2026-10-15',
    iconColor: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'rew-3',
    recipient: 'Rajesh Sharma',
    role: 'Software Engineer',
    badge: 'Spotlight Bug Hunter',
    points: 800,
    reason: 'Identified and patched critical edge-case during production deployment.',
    awardedBy: 'Engineering Lead',
    date: '2026-10-12',
    iconColor: 'from-emerald-400 to-teal-500'
  }
];

export const RewardsPage = () => {
  const { user } = useAuthStore();
  const [rewards, setRewards] = useState<RewardItem[]>(initialRewards);
  const [recipient, setRecipient] = useState('Aman Verma');
  const [badge, setBadge] = useState('Spotlight Recognition');
  const [points, setPoints] = useState('500');
  const [reason, setReason] = useState('');
  const [isGiveModalOpen, setIsGiveModalOpen] = useState(false);

  const handleGiveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please enter a recognition reason');
      return;
    }

    const newRew: RewardItem = {
      id: 'rew-' + Date.now().toString().slice(-4),
      recipient,
      role: 'Team Member',
      badge,
      points: Number(points) || 500,
      reason: reason.trim(),
      awardedBy: `${user?.name || 'Michael Chen'} (${user?.role || 'Manager'})`,
      date: new Date().toISOString().split('T')[0],
      iconColor: 'from-indigo-500 to-cyan-500',
    };

    setRewards([newRew, ...rewards]);
    toast.success(`Reward points sent to ${recipient}!`, { icon: '🎉' });
    setReason('');
    setIsGiveModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Trophy size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Employee Rewards & Peer Recognition
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Celebrate achievements, grant appreciation badges, and reward team contributors for outstanding performance.
          </p>
        </div>

        <Button
          onClick={() => setIsGiveModalOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs sm:text-sm"
        >
          <Gift size={16} />
          <span>+ Give Recognition / Kudos</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Reward Points</p>
              <h3 className="text-2xl font-black text-amber-500 mt-0.5">3,250 pts</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <Star size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recognitions Awarded</p>
              <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{rewards.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <Award size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team Morale Score</p>
              <h3 className="text-2xl font-black text-emerald-500 mt-0.5">98.4%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
              <HeartHandshake size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Feed */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles size={18} className="text-amber-500" />
          Recent Recognition Wall & Kudos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((rew) => (
            <Card key={rew.id} className="rounded-2xl border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200/50">
                    +{rew.points} Points
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{rew.date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-tr text-white flex items-center justify-center font-black text-base shadow-md", rew.iconColor)}>
                    {rew.recipient[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{rew.recipient}</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{rew.badge}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  "{rew.reason}"
                </p>

                <p className="text-[11px] text-slate-400 pt-1">
                  Awarded by: <strong className="text-slate-600 dark:text-slate-300">{rew.awardedBy}</strong>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Give Reward Modal */}
      {isGiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsGiveModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Give Recognition & Kudos</h3>
            <form onSubmit={handleGiveReward} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Recipient</label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                >
                  <option value="Aman Verma">Aman Verma (Pre Sales)</option>
                  <option value="James Wilson">James Wilson (Sales)</option>
                  <option value="Rajesh Sharma">Rajesh Sharma (Engineering)</option>
                  <option value="Sarah Jenkins">Sarah Jenkins (HR Admin)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Award Title / Badge</label>
                <Input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. Spotlight Problem Solver"
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Points Awarded</label>
                <Input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason / Citation</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Why does this team member deserve recognition?"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsGiveModalOpen(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs px-4">
                  Send Recognition
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
