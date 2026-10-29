import React, { useState, useEffect } from 'react';
import { Wind, GlassWater, Heart, CheckCircle, X, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SOSCravingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessResist: () => void;
  partnerName: string;
  recentLoveNote?: string;
}

export const SOSCravingModal: React.FC<SOSCravingModalProps> = ({
  isOpen,
  onClose,
  onSuccessResist,
  partnerName,
  recentLoveNote,
}) => {
  const [breathPhase, setBreathPhase] = useState<'Tarik Napas' | 'Tahan' | 'Hembuskan' | 'Tenang'>('Tarik Napas');
  const [seconds, setSeconds] = useState(4);
  const [drankWater, setDrankWater] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setBreathPhase((current) => {
            if (current === 'Tarik Napas') return 'Tahan';
            if (current === 'Tahan') return 'Hembuskan';
            if (current === 'Hembuskan') return 'Tenang';
            return 'Tarik Napas';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaimSuccess = () => {
    sounds.playChime();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#F59E0B'],
    });
    onSuccessResist();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-xl">
              <Wind className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Darurat Craving: Tahan 3 Menit!
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Rasa ingin merokok (craving) umumnya hanya berlangsung <strong>3–5 menit</strong> lalu hilang dengan sendirinya. Mari lewati bersama!
        </p>

        {/* Box Breathing Visualizer */}
        <div className="my-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-850 border border-teal-200/60 dark:border-teal-900/40">
          <div
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-1000 ${
              breathPhase === 'Tarik Napas'
                ? 'scale-110 bg-emerald-500 text-white'
                : breathPhase === 'Tahan'
                ? 'scale-105 bg-teal-600 text-white'
                : breathPhase === 'Hembuskan'
                ? 'scale-90 bg-sky-500 text-white'
                : 'scale-95 bg-slate-400 text-white'
            }`}
          >
            <span className="text-xs font-semibold tracking-wide uppercase">
              {breathPhase}
            </span>
            <span className="text-2xl font-black tabular-nums mt-0.5">{seconds}s</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-3 font-medium">
            Ikuti ritme napas untuk menenangkan saraf otak
          </span>
        </div>

        {/* Cold Water Check */}
        <div
          onClick={() => {
            sounds.playPop();
            setDrankWater(!drankWater);
          }}
          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
            drankWater
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-600 shrink-0">
            <GlassWater className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-100">
              Minum 1 Gelas Air Dingin
            </div>
            <div className="text-[11px] text-slate-500">
              Sensasi dingin menyegarkan tenggorokan seketika.
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center ${
              drankWater ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
            }`}
          >
            {drankWater && <CheckCircle className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Loving Support Note from Zahra */}
        <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-start gap-2.5">
          <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 fill-rose-500" />
          <div className="text-xs">
            <span className="font-bold text-rose-950 dark:text-rose-200">
              Pesan Cinta Dari {partnerName}:
            </span>
            <p className="text-rose-800 dark:text-rose-300 mt-0.5 italic">
              "{recentLoveNote || 'Aku tahu ini berat, tapi kamu jauh lebih kuat dari sebatang rokok. Aku bangga banget sama kamu sayang! ❤️'}"
            </p>
          </div>
        </div>

        {/* Action Button: Successfully Resisted */}
        <button
          onClick={handleClaimSuccess}
          className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-md flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Saya Berhasil Tahan! (+20 Koin & Sembuhkan Pet)</span>
        </button>
      </div>
    </div>
  );
};
