import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  X, 
  Coffee, 
  CreditCard, 
  Globe, 
  DollarSign, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink
} from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'NGN' | 'USD' | 'GBP'>('USD');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Background glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-debzane-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <Heart className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-100">
                Support Free Development
              </h2>
              <p className="text-xs text-slate-400">
                Keep Debzane Teleprompter 100% free with no paywalls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mission Statement */}
        <div className="my-4 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs leading-relaxed text-slate-300">
          <p>
            <strong className="text-amber-300">Why are we building this?</strong> Most commercial teleprompters force creators into expensive subscriptions. 
            <strong> Sylvester Oga Ogaji</strong> (powered by <em>JV Impact Initiative</em> for <em>Debzane Concepts</em>) designed this studio app so every creator, coach, educator, and speaker can work freely.
          </p>
        </div>

        {/* Currency Tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-4">
          {(['USD', 'NGN', 'GBP'] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedCurrency === curr
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {curr === 'USD' ? '🇺🇸 USD ($)' : curr === 'NGN' ? '🇳🇬 Naira (₦)' : '🇬🇧 GBP (£)'}
            </button>
          ))}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="space-y-3">
          {selectedCurrency === 'USD' && (
            <>
              {/* Buy Me a Coffee / Card */}
              <a
                href="https://buymeacoffee.com/debzain"
                target="_blank"
                rel="noreferrer"
                onClick={triggerConfetti}
                className="flex items-center justify-between p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-200 group-hover:text-amber-300">
                      Buy Us a Coffee ($2 - $5)
                    </div>
                    <div className="text-xs text-slate-400">Instant credit card / Apple Pay / Google Pay</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-300" />
              </a>

              {/* PayPal */}
              <a
                href="https://paypal.me/sylvesterogaji"
                target="_blank"
                rel="noreferrer"
                onClick={triggerConfetti}
                className="flex items-center justify-between p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-debzane-blue-400/50 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-debzane-blue-400/10 text-debzane-blue-400 rounded-lg">
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
            </>
          )}

          {selectedCurrency === 'NGN' && (
            <div className="space-y-3">
              {/* Direct Bank Transfer */}
              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Bank Transfer (Nigeria)
                  </span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                    JV Impact Initiative
                  </span>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Account Name:</span>
                    <span className="font-semibold text-slate-200">Sylvester Oga Ogaji / Debzane</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Bank:</span>
                    <span className="font-semibold text-slate-200">Kuda Microfinance / GTBank</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Account Number:</span>
                    <button
                      onClick={() => copyToClipboard('2001198421', 'ngn_account')}
                      className="flex items-center gap-1.5 font-mono font-bold text-amber-400 hover:text-amber-300"
                    >
                      <span>2001198421</span>
                      {copiedAccount === 'ngn_account' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedCurrency === 'GBP' && (
            <a
              href="https://buymeacoffee.com/debzain"
              target="_blank"
              rel="noreferrer"
              onClick={triggerConfetti}
              className="flex items-center justify-between p-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
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

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            100% Goes to Server & Mobile App Hosting
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
