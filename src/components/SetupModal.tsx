import React, { useState } from 'react';
import { Users, Bot, Play, Sparkles } from 'lucide-react';

interface SetupModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onStartGame: (config: {
    playerCount: number;
    names: string[];
    roundLimit: number;
    withBots: boolean;
  }) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose, onStartGame }) => {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [roundLimit, setRoundLimit] = useState<number>(10);
  const [withBots, setWithBots] = useState<boolean>(false);
  const [names, setNames] = useState<string[]>([
    'Jogador 1',
    'Jogador 2',
    'Jogador 3',
    'Jogador 4',
  ]);

  if (!isOpen) return null;

  const handleNameChange = (index: number, value: string) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame({
      playerCount,
      names: names.slice(0, playerCount),
      roundLimit,
      withBots: playerCount === 1 ? withBots : false,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="glass-modal max-w-md w-full p-6 md:p-8 rounded-3xl border border-slate-700/80 shadow-2xl my-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/10">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Configurar Partida</h2>
          <p className="text-xs text-slate-400 mt-1">
            Defina o número de competidores e a duração da partida.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Número de Jogadores */}
          <div>
            <label className="text-xs uppercase font-bold text-slate-400 block mb-2">
              Número de Jogadores
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setPlayerCount(count)}
                  className={`py-2.5 rounded-xl font-bold text-sm transition border ${
                    playerCount === count
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-850 bg-slate-900/80 text-slate-400 hover:text-white border-slate-700/80'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Opção de Bots para 1 Jogador */}
          {playerCount === 1 && (
            <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <span>Adicionar Adversários de IA?</span>
                </span>
                <button
                  type="button"
                  onClick={() => setWithBots(!withBots)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    withBots
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {withBots ? 'SIM (1 vs 2 Bots)' : 'NÃO (Solo)'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {withBots
                  ? 'Você jogará contra 2 robôs automatizados ("Bot Estratégico" e "Bot Agressivo") que apostam e sabotam.'
                  : 'Modo sobrevivência individual: veja até quanto consegue multiplicar seu saldo.'}
              </p>
            </div>
          )}

          {/* Quantidade de Rodadas */}
          <div>
            <label className="text-xs uppercase font-bold text-slate-400 block mb-2">
              Quantidade de Rodadas
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '5', value: 5 },
                { label: '10', value: 10 },
                { label: '15', value: 15 },
                { label: 'Sem Fim', value: 0 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRoundLimit(opt.value)}
                  className={`py-2 rounded-xl font-bold text-xs transition border ${
                    roundLimit === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-700/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customização dos Nomes dos Jogadores */}
          <div>
            <label className="text-xs uppercase font-bold text-slate-400 block mb-2">
              Nomes dos Jogadores
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {Array.from({ length: playerCount }).map((_, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400">
                    P{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={names[idx] || `Jogador ${idx + 1}`}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    maxLength={18}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-medium"
                    placeholder={`Jogador ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm tracking-wide shadow-lg shadow-indigo-600/30 transition transform active:scale-98 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>INICIAR JOGO</span>
            </button>
          </div>

          <div className="text-center">
            <span className="text-[11px] text-slate-400 inline-flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Banca inicial: R$ 10.000 para cada participante</span>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
