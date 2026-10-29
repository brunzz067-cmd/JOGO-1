import React, { useState, useEffect } from 'react';
import { Skull, Timer, Crosshair, AlertTriangle } from 'lucide-react';
import { Player, SabotageType } from '../types';

interface SabotageOverlayProps {
  isOpen: boolean;
  timeLeft: number;
  currentPlayer: Player;
  players: Player[];
  onExecute: (targetId: number, type: SabotageType) => void;
  onClose: () => void;
}

export const SabotageOverlay: React.FC<SabotageOverlayProps> = ({
  isOpen,
  timeLeft,
  currentPlayer,
  players,
  onExecute,
  onClose,
}) => {
  const eligibleTargets = players.filter((p) => p.id !== currentPlayer.id && !p.bankrupt && p.balance > 0);
  const [targetId, setTargetId] = useState<number>(eligibleTargets[0]?.id || 0);
  const [sabotageType, setSabotageType] = useState<SabotageType>('STEAL_20');

  useEffect(() => {
    if (eligibleTargets.length > 0 && !eligibleTargets.some((t) => t.id === targetId)) {
      setTargetId(eligibleTargets[0].id);
    }
  }, [eligibleTargets, targetId]);

  if (!isOpen) return null;

  const handleExecute = () => {
    if (targetId) {
      onExecute(targetId, sabotageType);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-modal max-w-sm w-full p-6 md:p-7 rounded-3xl border border-rose-500/50 text-center relative shadow-2xl">
        {/* Countdown pill */}
        <div className="absolute top-4 right-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono font-black text-xs px-3 py-1 rounded-xl flex items-center space-x-1.5 shadow-sm">
          <Timer className="w-3.5 h-3.5 animate-pulse text-rose-400" />
          <span>{timeLeft}s</span>
        </div>

        <div className="w-16 h-16 bg-rose-600/20 text-rose-400 border border-rose-500/40 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-600/10">
          <Skull className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-white tracking-tight uppercase">SABOTAR ADVERSÁRIO</h3>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          Oportunidade relâmpago! Escolha seu alvo e desfira um golpe financeiro.
        </p>

        <div className="space-y-4 text-left">
          {/* Target Selector */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 flex items-center space-x-1">
              <Crosshair className="w-3 h-3 text-rose-400" />
              <span>Selecione o Alvo</span>
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 transition font-medium"
            >
              {eligibleTargets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.name} (R$ {target.balance.toLocaleString('pt-BR')})
                </option>
              ))}
            </select>
          </div>

          {/* Sabotage Type */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Tipo de Sabotagem</span>
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-start p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                  sabotageType === 'STEAL_20'
                    ? 'bg-rose-500/20 border-rose-500/60 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <input
                  type="radio"
                  name="sabotage"
                  value="STEAL_20"
                  checked={sabotageType === 'STEAL_20'}
                  onChange={() => setSabotageType('STEAL_20')}
                  className="mt-0.5 mr-2 accent-rose-500"
                />
                <div>
                  <div className="font-bold text-rose-300">Roubar 20% do Saldo</div>
                  <div className="text-[11px] text-slate-400">Transfere 20% do dinheiro do alvo diretamente para você.</div>
                </div>
              </label>

              <label
                className={`flex items-start p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                  sabotageType === 'FORCE_ALL_IN'
                    ? 'bg-rose-500/20 border-rose-500/60 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <input
                  type="radio"
                  name="sabotage"
                  value="FORCE_ALL_IN"
                  checked={sabotageType === 'FORCE_ALL_IN'}
                  onChange={() => setSabotageType('FORCE_ALL_IN')}
                  className="mt-0.5 mr-2 accent-rose-500"
                />
                <div>
                  <div className="font-bold text-amber-300">Forçar ALL-IN Obrigatório</div>
                  <div className="text-[11px] text-slate-400">O alvo será obrigado a apostar 100% da banca na próxima rodada!</div>
                </div>
              </label>

              <label
                className={`flex items-start p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                  sabotageType === 'FEE_1000'
                    ? 'bg-rose-500/20 border-rose-500/60 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <input
                  type="radio"
                  name="sabotage"
                  value="FEE_1000"
                  checked={sabotageType === 'FEE_1000'}
                  onChange={() => setSabotageType('FEE_1000')}
                  className="mt-0.5 mr-2 accent-rose-500"
                />
                <div>
                  <div className="font-bold text-slate-200">Multa Imediata de R$ 1.000</div>
                  <div className="text-[11px] text-slate-400">Aplica uma multa punitiva descontada na hora da banca rival.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700 active:scale-98"
            >
              CANCELAR
            </button>
            <button
              type="button"
              onClick={handleExecute}
              className="py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition shadow-lg shadow-rose-600/30 active:scale-98"
            >
              EXECUTAR GOLPE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
