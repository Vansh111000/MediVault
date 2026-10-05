import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NewPatientRegistrationModal } from './NewPatientRegistrationModal';
import { CheckInModal } from './CheckInModal';
import { AiOcrScannerModal } from '../Shared/AiOcrScannerModal';
import {
  Building2,
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  LogOut,
  AlertTriangle,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Key,
  Calendar,
  Activity
} from 'lucide-react';

export const AssistantDashboard = () => {
  const {
    currentAssistant,
    currentHospital,
    patients,
    doctors,
    activeVisits,
    consentRequests,
    endVisit,
    requestInterHospitalConsent,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [preselectedPatientId, setPreselectedPatientId] = useState('');

  // Federated patient search results
  const searchResults = searchQuery.trim()
    ? patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.abhaId.includes(searchQuery) ||
        p.mediVaultId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery)
      )
    : [];

  const handleQuickCheckIn = (patId) => {
    setPreselectedPatientId(patId);
    setShowCheckInModal(true);
  };

  const handleRequestCrossHospitalConsent = (patientId, patientName) => {
    requestInterHospitalConsent({
      patientId,
      reason: `Temporary visit record access for triage and consultation at ${currentHospital.name}`,
      durationMinutes: 240
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Frontdesk Station Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/25">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-white">{currentHospital.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Frontdesk Triage & Reception
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
                <span>Duty Assistant: <strong className="text-slate-200">{currentAssistant.name}</strong></span>
                <span>•</span>
                <span>Role: <strong className="text-slate-200">{currentAssistant.role}</strong></span>
                <span>•</span>
                <span>License: <span className="font-mono text-cyan-300">{currentHospital.license}</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register New Patient</span>
            </button>

            <button
              onClick={() => {
                setPreselectedPatientId(patients[0]?.id || '');
                setShowCheckInModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Check-In & Queue Token</span>
            </button>

            <button
              onClick={() => setShowOcrModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Scan Initial Slip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Federated Patient Search Station */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              Federated Health Grid Patient Lookup
            </h3>
            <p className="text-xs text-slate-400">
              Lookup any patient across all 18 registered hospitals by ABHA ID, MediVault ID, Phone, or Name
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient by ABHA ID (e.g. 91-4432...), MediVault ID (MV-774921), Phone (+1 555...), or Name (Alex Mercer)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Live Search Results Dropdown / Panel */}
        {searchQuery.trim() && (
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 space-y-2 animate-fade-in">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Search Results ({searchResults.length} Patients Found in Network)
            </div>

            {searchResults.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No patient found with "{searchQuery}". Click <strong>"+ Register New Patient"</strong> to create a new profile.
              </div>
            ) : (
              searchResults.map(pat => {
                const isFromOtherHospital = pat.homeHospital !== currentHospital.name;
                const existingConsent = consentRequests.find(
                  c => c.patientId === pat.id && c.requestingHospitalId === currentHospital.id && c.status === 'APPROVED_ACTIVE'
                );

                return (
                  <div
                    key={pat.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{pat.name}</strong>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300">
                          {pat.gender}, {pat.age}Y • Blood {pat.bloodGroup}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {pat.mediVaultId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        ABHA: <span className="font-mono text-slate-300">{pat.abhaId}</span> • Phone: {pat.phone} • Home Node: <strong className="text-slate-300">{pat.homeHospital}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isFromOtherHospital && !existingConsent && (
                        <button
                          onClick={() => handleRequestCrossHospitalConsent(pat.id, pat.name)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Request Cross-Hospital Consent</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleQuickCheckIn(pat.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Check-In</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Doctor Queue Load Tracker */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-emerald-400" />
          OPD Clinician Queue Load ({doctors.length} Doctors Active)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {doctors.map(doc => {
            const queueCount = activeVisits.filter(v => v.assignedDoctorId === doc.id).length;
            return (
              <div key={doc.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img src={doc.avatar} alt={doc.name} className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[120px]">{doc.name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{doc.specialty}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    queueCount > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {queueCount} in Queue
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Visits & Temporary Cross-Hospital Access Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Active Hospital Visits & Triage Queue ({activeVisits.length})
            </h3>
            <p className="text-xs text-slate-400">
              When a patient's visit completes, discharging them automatically revokes and expires cross-hospital access tokens.
            </p>
          </div>
        </div>

        {activeVisits.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-500 text-xs">
            No active patient visits currently checked in at this hospital.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Token</th>
                  <th className="p-3.5">Patient Details</th>
                  <th className="p-3.5">Assigned Doctor</th>
                  <th className="p-3.5">Triage Vitals</th>
                  <th className="p-3.5">Cross-Hospital Consent</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {activeVisits.map(visit => {
                  const pat = patients.find(p => p.id === visit.patientId);
                  const consentActive = visit.crossHospitalConsent?.status === 'APPROVED_ACTIVE';

                  return (
                    <tr key={visit.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-cyan-300">
                        {visit.tokenNumber}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-white">{visit.patientName}</div>
                        <div className="text-[10px] text-slate-400">
                          {pat?.age}Y • {pat?.bloodGroup} • {visit.priority}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-slate-200">{visit.assignedDoctorName}</div>
                        <div className="text-[10px] text-slate-400">{visit.specialty}</div>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-slate-300">
                        <div>BP: {visit.triageVitals?.bp}</div>
                        <div className="text-[10px] text-slate-400">Pulse: {visit.triageVitals?.pulse}</div>
                      </td>

                      <td className="p-3.5">
                        {consentActive ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Visit Access Active (4h Token)</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 w-max block">
                            Consent Pending
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => endVisit(visit.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/40 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all"
                          title="Discharge patient and auto-expire temporary consent"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>End Visit & Expire Access</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Modals for Assistant */}
      <NewPatientRegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegistered={(newPat) => {
          setPreselectedPatientId(newPat.id);
          setShowCheckInModal(true);
        }}
      />

      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        preselectedPatientId={preselectedPatientId}
      />

      <AiOcrScannerModal
        isOpen={showOcrModal}
        onClose={() => setShowOcrModal(false)}
        patientId={preselectedPatientId || patients[0]?.id}
      />
    </div>
  );
};
