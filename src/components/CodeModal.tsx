import React, { useState } from 'react';
import { X, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { SecretEffect } from '../types';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRedeem: (code: string) => { success: boolean; message: string; effect?: SecretEffect };
}

export const CodeModal: React.FC<CodeModalProps> = ({ isOpen, onClose, onRedeem }) => {
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    const res = onRedeem(cleanCode);
    if (res.success) {
      setFeedback({ message: res.message, isError: false });
      setTimeout(() => {
        setCode('');
        setFeedback(null);
        onClose();
      }, 1400);
    } else {
      setFeedback({ message: res.message, isError: true });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-modal max-w-sm w-full p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Key className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-white">Resgatar Código Secreto</h3>
          <p className="text-xs text-slate-400 mt-1">Insira o código de 6 caracteres para aplicar o efeito na sua conta.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setFeedback(null);
              }}
              maxLength={8}
              autoFocus
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 text-center text-xl font-mono font-black text-amber-400 uppercase tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition"
              placeholder="EX: 8AH2JH"
            />
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
                feedback.isError
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {feedback.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              ) : (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              )}
              <span className="leading-snug">{feedback.message}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm tracking-wide transition shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center space-x-2"
          >
            <Key className="w-4 h-4" />
            <span>RESGATAR CÓDIGO</span>
          </button>
        </form>
      </div>
    </div>
  );
};
