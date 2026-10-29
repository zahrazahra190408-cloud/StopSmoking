import React, { useState } from 'react';
import { Heart, Send, Plus, Gift, CheckCircle, Clock, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface CoupleReward {
  id: string;
  title: string;
  requiredStreakDays: number;
  rewardDescription: string;
  claimed: boolean;
  createdBy: 'zahra' | 'smoker';
  createdAt: number;
}

interface CheerMessage {
  id: string;
  from: 'zahra' | 'smoker';
  message: string;
  emoji: string;
  timestamp: number;
}

interface PartnerMonitorViewProps {
  partnerName: string;
  smokerName: string;
  roomId: string;
  cigarettesToday: number;
  dailyLimit: number;
  streakFormatted: string;
  streakDays: number;
  totalSavedRp: number;
  cheers: CheerMessage[];
  coupleRewards: CoupleReward[];
  onSendCheer: (message: string, emoji: string) => void;
  onAddReward: (reward: { title: string; requiredStreakDays: number; rewardDescription: string }) => void;
  onClaimReward: (rewardId: string) => void;
}

export const PartnerMonitorView: React.FC<PartnerMonitorViewProps> = ({
  partnerName,
  smokerName,
  roomId,
  cigarettesToday,
  dailyLimit,
  streakFormatted,
  streakDays,
  totalSavedRp,
  cheers,
  coupleRewards,
  onSendCheer,
  onAddReward,
  onClaimReward,
}) => {
  const [customCheer, setCustomCheer] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💖');
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDays, setNewDays] = useState('3');
  const [newDesc, setNewDesc] = useState('');

  const presetCheers = [
    { text: 'Semangat sayang, kamu pasti bisa!', emoji: '💖' },
    { text: 'Aku bangga banget sama progresmu hari ini!', emoji: '🥰' },
    { text: 'Tahan ya sayang, minum air putih dingin dulu 💧', emoji: '💧' },
    { text: 'Puffi & aku kirim peluk hangat buat kamu 🤗', emoji: '✨' },
  ];

  const handleSendPreset = (text: string, emoji: string) => {
    sounds.playHeartWarm();
    onSendCheer(text, emoji);
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#EC4899', '#F43F5E', '#FB7185'],
    });
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCheer.trim()) return;
    sounds.playHeartWarm();
    onSendCheer(customCheer.trim(), selectedEmoji);
    setCustomCheer('');
    confetti({
      particleCount: 30,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#EC4899', '#F43F5E', '#10B981'],
    });
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddReward({
      title: newTitle.trim(),
      requiredStreakDays: Number(newDays) || 1,
      rewardDescription: newDesc.trim() || 'Hadiah spesial dari pasangan tercinta!',
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddRewardModal(false);
  };

  const isExceeded = cigarettesToday > dailyLimit;

  return (
    <div className="w-full space-y-5">
      {/* Couple Connection Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-rose-100">
                Mode Pemantau Pasangan
              </span>
              <span className="text-rose-200">·</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">
                Room #{roomId}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1">
              {partnerName} & {smokerName}
            </h2>
            <p className="text-xs text-rose-100 mt-0.5">
              Pantau kesehatan pasangan secara real-time dan dukung proses berhenti merokoknya.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between bg-black/15 p-2.5 rounded-xl backdrop-blur-sm">
            <span className="text-[11px] text-rose-200">Bebas Rokok Saat Ini</span>
            <span className="text-sm font-bold text-white tabular-nums flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              {streakFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Boyfriend Live Health Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Rokok Hari Ini</span>
            <Flame className={`w-4 h-4 ${isExceeded ? 'text-rose-500' : 'text-amber-500'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {cigarettesToday}
            </span>
            <span className="text-xs text-slate-500">/ max {dailyLimit} batang</span>
          </div>
          <div className="mt-2 text-[11px]">
            {isExceeded ? (
              <span className="text-rose-600 font-medium">⚠️ Melebihi target hari ini</span>
            ) : (
              <span className="text-emerald-600 font-medium">✨ Target aman terjaga</span>
            )}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Uang Dihemat</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            Rp {(totalSavedRp / 1000).toFixed(0)}k
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Dapat dialihkan untuk tabungan berdua
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Status Pet (Puffi)</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {isExceeded ? 'Butuh Perhatian & Istirahat' : 'Tersenyum & Penuh Harapan'}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Kirimkan semangat agar pet dan {smokerName} makin bugar!
          </div>
        </div>
      </div>

      {/* Quick Love Notes & Cheer Dispatcher */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Kirim Kata-Kata Semangat untuk {smokerName}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">Muncul langsung di layarnya</span>
        </div>

        {/* Preset Cheer Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {presetCheers.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPreset(item.text, item.emoji)}
              className="flex items-center gap-2 p-2.5 rounded-xl text-left text-xs bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 border border-rose-200/80 dark:border-rose-900/40 hover:bg-rose-100/80 transition active:scale-[0.98]"
            >
              <span className="text-base">{item.emoji}</span>
              <span className="truncate">{item.text}</span>
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <form onSubmit={handleSendCustom} className="flex gap-2">
          <input
            type="text"
            value={customCheer}
            onChange={(e) => setCustomCheer(e.target.value)}
            placeholder={`Tulis pesan cinta atau pengingat untuk ${smokerName}...`}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim</span>
          </button>
        </form>
      </div>

      {/* Couple Rewards Manager (Sistem Reward Pasangan) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sistem Reward & Janji Manis Pasangan
            </h3>
          </div>
          <button
            onClick={() => setShowAddRewardModal(true)}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Janji Hadiah</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Zahra dapat menetapkan hadiah nyata saat {smokerName} berhasil mencapai streak tertentu untuk menjaga motivasi tetap tinggi.
        </p>

        <div className="space-y-2.5">
          {coupleRewards.map((reward) => {
            const isEligible = streakDays >= reward.requiredStreakDays;
            return (
              <div
                key={reward.id}
                className={`p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                  reward.claimed
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-75'
                    : isEligible
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      reward.claimed
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        : isEligible
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {reward.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                        Target: {reward.requiredStreakDays} Hari
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {reward.rewardDescription}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  {reward.claimed ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Terklaim
                    </span>
                  ) : isEligible ? (
                    <button
                      onClick={() => {
                        sounds.playChime();
                        onClaimReward(reward.id);
                        confetti({ particleCount: 40, spread: 80 });
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95"
                    >
                      Klaim Hadiah!
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Kurang {reward.requiredStreakDays - streakDays} hari
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Timeline of Recent Couple Activity */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Aktivitas & Riwayat Semangat Terkini</span>
        </h3>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {cheers.map((c) => (
            <div
              key={c.id}
              className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-750 text-xs"
            >
              <span className="text-base">{c.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {c.from === 'zahra' ? partnerName : smokerName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">{c.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Couple Reward Modal */}
      {showAddRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Buat Janji Hadiah Spesial
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tentukan hadiah manis yang akan kamu berikan jika {smokerName} berhasil konsisten.
            </p>

            <form onSubmit={handleCreateReward} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Hadiah / Janji
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Masakin Rendang Spesial"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Bebas Rokok (Hari)
                </label>
                <select
                  value={newDays}
                  onChange={(e) => setNewDays(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="1">1 Hari Penuh</option>
                  <option value="2">2 Hari</option>
                  <option value="3">3 Hari</option>
                  <option value="5">5 Hari</option>
                  <option value="7">1 Minggu (7 Hari)</option>
                  <option value="14">2 Minggu (14 Hari)</option>
                  <option value="30">1 Bulan (30 Hari)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan / Pesan Manis
                </label>
                <textarea
                  rows={2}
                  placeholder="Bakal aku siapin sepulang kerja biar kamu makin bahagia!"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRewardModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition shadow-sm"
                >
                  Simpan Janji
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
