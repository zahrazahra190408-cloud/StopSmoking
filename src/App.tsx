/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  Flame,
  Shield,
  Coins,
  Bell,
  Smartphone,
  Trophy,
  TrendingDown,
  ShoppingBag,
  Sparkles,
  Award,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { PetCharacter } from './components/PetCharacter';
import { PartnerMonitorView } from './components/PartnerMonitorView';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { CustomizationShop } from './components/CustomizationShop';
import { LeaderboardView } from './components/LeaderboardView';
import { SOSCravingModal } from './components/SOSCravingModal';
import { ReminderNotificationModal } from './components/ReminderNotificationModal';
import { PairingModal } from './components/PairingModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  calculatePetHealth,
  getPetMood,
  calculateMoneySaved,
  calculateStreak,
  calculateLevelAndXP,
} from './utils/petLogic';
import { sounds } from './utils/audio';
import confetti from 'canvas-confetti';

interface Customization {
  hat: string;
  outfit: string;
  glasses: string;
  skinColor: string;
  roomTheme: string;
}

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

interface DailyRecord {
  date: string;
  count: number;
  cravingsResisted: number;
}

interface RoomData {
  roomId: string;
  partnerName: string;
  smokerName: string;
  dailyLimit: number;
  costPerPack: number;
  cigsPerPack: number;
  cigarettesToday: number;
  lastSmokedAt: number;
  quitStartDate: number;
  cravingCount: number;
  pet: {
    name: string;
    health: number;
    lungCleanliness: number;
    happiness: number;
    coins: number;
    xp: number;
    lastCaredAt: number;
    customization: Customization;
    unlockedItems: string[];
  };
  history: DailyRecord[];
  cheers: CheerMessage[];
  coupleRewards: CoupleReward[];
  lastUpdated: number;
}

