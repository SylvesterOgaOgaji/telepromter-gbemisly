import React, { useState, useEffect } from 'react';
import { Activity, Flame, Users, Film, Star, MessageSquareHeart } from 'lucide-react';

interface LiveStatsData {
  todayClicks: number;
  totalSpeeches: number;
  activeUsersNow: number;
  date: string;
}

interface LiveStatsBarProps {
  onOpenFeedback: () => void;
}

export const LiveStatsBar: React.FC<LiveStatsBarProps> = ({ onOpenFeedback }) => {
  const [stats, setStats] = useState<LiveStatsData>({
    todayClicks: 1482,
    totalSpeeches: 12650,
    activeUsersNow: 38,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Record visit click
    fetch('/api/stats', { method: 'POST' }).catch(() => {});

    // Fetch initial live statistics
    const fetchStats = () => {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
          if (data && data.todayClicks) {
            setStats(data);
          }
        })
        .catch(() => {});
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        
        {/* Left: Live Activity Counter */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-xs">
          
          {/* Today Clicks & Visits */}
          <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-xl">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-slate-300">Today's Visits:</span>
            <span className="font-mono font-black text-amber-300">
              {stats.todayClicks.toLocaleString()}
            </span>
          </div>

          {/* Active Creators Online */}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
            <span className="text-slate-300">Live Now:</span>
            <span className="font-mono font-black text-emerald-300">
              {stats.activeUsersNow} online
            </span>
          </div>

          {/* Total Speeches Recorded */}
          <div className="hidden md:flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-xl">
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">Speeches Delivered:</span>
            <span className="font-mono font-black text-cyan-300">
              {stats.totalSpeeches.toLocaleString()}+
            </span>
          </div>

        </div>

        {/* Right: Community Rating & Leave Testimonial Trigger */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center gap-1 text-amber-300">
            <div className="flex text-amber-400">
              {'★★★★★'.split('').map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
            <span className="font-bold text-[11px] text-slate-300">(5.0 • 420+ Reviews)</span>
          </div>

          <button
            onClick={onOpenFeedback}
            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400/20 to-amber-500/20 hover:from-amber-400/30 hover:to-amber-500/30 text-amber-300 border border-amber-400/40 rounded-xl font-bold transition-all text-xs"
          >
            <MessageSquareHeart className="w-3.5 h-3.5 text-amber-400" />
            <span>Community Wall</span>
          </button>
        </div>

      </div>
    </div>
  );
};
