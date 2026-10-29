import React from 'react';
import { TriangleAlert, ShieldAlert } from 'lucide-react';

interface SabotageNoticeOverlayProps {
  attackerName: string;
  effectDesc: string;
  onClose: () => void;
}

export const SabotageNoticeOverlay: React.FC<SabotageNoticeOverlayProps> = ({
  attackerName,
  effectDesc,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-modal max-w-sm w-full p-6 md:p-7 rounded-3xl border border-rose-500/50 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 bg-rose-600/20 text-rose-400 border border-rose-500/40 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-rose-600/20 animate-bounce">
          <TriangleAlert className="w-8 h-8 text-rose-400" />
        </div>

        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">VOCÊ FOI SABOTADO!</h3>
          <p className="text-xs text-slate-400 mt-1">Um adversário executou um golpe contra você.</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-rose-500/30 text-left space-y-2 shadow-inner">
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>ATACANTE: {attackerName}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            {effectDesc}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wide transition shadow-lg shadow-rose-600/30 active:scale-98"
        >
          ENTENDIDO, ENFRENTAR A SORTE
        </button>
      </div>
    </div>
  );
};
