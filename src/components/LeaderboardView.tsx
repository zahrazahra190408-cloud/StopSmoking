import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Flame, Sparkles, Heart } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  couple: string;
  streakDays: number;
  petLevel: number;
  cigsAvoided: number;
  moneySaved: number;
  avatarSkin: string;
  badge: string;
}

interface LeaderboardViewProps {
  currentCoupleName: string;
  currentStreakDays: number;
  currentAvoided: number;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentCoupleName,
  currentStreakDays,
  currentAvoided,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback default
        setEntries([
          {
            rank: 1,
            couple: 'Zahra & Pacar (Anda)',
            streakDays: Math.max(7, currentStreakDays),
            petLevel: 5,
            cigsAvoided: Math.max(84, currentAvoided),
            moneySaved: 183750,
            avatarSkin: 'golden',
            badge: 'Bintang Paru Sehat',
          },
          {
            rank: 2,
            couple: 'Dina & Farhan',
            streakDays: 6,
            petLevel: 4,
            cigsAvoided: 72,
            moneySaved: 157500,
            avatarSkin: 'emerald',
            badge: 'Pahlawan Bebas Asap',
          },
          {
            rank: 3,
            couple: 'Annisa & Dimas',
            streakDays: 5,
            petLevel: 4,
            cigsAvoided: 60,
            moneySaved: 131250,
            avatarSkin: 'pink',
            badge: 'Pejuang Disiplin',
          },
        ]);
        setLoading(false);
      });
  }, [currentStreakDays, currentAvoided]);

  return (
    <div className="w-full space-y-4">
      {/* Trophy Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Trophy className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <h3 className="text-base font-bold">Papan Peringkat Pejuang Sehat</h3>
            <p className="text-xs text-amber-100">
              Kompetisi ramah antar pasangan untuk saling memotivasi lepas dari rokok.
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-3 gap-2 pt-2 items-end">
        {/* Rank 2 */}
        {entries[1] && (
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center">
            <span className="text-lg">🥈</span>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate max-w-full">
              {entries[1].couple}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 tabular-nums">
              {entries[1].streakDays} Hari
            </div>
            <span className="text-[10px] text-emerald-600 font-medium mt-1">
              {entries[1].cigsAvoided} Btg Dihindari
            </span>
          </div>
        )}

        {/* Rank 1 (Tallest) */}
        {entries[0] && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 text-center flex flex-col items-center -mt-3 shadow-md">
            <span className="text-2xl animate-bounce">👑</span>
            <div className="text-xs font-extrabold text-amber-950 dark:text-amber-200 mt-1 truncate max-w-full">
              {entries[0].couple}
            </div>
            <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
              {entries[0].streakDays} Hari Streak
            </div>
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 mt-1 bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
              {entries[0].badge}
            </span>
          </div>
        )}

        {/* Rank 3 */}
        {entries[2] && (
          <div className="p-3 rounded-2xl bg-amber-900/10 dark:bg-amber-950/20 border border-amber-800/30 text-center flex flex-col items-center">
            <span className="text-lg">🥉</span>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate max-w-full">
              {entries[2].couple}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 tabular-nums">
              {entries[2].streakDays} Hari
            </div>
            <span className="text-[10px] text-emerald-600 font-medium mt-1">
              {entries[2].cigsAvoided} Btg Dihindari
            </span>
          </div>
        )}
      </div>

      {/* Full Leaderboard List */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-2">
        <div className="text-xs font-bold text-slate-500 px-2 py-1 flex justify-between">
          <span>Peringkat Pasangan</span>
          <span>Performa</span>
        </div>

        {entries.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-2.5 rounded-xl transition ${
              item.couple.includes('Zahra')
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 font-semibold'
                : 'bg-slate-50 dark:bg-slate-750'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-5 text-center font-bold text-xs text-slate-500 tabular-nums">
                #{idx + 1}
              </span>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{item.couple}</span>
                  {item.couple.includes('Zahra') && (
                    <span className="text-[9px] bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200 px-1.5 py-0.2 rounded-full font-medium">
                      Anda
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-amber-500" />
                    {item.streakDays} hari
                  </span>
                  <span>·</span>
                  <span>Pet Lv.{item.petLevel}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {item.cigsAvoided} btg hemat
              </div>
              <div className="text-[10px] text-slate-400">
                Rp {(item.moneySaved / 1000).toFixed(0)}k disimpan
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
