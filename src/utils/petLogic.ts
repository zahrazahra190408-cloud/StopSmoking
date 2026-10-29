/**
 * Pure business and game logic for NikoPuff quit-smoking virtual pet
 * Decoupled from UI to enable rigorous unit testing and predictable state.
 */

export interface PetHealthParams {
  cigarettesToday: number;
  dailyLimit: number;
  hoursSinceLastSmoke: number;
  careBonus?: number;
}

export type PetMood = 'sick' | 'coughing' | 'sad' | 'normal' | 'happy' | 'thriving';

/**
 * Calculates pet health score (5 - 100)
 */
export function calculatePetHealth(params: PetHealthParams): number {
  const { cigarettesToday, dailyLimit, hoursSinceLastSmoke, careBonus = 0 } = params;

  // Base starting health
  let health = 100;

  // Penalty per cigarette
  const perCigPenalty = 12;
  health -= cigarettesToday * perCigPenalty;

  // Additional penalty if exceeding daily limit
  if (cigarettesToday > dailyLimit) {
    const excess = cigarettesToday - dailyLimit;
    health -= excess * 10;
  }

  // Recovery bonus per hour without smoke
  const recovery = Math.min(hoursSinceLastSmoke * 2.5, 40);
  health += recovery;

  // Care bonus (feeding healthy snacks, grooming, patting)
  health += careBonus;

  // Clamp between 5 (severely coughing) and 100 (thriving)
  return Math.max(5, Math.min(100, Math.round(health)));
}

/**
 * Determines current pet mood expression
 */
export function getPetMood(
  health: number,
  happiness: number,
  minutesSinceLastSmoke: number
): PetMood {
  if (minutesSinceLastSmoke < 20) {
    return 'coughing';
  }
  if (health < 35) {
    return 'sick';
  }
  if (health < 60 || happiness < 40) {
    return 'sad';
  }
  if (health >= 85 && happiness >= 80) {
    return 'thriving';
  }
  if (health >= 60 && happiness >= 50) {
    return 'happy';
  }
  return 'normal';
}

export interface MoneySavedParams {
  daysActive: number;
  normalCigsPerDay: number;
  actualSmokedTotal: number;
  costPerPack: number;
  cigsPerPack: number;
}

/**
 * Calculates money saved in Rupiah
 */
export function calculateMoneySaved(params: MoneySavedParams): {
  totalSavedRp: number;
  cigsAvoided: number;
  costPerCigarette: number;
} {
  const { daysActive, normalCigsPerDay, actualSmokedTotal, costPerPack, cigsPerPack } = params;
  const costPerCigarette = cigsPerPack > 0 ? costPerPack / cigsPerPack : 2000;
  
  // Days active must be at least 1 for calculation
  const effectiveDays = Math.max(1, daysActive);
  const baselineCigsExpected = effectiveDays * normalCigsPerDay;
  const cigsAvoided = Math.max(0, baselineCigsExpected - actualSmokedTotal);
  
  const totalSavedRp = Math.round(cigsAvoided * costPerCigarette);
  return { totalSavedRp, cigsAvoided, costPerCigarette };
}

export interface HealthMilestone {
  id: string;
  title: string;
  targetHours: number;
  progressPercent: number;
  isUnlocked: boolean;
  description: string;
  iconType: string;
}

/**
 * Clinical recovery milestones based on hours without smoking
 */
export function calculateHealthMilestones(smokeFreeHours: number): HealthMilestone[] {
  const milestonesDef = [
    {
      id: '20_min',
      title: '20 Menit',
      targetHours: 20 / 60,
      description: 'Detak jantung & tekanan darah mulai stabil ke batas normal.',
      iconType: 'heart',
    },
    {
      id: '8_hours',
      title: '8 Jam',
      targetHours: 8,
      description: 'Kadar karbon monoksida dalam darah berkurang separuh, oksigen pulih.',
      iconType: 'wind',
    },
    {
      id: '24_hours',
      title: '24 Jam (1 Hari)',
      targetHours: 24,
      description: 'Risiko serangan jantung dan kejang arteri mulai menurun.',
      iconType: 'shield',
    },
    {
      id: '48_hours',
      title: '48 Jam (2 Hari)',
      targetHours: 48,
      description: 'Ujung saraf mulai tumbuh kembali, indra pengecap & penciuman jauh lebih tajam.',
      iconType: 'sparkles',
    },
    {
      id: '72_hours',
      title: '72 Jam (3 Hari)',
      targetHours: 72,
      description: 'Saluran pernapasan (bronkus) mulai rileks, bernapas terasa lebih lega.',
      iconType: 'activity',
    },
    {
      id: '1_week',
      title: '1 Minggu',
      targetHours: 168,
      description: 'Sirkulasi darah meningkat, energi fisik untuk olahraga jauh bertambah.',
      iconType: 'zap',
    },
    {
      id: '2_weeks',
      title: '2 Minggu',
      targetHours: 336,
      description: 'Kapasitas fungsi paru-paru meningkat hingga 30%.',
      iconType: 'sun',
    },
    {
      id: '1_month',
      title: '1 Bulan',
      targetHours: 720,
      description: 'Batuk berdahak & sesak napas berkurang drastis, silia paru aktif membersihkan kotoran.',
      iconType: 'award',
    },
  ];

  return milestonesDef.map((m) => {
    const progress = Math.min(100, Math.round((smokeFreeHours / m.targetHours) * 100));
    return {
      id: m.id,
      title: m.title,
      targetHours: m.targetHours,
      progressPercent: progress,
      isUnlocked: progress >= 100,
      description: m.description,
      iconType: m.iconType,
    };
  });
}

/**
 * Calculates level and progress towards next level
 */
export function calculateLevelAndXP(xp: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
} {
  // Each level requires 100 * level XP
  let level = 1;
  let remainingXP = Math.max(0, xp);
  let threshold = 100;

  while (remainingXP >= threshold) {
    remainingXP -= threshold;
    level++;
    threshold = level * 100;
  }

  const progressPercent = Math.min(100, Math.round((remainingXP / threshold) * 100));
  return {
    level,
    currentLevelXP: remainingXP,
    nextLevelXP: threshold,
    progressPercent,
  };
}

/**
 * Calculates formatted streak time
 */
export function calculateStreak(lastSmokedTimestamp: number, currentTimestamp: number): {
  hours: number;
  days: number;
  totalMinutes: number;
  formattedString: string;
} {
  const diffMs = Math.max(0, currentTimestamp - lastSmokedTimestamp);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  const remainingMinutes = totalMinutes % 60;

  let formattedString = '';
  if (days > 0) {
    formattedString = `${days} hari ${remainingHours} jam`;
  } else if (hours > 0) {
    formattedString = `${hours} jam ${remainingMinutes} mnt`;
  } else {
    formattedString = `${remainingMinutes} menit`;
  }

  return { hours, days, totalMinutes, formattedString };
}
