/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Dices,
  HelpCircle,
  Key,
  Volume2,
  VolumeX,
  Skull,
  ArrowRight,
  History,
  RotateCcw,
  Sparkles,
  Flame,
  AlertCircle,
  Coins,
} from 'lucide-react';
import { Dice3D } from './components/Dice3D';
import { SetupModal } from './components/SetupModal';
import { RulesModal } from './components/RulesModal';
import { CodeModal } from './components/CodeModal';
import { SecretAlertModal } from './components/SecretAlertModal';
import { SabotageOverlay } from './components/SabotageOverlay';
import { SabotageNoticeOverlay } from './components/SabotageNoticeOverlay';
import { TurnOverlay } from './components/TurnOverlay';
import { WinnerOverlay } from './components/WinnerOverlay';
import { HistoryDrawer } from './components/HistoryDrawer';
import { sounds } from './utils/audio';
import { triggerConfetti } from './utils/confetti';
import {
  calculateOutcome,
  generateSecretCode,
  generateSecretEffect,
  PROBABILITY_RULES,
} from './utils/probabilities';
import {
  Player,
  PlayerColor,
  RollResult,
  SabotageType,
  SecretCodeRecord,
  SecretEffect,
} from './types';

const PLAYER_COLORS: PlayerColor[] = [
  {
    id: 'indigo',
    bg: 'bg-indigo-600',
    border: 'border-indigo-400',
    text: 'text-indigo-400',
    ring: 'ring-indigo-500',
    badgeBg: 'bg-indigo-500/20',
  },
  {
    id: 'emerald',
    bg: 'bg-emerald-600',
    border: 'border-emerald-400',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500',
    badgeBg: 'bg-emerald-500/20',
  },
  {
    id: 'amber',
    bg: 'bg-amber-600',
    border: 'border-amber-400',
    text: 'text-amber-400',
    ring: 'ring-amber-500',
    badgeBg: 'bg-amber-500/20',
  },
  {
    id: 'rose',
    bg: 'bg-rose-600',
    border: 'border-rose-400',
    text: 'text-rose-400',
    ring: 'ring-rose-500',
    badgeBg: 'bg-rose-500/20',
  },
];

