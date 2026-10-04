import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Stethoscope, User, X, CheckCircle2, Clock, Activity, ShieldAlert } from 'lucide-react';

export const CheckInModal = ({ isOpen, onClose, preselectedPatientId }) => {
  const { currentHospital, doctors, patients, checkInPatient, showToast } = useApp();

  const [patientId, setPatientId] = useState(preselectedPatientId || patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [priority, setPriority] = useState('Routine');
  const [reason, setReason] = useState('');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [temp, setTemp] = useState('98.6');
  const [spO2, setSpO2] = useState('98');

  if (!isOpen) return null;

  // Doctors belonging to this hospital or available for OPD
  const hospitalDoctors = doctors.filter(d => d.hospitalId === currentHospital.id || true);
  const selectedPatient = patients.find(p => p.id === patientId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patientId || !doctorId) {
      showToast('Selection Required', 'Please select both a patient and an attending doctor.', 'error');
      return;
    }

    checkInPatient({
      patientId,
      doctorId,
      priority,
      reason: reason || 'Outpatient Consultation & Review',
      triageVitals: {
        bp: `${bp} mmHg`,
        pulse: `${pulse} bpm`,
        temp: `${temp} °F`,
        spO2: `${spO2}%`
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl p-6 sm:p-8 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Patient Triage & Check-In</h3>
              <p className="text-xs text-slate-400">
                Frontdesk Token Generation & Doctor Assignment at {currentHospital.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Patient Selection */}
          <div>
            <label className="text-slate-300 font-bold block mb-1 uppercase tracking-wider">Select Patient</label>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — ABHA: {p.abhaId} (Home: {p.homeHospital})
                </option>
              ))}
            </select>
          </div>

          {/* Cross-hospital notice if from another facility */}
          {selectedPatient && selectedPatient.homeHospital !== currentHospital.name && (
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>
                <strong>Cross-Hospital Visitor:</strong> Patient registered originally at <strong>{selectedPatient.homeHospital}</strong>. System will prompt patient for temporary visit consent.
              </span>
            </div>
          )}

          {/* Doctor Assignment & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-bold block mb-1 uppercase tracking-wider">Assign Attending Doctor</label>
              <select
                value={doctorId}
                onChange={e => setDoctorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
              >
                {hospitalDoctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1 uppercase tracking-wider">Triage Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none font-semibold"
              >
                <option value="Routine">Routine Outpatient (Token R)</option>
                <option value="Urgent (Priority Evaluation)">Urgent Evaluation (Token U)</option>
                <option value="Follow-Up Review">Follow-Up Review (Token F)</option>
              </select>
            </div>
          </div>

          {/* Vitals */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Triage Intake Vitals
            </span>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block">BP (mmHg)</label>
                <input
                  type="text"
                  value={bp}
                  onChange={e => setBp(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Pulse (bpm)</label>
                <input
                  type="text"
                  value={pulse}
                  onChange={e => setPulse(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Temp (°F)</label>
                <input
                  type="text"
                  value={temp}
                  onChange={e => setTemp(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">SpO2 (%)</label>
                <input
                  type="text"
                  value={spO2}
                  onChange={e => setSpO2(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="text-slate-300 font-bold block mb-1 uppercase tracking-wider">Chief Complaint / Visit Reason</label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Follow-up consultation for lipid levels and cardiology history review..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Token will be dispatched to OPD display and doctor console.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Check-In Patient</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
