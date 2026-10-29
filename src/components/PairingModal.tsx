import React, { useState } from 'react';
import { Smartphone, Copy, Check, QrCode, X, Users, RefreshCw } from 'lucide-react';
import { sounds } from '../utils/audio';

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  isSmokerMode: boolean;
  partnerName: string;
  smokerName: string;
  onSwitchMode: (isSmoker: boolean) => void;
  onJoinRoom: (newRoomId: string, partnerName: string, smokerName: string) => void;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  isOpen,
  onClose,
  roomId,
  isSmokerMode,
  partnerName,
  smokerName,
  onSwitchMode,
  onJoinRoom,
}) => {
  const [copied, setCopied] = useState(false);
  const [inputRoomId, setInputRoomId] = useState('');
  const [inputPartner, setInputPartner] = useState(partnerName);
  const [inputSmoker, setInputSmoker] = useState(smokerName);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareLink = `${currentUrl}?room=${roomId}&role=partner`;

  const handleCopy = () => {
    sounds.playPop();
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    sounds.playChime();
    onJoinRoom(inputRoomId.trim().toUpperCase(), inputPartner.trim() || 'Zahra', inputSmoker.trim() || 'Pacar');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
              <Smartphone className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sinkronisasi Antar HP
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Hubungkan HP Zahra dengan HP pacar agar data rokok, kesehatan pet, dan reward selalu tersimpan dan sinkron real-time.
        </p>

        {/* Current Active Mode Switcher */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Pilih Peran di Perangkat Ini:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sounds.playPop();
                onSwitchMode(true);
              }}
              className={`p-2.5 rounded-xl border text-left transition ${
                isSmokerMode
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'
              }`}
            >
              <div className="text-xs font-bold">🎮 HP Pacar</div>
              <div className="text-[10px] opacity-80 mt-0.5">Catat & rawat pet</div>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                onSwitchMode(false);
              }}
              className={`p-2.5 rounded-xl border text-left transition ${
                !isSmokerMode
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-white dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'
              }`}
            >
              <div className="text-xs font-bold">💖 HP Zahra</div>
              <div className="text-[10px] opacity-80 mt-0.5">Pantau & beri reward</div>
            </button>
          </div>
        </div>

        {/* Room Code Box */}
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Kode Pasangan (Room Code)
          </span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-200 tracking-widest my-1 font-mono">
            {roomId}
          </div>
          <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400">
            Masukkan kode ini di HP lain untuk menyambungkan kedua akun.
          </p>

          <button
            onClick={handleCopy}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 shadow-xs hover:bg-emerald-50 transition active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Kode Pasangan'}</span>
          </button>
        </div>

        {/* Connect / Join Another Room */}
        <form onSubmit={handleJoin} className="mt-4 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Sambungkan ke Room Lain</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Kode Room Pasangan
            </label>
            <input
              type="text"
              placeholder="Contoh: ZAHRA1"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sinkronkan Sekarang</span>
          </button>
        </form>
      </div>
    </div>
  );
};
