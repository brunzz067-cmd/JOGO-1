import React from 'react';
import { Trophy, RotateCcw, Award } from 'lucide-react';
import { Player } from '../types';

interface WinnerOverlayProps {
  winner: Player;
  players: Player[];
  reason: string;
  onPlayAgain: () => void;
}

export const WinnerOverlay: React.FC<WinnerOverlayProps> = ({
  winner,
  players,
  reason,
  onPlayAgain,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.balance - a.balance);

  return (
    <div className="fixed inset-0 bg-slate-950/92 backdrop-blur-lg flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-300">
      <div className="glass-modal max-w-lg w-full p-6 md:p-8 rounded-3xl border border-amber-500/50 text-center space-y-6 shadow-2xl my-8">
        <div className="w-24 h-24 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20 animate-pulse">
          <Trophy className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs uppercase text-amber-400 font-black tracking-widest block">
            GRANDE CAMPEÃO
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-1 tracking-tight">
            {winner.name}
          </h2>
          <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            R$ {winner.balance.toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="text-xs text-slate-300 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 leading-relaxed">
          {reason}
        </div>

        {/* Podium / Ranking Table */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-3 text-left">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 mb-2.5 px-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Classificação Final</span>
          </div>

          <div className="space-y-2">
            {sortedPlayers.map((p, idx) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                  idx === 0
                    ? 'bg-amber-500/10 border-amber-500/30 font-bold'
                    : 'bg-slate-950/40 border-slate-800/80'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                      idx === 0
                        ? 'bg-amber-500 text-slate-950'
                        : idx === 1
                          ? 'bg-slate-400 text-slate-950'
                          : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}º
                  </span>
                  <span className="text-white font-medium">{p.name}</span>
                  {p.bankrupt && (
                    <span className="text-[10px] text-rose-400 font-semibold">(Falido)</span>
                  )}
                </div>

                <div className="text-right font-mono font-bold">
                  <span className={p.balance > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                    R$ {p.balance.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm tracking-wide transition shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>JOGAR NOVAMENTE</span>
        </button>
      </div>
    </div>
  );
};
