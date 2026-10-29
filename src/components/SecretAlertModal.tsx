import React, { useState } from 'react';
import { Gift, Copy, Check, Sparkles } from 'lucide-react';
import { SecretCodeRecord } from '../types';

interface SecretAlertModalProps {
  codeRecord: SecretCodeRecord | null;
  onClose: () => void;
}

export const SecretAlertModal: React.FC<SecretAlertModalProps> = ({ codeRecord, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!codeRecord) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeRecord.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-modal max-w-sm w-full p-6 md:p-7 rounded-3xl border border-amber-500/40 text-center shadow-2xl relative">
        <div className="w-16 h-16 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
          <Gift className="w-8 h-8 animate-bounce" />
        </div>

        <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sorteio Especial!</span>
        </div>

        <h3 className="text-2xl font-black text-white">CÓDIGO SURPRESA!</h3>
        <p className="text-xs text-slate-300 mt-1">
          <strong className="text-indigo-400">{codeRecord.assignedToPlayerName}</strong> recebeu um código secreto!
        </p>

        {/* Code display box */}
        <div className="my-5 bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between shadow-inner">
          <span className="font-mono font-black text-2xl text-amber-400 tracking-widest pl-2">
            {codeRecord.code}
          </span>
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 transition flex items-center space-x-1.5 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mb-5 leading-snug">
          Guarde o código ou compartilhe com cuidado! Use o botão <strong>&quot;Código&quot;</strong> no topo da tela para resgatá-lo quando desejar.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide transition shadow-lg shadow-indigo-600/30 active:scale-98"
        >
          ENTENDIDO, CONTINUAR
        </button>
      </div>
    </div>
  );
};
