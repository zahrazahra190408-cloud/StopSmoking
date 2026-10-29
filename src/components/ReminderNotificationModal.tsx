import React, { useState } from 'react';
import { Bell, Check, Sparkles, X, Clock, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ReminderNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
}

export const ReminderNotificationModal: React.FC<ReminderNotificationModalProps> = ({
  isOpen,
  onClose,
  partnerName,
}) => {
  const [morningRemind, setMorningRemind] = useState(true);
  const [lunchRemind, setLunchRemind] = useState(true);
  const [eveningRemind, setEveningRemind] = useState(true);
  const [webPermState, setWebPermState] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setWebPermState(perm);
      if (perm === 'granted') {
        sounds.playChime();
        new Notification('NikoPuff Siap Menemani!', {
          body: `Pengingat harian telah aktif. ${partnerName} siap mendukung hidup sehatmu!`,
          icon: '/icon.svg',
        });
      }
    } else {
      alert('Browser Anda belum mendukung Web Notification.');
    }
  };

  const testNotification = () => {
    sounds.playHeartWarm();
    const msg = `Pesan Pengingat: "Halo sayang, jangan lupa minum air putih dan elus Puffi ya! Kamu hebat sudah bertahan hari ini!" ❤️ - ${partnerName}`;

    if (webPermState === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
      new Notification(`Pengingat Sehat dari ${partnerName}`, {
        body: msg,
        icon: '/icon.svg',
      });
    }

    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
              <Bell className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sistem Pengingat Harian
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
          Notifikasi terbukti menaikkan konsistensi berhenti merokok hingga <strong>3x lipat</strong> dengan menjaga kewaspadaan pada jam-jam rawan.
        </p>

        {/* Browser Permission Banner */}
        <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Izin Notifikasi HP / Browser
              </span>
            </div>
            {webPermState === 'granted' ? (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                <Check className="w-3.5 h-3.5" /> Aktif
              </span>
            ) : (
              <button
                onClick={requestPermission}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg shadow-xs"
              >
                Aktifkan
              </button>
            )}
          </div>
        </div>

        {/* Schedule Toggles */}
        <div className="mt-4 space-y-2.5">
          {/* Morning */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  08:00 WIB · Motivasi Pagi
                </div>
                <div className="text-[11px] text-slate-500">
                  Cek kondisi pet & kuatkan komitmen hari baru
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={morningRemind}
              onChange={(e) => setMorningRemind(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          {/* Lunch / Peak Craving */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  13:00 WIB · Jam Rawan Siang
                </div>
                <div className="text-[11px] text-slate-500">
                  Pengingat setelah makan siang agar tidak merokok
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={lunchRemind}
              onChange={(e) => setLunchRemind(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          {/* Evening */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  21:00 WIB · Rekap Malam & Pujian
                </div>
                <div className="text-[11px] text-slate-500">
                  Rayakan uang yang berhasil dihemat hari ini
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={eveningRemind}
              onChange={(e) => setEveningRemind(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Live Test Button */}
        <button
          onClick={testNotification}
          className="mt-4 w-full py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Uji Coba Kirim Notifikasi Sekarang</span>
        </button>

        {toastMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs text-rose-900 dark:text-rose-200 animate-in fade-in">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
