import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  X, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Youtube,
  Send,
  Award,
  Users,
  Download
} from 'lucide-react';
import { 
  SupporterRecord, 
  fetchSupportersList, 
  submitSupporterConfirmation,
  exportSupportersToJSON
} from '../services/supporterStorage';

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
  const [supporters, setSupporters] = useState<SupporterRecord[]>([]);
  const [donorName, setDonorName] = useState('');
  const [donorAmount, setDonorAmount] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<'donate' | 'wall'>('donate');

  useEffect(() => {
    if (isOpen) {
      fetchSupportersList().then(setSupporters);
    }
  }, [isOpen]);

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

  const handleSubmitPledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) return;

    setIsSubmitting(true);
    await submitSupporterConfirmation({
      donorName: donorName.trim(),
      amount: donorAmount.trim() || 'Contributed',
      message: donorMessage.trim() || 'Proud to support Debzane Free Studio Teleprompter!'
    });

    const updated = await fetchSupportersList();
    setSupporters(updated);
    setIsSubmitting(false);
    setSubmittedNotice(true);
    triggerConfetti();

    setTimeout(() => {
      setSubmittedNotice(false);
      setDonorName('');
      setDonorAmount('');
      setDonorMessage('');
      setActiveTab('wall');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 text-slate-100 select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[95vh] flex flex-col">
        
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
                <span>{isReminder ? '❤️ Support Free Studio Development' : 'Donate & Support Free Tools'}</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Debzane Concepts • 100% Free Forever • Zero Paywalls
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

        {/* Navigation Tabs (OPay Account vs Supporters Wall) */}
        <div className="flex border-b border-slate-800 my-3 gap-2">
          <button
            onClick={() => setActiveTab('donate')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'donate'
                ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>OPay Bank & Pledge</span>
          </button>

          <button
            onClick={() => setActiveTab('wall')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'wall'
                ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Supporters Wall ({supporters.length})</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          
          {activeTab === 'donate' && (
            <>
              {/* Official OPay Bank Account Card */}
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
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 font-medium">Bank Name:</span>
                    <span className="font-extrabold text-emerald-400 text-sm">OPay</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-400 font-medium">Account Name:</span>
                    <span className="font-bold text-slate-100">Sylvester Oga Ogaji</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-slate-900/90 px-3 rounded-xl border border-amber-500/30">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Account Number:</span>
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

              {/* Supporter Confirmation & Recognition Form */}
              <form onSubmit={handleSubmitPledge} className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Confirm Your Donation / Join Wall:</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Your Name / Studio (e.g. Samuel K.)"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                    className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    placeholder="Amount (e.g. ₦1,000, ₦5,000, $10)"
                    value={donorAmount}
                    onChange={(e) => setDonorAmount(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Optional note / blessing for Debzane & Sylvester..."
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />

                <div className="flex items-center justify-between pt-1">
                  {submittedNotice ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] animate-pulse">
                      <CheckCircle2 className="w-4 h-4" />
                      Thank you! Added to Supporters Wall.
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      Publicly featured on the Debzane Supporters Wall.
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !donorName.trim()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Saving...' : 'Add to Wall'}</span>
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'wall' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Public Supporters & Donors ({supporters.length})</span>
                </span>
                <button
                  onClick={exportSupportersToJSON}
                  className="text-[11px] text-amber-300 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Backup List</span>
                </button>
              </div>

              <div className="space-y-2">
                {supporters.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center">
                          {item.donorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-200 text-xs">{item.donorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[10px]">
                          {item.amount}
                        </span>
                        {item.date && (
                          <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
                        )}
                      </div>
                    </div>
                    {item.message && (
                      <p className="text-slate-300 text-xs pl-8 leading-relaxed">
                        "{item.message}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YouTube Channel Reviews Link */}
          <a
            href="https://youtube.com/@debzane_concepts"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 rounded-xl transition-all group mt-2"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-red-500/15 text-red-400 rounded-lg">
                <Youtube className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-red-300">
                  Rate & Comment on Official YouTube Channel
                </div>
                <div className="text-[10px] text-slate-400">@debzane_concepts</div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-300" />
          </a>

        </div>

        {/* Footer info & Proceed Button */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            100% Free Open Platform
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
