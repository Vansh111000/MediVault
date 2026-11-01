import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Clock, CheckCircle2, XCircle, QrCode, AlertTriangle, Building2, User, Key, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ConsentManager = ({ patient, onOpenQrModal }) => {
  const { consentRequests, respondConsentRequest, revokeConsent, showToast } = useApp();
  const [now, setNow] = useState(Date.now());

  // Live countdown ticker
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const patientConsents = consentRequests.filter(
    c => !c.patientId || c.patientId === patient?.id || c.patientId === patient?._id || c.patientId === patient?.mediVaultId
  );
  const activeConsents = patientConsents.filter(c => c.status === 'APPROVED_ACTIVE');
  const pendingRequests = patientConsents.filter(c => c.status === 'PENDING');
  const pastConsents = patientConsents.filter(c => c.status === 'EXPIRED' || c.status === 'REVOKED' || c.status === 'REJECTED');

  const formatRemainingTime = (expiresAt) => {
    if (!expiresAt) return 'Calculating...';
    const diffMs = new Date(expiresAt).getTime() - now;
    if (diffMs <= 0) return 'Expired';
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Privacy Guarantees */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Visit-Based Patient Consent & Privacy Architecture
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                MediVault ensures you own 100% of your medical data. Other hospitals can only access your past records with your explicit consent. Access is <strong>strictly temporary</strong> and <strong>automatically terminates</strong> when your visit finishes.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenQrModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all flex-shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span>Generate Share Pass</span>
          </button>
        </div>
      </div>

      {/* Pending Consent Requests (Urgent) */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Pending Hospital Access Requests ({pendingRequests.length})</span>
          </div>

          <div className="grid gap-3">
            {pendingRequests.map(req => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-amber-950/20 border-2 border-amber-500/50 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-sm">{req.requestingHospitalName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {req.durationMinutes / 60}h Temporary Access
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Doctor: <strong className="text-white">{req.requestingDoctorName}</strong>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed italic">
                    Purpose: "{req.purpose}"
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <button
                    onClick={() => respondConsentRequest(req.id, true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize ({req.durationMinutes / 60}h)</span>
                  </button>
                  <button
                    onClick={() => respondConsentRequest(req.id, false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Temporary Permissions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-4 h-4 text-cyan-400" />
            Active Temporary Hospital Permissions ({activeConsents.length})
          </h3>
          <span className="text-[11px] text-slate-400">Real-Time Auto-Expiry Ticker</span>
        </div>

        {activeConsents.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No active temporary sharing sessions. Your records are completely private to your home hospital.
          </div>
        ) : (
          <div className="grid gap-3">
            {activeConsents.map(consent => (
              <div
                key={consent.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/40 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-sm">{consent.requestingHospitalName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Token ID: {consent.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Authorized Clinician: <strong className="text-white">{consent.requestingDoctorName}</strong>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Scope: <span className="text-slate-300">Read-Only History for Current Visit</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Countdown Timer Display */}
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Access Auto-Expires In:</div>
                    <div className="text-sm font-mono font-black text-cyan-300 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      {formatRemainingTime(consent.expiresAt)}
                    </div>
                  </div>

                  <button
                    onClick={() => revokeConsent(consent.id)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold transition-all shadow-xs"
                  >
                    Revoke Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Audit of Past Consents */}
      {pastConsents.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Past Expired / Terminated Tokens ({pastConsents.length})
          </h4>
          <div className="space-y-2">
            {pastConsents.map(c => (
              <div key={c.id} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.requestingHospitalName}</span>
                  <span className="text-slate-500">•</span>
                  <span>{c.requestingDoctorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === 'EXPIRED' ? 'bg-slate-800 text-slate-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
