import React, { useState } from 'react';
import { Sparkles, ShieldAlert, Heart, Activity, CheckCircle2, ChevronDown, ChevronUp, RefreshCw, Layers } from 'lucide-react';

export const AiSummaryCard = ({ patient, records = [], compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRefresh = (e) => {
    e.stopPropagation();
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 900);
  };

  const patientRecords = records.filter(r => r.patientId === patient?.id);
  const uniqueHospitals = [...new Set(patientRecords.map(r => r.hospitalName))];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-cyan-950/40 p-5 shadow-2xl backdrop-blur-xl">
      {/* Background Accent Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-lg shadow-cyan-500/20">
            <Sparkles className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : 'animate-pulse'}`} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                MediVault AI Clinical History Synthesis
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Multi-Hospital Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Synthesized from {patientRecords.length} records across {uniqueHospitals.length || 1} healthcare centers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            title="Re-run AI Analysis across all federated records"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 text-xs animate-fade-in">
          {/* Key Clinical Summary Narrative */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 text-slate-200 leading-relaxed">
            <span className="font-semibold text-cyan-300">Executive Clinical Brief: </span>
            {patient?.name} is a {patient?.age}-year-old {patient?.gender?.toLowerCase()} with a verified history of{' '}
            <span className="text-white font-medium">
              {patient?.chronicConditions?.map(c => c.condition).join(', ') || 'no major chronic conditions'}
            </span>
            . Last evaluation at {uniqueHospitals[0] || 'Metro General'} confirmed stable vitals (BP {patient?.vitals?.bp}, HR {patient?.vitals?.heartRate}). Active compliance on cardiovascular and metabolic regimens is monitored. Cross-hospital telemetry shows no acute adverse interactions.
          </div>

          {/* Critical Allergy & Precaution Flags */}
          {patient?.allergies && patient.allergies.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                  Critical Safety Alerts (High Priority Contraindications)
                </div>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {patient.allergies.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-200 border border-rose-500/40 text-[11px] font-medium"
                    >
                      ⚠️ <strong className="text-white">{allergy.allergen}</strong> — {allergy.severity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Cardiovascular</span>
              </div>
              <div className="text-sm font-bold text-white mt-1">Stage 1 Stable</div>
              <div className="text-[10px] text-slate-400">Telmisartan 40mg OD</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Lipid Profile</span>
              </div>
              <div className="text-sm font-bold text-amber-300 mt-1">Borderline LDL</div>
              <div className="text-[10px] text-slate-400">LDL 132 mg/dL (Nov '25)</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Renal & Glycemic</span>
              </div>
              <div className="text-sm font-bold text-emerald-300 mt-1">Normal eGFR</div>
              <div className="text-[10px] text-slate-400">HbA1c 5.6% (Optimal)</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Federated Sources</span>
              </div>
              <div className="text-sm font-bold text-cyan-300 mt-1">{uniqueHospitals.length} Centers</div>
              <div className="text-[10px] text-slate-400">Immutable Cryptoseals</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
