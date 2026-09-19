import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  X, 
  Coffee, 
  CreditCard, 
  Globe, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquare,
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
  const [selectedCurrency, setSelectedCurrency] = useState<'NGN' | 'USD' | 'GBP'>('NGN');
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
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[95vh] flex flex-col">
        
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
                <span>{isReminder ? '❤️ Enjoying Free Teleprompter?' : 'Support Free Development'}</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                100% Free Forever • No paywalls, no subscriptions
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
            This app is proudly built by <strong>Sylvester Oga Ogaji</strong> (powered by <em>JV Impact Initiative</em> for <em>Debzane Concepts</em>) to ensure that creators, speakers, teachers, and students never have to pay expensive monthly fees.
          </p>
          <p className="mt-1.5 text-amber-300 font-semibold">
            ✨ No matter how small, your kind donation of ₦500, ₦1,000, $2 or £2 helps us keep the servers running free for everyone!
          </p>
        </div>

        {/* Currency Tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-3.5">
          {(['NGN', 'USD', 'GBP'] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                selectedCurrency === curr
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {curr === 'NGN' ? '🇳🇬 Naira (OPay ₦)' : curr === 'USD' ? '🇺🇸 USD ($)' : '🇬🇧 GBP (£)'}
            </button>
          ))}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {selectedCurrency === 'NGN' && (
            <div className="space-y-3">
              {/* Official OPay Bank Account Card */}
              <div className="p-4 bg-gradient-to-br from-slate-950 via-debzane-blue-950/40 to-slate-950 border-2 border-amber-500/40 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Direct Bank Transfer (Nigeria)
                  </span>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    OPAY OFFICIAL
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

              {/* YouTube Feedback link */}
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
                      Drop a Review on YouTube
                    </div>
                    <div className="text-[10px] text-slate-400">@debzane_concepts</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-300" />
              </a>
            </div>
          )}

          {selectedCurrency === 'USD' && (
            <div className="space-y-3">
              <a
                href="https://buymeacoffee.com/debzain"
                target="_blank"
                rel="noreferrer"
                onClick={triggerConfetti}
                className="flex items-center justify-between p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-200 group-hover:text-amber-300">
                      Buy Us a Coffee ($2 - $5)
                    </div>
                    <div className="text-xs text-slate-400">Card / Apple Pay / Google Pay</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-300" />
              </a>

              <a
                href="https://paypal.me/sylvesterogaji"
                target="_blank"
                rel="noreferrer"
                onClick={triggerConfetti}
                className="flex items-center justify-between p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-debzane-blue-400/50 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-debzane-blue-400/10 text-debzane-blue-400 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-200 group-hover:text-debzane-blue-300">
                      PayPal Contribution
                    </div>
                    <div className="text-xs text-slate-400">paypal.me/sylvesterogaji</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-debzane-blue-300" />
              </a>
            </div>
          )}

          {selectedCurrency === 'GBP' && (
            <a
              href="https://buymeacoffee.com/debzain"
              target="_blank"
              rel="noreferrer"
              onClick={triggerConfetti}
              className="flex items-center justify-between p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-200 group-hover:text-amber-300">
                    UK / International Support (£2 - £5)
                  </div>
                  <div className="text-xs text-slate-400">Card, Revolut & Wise transfers</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-300" />
            </a>
          )}
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
