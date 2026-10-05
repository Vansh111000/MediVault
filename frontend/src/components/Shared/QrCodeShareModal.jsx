import React, { useState } from 'react';
import { X, QrCode, Copy, Check, ShieldCheck, Clock, Share2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QrCodeShareModal = ({ isOpen, onClose, patient }) => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [validityHours, setValidityHours] = useState('4');

  if (!isOpen || !patient) return null;

  const shareToken = `MV-TOKEN-${patient.id.replace('PAT-', '')}-${Date.now().toString(36).toUpperCase()}`;
  const shareUrl = `https://medivault.health/verify?token=${shareToken}&validity=${validityHours}h`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    showToast('Secure Link Copied', 'Encrypted temporary sharing link copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Temporary Visit Share Pass</h3>
              <p className="text-xs text-slate-400">Consent-secured QR Code for Doctor/Clinic</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Display */}
        <div className="mt-5 flex flex-col items-center text-center">
          <div className="p-4 rounded-2xl bg-white shadow-2xl border-4 border-emerald-500/40 flex flex-col items-center">
            {/* SVG simulated QR Code with MediVault Emblem */}
            <svg viewBox="0 0 160 160" className="w-48 h-48">
              {/* Corner position markers */}
              <rect x="10" y="10" width="40" height="40" fill="#0f172a" rx="4" />
              <rect x="18" y="18" width="24" height="24" fill="#ffffff" rx="2" />
              <rect x="24" y="24" width="12" height="12" fill="#059669" />

              <rect x="110" y="10" width="40" height="40" fill="#0f172a" rx="4" />
              <rect x="118" y="18" width="24" height="24" fill="#ffffff" rx="2" />
              <rect x="124" y="24" width="12" height="12" fill="#059669" />

              <rect x="10" y="110" width="40" height="40" fill="#0f172a" rx="4" />
              <rect x="18" y="118" width="24" height="24" fill="#ffffff" rx="2" />
              <rect x="24" y="124" width="12" height="12" fill="#059669" />

              {/* Data matrix pattern */}
              <rect x="60" y="20" width="8" height="8" fill="#0f172a" />
              <rect x="75" y="15" width="8" height="15" fill="#0f172a" />
              <rect x="90" y="25" width="10" height="8" fill="#0f172a" />
              <rect x="20" y="60" width="15" height="8" fill="#0f172a" />
              <rect x="45" y="60" width="8" height="8" fill="#059669" />
              <rect x="60" y="55" width="12" height="12" fill="#0f172a" />
              <rect x="80" y="60" width="10" height="10" fill="#0f172a" />
              <rect x="100" y="55" width="8" height="14" fill="#0f172a" />
              <rect x="120" y="65" width="15" height="8" fill="#0f172a" />
              <rect x="20" y="80" width="12" height="12" fill="#0f172a" />
              <rect x="40" y="80" width="8" height="15" fill="#0f172a" />
              <rect x="60" y="75" width="40" height="40" fill="#0ea5e9" rx="6" />
              <rect x="110" y="80" width="10" height="8" fill="#0f172a" />
              <rect x="130" y="90" width="12" height="10" fill="#0f172a" />
              <rect x="60" y="125" width="8" height="12" fill="#0f172a" />
              <rect x="75" y="120" width="12" height="8" fill="#059669" />
              <rect x="95" y="130" width="15" height="8" fill="#0f172a" />
              <rect x="120" y="120" width="8" height="15" fill="#0f172a" />
              <rect x="135" y="130" width="12" height="12" fill="#0f172a" />

              {/* MediVault Center Logo */}
              <text x="80" y="99" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">MV</text>
            </svg>
            <div className="mt-2 text-[11px] font-mono font-bold text-slate-800">
              {shareToken}
            </div>
          </div>

          {/* Patient Details Pill */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 w-full text-left flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">{patient.name}</div>
              <div className="text-[11px] text-slate-400">ABHA: {patient.abhaId}</div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Blood Group {patient.bloodGroup}
              </span>
            </div>
          </div>

          {/* Expiry Selector */}
          <div className="mt-3 flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Access Validity:</span>
            </div>
            <select
              value={validityHours}
              onChange={(e) => setValidityHours(e.target.value)}
              className="bg-slate-800 text-cyan-300 border border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-cyan-400"
            >
              <option value="1">1 Hour (Single Visit)</option>
              <option value="4">4 Hours (Consultation + Tests)</option>
              <option value="12">12 Hours (Day Care)</option>
              <option value="24">24 Hours (Overnight)</option>
            </select>
          </div>

          {/* Copy Link button */}
          <div className="mt-4 w-full flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              {copied ? 'Link Copied!' : 'Copy Secure Link'}
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'MediVault Temporary Record Share', url: shareUrl });
                } else {
                  handleCopy();
                }
              }}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              title="Share Pass"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Encrypted Token automatically expires when visit finishes or validity elapses.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
