import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm border border-amber-400"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Mode Offline — Progres disimpan lokal & tersinkronisasi otomatis saat online.</span>
    </div>
  );
};
