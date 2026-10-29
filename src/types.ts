export type GameState = 'SETUP' | 'PLAYING' | 'GAME_OVER';

export type PlayerColor = {
  id: string;
  bg: string;
  border: string;
  text: string;
  ring: string;
  badgeBg: string;
};

export interface Player {
  id: number;
  name: string;
  isBot?: boolean;
  botPersonality?: 'conservative' | 'balanced' | 'aggressive';
  balance: number;
  initialBalance: number;
  color: PlayerColor;
  forcedAllIn: boolean;
  bankrupt: boolean;
  pendingSabotageNotice: {
    attackerName: string;
    effectDesc: string;
  } | null;
  stats: {
    rolls: number;
    wins: number;
    losses: number;
    neutrals: number;
    highestBalance: number;
    totalWon: number;
    totalLost: number;
    sabotagesUsed: number;
  };
}

export interface RollResult {
  dice1: number;
  dice2: number;
  sum: number;
  bet: number;
  change: number;
  newBalance: number;
  message: string;
  multiplierLabel: string;
  isGain: boolean;
  isNeutral: boolean;
  isPressureMode: boolean;
  timestamp: Date;
  playerId: number;
  playerName: string;
}

export type SabotageType = 'STEAL_20' | 'FORCE_ALL_IN' | 'FEE_1000';

export interface SecretEffect {
  type: 'MULT_GAIN' | 'FIXED_GAIN' | 'FIXED_LOSS' | 'PERCENT_LOSS';
  val: number;
  desc: string;
  isPositive: boolean;
}

export interface SecretCodeRecord {
  code: string;
  effect: SecretEffect;
  assignedToPlayerId: number;
  assignedToPlayerName: string;
  createdAt: number;
}
