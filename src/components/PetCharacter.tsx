import React, { useState } from 'react';
import { PetMood } from '../utils/petLogic';
import { sounds } from '../utils/audio';
import { Sparkles, Heart, Apple, Bath, Footprints } from 'lucide-react';

interface PetCharacterProps {
  name: string;
  health: number;
  lungCleanliness: number;
  happiness: number;
  mood: PetMood;
  customization: {
    hat: string;
    outfit: string;
    glasses: string;
    skinColor: string;
    roomTheme: string;
  };
  onCareAction: (type: 'bath' | 'feed' | 'pet' | 'walk') => void;
  isSmokerMode: boolean;
}

export const PetCharacter: React.FC<PetCharacterProps> = ({
  name,
  health,
  lungCleanliness,
  happiness,
  mood,
  customization,
  onCareAction,
  isSmokerMode,
}) => {
  const [isJumping, setIsJumping] = useState(false);
  const [floatingHeart, setFloatingHeart] = useState<{ id: number; x: number; y: number } | null>(null);
  const [activeCareAnim, setActiveCareAnim] = useState<string | null>(null);

  const handlePetClick = (e: React.MouseEvent) => {
    sounds.playPop();
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 500);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFloatingHeart({ id: Date.now(), x, y });
    setTimeout(() => setFloatingHeart(null), 1000);

    if (isSmokerMode) {
      onCareAction('pet');
    }
  };

  const triggerCare = (type: 'bath' | 'feed' | 'pet' | 'walk') => {
    sounds.playPop();
    setActiveCareAnim(type);
    setIsJumping(true);
    setTimeout(() => {
      setIsJumping(false);
      setActiveCareAnim(null);
    }, 700);
    onCareAction(type);
  };

  // Determine skin tone
  const skin = customization.skinColor || '#FDE68A';

  // Determine eye and mouth expression based on mood
  const isSick = mood === 'sick' || mood === 'coughing';
  const isCoughing = mood === 'coughing';
  const isSad = mood === 'sad';
  const isThriving = mood === 'thriving';

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Pet Canvas Container */}
      <div
        className="relative w-full max-w-[340px] h-[270px] sm:h-[300px] flex items-center justify-center cursor-pointer transition-transform duration-200"
        onClick={handlePetClick}
        role="button"
        tabIndex={0}
        aria-label={`Elus ${name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handlePetClick(e as unknown as React.MouseEvent);
          }
        }}
      >
        {/* Floating Heart Click Effect */}
        {floatingHeart && (
          <div
            className="absolute pointer-events-none z-30 animate-out fade-out slide-out-to-top duration-700"
            style={{ left: floatingHeart.x - 12, top: floatingHeart.y - 30 }}
          >
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500 animate-bounce" />
          </div>
        )}

        {/* Active Care Particles Animation */}
        {activeCareAnim === 'bath' && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            <span className="text-3xl animate-ping">🫧</span>
            <span className="text-2xl animate-bounce -mt-10 ml-8">🧼</span>
          </div>
        )}
        {activeCareAnim === 'feed' && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            <span className="text-3xl animate-bounce -mt-16">🍏</span>
            <span className="text-xs font-bold text-emerald-600 bg-white/90 px-2 py-0.5 rounded-full shadow-sm mt-12">
              Nyam enak!
            </span>
          </div>
        )}
        {activeCareAnim === 'walk' && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            <span className="text-3xl animate-pulse">🍃</span>
            <span className="text-2xl animate-bounce -mt-8 mr-12">👟</span>
          </div>
        )}

        {/* Smoke Clouds when Coughing */}
        {isCoughing && (
          <div className="absolute top-8 pointer-events-none z-20 flex items-center gap-1 opacity-90 animate-pulse">
            <div className="text-2xl animate-bounce">💨</div>
            <div className="bg-slate-800/80 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
              *Uhuk-uhuk!* Paru-paru sesak...
            </div>
          </div>
        )}

        {/* Sparkles when Thriving */}
        {isThriving && (
          <div className="absolute inset-x-8 top-6 pointer-events-none flex justify-between z-10 text-amber-400">
            <Sparkles className="w-5 h-5 animate-spin" />
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        )}

        {/* Character SVG */}
        <div
          className={`transition-transform duration-300 ${
            isJumping ? '-translate-y-4 scale-105' : ''
          } ${isCoughing ? 'animate-wiggle' : ''}`}
        >
          <svg
            viewBox="0 0 320 320"
            className="w-56 h-56 sm:w-64 sm:h-64 drop-shadow-xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft Shadow on Floor */}
            <ellipse
              cx="160"
              cy="285"
              rx={isJumping ? '50' : '75'}
              ry={isJumping ? '10' : '16'}
              fill="#000000"
              opacity={isJumping ? '0.1' : '0.2'}
            />

            {/* Back Hero Cape (if equipped) */}
            {customization.outfit === 'cape' && (
              <path
                d="M 120 180 Q 90 280 110 290 Q 160 280 210 290 Q 230 280 200 180 Z"
                fill="#EF4444"
                stroke="#B91C1C"
                strokeWidth="6"
              />
            )}

            {/* Main Body (Pou pear/potato droplet shape) */}
            <path
              d="M 160 80 C 220 80 250 120 258 190 C 265 245 235 275 185 282 C 170 284 150 284 135 282 C 85 275 55 245 62 190 C 70 120 100 80 160 80 Z"
              fill={isSick ? '#CBD5E1' : skin}
              stroke={isSick ? '#475569' : '#78350F'}
              strokeWidth="10"
              strokeLinejoin="round"
            />

            {/* Soot / Smoke stain patches if sick or coughing */}
            {(isSick || lungCleanliness < 50) && (
              <g opacity="0.45" fill="#475569">
                <circle cx="110" cy="180" r="16" />
                <circle cx="125" cy="195" r="10" />
                <circle cx="210" cy="170" r="14" />
                <circle cx="225" cy="185" r="8" />
              </g>
            )}

            {/* Little Hands / Arms */}
            <ellipse
              cx={isJumping ? '65' : '72'}
              cy={isJumping ? '170' : '195'}
              rx="14"
              ry="22"
              transform={`rotate(${isJumping ? '-45' : '-20'} ${isJumping ? 65 : 72} ${isJumping ? 170 : 195})`}
              fill={isSick ? '#94A3B8' : skin}
              stroke={isSick ? '#475569' : '#78350F'}
              strokeWidth="8"
            />
            <ellipse
              cx={isJumping ? '255' : '248'}
              cy={isJumping ? '170' : '195'}
              rx="14"
              ry="22"
              transform={`rotate(${isJumping ? '45' : '20'} ${isJumping ? 255 : 248} ${isJumping ? 170 : 195})`}
              fill={isSick ? '#94A3B8' : skin}
              stroke={isSick ? '#475569' : '#78350F'}
              strokeWidth="8"
            />

            {/* Outfits (Front) */}
            {customization.outfit === 'hoodie' && (
              <g>
                <path
                  d="M 95 210 Q 160 215 225 210 Q 235 270 160 278 Q 85 270 95 210 Z"
                  fill="#3B82F6"
                  stroke="#1D4ED8"
                  strokeWidth="8"
                />
                <line x1="160" y1="215" x2="160" y2="245" stroke="#FFFFFF" strokeWidth="4" />
                <circle cx="150" cy="248" r="4" fill="#FFFFFF" />
                <circle cx="170" cy="248" r="4" fill="#FFFFFF" />
              </g>
            )}

            {customization.outfit === 'jersey' && (
              <g>
                <path
                  d="M 95 210 Q 160 215 225 210 Q 235 270 160 278 Q 85 270 95 210 Z"
                  fill="#10B981"
                  stroke="#047857"
                  strokeWidth="8"
                />
                <text x="160" y="255" textAnchor="middle" fill="#FFFFFF" fontSize="24" fontWeight="bold">
                  07
                </text>
              </g>
            )}

            {customization.outfit === 'bowtie' && (
              <g transform="translate(160, 218)">
                <polygon points="0,0 -16,-8 -16,8" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
                <polygon points="0,0 16,-8 16,8" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
                <circle cx="0" cy="0" r="5" fill="#B91C1C" />
              </g>
            )}

            {/* Cheeks Blush (Only when not severely sick) */}
            {!isSick && (
              <>
                <circle cx="108" cy="188" r="14" fill="#FDA4AF" opacity="0.8" />
                <circle cx="212" cy="188" r="14" fill="#FDA4AF" opacity="0.8" />
              </>
            )}

            {/* EYES */}
            {isSick ? (
              // Droopy / X_X or tired eyes
              <>
                <path d="M 115 160 Q 130 170 145 160" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" fill="none" />
                <path d="M 175 160 Q 190 170 205 160" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" fill="none" />
              </>
            ) : isThriving ? (
              // Happy squinting arch eyes
              <>
                <path d="M 115 172 Q 130 152 145 172" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" fill="none" />
                <path d="M 175 172 Q 190 152 205 172" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" fill="none" />
              </>
            ) : (
              // Big round shiny eyes
              <>
                {/* Left Eye */}
                <ellipse cx="130" cy="165" rx="16" ry="20" fill="#1E293B" />
                <circle cx="126" cy="158" r="6" fill="#FFFFFF" />
                <circle cx="135" cy="172" r="3" fill="#FFFFFF" />

                {/* Right Eye */}
                <ellipse cx="190" cy="165" rx="16" ry="20" fill="#1E293B" />
                <circle cx="186" cy="158" r="6" fill="#FFFFFF" />
                <circle cx="195" cy="172" r="3" fill="#FFFFFF" />
              </>
            )}

            {/* GLASSES */}
            {customization.glasses === 'sunglasses' && (
              <g>
                <rect x="110" y="150" width="40" height="26" rx="6" fill="#0F172A" stroke="#000000" strokeWidth="4" />
                <rect x="170" y="150" width="40" height="26" rx="6" fill="#0F172A" stroke="#000000" strokeWidth="4" />
                <line x1="150" y1="160" x2="170" y2="160" stroke="#0F172A" strokeWidth="5" />
                <line x1="115" y1="155" x2="145" y2="168" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
                <line x1="175" y1="155" x2="205" y2="168" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
              </g>
            )}

            {customization.glasses === 'nerd' && (
              <g>
                <circle cx="130" cy="165" r="20" fill="none" stroke="#78350F" strokeWidth="5" />
                <circle cx="190" cy="165" r="20" fill="none" stroke="#78350F" strokeWidth="5" />
                <line x1="150" y1="165" x2="170" y2="165" stroke="#78350F" strokeWidth="5" />
              </g>
            )}

            {/* MOUTH */}
            {isCoughing ? (
              // Open coughing 'O' mouth
              <circle cx="160" cy="200" r="10" fill="#7F1D1D" stroke="#78350F" strokeWidth="5" />
            ) : isSad || isSick ? (
              // Frown
              <path d="M 148 206 Q 160 194 172 206" fill="none" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
            ) : (
              // Cheerful smile
              <path d="M 146 195 Q 160 214 174 195" fill="none" stroke="#78350F" strokeWidth="7" strokeLinecap="round" />
            )}

            {/* HATS */}
            {customization.hat === 'sprout' && (
              <g transform="translate(160, 80)">
                <path d="M 0 0 Q -15 -35 -30 -30 Q -15 -5 0 0 Z" fill="#34D399" stroke="#065F46" strokeWidth="4" />
                <path d="M 0 0 Q 15 -35 30 -30 Q 15 -5 0 0 Z" fill="#10B981" stroke="#065F46" strokeWidth="4" />
              </g>
            )}

            {customization.hat === 'cap' && (
              <g transform="translate(160, 85)">
                <ellipse cx="0" cy="0" rx="42" ry="14" fill="#EF4444" stroke="#991B1B" strokeWidth="5" />
                <path d="M -35 0 C -35 -30 35 -30 35 0 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="5" />
                {/* Visor */}
                <ellipse cx="25" cy="5" rx="30" ry="8" fill="#DC2626" stroke="#991B1B" strokeWidth="4" />
              </g>
            )}

            {customization.hat === 'crown' && (
              <g transform="translate(160, 80)">
                <polygon
                  points="-35,5 -35,-25 -15,-10 0,-35 15,-10 35,-25 35,5"
                  fill="#F59E0B"
                  stroke="#B45309"
                  strokeWidth="5"
                />
                <circle cx="-35" cy="-25" r="4" fill="#EF4444" />
                <circle cx="0" cy="-35" r="5" fill="#3B82F6" />
                <circle cx="35" cy="-25" r="4" fill="#10B981" />
              </g>
            )}

            {customization.hat === 'beanie' && (
              <g transform="translate(160, 84)">
                <path d="M -38 0 C -38 -35 38 -35 38 0 Z" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="5" />
                <rect x="-42" y="-4" width="84" height="12" rx="4" fill="#A78BFA" stroke="#6D28D9" strokeWidth="4" />
                <circle cx="0" cy="-35" r="7" fill="#EDE9FE" stroke="#6D28D9" strokeWidth="3" />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Pet Name & Status Bar */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-base font-bold text-slate-800 dark:text-slate-100">{name}</span>
        <span className="text-xs text-slate-500">·</span>
        <span
          className={`text-xs font-semibold ${
            isSick ? 'text-rose-600' : isThriving ? 'text-emerald-600' : 'text-amber-600'
          }`}
        >
          {isCoughing
            ? 'Sedang Terbatuk'
            : isSick
            ? 'Kondisi Drop'
            : isThriving
            ? 'Bugar & Bahagia'
            : 'Sehat & Ceria'}
        </span>
      </div>

      {/* Core Vitals Rings / Meters */}
      <div className="w-full max-w-sm mt-3 px-3 py-2.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-3 gap-2 text-center">
        {/* Health */}
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Kesehatan</div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                health > 70 ? 'bg-emerald-500' : health > 40 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${health}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1 tabular-nums">
            {health}%
          </span>
        </div>

        {/* Lungs Cleanliness */}
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Paru-Paru</div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                lungCleanliness > 70
                  ? 'bg-cyan-500'
                  : lungCleanliness > 40
                  ? 'bg-amber-500'
                  : 'bg-slate-500'
              }`}
              style={{ width: `${lungCleanliness}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1 tabular-nums">
            {lungCleanliness}%
          </span>
        </div>

        {/* Happiness */}
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-medium text-slate-500 mb-1">Kebahagiaan</div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-rose-400 transition-all duration-500"
              style={{ width: `${happiness}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1 tabular-nums">
            {happiness}%
          </span>
        </div>
      </div>

      {/* Interactive Pou Care Actions (Only in Smoker/Active Mode) */}
      {isSmokerMode ? (
        <div className="flex items-center justify-center gap-2 mt-3 w-full max-w-sm">
          <button
            onClick={() => triggerCare('bath')}
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition active:scale-95"
            aria-label="Mandi Busa & Bersihkan Paru"
          >
            <Bath className="w-4 h-4 text-cyan-600 mb-0.5" />
            <span className="text-[10px] font-semibold">Mandi</span>
          </button>

          <button
            onClick={() => triggerCare('feed')}
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition active:scale-95"
            aria-label="Beri Cemilan Apel Sehat"
          >
            <Apple className="w-4 h-4 text-emerald-600 mb-0.5" />
            <span className="text-[10px] font-semibold">Cemilan</span>
          </button>

          <button
            onClick={() => triggerCare('pet')}
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition active:scale-95"
            aria-label="Elus Penuh Kasih"
          >
            <Heart className="w-4 h-4 text-rose-600 mb-0.5" />
            <span className="text-[10px] font-semibold">Elus</span>
          </button>

          <button
            onClick={() => triggerCare('walk')}
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition active:scale-95"
            aria-label="Jalan Santai Udara Segar"
          >
            <Footprints className="w-4 h-4 text-amber-600 mb-0.5" />
            <span className="text-[10px] font-semibold">Jalan</span>
          </button>
        </div>
      ) : (
        <div className="mt-2 text-center text-xs text-slate-500">
          Pet milik pacar Anda. Ketuk untuk mengirim getaran cinta virtual ❤️
        </div>
      )}
    </div>
  );
};
