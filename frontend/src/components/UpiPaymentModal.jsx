import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import confetti from 'canvas-confetti';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export default function UpiPaymentModal() {
  const { 
    isUpiPaymentOpen, 
    closeUpiPayment, 
    activePayment, 
    refreshAll, 
    showToast 
  } = useApp();

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  if (!isUpiPaymentOpen || !activePayment) return null;

  const {
    fromMember,
    toMember,
    amount,
    upiLink,
    qrCode,
    groupId
  } = activePayment;

  const handleCopyUpi = () => {
    if (toMember?.upiId) {
      navigator.clipboard.writeText(toMember.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
      showToast('UPI ID copied to clipboard!');
    }
  };

  const handleCopyLink = () => {
    if (upiLink) {
      navigator.clipboard.writeText(upiLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      showToast('UPI payment link copied!');
    }
  };

  // Mark as Paid
  const handleMarkAsSettled = async () => {
    try {
      setIsRecording(true);
      await api.recordSettlement({
        groupId: groupId || 'all',
        fromMemberId: fromMember.id,
        toMemberId: toMember.id,
        amount: Number(amount),
        upiLink: upiLink || '',
        note: `Settled payment to ${toMember.name}`
      });

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#38bdf8', '#f59e0b']
      });

      await refreshAll();
      showToast(`Settlement of ₹${amount} recorded! Balances updated.`);
      closeUpiPayment();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0a0f1d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Settle via UPI</h3>
              <p className="text-xs text-slate-400">Scan QR or open UPI payment app</p>
            </div>
          </div>
          <button 
            onClick={closeUpiPayment}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-center">
          
          {/* Transfer Participants */}
          <div className="flex items-center justify-center gap-4 py-1">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl mx-auto shadow-inner">
                {fromMember?.avatar || '👤'}
              </div>
              <p className="text-xs font-semibold text-slate-300 mt-1 truncate max-w-[100px]">
                {fromMember?.name || 'Debtor'}
              </p>
              <span className="text-[10px] text-rose-400 font-semibold uppercase">Payer</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                ₹{Number(amount).toFixed(2)}
              </span>
              <span className="text-slate-500 text-xs mt-0.5">→ pays →</span>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl mx-auto shadow-inner">
                {toMember?.avatar || '👤'}
              </div>
              <p className="text-xs font-semibold text-slate-200 mt-1 truncate max-w-[100px]">
                {toMember?.name || 'Receiver'}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">Payee</span>
            </div>
          </div>

          {/* Amount Display */}
          <div className="py-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
              ₹{Number(amount).toFixed(2)}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Exact settlement amount to clear debt
            </p>
          </div>

          {/* Dynamic Scannable QR Code */}
          <div className="p-4 rounded-3xl bg-white max-w-[240px] mx-auto shadow-xl border-4 border-emerald-500/30">
            {qrCode ? (
              <img 
                src={qrCode} 
                alt="UPI Settlement QR Code" 
                className="w-full h-auto aspect-square rounded-xl"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400 font-mono text-xs">
                Generating QR...
              </div>
            )}
            <div className="mt-2 text-[10px] text-slate-700 font-bold tracking-wider flex items-center justify-center gap-1.5 uppercase">
              <span>GPay</span> • <span>PhonePe</span> • <span>Paytm</span>
            </div>
          </div>

          {/* Payee UPI ID */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Receiver UPI ID
              </p>
              <p className="font-mono text-slate-200 font-bold truncate">
                {toMember?.upiId || 'hostel@upi'}
              </p>
            </div>
            <button
              onClick={handleCopyUpi}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 font-semibold"
            >
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copiedUpi ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Direct UPI App Trigger (for mobile or UPI protocol handlers) */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={upiLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Open UPI App</span>
            </a>

            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Copy className="w-4 h-4 text-emerald-400" />
              <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Mark as Settled Button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleMarkAsSettled}
              disabled={isRecording}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              {isRecording ? 'Recording Settlement...' : 'Mark as Paid & Clear Debt'}
            </button>
            <p className="text-[11px] text-slate-500 mt-2">
              SplitMate updates balances immediately upon confirmation.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
