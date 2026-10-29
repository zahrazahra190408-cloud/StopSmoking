import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePetHealth,
  getPetMood,
  calculateMoneySaved,
  calculateHealthMilestones,
  calculateLevelAndXP,
  calculateStreak,
} from './petLogic';

test('calculatePetHealth decreases health when smoking and recovers with smoke-free hours', () => {
  // Baseline healthy pet
  const initial = calculatePetHealth({
    cigarettesToday: 0,
    dailyLimit: 10,
    hoursSinceLastSmoke: 5,
  });
  assert.equal(initial, 100);

  // Smoking 3 cigarettes
  const smoked3 = calculatePetHealth({
    cigarettesToday: 3,
    dailyLimit: 10,
    hoursSinceLastSmoke: 0,
  });
  // 100 - (3 * 12) = 64
  assert.equal(smoked3, 64);

  // Exceeding daily limit incurs extra penalty
  const exceeded = calculatePetHealth({
    cigarettesToday: 12,
    dailyLimit: 10,
    hoursSinceLastSmoke: 0,
  });
  // 100 - (12 * 12 = 144) - (2 * 10 = 20) = -64, clamped to min 5
  assert.equal(exceeded, 5);

  // With smoke free hours and care bonus, it recovers
  const recovered = calculatePetHealth({
    cigarettesToday: 2,
    dailyLimit: 10,
    hoursSinceLastSmoke: 8,
    careBonus: 10,
  });
  // 100 - 24 + min(8*2.5, 40) [20] + 10 = 106 clamped to 100
  assert.equal(recovered, 100);
});

test('getPetMood returns coughing immediately after smoke and thriving on high health streak', () => {
  // Immediately after smoking (e.g. 5 mins ago)
  const coughingMood = getPetMood(80, 80, 5);
  assert.equal(coughingMood, 'coughing');

  // Low health (< 35)
  const sickMood = getPetMood(30, 80, 60);
  assert.equal(sickMood, 'sick');

  // Low health / sad
  const sadMood = getPetMood(50, 40, 60);
  assert.equal(sadMood, 'sad');

  // Thriving
  const thrivingMood = getPetMood(90, 85, 300);
  assert.equal(thrivingMood, 'thriving');
});

test('calculateMoneySaved accurately accounts for avoided cigarettes and cost', () => {
  const result = calculateMoneySaved({
    daysActive: 5,
    normalCigsPerDay: 16,
    actualSmokedTotal: 20, // normally 5 * 16 = 80, avoided = 60
    costPerPack: 32000,
    cigsPerPack: 16, // Rp 2.000 per cigarette
  });

  assert.equal(result.cigsAvoided, 60);
  assert.equal(result.costPerCigarette, 2000);
  assert.equal(result.totalSavedRp, 120000);
});

test('calculateHealthMilestones tracks clinical progress across time thresholds', () => {
  const milestonesAfter1Day = calculateHealthMilestones(24);
  
  // 20 min milestone is unlocked
  assert.equal(milestonesAfter1Day[0].isUnlocked, true);
  assert.equal(milestonesAfter1Day[0].progressPercent, 100);

  // 8 hours milestone is unlocked
  assert.equal(milestonesAfter1Day[1].isUnlocked, true);

  // 24 hours milestone is unlocked
  assert.equal(milestonesAfter1Day[2].isUnlocked, true);

  // 48 hours is 50%
  assert.equal(milestonesAfter1Day[3].isUnlocked, false);
  assert.equal(milestonesAfter1Day[3].progressPercent, 50);
});

test('calculateLevelAndXP handles levels thresholds smoothly', () => {
  const lvl1 = calculateLevelAndXP(50);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.currentLevelXP, 50);
  assert.equal(lvl1.progressPercent, 50);

  // 100 XP progresses to level 2
  const lvl2 = calculateLevelAndXP(150);
  assert.equal(lvl2.level, 2);
  assert.equal(lvl2.currentLevelXP, 50); // threshold is 200
  assert.equal(lvl2.progressPercent, 25);
});

test('calculateStreak formats duration appropriately', () => {
  const now = 1700000000000;
  const smoked10MinAgo = now - 10 * 60 * 1000;
  const streak10m = calculateStreak(smoked10MinAgo, now);
  assert.equal(streak10m.totalMinutes, 10);
  assert.equal(streak10m.formattedString, '10 menit');

  const smoked2DaysAgo = now - (2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000);
  const streak2d = calculateStreak(smoked2DaysAgo, now);
  assert.equal(streak2d.days, 2);
  assert.equal(streak2d.formattedString, '2 hari 4 jam');
});
