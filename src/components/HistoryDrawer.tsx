import React from 'react';
import { X, History, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RollResult } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  history: RollResult[];
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, history, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-modal max-w-lg w-full p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative my-6 max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4 shrink-0">
          <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Histórico de Jogadas</h3>
            <p className="text-xs text-slate-400">{history.length} rolagem(ns) registrada(s)</p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhuma rolagem realizada ainda. Comece a rodada apostando e jogando os dados!
          </div>
        ) : (
          <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
            {[...history].reverse().map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                    P{item.playerId}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center space-x-1.5">
                      <span>{item.playerName}</span>
                      {item.isPressureMode && (
                        <span className="text-[10px] text-rose-400 font-mono font-bold">
                          [PRESSÃO]
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Dados: [{item.dice1}] + [{item.dice2}] ={' '}
                      <strong className="text-white">{item.sum}</strong> · Aposta: R${' '}
                      {item.bet.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono font-black flex items-center justify-end space-x-1 ${
                      item.isNeutral
                        ? 'text-slate-400'
                        : item.isGain
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                    }`}
                  >
                    {item.isNeutral ? (
                      <Minus className="w-3.5 h-3.5" />
                    ) : item.isGain ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {item.change >= 0 ? '+' : ''}R$ {item.change.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Saldo: R$ {item.newBalance.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 shrink-0"
        >
          FECHAR HISTÓRICO
        </button>
      </div>
    </div>
  );
};
