import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ACTIVE_CONSENT_REQUEST } from '../../data/mockData';
import {
  Shield,
  ShieldCheck,
  Building2,
  Clock,
  Key,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Pill,
  Heart,
  ChevronDown,
  ChevronUp,
  XCircle,
  ExternalLink,
  Lock,
  ArrowLeft,
  Activity,
  Check,
  Stethoscope
} from 'lucide-react';

export const ConsentReviewPage = ({ onBackToDashboard, onOpenQrModal }) => {
  const { showToast } = useApp();

  const [consentState, setConsentState] = useState(ACTIVE_CONSENT_REQUEST.status);
  const [scopes, setScopes] = useState(ACTIVE_CONSENT_REQUEST.requestedScopes);
  const [showAuditDetails, setShowAuditDetails] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(15287);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  const handleToggleScope = (scopeId) => {
    setScopes(prev => prev.map(sc => sc.id === scopeId ? { ...sc, selected: !sc.selected } : sc));
  };

  const handleGrantConsent = () => {
    setConsentState('APPROVED_ACTIVE');
    showToast('Access Granted', 'Temporary 6-hour cryptographic token issued to CityCare Hospital.', 'success');
  };

  const handleDeclineConsent = () => {
    setConsentState('REJECTED');
    showToast('Request Declined', 'Cross-hospital access request was declined.', 'warning');
  };

  const handleRevoke = () => {
    setConsentState('REVOKED');
    showToast('Access Revoked', 'Cryptographic keys purged. Hospital session terminated immediately.', 'error');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={onBackToDashboard} className="hover:text-slate-900 flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            Consent Vault
          </button>
          <span>/</span>
          <span>Review Access Request</span>
          <span>/</span>
          <span className="font-mono text-slate-700 font-bold">{ACTIVE_CONSENT_REQUEST.id}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
          <span>ABDM Enclave v4.2 Connected</span>
        </div>
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Review Access Request
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          You maintain sovereign cryptographic authority over your medical history at all times.
        </p>
      </div>

      {/* 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Request Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
            {/* Hospital Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-teal-700">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{ACTIVE_CONSENT_REQUEST.requestingHospitalName}</h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-teal-600" />
                      ABDM Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{ACTIVE_CONSENT_REQUEST.department}</p>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">RECEIVED</span>
                <strong className="text-slate-900 font-semibold">{ACTIVE_CONSENT_REQUEST.receivedTime}</strong>
              </div>
            </div>

            {/* Purpose Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Stethoscope className="w-4 h-4 text-teal-700" />
                <span>{ACTIVE_CONSENT_REQUEST.purpose}</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {ACTIVE_CONSENT_REQUEST.purposeDetail}
              </p>
            </div>

            {/* Clinician Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
                  alt="Dr. Sharma"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">{ACTIVE_CONSENT_REQUEST.requestingDoctorName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">License #{ACTIVE_CONSENT_REQUEST.doctorLicense}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                Primary Care Provider
              </span>
            </div>

            {/* Requested Clinical Datasets Scopes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Requested Clinical Datasets
                </h4>
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-teal-700" />
                  3 Categorical Scopes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {scopes.map(scope => (
                  <div
                    key={scope.id}
                    onClick={() => handleToggleScope(scope.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      scope.selected
                        ? 'bg-teal-50/50 border-teal-300 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {scope.id === 'scope-1' && <FileText className="w-4 h-4 text-teal-700" />}
                      {scope.id === 'scope-2' && <Pill className="w-4 h-4 text-teal-700" />}
                      {scope.id === 'scope-3' && <Heart className="w-4 h-4 text-teal-700" />}
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        scope.selected ? 'bg-teal-700 border-teal-700 text-white' : 'border-slate-300'
                      }`}>
                        {scope.selected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-2">{scope.title}</div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{scope.description}</p>
                    <div className="text-[9px] font-semibold font-mono text-teal-800 mt-2">
                      {scope.recordsCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shielded Isolation Guarantee */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-slate-800">Shielded Isolation:</strong> Mental health logs, genomic sequences, and reproductive history remain permanently encrypted and omitted from this scope.
              </div>
            </div>

            {/* Zero-Persistence ABDM Guarantee Box */}
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-teal-950 text-xs">
                <Shield className="w-4 h-4 text-teal-700" />
                <span>Zero-Persistence ABDM Guarantee</span>
              </div>
              <p className="text-[11px] text-teal-900 leading-relaxed">
                This session uses decentralized cryptographic key delegation. Hospital terminals process data in volatile memory without cloud mirroring. The decryption keys automatically revoke when Dr. Sharma completes your OPD consultation.
              </p>
              <div className="flex items-center gap-4 text-[10px] font-bold text-teal-950 pt-1 flex-wrap">
                <span>⏱ Max lease: 6 Hours</span>
                <span>•</span>
                <span>🔄 Auto-purge at discharge</span>
                <span>•</span>
                <span>✋ Patient revocable anytime</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={handleDeclineConsent}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Decline Request
              </button>

              <button
                onClick={handleGrantConsent}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                <span>Accept & Grant Temporary Access</span>
              </button>
            </div>

            {/* Expandable Accordion */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAuditDetails(!showAuditDetails)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  Cryptographic Token & Workstation Audit Details
                </span>
                {showAuditDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAuditDetails && (
                <div className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[10px] space-y-1">
                  <div>REQUEST_ID: REQ-ABDM-8821-E89</div>
                  <div>TERMINAL_NODE: 192.168.10.45 [CityCare Card_OPD_04]</div>
                  <div>HSM_PUBKEY: 0x892a9f14...c70281</div>
                  <div>DIGITAL_SIGNATURE: SHA256withECDSA_VERIFIED</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Session Tracker */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                Active Session Tracker
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                ⚡ Live Enclave
              </span>
            </div>

            {/* Circular Timer Display */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  SESSION TIME REMAINING
                </span>
                <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
                  {formatTimer(remainingSeconds)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Granted 09:35 AM • Auto-purge at checkout
                </div>
              </div>

              {/* Circular SVG Gauge in Teal */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-teal-700"
                    strokeDasharray="75, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <Key className="w-4 h-4 text-teal-700 absolute" />
              </div>
            </div>

            {/* Live Transaction Stream */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Live Transaction Stream</span>
                <span className="text-teal-800">Real-time ABDM Log</span>
              </div>

              <div className="space-y-2">
                {ACTIVE_CONSENT_REQUEST.liveTransactions.map(tx => (
                  <div key={tx.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-0.5">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{tx.actor}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{tx.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-mono">{tx.action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Revoke Button */}
            <button
              onClick={handleRevoke}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-slate-600" />
              <span>Revoke Access Immediately</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Instant cryptographic purge. Terminates provider session instantly.
            </p>
          </div>

          {/* National Health Authority Compliance Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">National Health Authority Compliance</h4>
                <p className="text-[10px] text-slate-500">ABHA Ayushman Bharat Digital Mission Level 3</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              MediVault does not sell or syndicate health identifiers. Each hospital access request adheres strictly to the Digital Personal Data Protection (DPDP) Act 2023.
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
              <a href="#charter" className="text-teal-700 hover:underline">
                Read Consent Governance Charter
              </a>
              <span className="text-slate-400 font-mono flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                v2.1 Cryptographic Audit
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
