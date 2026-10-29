import React from 'react';
import { Palette, Shirt, Sparkles, Check, Lock, Coins } from 'lucide-react';
import { sounds } from '../utils/audio';

interface CustomizationShopProps {
  coins: number;
  unlockedItems: string[];
  currentCustomization: {
    hat: string;
    outfit: string;
    glasses: string;
    skinColor: string;
    roomTheme: string;
  };
  onEquipItem: (type: string, value: string) => void;
  onBuyItem: (itemId: string, cost: number, type: string, value: string) => void;
}

export const CustomizationShop: React.FC<CustomizationShopProps> = ({
  coins,
  unlockedItems,
  currentCustomization,
  onEquipItem,
  onBuyItem,
}) => {
  const [activeCategory, setActiveCategory] = React.useState<'hat' | 'outfit' | 'glasses' | 'skin'>('hat');

  const hats = [
    { id: 'hat_sprout', name: 'Tunas Paru Sehat', val: 'sprout', cost: 0, desc: 'Simbol udara bersih dan awal baru' },
    { id: 'hat_cap', name: 'Topi Merah Keren', val: 'cap', cost: 40, desc: 'Topi santai buat jalan sore' },
    { id: 'hat_crown', name: 'Mahkota Juara', val: 'crown', cost: 120, desc: 'Khusus pejuang bebas asap rokok' },
    { id: 'hat_beanie', name: 'Beanie Rajut Hangat', val: 'beanie', cost: 60, desc: 'Beanie ungu lembut yang nyaman' },
    { id: 'hat_none', name: 'Tanpa Topi', val: 'none', cost: 0, desc: 'Tampilan alami kepala bulat' },
  ];

  const outfits = [
    { id: 'outfit_none', name: 'Alami / Polos', val: 'none', cost: 0, desc: 'Tampilan klasik Pou yang imut' },
    { id: 'outfit_jersey', name: 'Jersey Olahraga #07', val: 'jersey', cost: 80, desc: 'Siap lari pagi dengan paru segar' },
    { id: 'outfit_hoodie', name: 'Hoodie Biru Kasual', val: 'hoodie', cost: 100, desc: 'Hangat dan modis sepanjang hari' },
    { id: 'outfit_bowtie', name: 'Dasi Kupu-Kupu Elegan', val: 'bowtie', cost: 50, desc: 'Tampil rapi untuk date bersama Zahra' },
    { id: 'outfit_cape', name: 'Jubah Superhero Paru', val: 'cape', cost: 150, desc: 'Pahlawan melawan kecanduan nikotin' },
  ];

  const glasses = [
    { id: 'glasses_none', name: 'Tanpa Kacamata', val: 'none', cost: 0, desc: 'Mata bulat berbinar alami' },
    { id: 'glasses_sunglasses', name: 'Kacamata Hitam Kece', val: 'sunglasses', cost: 60, desc: 'Gaya penuh percaya diri' },
    { id: 'glasses_nerd', name: 'Kacamata Belajar Cerdas', val: 'nerd', cost: 45, desc: 'Fokus dan bijak menjaga kesehatan' },
  ];

  const skins = [
    { id: 'skin_golden', name: 'Kuning Madu Hangat', val: '#FDE68A', cost: 0, desc: 'Warna kulit klasik Pou' },
    { id: 'skin_mint', name: 'Mint Segar Hijau', val: '#A7F3D0', cost: 50, desc: 'Aura tanaman segar kaya oksigen' },
    { id: 'skin_lavender', name: 'Lavender Romantis', val: '#E9D5FF', cost: 75, desc: 'Warna lembut kesukaan Zahra' },
    { id: 'skin_peach', name: 'Peach Merona Manis', val: '#FECDD3', cost: 75, desc: 'Pipi merona tanda tubuh bugar' },
    { id: 'skin_sky', name: 'Biru Langit Cerah', val: '#BAE6FD', cost: 60, desc: 'Sebebas langit tanpa asap tebal' },
  ];

  const currentItems =
    activeCategory === 'hat'
      ? hats
      : activeCategory === 'outfit'
      ? outfits
      : activeCategory === 'glasses'
      ? glasses
      : skins;

  return (
    <div className="w-full space-y-4">
      {/* Coin Balance Bar */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-xl">
            <Coins className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <span className="text-[11px] text-amber-100 font-medium">Dompet Koin Sehat</span>
            <div className="text-xl font-extrabold tabular-nums flex items-center gap-1">
              <span>{coins}</span>
              <span className="text-xs font-semibold text-amber-200">Koin</span>
            </div>
          </div>
        </div>
        <div className="text-right text-[11px] text-amber-100 max-w-[170px]">
          Dapatkan koin dengan menahan craving rokok (+20) dan menjaga streak!
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveCategory('hat')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
            activeCategory === 'hat'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Topi
        </button>
        <button
          onClick={() => setActiveCategory('outfit')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
            activeCategory === 'outfit'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Pakaian
        </button>
        <button
          onClick={() => setActiveCategory('glasses')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
            activeCategory === 'glasses'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Kacamata
        </button>
        <button
          onClick={() => setActiveCategory('skin')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
            activeCategory === 'skin'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Warna Kulit
        </button>
      </div>

      {/* Item List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {currentItems.map((item) => {
          const isUnlocked = item.cost === 0 || unlockedItems.includes(item.id);
          const isEquipped =
            activeCategory === 'hat'
              ? currentCustomization.hat === item.val
              : activeCategory === 'outfit'
              ? currentCustomization.outfit === item.val
              : activeCategory === 'glasses'
              ? currentCustomization.glasses === item.val
              : currentCustomization.skinColor === item.val;

          const canAfford = coins >= item.cost;

          return (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                isEquipped
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {activeCategory === 'skin' ? (
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-inner"
                    style={{ backgroundColor: item.val }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm">
                    {activeCategory === 'hat' ? '🧢' : activeCategory === 'outfit' ? '👕' : '🕶️'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {isEquipped && (
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.2 rounded-full">
                        Dipakai
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{item.desc}</p>
                </div>
              </div>

              <div>
                {isEquipped ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <Check className="w-4 h-4" />
                  </span>
                ) : isUnlocked ? (
                  <button
                    onClick={() => {
                      sounds.playPop();
                      onEquipItem(activeCategory, item.val);
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-600 hover:text-white text-xs font-semibold rounded-xl transition active:scale-95"
                  >
                    Pakai
                  </button>
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={() => {
                      sounds.playChime();
                      onBuyItem(item.id, item.cost, activeCategory, item.val);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1 transition active:scale-95 ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>{item.cost} Koin</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
