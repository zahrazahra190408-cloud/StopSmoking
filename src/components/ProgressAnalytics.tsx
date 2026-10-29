import React, { useState } from 'react';
import { calculateHealthMilestones } from '../utils/petLogic';
import { TrendingDown, PiggyBank, HeartPulse, CheckCircle2, Target, Calendar } from 'lucide-react';

interface DailyRecord {
  date: string;
  count: number;
  cravingsResisted: number;
}

interface ProgressAnalyticsProps {
  history: DailyRecord[];
  dailyLimit: number;
  totalSavedRp: number;
  cigsAvoided: number;
  costPerPack: number;
  smokeFreeHours: number;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({
  history,
  dailyLimit,
  totalSavedRp,
  cigsAvoided,
  costPerPack,
  smokeFreeHours,
}) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'savings' | 'health'>('chart');
  const [dreamGoal, setDreamGoal] = useState({ name: 'Liburan Romantis Berdua', targetRp: 500000 });

  const milestones = calculateHealthMilestones(smokeFreeHours);

  // Calculate highest count for chart scaling
  const maxInHistory = Math.max(dailyLimit + 2, ...history.map((h) => h.count));

  // Goal progress
  const goalProgress = Math.min(100, Math.round((totalSavedRp / dreamGoal.targetRp) * 100));

  return (
    <div className="w-full space-y-4">
      {/* Tab Selector */}
      <div className="flex items-center gap-1 p-1 bg-slate-150 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'chart'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Grafik Pengurangan</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'savings'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Kalkulator Hemat</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'health'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Pemulihan Paru</span>
          </div>
        </button>
      </div>

      {/* TAB 1: GRAFIK PENGURANGAN ROKOK */}
      {activeTab === 'chart' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tren Pengurangan Rokok Harian
              </h3>
              <p className="text-xs text-slate-500">
                Garis merah putus-putus menunjukkan batas target maksimal harian ({dailyLimit} batang).
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
              <Calendar className="w-3 h-3" />
              <span>7 Hari Terakhir</span>
            </div>
          </div>

          {/* Interactive SVG Bar Chart */}
          <div className="relative pt-6 pb-2">
            {/* Target line indicator */}
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-rose-400/80 z-10 flex items-center justify-end pr-1 pointer-events-none"
              style={{
                bottom: `${(dailyLimit / maxInHistory) * 160 + 28}px`,
              }}
            >
              <span className="text-[10px] font-bold text-rose-500 bg-white/90 dark:bg-slate-800/90 px-1.5 py-0.5 rounded shadow-xs">
                Batas Target: {dailyLimit} btg
              </span>
            </div>

            {/* Bars Grid */}
            <div className="h-44 flex items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-1">
              {history.map((record, index) => {
                const heightPercent = Math.min(100, Math.round((record.count / maxInHistory) * 100));
                const isUnderLimit = record.count <= dailyLimit;
                const d = new Date(record.date);
                const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short' });

                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-900 text-white text-[10px] rounded-lg p-1.5 whitespace-nowrap z-20 pointer-events-none shadow-md">
                      <div>{record.date}</div>
                      <div className="font-bold">{record.count} batang dihisap</div>
                      <div className="text-emerald-300">+{record.cravingsResisted} craving ditahan</div>
                    </div>

                    <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 tabular-nums">
                      {record.count}
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[28px] bg-slate-100 dark:bg-slate-700 rounded-t-lg h-36 flex items-end overflow-hidden p-0.5">
                      <div
                        className={`w-full rounded-t transition-all duration-500 ${
                          isUnderLimit
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                            : 'bg-gradient-to-t from-rose-600 to-amber-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <span className="text-[10px] text-slate-500 mt-2 font-medium">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-slate-100 dark:border-slate-700/60">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <span className="text-[11px] text-slate-500">Total Batang Dihindari</span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {cigsAvoided} Batang
              </div>
            </div>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/30">
              <span className="text-[11px] text-slate-500">Penurunan Frekuensi</span>
              <div className="text-base font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                -78% Sejak Awal
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KALKULATOR PENGHEMATAN BERSAMA */}
      {activeTab === 'savings' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-xl">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tabungan Nyata Berhenti Merokok
                </h3>
                <p className="text-xs text-slate-500">
                  Perhitungan berbasis harga rokok Rp {costPerPack.toLocaleString('id-ID')} / bungkus
                </p>
              </div>
            </div>
          </div>

          {/* Big Amount Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md">
            <span className="text-xs text-emerald-100 font-medium">Total Uang Yang Berhasil Disimpan</span>
            <div className="text-3xl font-extrabold tracking-tight mt-1 tabular-nums">
              Rp {totalSavedRp.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              Uang ini tidak habis terbakar menjadi asap, melainkan terselamatkan untuk masa depan sehat bersama.
            </p>
          </div>

          {/* Dream Goal Tracker */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                Target Bersama: {dreamGoal.name}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {goalProgress}%
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Terkumpul: Rp {totalSavedRp.toLocaleString('id-ID')}</span>
              <span>Target: Rp {dreamGoal.targetRp.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TAHAPAN PEMULIHAN KLINIS PARU-PARU */}
      {activeTab === 'health' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Garis Waktu Pemulihan Medis Tubuh
            </h3>
            <p className="text-xs text-slate-500">
              Progres perbaikan organ tubuh dan paru-paru berdasarkan waktu bebas rokok.
            </p>
          </div>

          <div className="space-y-2.5">
            {milestones.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition ${
                  item.isUnlocked
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.title}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold tabular-nums ${
                      item.isUnlocked ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  >
                    {item.isUnlocked ? 'Tercapai 🎉' : `${item.progressPercent}%`}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 pl-6">
                  {item.description}
                </p>

                {!item.isUnlocked && (
                  <div className="mt-2 pl-6">
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-teal-500 transition-all duration-500"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
