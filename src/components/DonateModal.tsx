import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  X, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  Youtube
} from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isReminder?: boolean;
}

export const DonateModal: React.FC<DonateModalProps> = ({ 
  isOpen, 
  onClose,
  isReminder = false
}) => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    triggerConfetti();
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Background glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-debzane-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-2xl">
              <Heart className="w-5 h-5 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-100 flex items-center gap-2">
                <span>{isReminder ? '❤️ Support Continuous Development' : 'Donate to Keep It Free'}</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                100% Free Forever • Zero Subscription Fees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mission Statement */}
        <div className="my-3.5 p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl text-xs leading-relaxed text-slate-300">
          <p>
            Debzane Concept Teleprompter is proudly built by <strong>Sylvester Oga Ogaji</strong> (powered by <em>JV Impact Initiative</em> for <em>Debzane Concepts</em>) to ensure that creators, speakers, and public health educators never have to pay expensive subscriptions.
          </p>
          <p className="mt-1.5 text-amber-300 font-semibold">
            ✨ Your kind donation of ₦500, ₦1,000, ₦2,000 or any amount directly supports server maintenance and continuous mobile upgrades.
          </p>
        </div>

        {/* Official OPay Bank Account Card (Exclusive Payment Channel) */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="p-4 bg-gradient-to-br from-slate-950 via-debzane-blue-950/40 to-slate-950 border-2 border-amber-500/40 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Official Donation Account
              </span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                OPAY NIGERIA
              </span>
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Bank Name:</span>
                <span className="font-extrabold text-emerald-400 text-sm">OPay</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Account Name:</span>
                <span className="font-bold text-slate-100">Sylvester Oga Ogaji</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-slate-900/90 px-3 rounded-xl border border-amber-500/30">
                <div>
                  <span className="text-slate-400 text-[11px] block">Account Number:</span>
                  <span className="font-mono text-base sm:text-lg font-black tracking-widest text-amber-400">
                    8057961025
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard('8057961025', 'opay_account')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg shadow transition-all active:scale-95"
                >
                  {copiedAccount === 'opay_account' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-950" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* YouTube Channel Reviews Link */}
          <a
            href="https://youtube.com/@debzane_concepts"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-red-500/15 text-red-400 rounded-lg">
                <Youtube className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-red-300">
                  Rate & Comment on YouTube
                </div>
                <div className="text-[10px] text-slate-400">@debzane_concepts</div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-300" />
          </a>
        </div>

        {/* Footer info & Proceed Button */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            100% Free Forever
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors"
          >
            {isReminder ? 'Continue Using App' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
