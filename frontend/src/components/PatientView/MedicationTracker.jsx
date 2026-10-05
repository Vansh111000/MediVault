import React, { useState } from 'react';
import { Pill, Clock, CheckCircle2, AlertTriangle, Building2, Stethoscope, Plus, Calendar, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MedicationTracker = ({ records, patient }) => {
  const { showToast } = useApp();
  const [takenToday, setTakenToday] = useState({});

  // Extract all medications across patient records
  const allMeds = records
    .filter(r => r.patientId === patient?.id && r.medications)
    .flatMap(r => r.medications.map(m => ({
      ...m,
      hospitalName: r.hospitalName,
      doctorName: r.doctorName,
      datePrescribed: r.date,
      recordId: r.id
    })));

  // Deduplicate by drug name
  const activeMeds = allMeds.filter((med, index, self) =>
    index === self.findIndex(t => t.drug.toLowerCase() === med.drug.toLowerCase())
  );

  const toggleTaken = (drug) => {
    setTakenToday(prev => {
      const newState = !prev[drug];
      if (newState) {
        showToast('Dose Logged', `Marked ${drug} as taken for today. Keep up the good adherence!`, 'success');
      }
      return { ...prev, [drug]: newState };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Prescribed Drugs</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{activeMeds.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">From verified medical consultations</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Today's Adherence Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            {activeMeds.length > 0
              ? `${Math.round((Object.values(takenToday).filter(Boolean).length / activeMeds.length) * 100)}%`
              : '100%'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {Object.values(takenToday).filter(Boolean).length} of {activeMeds.length} doses logged
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Allergy Contraindication Guard</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {patient?.allergies?.length || 0} Blocked
          </div>
          <div className="text-[11px] text-rose-300/80 mt-1">
            {patient?.allergies?.map(a => a.allergen).join(', ') || 'No active allergies'}
          </div>
        </div>
      </div>

      {/* Medication List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Current Prescriptions & Schedule
          </h3>
          <span className="text-xs text-slate-400">
            Cross-Hospital Centralized Sync
          </span>
        </div>

        {activeMeds.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
            <Pill className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">No active medications on record.</p>
          </div>
        ) : (
          activeMeds.map((med, idx) => {
            const isTaken = !!takenToday[med.drug];
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isTaken
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaken(med.drug)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isTaken
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                      }`}
                      title={isTaken ? 'Mark as not taken' : 'Log dose taken'}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{med.drug}</h4>
                        <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Schedule: <strong>{med.frequency}</strong></span>
                        <span>•</span>
                        <span>Duration: {med.duration}</span>
                      </div>
                      {med.instructions && (
                        <p className="text-xs text-slate-400 mt-1 italic">
                          "{med.instructions}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Doctor & Hospital Provenance */}
                  <div className="flex sm:flex-col items-end justify-between text-right text-xs gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{med.hospitalName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Prescribed by {med.doctorName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {med.datePrescribed}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
