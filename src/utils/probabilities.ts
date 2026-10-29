export interface SumRule {
  sum: number;
  combinations: number; // out of 36
  percentage: number; // e.g. 16.67
  normalMultiplier: number; // e.g. 1.0 (gain), 0 (neutral), -0.1 (loss)
  pressureMultiplier: number;
  normalLabel: string;
  pressureLabel: string;
}

export const PROBABILITY_RULES: Record<number, SumRule> = {
  12: {
    sum: 12,
    combinations: 1,
    percentage: 2.78,
    normalMultiplier: 1.0,
    pressureMultiplier: 0.75,
    normalLabel: '+100%',
    pressureLabel: '+75%',
  },
  11: {
    sum: 11,
    combinations: 2,
    percentage: 5.56,
    normalMultiplier: 0.5,
    pressureMultiplier: 0.3,
    normalLabel: '+50%',
    pressureLabel: '+30%',
  },
  10: {
    sum: 10,
    combinations: 3,
    percentage: 8.33,
    normalMultiplier: 0.3,
    pressureMultiplier: 0.15,
    normalLabel: '+30%',
    pressureLabel: '+15%',
  },
  9: {
    sum: 9,
    combinations: 4,
    percentage: 11.11,
    normalMultiplier: 0.1,
    pressureMultiplier: 0.0,
    normalLabel: '+10%',
    pressureLabel: 'Neutro (0%)',
  },
  8: {
    sum: 8,
    combinations: 5,
    percentage: 13.89,
    normalMultiplier: 0.0,
    pressureMultiplier: -0.2,
    normalLabel: 'Neutro (0%)',
    pressureLabel: '-20%',
  },
  7: {
    sum: 7,
    combinations: 6,
    percentage: 16.67,
    normalMultiplier: -0.1,
    pressureMultiplier: -0.35,
    normalLabel: '-10%',
    pressureLabel: '-35%',
  },
  6: {
    sum: 6,
    combinations: 5,
    percentage: 13.89,
    normalMultiplier: -0.2,
    pressureMultiplier: -0.5,
    normalLabel: '-20%',
    pressureLabel: '-50%',
  },
  5: {
    sum: 5,
    combinations: 4,
    percentage: 11.11,
    normalMultiplier: -0.35,
    pressureMultiplier: -0.7,
    normalLabel: '-35%',
    pressureLabel: '-70%',
  },
  4: {
    sum: 4,
    combinations: 3,
    percentage: 8.33,
    normalMultiplier: -0.5,
    pressureMultiplier: -0.85,
    normalLabel: '-50%',
    pressureLabel: '-85%',
  },
  3: {
    sum: 3,
    combinations: 2,
    percentage: 5.56,
    normalMultiplier: -0.75,
    pressureMultiplier: -1.0,
    normalLabel: '-75%',
    pressureLabel: '-100% (Perda Total)',
  },
  2: {
    sum: 2,
    combinations: 1,
    percentage: 2.78,
    normalMultiplier: -1.0,
    pressureMultiplier: -1.0,
    normalLabel: '-100% (Perda Total)',
    pressureLabel: '-100% (Perda Total)',
  },
};

export function calculateOutcome(sum: number, bet: number, currentRound: number) {
  const isHardMode = currentRound > 4;
  const rule = PROBABILITY_RULES[sum];

  if (!rule) {
    return {
      change: 0,
      message: 'Soma Indefinida',
      multiplierLabel: '0%',
      isGain: false,
      isNeutral: true,
      isPressureMode: isHardMode,
    };
  }

  const multiplier = isHardMode ? rule.pressureMultiplier : rule.normalMultiplier;
  const label = isHardMode ? rule.pressureLabel : rule.normalLabel;
  const isGain = multiplier > 0;
  const isNeutral = multiplier === 0;

  let change = 0;
  if (multiplier === -1.0) {
    change = -bet; // full loss
  } else if (multiplier === 0) {
    change = 0;
  } else {
    change = Math.floor(bet * multiplier);
  }

  const prefix = isHardMode ? ' (PRESSÃO)' : '';
  const message = isNeutral
    ? `SOMA ${sum}: NEUTRO${prefix}`
    : isGain
      ? `SOMA ${sum}: +${Math.round(multiplier * 100)}%${prefix}`
      : multiplier === -1.0
        ? `SOMA ${sum}: PERDA TOTAL (-100%)!${prefix}`
        : `SOMA ${sum}: -${Math.round(Math.abs(multiplier) * 100)}%${prefix}`;

  return {
    change,
    message,
    multiplierLabel: label,
    isGain,
    isNeutral,
    isPressureMode: isHardMode,
  };
}

export function generateSecretCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateSecretEffect() {
  const effects = [
    { type: 'MULT_GAIN' as const, val: 2, desc: 'BÔNUS: DOBROU O SALDO (2x)!', isPositive: true },
    { type: 'FIXED_GAIN' as const, val: 3000, desc: 'BÔNUS: +R$ 3.000,00 EM CONTA!', isPositive: true },
    { type: 'FIXED_LOSS' as const, val: 2000, desc: 'MULTA: -R$ 2.000,00 DE PENALIDADE!', isPositive: false },
    { type: 'PERCENT_LOSS' as const, val: 0.5, desc: 'AZAR: PERDEU 50% DO SALDO!', isPositive: false },
  ];
  return effects[Math.floor(Math.random() * effects.length)];
}