export default function App() {
  const [roomId, setRoomId] = useState('ZAHRA1');
  const [isSmokerMode, setIsSmokerMode] = useState(true); // true = Boyfriend/Smoker, false = Zahra
  const [activeTab, setActiveTab] = useState<'pet' | 'zahra' | 'analytics' | 'shop' | 'leaderboard'>('pet');

  // Modals state
  const [showSOS, setShowSOS] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showPairing, setShowPairing] = useState(false);

  // App State with resilient fallback initial
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Clock tick every 10 seconds for streak calculation
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch or SSE sync with server
  const fetchRoomData = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/room/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRoom(data);
        localStorage.setItem(`nikopuff_room_${id}`, JSON.stringify(data));
      }
    } catch {
      // Offline fallback from local storage
      const cached = localStorage.getItem(`nikopuff_room_${id}`);
      if (cached) {
        setRoom(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize room from URL query or default
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const roleParam = params.get('role');
    const id = roomParam ? roomParam.toUpperCase() : 'ZAHRA1';
    setRoomId(id);
    if (roleParam === 'partner') {
      setIsSmokerMode(false);
      setActiveTab('zahra');
    }
    fetchRoomData(id);

    // SSE connection for real-time live synchronization between two phones
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/sync/${id}`);
      eventSource.onmessage = (event) => {
        try {
          const freshData = JSON.parse(event.data);
          setRoom(freshData);
          localStorage.setItem(`nikopuff_room_${id}`, JSON.stringify(freshData));
        } catch {
          // ignore parse errors
        }
      };
    } catch {
      // SSE not supported or offline
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [fetchRoomData]);

  // Dispatch Action Helper
  const sendAction = async (action: string, payload?: unknown) => {
    try {
      const res = await fetch(`/api/room/${roomId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRoom(updated);
        localStorage.setItem(`nikopuff_room_${roomId}`, JSON.stringify(updated));
      }
    } catch {
      // Optimistic offline update
      if (room) {
        const cloned = { ...room };
        if (action === 'SMOKE') {
          cloned.cigarettesToday += 1;
          cloned.lastSmokedAt = Date.now();
          cloned.pet.health = Math.max(5, cloned.pet.health - 15);
        }
        setRoom(cloned);
      }
    }
  };

  // Smoke logger handler
  const handleLogSmoke = () => {
    sounds.playCough();
    sendAction('SMOKE');
  };

  // Craving resisted handler
  const handleResistCraving = () => {
    sendAction('RESIST');
  };

  // Care action handler
  const handleCareAction = (type: 'bath' | 'feed' | 'pet' | 'walk') => {
    sendAction('CARE', { type });
  };

  // Equip item
  const handleEquipItem = (type: string, value: string) => {
    sendAction('CUSTOMIZE', {
      customization: { [type]: value },
    });
  };

  // Buy item
  const handleBuyItem = (itemId: string, cost: number, type: string, value: string) => {
    sendAction('CUSTOMIZE', {
      boughtItem: itemId,
      cost,
      customization: { [type]: value },
    });
  };

  // Zahra cheer handler
  const handleSendCheer = (message: string, emoji: string) => {
    sendAction('CHEER', { from: 'zahra', message, emoji });
  };

  // Couple reward add handler
  const handleAddReward = (reward: { title: string; requiredStreakDays: number; rewardDescription: string }) => {
    sendAction('REWARD_ADD', { ...reward, createdBy: 'zahra' });
  };

  // Couple reward claim handler
  const handleClaimReward = (rewardId: string) => {
    sendAction('REWARD_CLAIM', { rewardId });
  };

  // Join or change room
  const handleJoinRoom = (newId: string, pName: string, sName: string) => {
    setRoomId(newId);
    setLoading(true);
    fetch(`/api/room/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: newId, partnerName: pName, smokerName: sName }),
    })
      .then((res) => res.json())
      .then((data) => {
        setRoom(data);
        setLoading(false);
      });
  };

  if (loading || !room) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center animate-bounce">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="mt-3 text-sm font-bold text-slate-700">Menyiapkan NikoPuff...</div>
        <div className="text-xs text-slate-400 mt-1">Sinkronisasi data kesehatan pasangan</div>
      </div>
    );
  }

  // Calculations
  const streak = calculateStreak(room.lastSmokedAt, now);
  const minutesSinceSmoke = Math.floor((now - room.lastSmokedAt) / (1000 * 60));
  const petMood = getPetMood(room.pet.health, room.pet.happiness, minutesSinceSmoke);
  const levelInfo = calculateLevelAndXP(room.pet.xp);

  // Avoided calculation
  const daysActive = Math.max(1, Math.ceil((now - room.quitStartDate) / (1000 * 60 * 60 * 24)));
  const totalActualSmoked = room.history.reduce((acc, h) => acc + h.count, 0) + room.cigarettesToday;
  const moneyInfo = calculateMoneySaved({
    daysActive,
    normalCigsPerDay: 16,
    actualSmokedTotal: totalActualSmoked,
    costPerPack: room.costPerPack,
    cigsPerPack: room.cigsPerPack,
  });

  const latestCheer = room.cheers[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Offline state indicator */}
      <OfflineIndicator />

      {/* TOP BAR CONTRACT: Zone 1 (Brand) — Zone 2 (Nav links) — Zone 3 (Action / utilities) */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element brand wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              NP
            </span>
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              NikoPuff
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('pet')}
              className={`hover:text-slate-900 dark:hover:text-white transition whitespace-nowrap ${
                activeTab === 'pet' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              Pet Karakter
            </button>
            <button
              onClick={() => setActiveTab('zahra')}
              className={`hover:text-slate-900 dark:hover:text-white transition whitespace-nowrap ${
                activeTab === 'zahra' ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
              }`}
            >
              Mode Zahra
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`hover:text-slate-900 dark:hover:text-white transition whitespace-nowrap ${
                activeTab === 'analytics' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              Grafik & Hemat
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`hover:text-slate-900 dark:hover:text-white transition whitespace-nowrap ${
                activeTab === 'shop' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              Kustomisasi
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`hover:text-slate-900 dark:hover:text-white transition whitespace-nowrap ${
                activeTab === 'leaderboard' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              Peringkat
            </button>
          </nav>

          {/* Zone 3: Primary Actions & Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sync / Room Badge Button */}
            <button
              onClick={() => setShowPairing(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition whitespace-nowrap"
              title="Pengaturan Sinkronisasi & Peran"
              aria-label="Sinkronisasi HP"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono text-[11px]">#{room.roomId}</span>
              <span className="text-[10px] hidden sm:inline text-slate-400">·</span>
              <span className="text-[10px] hidden sm:inline text-slate-500 font-medium">
                {isSmokerMode ? 'HP Pacar' : 'HP Zahra'}
              </span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setShowReminders(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
              title="Pengingat Harian"
              aria-label="Atur Notifikasi Pengingat"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Subheader Role & Quick Status Banner */}
      <div className="bg-slate-100/70 dark:bg-slate-850/70 border-b border-slate-200/60 dark:border-slate-800 px-4 py-2 text-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                room.cigarettesToday <= room.dailyLimit ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
              }`}
            />
            <span className="text-slate-600 dark:text-slate-400">
              {isSmokerMode ? (
                <>
                  Mode Aktif: <strong>{room.smokerName}</strong> · Didukung penuh oleh{' '}
                  <strong className="text-rose-600">{room.partnerName} ❤️</strong>
                </>
              ) : (
                <>
                  Mode Aktif: <strong>{room.partnerName}</strong> · Memantau kesehatan{' '}
                  <strong className="text-emerald-600">{room.smokerName}</strong>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-500 tabular-nums hidden sm:inline">
              Bebas Rokok: {streak.formattedString}
            </span>
            <button
              onClick={() => setIsSmokerMode(!isSmokerMode)}
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              Ganti ke {isSmokerMode ? 'Mode Zahra' : 'Mode Pacar'}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN VIEW CONTAINER */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-8">
        {/* VIEW 1: DIGITAL PET VIRTUAL (POU EXPERIENCE) */}
        {activeTab === 'pet' && (
          <div className="space-y-4">
            {/* Loving Partner Cheer Notification Bar */}
            {latestCheer && (
              <div
                onClick={() => setActiveTab('zahra')}
                className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between cursor-pointer hover:shadow-xs transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{latestCheer.emoji}</span>
                  <div className="text-xs">
                    <span className="font-bold text-rose-900 dark:text-rose-200">
                      Pesan Cinta dari {room.partnerName}:
                    </span>
                    <p className="text-rose-700 dark:text-rose-300 line-clamp-1 italic">
                      "{latestCheer.message}"
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-rose-500 font-bold whitespace-nowrap pl-2">
                  Buka & Balas →
                </span>
              </div>
            )}

            {/* Cozy Room & Pou Digital Pet Container */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700 shadow-md bg-gradient-to-b from-amber-50/70 via-orange-50/40 to-slate-100 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 p-4 sm:p-6">
              {/* Top Pet Room HUD */}
              <div className="flex items-center justify-between gap-2 mb-2">
                {/* Level & XP */}
                <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl shadow-xs border border-slate-200/60 dark:border-slate-700">
                  <Award className="w-4 h-4 text-amber-500" />
                  <div className="text-xs">
                    <span className="font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">
                      Lv. {levelInfo.level}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({levelInfo.progressPercent}%)
                    </span>
                  </div>
                </div>

                {/* Coins */}
                <button
                  onClick={() => setActiveTab('shop')}
                  className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl shadow-xs border border-slate-200/60 dark:border-slate-700 hover:bg-slate-50 transition"
                >
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">
                    {room.pet.coins}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Toko</span>
                </button>
              </div>

              {/* Digital Pet Character Component */}
              <PetCharacter
                name={room.pet.name}
                health={room.pet.health}
                lungCleanliness={room.pet.lungCleanliness}
                happiness={room.pet.happiness}
                mood={petMood}
                customization={room.pet.customization}
                onCareAction={handleCareAction}
                isSmokerMode={isSmokerMode}
              />
            </div>

            {/* QUICK SMOKER INTERACTION DECK (Natural Thumb Zone) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* SOS CRAVING BUTTON */}
              <button
                onClick={() => {
                  sounds.playHeartWarm();
                  setShowSOS(true);
                }}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md active:scale-[0.98] transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold tracking-tight">
                      Lagi Pengen Rokok? (SOS)
                    </div>
                    <div className="text-xs text-emerald-100">
                      Tahan 3 menit · +20 Koin & sembuhkan Puffi
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-xl">
                  Mulai
                </span>
              </button>

              {/* LOG A CIGARETTE BUTTON */}
              <button
                onClick={handleLogSmoke}
                className="w-full py-4 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 border-2 border-slate-200 dark:border-slate-700 hover:border-rose-300 text-slate-800 dark:text-slate-100 shadow-sm active:scale-[0.98] transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-xl">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-rose-900 dark:text-rose-200">
                      Catat 1 Batang Rokok
                    </div>
                    <div className="text-xs text-slate-500">
                      Hari ini: {room.cigarettesToday} / max {room.dailyLimit} btg
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/40 px-2.5 py-1 rounded-xl">
                  +1
                </span>
              </button>
            </div>

            {/* Quick Summary Pill Row */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                <span className="text-[10px] text-slate-500 font-medium">Bebas Rokok</span>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                  {streak.formattedString}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                <span className="text-[10px] text-slate-500 font-medium">Uang Disimpan</span>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                  Rp {(moneyInfo.totalSavedRp / 1000).toFixed(0)}k
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                <span className="text-[10px] text-slate-500 font-medium">Craving Ditahan</span>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5 tabular-nums">
                  {room.cravingCount} Kali
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: MODE PASANGAN / ZAHRA MONITOR */}
        {activeTab === 'zahra' && (
          <PartnerMonitorView
            partnerName={room.partnerName}
            smokerName={room.smokerName}
            roomId={room.roomId}
            cigarettesToday={room.cigarettesToday}
            dailyLimit={room.dailyLimit}
            streakFormatted={streak.formattedString}
            streakDays={streak.days}
            totalSavedRp={moneyInfo.totalSavedRp}
            cheers={room.cheers}
            coupleRewards={room.coupleRewards}
            onSendCheer={handleSendCheer}
            onAddReward={handleAddReward}
            onClaimReward={handleClaimReward}
          />
        )}

        {/* VIEW 3: GRAFIK PENGURANGAN & TABUNGAN */}
        {activeTab === 'analytics' && (
          <ProgressAnalytics
            history={room.history}
            dailyLimit={room.dailyLimit}
            totalSavedRp={moneyInfo.totalSavedRp}
            cigsAvoided={moneyInfo.cigsAvoided}
            costPerPack={room.costPerPack}
            smokeFreeHours={streak.hours}
          />
        )}

        {/* VIEW 4: TOKO KUSTOMISASI POU */}
        {activeTab === 'shop' && (
          <CustomizationShop
            coins={room.pet.coins}
            unlockedItems={room.pet.unlockedItems}
            currentCustomization={room.pet.customization}
            onEquipItem={handleEquipItem}
            onBuyItem={handleBuyItem}
          />
        )}

        {/* VIEW 5: PAPAN PERINGKAT */}
        {activeTab === 'leaderboard' && (
          <LeaderboardView
            currentCoupleName={`${room.partnerName} & ${room.smokerName}`}
            currentStreakDays={streak.days}
            currentAvoided={moneyInfo.cigsAvoided}
          />
        )}
      </main>

      {/* MOBILE BOTTOM TAB BAR (PATTERN 1 OF 10_mobile_touch_apps.md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center h-16 pb-safe">
        <button
          onClick={() => setActiveTab('pet')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'pet' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
          }`}
          aria-label="Pet Virtual"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Pet</span>
        </button>

        <button
          onClick={() => setActiveTab('zahra')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'zahra' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
          }`}
          aria-label="Pantau Zahra"
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Zahra</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'analytics' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
          }`}
          aria-label="Grafik & Hemat"
        >
          <TrendingDown className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Grafik</span>
        </button>

        <button
          onClick={() => setActiveTab('shop')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'shop' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
          }`}
          aria-label="Toko Kustom"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Kustom</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'leaderboard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
          }`}
          aria-label="Papan Peringkat"
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1">Juara</span>
        </button>
      </nav>

      {/* MODALS */}
      <SOSCravingModal
        isOpen={showSOS}
        onClose={() => setShowSOS(false)}
        onSuccessResist={handleResistCraving}
        partnerName={room.partnerName}
        recentLoveNote={latestCheer?.message}
      />

      <ReminderNotificationModal
        isOpen={showReminders}
        onClose={() => setShowReminders(false)}
        partnerName={room.partnerName}
      />

      <PairingModal
        isOpen={showPairing}
        onClose={() => setShowPairing(false)}
        roomId={room.roomId}
        isSmokerMode={isSmokerMode}
        partnerName={room.partnerName}
        smokerName={room.smokerName}
        onSwitchMode={setIsSmokerMode}
        onJoinRoom={handleJoinRoom}
      />
    </div>
  );
}
