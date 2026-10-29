import React from 'react';
import { X, Trophy, Flame, Percent, Zap, Skull, ShieldCheck } from 'lucide-react';
import { PROBABILITY_RULES } from '../utils/probabilities';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sortedSums = Object.values(PROBABILITY_RULES).sort((a, b) => b.sum - a.sum);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="glass-modal max-w-2xl w-full p-6 md:p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Manual do PROBADADOS</h2>
            <p className="text-xs text-slate-400">Regras, probabilidades matemáticas e táticas de sobrevivência.</p>
          </div>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-sm text-slate-300">
          {/* Como Ganhar */}
          <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <h3 className="text-base text-white">Objetivo & Vitória</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cada jogador começa com <strong className="text-emerald-400 font-semibold">R$ 10.000</strong>.
              Você vence se for o <strong>único sobrevivente</strong> (quando todos os adversários falirem) ou se tiver o
              <strong> maior saldo acumulado</strong> ao final de todas as rodadas configuradas!
            </p>
          </div>

          {/* Dificuldade Progressiva */}
          <div className="bg-slate-900/70 p-4 rounded-2xl border border-rose-500/20">
            <div className="flex items-center space-x-2 text-rose-400 font-bold mb-1.5">
              <Flame className="w-4 h-4" />
              <h3 className="text-base text-white">Dificuldade Progressiva: Modo Pressão</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nas <span className="text-indigo-300 font-semibold">Rodadas 1 a 4 (Modo Normal)</span>, as margens são amigáveis e neutras na soma 8.
              A partir da <span className="text-rose-400 font-semibold">Rodada 5 (MODO PRESSÃO)</span>, os lucros diminuem, as multas disparam e perdas de até -100% tornam-se frequentes!
            </p>
          </div>

          {/* Tabela de Probabilidades */}
          <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <Percent className="w-4 h-4" />
                <h3 className="text-base text-white">Tabela de Probabilidades (2 Dados de 6 Faces)</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">36 combinações totais</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-2">Soma</th>
                    <th className="py-2 px-2">Chances</th>
                    <th className="py-2 px-2">Probabilidade</th>
                    <th className="py-2 px-2 text-indigo-300">Modo Normal</th>
                    <th className="py-2 px-2 text-rose-300">Modo Pressão (R5+)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {sortedSums.map((item) => {
                    const isGainNormal = item.normalMultiplier > 0;
                    const isGainPressure = item.pressureMultiplier > 0;
                    const isNeutralNormal = item.normalMultiplier === 0;
                    const isNeutralPressure = item.pressureMultiplier === 0;

                    return (
                      <tr key={item.sum} className="hover:bg-slate-800/40 transition">
                        <td className="py-2 px-2 font-black text-white text-sm">{item.sum}</td>
                        <td className="py-2 px-2 text-slate-400">{item.combinations}/36</td>
                        <td className="py-2 px-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-10">{item.percentage}%</span>
                            <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                              <div
                                className="bg-indigo-500 h-full rounded-full"
                                style={{ width: `${(item.combinations / 6) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td
                          className={`py-2 px-2 font-bold ${
                            isNeutralNormal
                              ? 'text-slate-400'
                              : isGainNormal
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                          }`}
                        >
                          {item.normalLabel}
                        </td>
                        <td
                          className={`py-2 px-2 font-bold ${
                            isNeutralPressure
                              ? 'text-slate-400'
                              : isGainPressure
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                          }`}
                        >
                          {item.pressureLabel}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5 italic">
              * Nota: A soma 7 é a mais frequente de todas (16.67%), porém no PROBADADOS ela é penalizada para incentivar estratégia e gestão cuidadosa da banca!
            </p>
          </div>

          {/* Sabotagens & Códigos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-900/70 p-4 rounded-2xl border border-rose-500/30">
              <div className="flex items-center space-x-2 text-rose-400 font-bold mb-1">
                <Skull className="w-4 h-4" />
                <h4 className="text-white text-sm">Sistema de Sabotagem</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Em partidas com 2 ou mais competidores ativos, oportunidades relâmpago de sabotagem surgem com um cronômetro de <strong>10 segundos</strong>. Roube 20% do saldo, multe ou force o adversário ao ALL-IN!
              </p>
            </div>

            <div className="bg-slate-900/70 p-4 rounded-2xl border border-amber-500/30">
              <div className="flex items-center space-x-2 text-amber-400 font-bold mb-1">
                <Zap className="w-4 h-4" />
                <h4 className="text-white text-sm">Códigos Secretos</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aproximadamente 35% das jogadas geram um código de 6 dígitos sorteado. Eles podem dobrar seu saldo, conceder bônus de R$ 3.000 ou aplicar penalidades surpresa!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-indigo-600/30 active:scale-98"
        >
          ENTENDIDO, VAMOS JOGAR!
        </button>
      </div>
    </div>
  );
};