export default function App() {
  // Game Setup State
  const [isSetupOpen, setIsSetupOpen] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(10);

  // Dice State
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [diceRotationOffsets, setDiceRotationOffsets] = useState({
    dice1: { x: 0, y: 0 },
    dice2: { x: 0, y: 0 },
  });
  const [isRolling, setIsRolling] = useState(false);
  const [diceSum, setDiceSum] = useState<number | null>(null);

  // Betting State
  const [betAmount, setBetAmount] = useState<number>(2500);
  const [lastOutcome, setLastOutcome] = useState<{
    message: string;
    isGain: boolean;
    isNeutral: boolean;
  } | null>(null);
  const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);

  // Sabotage State
  const [sabotageAvailable, setSabotageAvailable] = useState(false);
  const [isSabotageOpen, setIsSabotageOpen] = useState(false);
  const [sabotageTimeLeft, setSabotageTimeLeft] = useState(10);
  const sabotageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Secret Codes State
  const [activeCodes, setActiveCodes] = useState<Record<string, SecretEffect>>({});
  const [secretAlertRecord, setSecretAlertRecord] = useState<SecretCodeRecord | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Modals & Overlays
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [turnOverlayPlayer, setTurnOverlayPlayer] = useState<Player | null>(null);
  const [activeSabotageNotice, setActiveSabotageNotice] = useState<{
    attackerName: string;
    effectDesc: string;
  } | null>(null);
  const [winnerInfo, setWinnerInfo] = useState<{
    winner: Player;
    reason: string;
  } | null>(null);

  // History Log
  const [history, setHistory] = useState<RollResult[]>([]);

  // Sound Mute State
  const [isMuted, setIsMuted] = useState(false);

  const currentPlayer = players[currentPlayerIndex] || null;
  const isPressureMode = currentRound > 4;

  // Clear sabotage timer helper
  const clearSabotageTimer = () => {
    if (sabotageTimerRef.current) {
      clearInterval(sabotageTimerRef.current);
      sabotageTimerRef.current = null;
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextState = sounds.toggleMute();
    setIsMuted(nextState);
  };

  // Start new match
  const handleStartGame = ({
    playerCount,
    names,
    roundLimit,
    withBots,
  }: {
    playerCount: number;
    names: string[];
    roundLimit: number;
    withBots: boolean;
  }) => {
    sounds.playClick();
    clearSabotageTimer();

    const newPlayers: Player[] = [];

    if (playerCount === 1 && withBots) {
      // 1 Human vs 2 Bots
      newPlayers.push({
        id: 1,
        name: names[0] || 'Você',
        balance: 10000,
        initialBalance: 10000,
        color: PLAYER_COLORS[0],
        forcedAllIn: false,
        bankrupt: false,
        pendingSabotageNotice: null,
        stats: {
          rolls: 0,
          wins: 0,
          losses: 0,
          neutrals: 0,
          highestBalance: 10000,
          totalWon: 0,
          totalLost: 0,
          sabotagesUsed: 0,
        },
      });

      newPlayers.push({
        id: 2,
        name: 'Bot Estratégico',
        isBot: true,
        botPersonality: 'balanced',
        balance: 10000,
        initialBalance: 10000,
        color: PLAYER_COLORS[1],
        forcedAllIn: false,
        bankrupt: false,
        pendingSabotageNotice: null,
        stats: {
          rolls: 0,
          wins: 0,
          losses: 0,
          neutrals: 0,
          highestBalance: 10000,
          totalWon: 0,
          totalLost: 0,
          sabotagesUsed: 0,
        },
      });

      newPlayers.push({
        id: 3,
        name: 'Bot Agressivo',
        isBot: true,
        botPersonality: 'aggressive',
        balance: 10000,
        initialBalance: 10000,
        color: PLAYER_COLORS[2],
        forcedAllIn: false,
        bankrupt: false,
        pendingSabotageNotice: null,
        stats: {
          rolls: 0,
          wins: 0,
          losses: 0,
          neutrals: 0,
          highestBalance: 10000,
          totalWon: 0,
          totalLost: 0,
          sabotagesUsed: 0,
        },
      });
    } else {
      // Standard local human players
      for (let i = 1; i <= playerCount; i++) {
        newPlayers.push({
          id: i,
          name: names[i - 1]?.trim() || `Jogador ${i}`,
          balance: 10000,
          initialBalance: 10000,
          color: PLAYER_COLORS[(i - 1) % PLAYER_COLORS.length],
          forcedAllIn: false,
          bankrupt: false,
          pendingSabotageNotice: null,
          stats: {
            rolls: 0,
            wins: 0,
            losses: 0,
            neutrals: 0,
            highestBalance: 10000,
            totalWon: 0,
            totalLost: 0,
            sabotagesUsed: 0,
          },
        });
      }
    }

    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setCurrentRound(1);
    setMaxRounds(roundLimit);
    setIsSetupOpen(false);
    setDiceSum(null);
    setLastOutcome(null);
    setHasRolledThisTurn(false);
    setHistory([]);
    setActiveCodes({});
    setWinnerInfo(null);
    setBetAmount(2500);

    // Initial check for sabotage opportunity
    checkSabotageOpportunity(newPlayers, 0);
  };

  // Check Sabotage Chance (~8% chance in multiplayer when more than 1 active player)
  const checkSabotageOpportunity = (currentPlayers: Player[], playerIdx: number) => {
    clearSabotageTimer();

    const activeCount = currentPlayers.filter((p) => !p.bankrupt && p.balance > 0).length;
    const player = currentPlayers[playerIdx];

    if (activeCount <= 1 || !player || player.isBot) {
      setSabotageAvailable(false);
      return;
    }

    const rollChance = Math.random();
    if (rollChance < 0.12) {
      setSabotageAvailable(true);
      setSabotageTimeLeft(10);
      sounds.playSabotageAlert();

      sabotageTimerRef.current = setInterval(() => {
        setSabotageTimeLeft((prev) => {
          if (prev <= 1) {
            clearSabotageTimer();
            setSabotageAvailable(false);
            setIsSabotageOpen(false);
            return 0;
          }
          sounds.playTick();
          return prev - 1;
        });
      }, 1000);
    } else {
      setSabotageAvailable(false);
    }
  };

  // Update Bet Input safely whenever current player changes
  useEffect(() => {
    if (!currentPlayer) return;

    if (currentPlayer.forcedAllIn) {
      setBetAmount(currentPlayer.balance);
    } else {
      setBetAmount((prev) => {
        if (prev > currentPlayer.balance) {
          return Math.max(1, Math.floor(currentPlayer.balance * 0.25));
        }
        return prev <= 0 ? Math.min(1000, currentPlayer.balance) : prev;
      });
    }
  }, [currentPlayerIndex, currentPlayer?.balance, currentPlayer?.forcedAllIn]);

  // Handle Bot Automated Play
  useEffect(() => {
    if (!currentPlayer || !currentPlayer.isBot || isSetupOpen || winnerInfo || isRolling) {
      return;
    }

    // Bot decides bet
    let botBet = 1000;
    if (currentPlayer.forcedAllIn) {
      botBet = currentPlayer.balance;
    } else if (currentPlayer.botPersonality === 'aggressive') {
      botBet = Math.max(1, Math.floor(currentPlayer.balance * (Math.random() < 0.4 ? 0.75 : 0.5)));
    } else {
      botBet = Math.max(1, Math.floor(currentPlayer.balance * (Math.random() < 0.5 ? 0.25 : 0.15)));
    }
    setBetAmount(botBet);

    // Bot rolls after short delay
    const botRollTimer = setTimeout(() => {
      performRoll(botBet);
    }, 1200);

    return () => clearTimeout(botRollTimer);
  }, [currentPlayerIndex, isSetupOpen, winnerInfo]);

  // Set quick bet percent
  const handleSetBetPercent = (percent: number) => {
    if (!currentPlayer || currentPlayer.forcedAllIn || isRolling || hasRolledThisTurn) return;
    sounds.playClick();
    const calculated = Math.floor(currentPlayer.balance * percent);
    setBetAmount(Math.max(1, calculated));
  };

  // Execute Sabotage
  const handleExecuteSabotage = (targetId: number, type: SabotageType) => {
    if (!currentPlayer) return;

    sounds.playClick();
    clearSabotageTimer();
    setSabotageAvailable(false);
    setIsSabotageOpen(false);

    let effectDesc = '';
    const updatedPlayers = players.map((p) => {
      if (p.id === targetId) {
        if (type === 'STEAL_20') {
          const amount = Math.floor(p.balance * 0.2);
          effectDesc = `Roubou R$ ${amount.toLocaleString('pt-BR')} (20%) do seu saldo!`;
          return {
            ...p,
            balance: Math.max(0, p.balance - amount),
            pendingSabotageNotice: {
              attackerName: currentPlayer.name,
              effectDesc,
            },
          };
        } else if (type === 'FORCE_ALL_IN') {
          effectDesc = `Forçou você a dar ALL-IN obrigatório na sua próxima rodada!`;
          return {
            ...p,
            forcedAllIn: true,
            pendingSabotageNotice: {
              attackerName: currentPlayer.name,
              effectDesc,
            },
          };
        } else if (type === 'FEE_1000') {
          effectDesc = `Aplicou uma multa imediata de R$ 1.000,00 da sua conta!`;
          return {
            ...p,
            balance: Math.max(0, p.balance - 1000),
            pendingSabotageNotice: {
              attackerName: currentPlayer.name,
              effectDesc,
            },
          };
        }
      }

      if (p.id === currentPlayer.id && type === 'STEAL_20') {
        const target = players.find((t) => t.id === targetId);
        const amount = target ? Math.floor(target.balance * 0.2) : 0;
        return {
          ...p,
          balance: p.balance + amount,
          stats: { ...p.stats, sabotagesUsed: p.stats.sabotagesUsed + 1 },
        };
      }

      return p;
    });

    setPlayers(updatedPlayers);
  };

  // Perform Roll Action
  const performRoll = (actualBet?: number) => {
    if (!currentPlayer || isRolling || hasRolledThisTurn) return;

    const betToUse = actualBet ?? betAmount;
    if (betToUse <= 0 || betToUse > currentPlayer.balance) {
      return;
    }

    setIsRolling(true);
    clearSabotageTimer();
    setSabotageAvailable(false);
    sounds.playDiceRoll();

    // Random roll values
    const nextVal1 = Math.floor(Math.random() * 6) + 1;
    const nextVal2 = Math.floor(Math.random() * 6) + 1;
    const sum = nextVal1 + nextVal2;

    // Apply rotation offsets to cause physical tumble spins
    setDiceRotationOffsets((prev) => ({
      dice1: {
        x: prev.dice1.x + 1080 + Math.floor(Math.random() * 2) * 360,
        y: prev.dice1.y + 1080 + Math.floor(Math.random() * 2) * 360,
      },
      dice2: {
        x: prev.dice2.x + 1080 + Math.floor(Math.random() * 2) * 360,
        y: prev.dice2.y + 1080 + Math.floor(Math.random() * 2) * 360,
      },
    }));

    setDice1(nextVal1);
    setDice2(nextVal2);

    setTimeout(() => {
      setDiceSum(sum);
      const outcome = calculateOutcome(sum, betToUse, currentRound);
      setLastOutcome({
        message: outcome.message,
        isGain: outcome.isGain,
        isNeutral: outcome.isNeutral,
      });

      // Play outcome audio
      if (outcome.isGain) {
        sounds.playWin();
      } else if (!outcome.isNeutral) {
        sounds.playLoss();
      }

      const newBalance = Math.max(0, currentPlayer.balance + outcome.change);
      const isBankrupt = newBalance <= 0;

      if (isBankrupt && !currentPlayer.bankrupt) {
        sounds.playBankruptcySiren();
      }

      // Update Player stats and record roll
      const updatedPlayers = players.map((p) => {
        if (p.id === currentPlayer.id) {
          return {
            ...p,
            balance: newBalance,
            bankrupt: isBankrupt,
            forcedAllIn: false,
            stats: {
              ...p.stats,
              rolls: p.stats.rolls + 1,
              wins: p.stats.wins + (outcome.isGain ? 1 : 0),
              losses: p.stats.losses + (!outcome.isGain && !outcome.isNeutral ? 1 : 0),
              neutrals: p.stats.neutrals + (outcome.isNeutral ? 1 : 0),
              highestBalance: Math.max(p.stats.highestBalance, newBalance),
              totalWon: p.stats.totalWon + (outcome.change > 0 ? outcome.change : 0),
              totalLost: p.stats.totalLost + (outcome.change < 0 ? Math.abs(outcome.change) : 0),
            },
          };
        }
        return p;
      });

      setPlayers(updatedPlayers);

      // Append to History
      const rollRecord: RollResult = {
        dice1: nextVal1,
        dice2: nextVal2,
        sum,
        bet: betToUse,
        change: outcome.change,
        newBalance,
        message: outcome.message,
        multiplierLabel: outcome.multiplierLabel,
        isGain: outcome.isGain,
        isNeutral: outcome.isNeutral,
        isPressureMode,
        timestamp: new Date(),
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
      };
      setHistory((prev) => [...prev, rollRecord]);

      setIsRolling(false);
      setHasRolledThisTurn(true);

      // Trigger Secret Code Drop Event (~35% chance)
      if (Math.random() < 0.35 && !isBankrupt) {
        const code = generateSecretCode();
        const effect = generateSecretEffect();
        setActiveCodes((prev) => ({ ...prev, [code]: effect }));

        setSecretAlertRecord({
          code,
          effect,
          assignedToPlayerId: currentPlayer.id,
          assignedToPlayerName: currentPlayer.name,
          createdAt: Date.now(),
        });

        sounds.playCodeReveal();
      }

      // If Bot, automatically pass turn after 2 seconds
      if (currentPlayer.isBot) {
        setTimeout(() => {
          advanceToNextPlayer(updatedPlayers);
        }, 1800);
      }
    }, 1500);
  };

  // Next Turn Handshake
  const advanceToNextPlayer = (currentPlayersList: Player[] = players) => {
    sounds.playClick();
    clearSabotageTimer();
    setSabotageAvailable(false);

    const activePlayers = currentPlayersList.filter((p) => !p.bankrupt && p.balance > 0);

    // Check if only 1 player remains in multiplayer
    if (activePlayers.length <= 1 && currentPlayersList.length > 1) {
      const winner = activePlayers[0] || currentPlayersList[0];
      setWinnerInfo({
        winner,
        reason: 'Vitória por Sobrevivência! Todos os adversários foram à falência.',
      });
      sounds.playVictory();
      triggerConfetti();
      return;
    }

    // Determine next player index
    let nextIdx = (currentPlayerIndex + 1) % currentPlayersList.length;

    // Check if a round completed
    if (nextIdx === 0) {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);

      if (maxRounds > 0 && nextRound > maxRounds) {
        const sorted = [...currentPlayersList].sort((a, b) => b.balance - a.balance);
        const winner = sorted[0];
        setWinnerInfo({
          winner,
          reason: `Maior patrimônio acumulado ao término das ${maxRounds} rodadas!`,
        });
        sounds.playVictory();
        triggerConfetti();
        return;
      }
    }

    // Skip bankrupt players
    let loopGuard = 0;
    while (
      (currentPlayersList[nextIdx].bankrupt || currentPlayersList[nextIdx].balance <= 0) &&
      loopGuard < currentPlayersList.length
    ) {
      nextIdx = (nextIdx + 1) % currentPlayersList.length;
      loopGuard++;
    }

    const nextPlayer = currentPlayersList[nextIdx];
    setCurrentPlayerIndex(nextIdx);
    setDiceSum(null);
    setLastOutcome(null);
    setHasRolledThisTurn(false);

    // Check if next player was sabotaged
    if (nextPlayer.pendingSabotageNotice) {
      setActiveSabotageNotice(nextPlayer.pendingSabotageNotice);
      // clear pending
      setPlayers((prev) =>
        prev.map((p) => (p.id === nextPlayer.id ? { ...p, pendingSabotageNotice: null } : p))
      );
      sounds.playSabotageAlert();
    } else if (!nextPlayer.isBot && currentPlayersList.length > 1) {
      // Show turn handoff overlay in local pass-and-play
      setTurnOverlayPlayer(nextPlayer);
    } else {
      checkSabotageOpportunity(currentPlayersList, nextIdx);
    }
  };

  // Close Sabotage Notice and show Turn Overlay
  const handleCloseSabotageNotice = () => {
    setActiveSabotageNotice(null);
    if (!currentPlayer?.isBot && players.length > 1) {
      setTurnOverlayPlayer(currentPlayer);
    } else {
      checkSabotageOpportunity(players, currentPlayerIndex);
    }
  };

  // Close Turn Overlay
  const handleStartTurnFromOverlay = () => {
    sounds.playClick();
    setTurnOverlayPlayer(null);
    checkSabotageOpportunity(players, currentPlayerIndex);
  };

  // Redeem Secret Code
  const handleRedeemCode = (code: string) => {
    sounds.playClick();
    const effect = activeCodes[code];

    if (!effect) {
      return { success: false, message: 'Código não encontrado ou já expirado!' };
    }

    // Consume code
    const updatedCodes = { ...activeCodes };
    delete updatedCodes[code];
    setActiveCodes(updatedCodes);

    let balanceDelta = 0;
    if (effect.type === 'MULT_GAIN') {
      balanceDelta = currentPlayer.balance * (effect.val - 1);
    } else if (effect.type === 'FIXED_GAIN') {
      balanceDelta = effect.val;
    } else if (effect.type === 'FIXED_LOSS') {
      balanceDelta = -Math.min(currentPlayer.balance, effect.val);
    } else if (effect.type === 'PERCENT_LOSS') {
      balanceDelta = -Math.floor(currentPlayer.balance * effect.val);
    }

    const newBal = Math.max(0, currentPlayer.balance + balanceDelta);

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === currentPlayer.id
          ? {
              ...p,
              balance: newBal,
              bankrupt: newBal <= 0,
            }
          : p
      )
    );

    if (effect.isPositive) {
      sounds.playWin();
    } else {
      sounds.playLoss();
    }

    return {
      success: true,
      message: `${effect.desc} Saldo atualizado para R$ ${newBal.toLocaleString('pt-BR')}`,
      effect,
    };
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-3 sm:p-5 md:p-8 relative">
      {/* Background radial ambient lights */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
      </div>

      {/* TOP BAR / CABEÇALHO */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between mb-6 glass-panel p-3.5 sm:p-4 rounded-3xl shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center">
            <Dices className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-black text-xl sm:text-2xl tracking-tight leading-none text-white">
                PROBA<span className="text-indigo-400">DADOS</span>
              </h1>
              {isPressureMode && (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[10px] font-black text-rose-300 uppercase tracking-wider animate-pulse">
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>PRESSÃO</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              {maxRounds > 0
                ? `Rodada ${currentRound} de ${maxRounds}`
                : `Rodada ${currentRound} (Sem Limite)`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition flex items-center space-x-1.5 text-xs font-semibold"
            title={isMuted ? 'Ativar Sons' : 'Silenciar'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
            <span className="hidden sm:inline">{isMuted ? 'Mudo' : 'Som'}</span>
          </button>

          {/* History Drawer */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition flex items-center space-x-1.5 text-xs font-semibold"
            title="Histórico de Jogadas"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Histórico</span>
          </button>

          {/* Rules Modal */}
          <button
            onClick={() => setIsRulesOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition flex items-center space-x-1.5 text-xs font-semibold"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Regras</span>
          </button>

          {/* Redeem Secret Code */}
          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 transition flex items-center space-x-1.5 text-xs font-bold"
          >
            <Key className="w-4 h-4" />
            <span>Código</span>
          </button>
        </div>
      </header>

      {/* ARENA PRINCIPAL */}
      <main className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 items-stretch">
        {/* PAINEL DOS DADOS (ESQUERDA) */}
        <div className="md:col-span-7 glass-panel p-5 sm:p-7 rounded-3xl flex flex-col justify-between min-h-[460px] relative overflow-hidden">
          {/* Current Player Status Bar */}
          {currentPlayer && (
            <div className="w-full flex items-center justify-between bg-slate-900/90 p-3 sm:p-3.5 rounded-2xl border border-slate-800/80 shadow-inner">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-11 h-11 rounded-2xl ${currentPlayer.color.bg} border ${currentPlayer.color.border} flex items-center justify-center font-black text-white text-base shadow-md`}
                >
                  P{currentPlayer.id}
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-extrabold tracking-wider block">
                    Vez do Competidor
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <h2 className="font-display font-black text-base sm:text-lg text-white">
                      {currentPlayer.name}
                    </h2>
                    {currentPlayer.isBot && (
                      <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                        BOT
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 font-extrabold tracking-wider block">
                  Saldo da Banca
                </span>
                <div className="font-display font-black text-lg sm:text-xl text-emerald-400 font-mono tracking-tight">
                  R$ {currentPlayer.balance.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          )}

          {/* Outcome Result Badge */}
          <div className="my-2 flex justify-center">
            {lastOutcome ? (
              <div
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-md ${
                  lastOutcome.isNeutral
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : lastOutcome.isGain
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10'
                }`}
              >
                {lastOutcome.message}
              </div>
            ) : (
              <div className="px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-slate-400 border border-slate-800 bg-slate-900/60">
                Aguardando Aposta & Rolagem...
              </div>
            )}
          </div>

          {/* 3D DICE DISPLAY */}
          <div className="flex items-center justify-center space-x-8 sm:space-x-14 my-4 sm:my-6">
            <Dice3D
              value={dice1}
              isRolling={isRolling}
              diceId="dice-1"
              rotationOffset={diceRotationOffsets.dice1}
            />
            <Dice3D
              value={dice2}
              isRolling={isRolling}
              diceId="dice-2"
              rotationOffset={diceRotationOffsets.dice2}
            />
          </div>

          {/* Dice Sum & Probability Info */}
          <div className="text-center pt-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
              Soma Obtida
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white font-display my-0.5">
              {diceSum !== null ? diceSum : '--'}
            </div>

            {diceSum !== null && PROBABILITY_RULES[diceSum] && (
              <span className="text-[11px] text-slate-400 inline-flex items-center space-x-1 font-mono">
                <span>Chance teórica:</span>
                <strong className="text-indigo-400">
                  {PROBABILITY_RULES[diceSum].percentage}%
                </strong>
                <span>({PROBABILITY_RULES[diceSum].combinations}/36)</span>
              </span>
            )}
          </div>
        </div>

        {/* PAINEL DE APOSTA E AÇÕES (DIREITA) */}
        <div className="md:col-span-5 glass-panel p-5 sm:p-7 rounded-3xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase text-slate-400 font-extrabold tracking-wider flex items-center space-x-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Valor da Aposta</span>
              </label>

              {currentPlayer?.forcedAllIn && (
                <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-[10px] uppercase flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>ALL-IN FORÇADO</span>
                </span>
              )}
            </div>

            {/* Input de Valor */}
            <div className="relative rounded-2xl bg-slate-900/90 border border-slate-700/80 focus-within:border-indigo-500 transition p-3.5 shadow-inner">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg sm:text-xl">
                R$
              </span>
              <input
                type="number"
                value={betAmount}
                disabled={currentPlayer?.forcedAllIn || isRolling || hasRolledThisTurn}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setBetAmount(val);
                }}
                min={1}
                max={currentPlayer?.balance || 10000}
                className="w-full bg-transparent pl-10 pr-2 text-2xl sm:text-3xl font-black text-white focus:outline-none font-mono disabled:opacity-70"
                placeholder="0"
              />
            </div>

            {/* Botões de Percentual Rápido */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '10%', val: 0.1 },
                { label: '25%', val: 0.25 },
                { label: '50%', val: 0.5 },
                { label: 'ALL-IN', val: 1.0, isAllIn: true },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSetBetPercent(item.val)}
                  disabled={currentPlayer?.forcedAllIn || isRolling || hasRolledThisTurn}
                  className={`py-2 rounded-xl text-xs font-black transition border disabled:opacity-40 ${
                    item.isAllIn
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Multiplier Quick Hint */}
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span>Maior Ganho:</span>
                <span className="font-bold text-emerald-400">
                  Soma 12 ({isPressureMode ? '+75%' : '+100%'})
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span>Maior Perda:</span>
                <span className="font-bold text-rose-400">Soma 2 / 3 (-100%)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Botão de Sabotagem Ocasional com Timer de 10s */}
            {sabotageAvailable && !hasRolledThisTurn && !currentPlayer?.isBot && (
              <button
                type="button"
                onClick={() => setIsSabotageOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-rose-600/25 hover:bg-rose-600/35 text-rose-300 font-bold text-xs border border-rose-500/50 transition flex items-center justify-between px-4 animate-pulse shadow-lg shadow-rose-600/20"
              >
                <span className="flex items-center space-x-2">
                  <Skull className="w-4 h-4 text-rose-400" />
                  <span>SABOTAR ADVERSÁRIO DISPONÍVEL!</span>
                </span>
                <span className="bg-rose-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-lg">
                  {sabotageTimeLeft}s
                </span>
              </button>
            )}

            {/* Ação Primária: ROLAR ou PASSAR A VEZ */}
            {!hasRolledThisTurn ? (
              <button
                type="button"
                onClick={() => performRoll()}
                disabled={isRolling || (currentPlayer?.isBot ?? false)}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-base tracking-wide shadow-xl shadow-indigo-600/30 transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Dices className="w-5 h-5" />
                <span>{isRolling ? 'ROLANDO DADOS...' : 'ROLAR DADOS'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => advanceToNextPlayer()}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base tracking-wide shadow-xl shadow-emerald-600/30 transition transform active:scale-98 flex items-center justify-center space-x-2"
              >
                <ArrowRight className="w-5 h-5" />
                <span>PASSAR A VEZ / PRÓXIMO</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER / CRÉDITOS */}
      <footer className="max-w-5xl mx-auto w-full text-center mt-6 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 px-2">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>PROBADADOS · Matemática e Sorte em Equilíbrio</span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          <button
            onClick={() => setIsSetupOpen(true)}
            className="hover:text-white transition flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reiniciar Partida</span>
          </button>
        </div>
      </footer>

      {/* MODAIS E TELAS CHEIAS */}
      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartGame={handleStartGame}
      />

      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onRedeem={handleRedeemCode}
      />

      <SecretAlertModal
        codeRecord={secretAlertRecord}
        onClose={() => setSecretAlertRecord(null)}
      />

      {currentPlayer && (
        <SabotageOverlay
          isOpen={isSabotageOpen}
          timeLeft={sabotageTimeLeft}
          currentPlayer={currentPlayer}
          players={players}
          onExecute={handleExecuteSabotage}
          onClose={() => setIsSabotageOpen(false)}
        />
      )}

      {activeSabotageNotice && (
        <SabotageNoticeOverlay
          attackerName={activeSabotageNotice.attackerName}
          effectDesc={activeSabotageNotice.effectDesc}
          onClose={handleCloseSabotageNotice}
        />
      )}

      {turnOverlayPlayer && (
        <TurnOverlay
          player={turnOverlayPlayer}
          round={currentRound}
          maxRounds={maxRounds}
          onStartTurn={handleStartTurnFromOverlay}
        />
      )}

      {winnerInfo && (
        <WinnerOverlay
          winner={winnerInfo.winner}
          players={players}
          reason={winnerInfo.reason}
          onPlayAgain={() => setIsSetupOpen(true)}
        />
      )}

      <HistoryDrawer
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
