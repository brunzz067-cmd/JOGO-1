import React from 'react';
import { Player } from '../types';
import { Play } from 'lucide-react';

interface TurnOverlayProps {
  player: Player;
  round: number;
  maxRounds: number;
  onStartTurn: () => void;
}

export const TurnOverlay: React.FC<TurnOverlayProps> = ({
  player,
  round,
  maxRounds,
  onStartTurn,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-40 animate-in fade-in duration-200">
      <div className="text-center space-y-4 max-w-sm w-full">
        {/* Big Avatar */}
        <div
          className={`w-24 h-24 rounded-3xl ${player.color.bg} border-2 ${player.color.border} flex items-center justify-center text-4xl font-black text-white shadow-2xl mx-auto shadow-${player.color.bg}/30`}
        >
          P{player.id}
        </div>

        <div>
          <span className="text-xs uppercase text-slate-400 font-bold tracking-widest block mb-1">
            {maxRounds > 0 ? `Rodada ${round} de ${maxRounds}` : `Rodada ${round}`}
          </span>
          <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
            VEZ DE {player.name}
          </h3>
          <p className="text-sm font-semibold text-emerald-400 mt-1">
            Saldo: R$ {player.balance.toLocaleString('pt-BR')}
          </p>
        </div>

        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          {player.forcedAllIn
            ? 'Atenção: Você foi forçado ao ALL-IN nesta jogada!'
            : 'Defina seu valor de aposta com sabedoria e jogue os dados.'}
        </p>

        <button
          onClick={onStartTurn}
          className="mt-6 w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-indigo-600/30 transition transform active:scale-95 flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>COMEÇAR JOGADA</span>
        </button>
      </div>
    </div>
  );
};
