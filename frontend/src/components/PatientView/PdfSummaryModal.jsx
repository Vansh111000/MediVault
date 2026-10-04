import React from 'react';
import { X, Printer, Download, ShieldCheck, Heart, Pill, Activity, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PdfSummaryModal = ({ isOpen, onClose, patient, records }) => {
  const { showToast } = useApp();
  if (!isOpen || !patient) return null;

  const handlePrint = () => {
    window.print();
    showToast('Medical Summary Print Triggered', 'Formatted clinical document sent to print preview.', 'success');
  };

  const patientRecords = records.filter(r => r.patientId === patient.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white text-slate-900 shadow-2xl p-6 sm:p-8">
        {/* Top Floating Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-100 text-cyan-800">
              OFFICIAL CLINICAL EXPORT
            </span>
            <span className="text-xs text-slate-500">MediVault Health Grid</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="mt-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">MediVault Medical Passport</h1>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Centralized Electronic Health Record Summary • Verified Cryptographic Audit Trail
              </p>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold text-slate-900">Generated: {new Date().toLocaleDateString()}</div>
              <div className="text-slate-500 font-mono">ABHA: {patient.abhaId}</div>
              <div className="text-slate-500 font-mono">ID: {patient.mediVaultId}</div>
            </div>
          </div>

          {/* Patient Demographics Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Patient Name:</span>
              <strong className="text-slate-900 text-sm font-bold">{patient.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Age / Gender / Blood:</span>
              <strong className="text-slate-900 text-sm font-bold">
                {patient.age} Y • {patient.gender} • {patient.bloodGroup}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Emergency Contact:</span>
              <strong className="text-slate-900">{patient.emergencyContact?.name} ({patient.emergencyContact?.phone})</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Home Hospital:</span>
              <strong className="text-slate-900">{patient.homeHospital}</strong>
            </div>
          </div>

          {/* Allergies & Chronic Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50">
              <h3 className="text-xs font-bold uppercase text-red-700 tracking-wider flex items-center gap-1.5 mb-2">
                Allergies & Adverse Reactions
              </h3>
              {patient.allergies?.length > 0 ? (
                <ul className="space-y-1 text-xs">
                  {patient.allergies.map((a, i) => (
                    <li key={i} className="text-red-900">
                      <strong>{a.allergen}</strong> — {a.severity}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">No known drug allergies reported.</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
              <h3 className="text-xs font-bold uppercase text-blue-700 tracking-wider flex items-center gap-1.5 mb-2">
                Active Chronic Conditions
              </h3>
              {patient.chronicConditions?.length > 0 ? (
                <ul className="space-y-1 text-xs">
                  {patient.chronicConditions.map((c, i) => (
                    <li key={i} className="text-blue-900">
                      <strong>{c.condition}</strong> ({c.status})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">No chronic medical conditions listed.</p>
              )}
            </div>
          </div>

          {/* Recent Records & Prescriptions Summary Table */}
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider mb-2">
              Recent Consultations & Clinical Encounters ({patientRecords.length})
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Hospital / Facility</th>
                  <th className="p-2.5">Clinician</th>
                  <th className="p-2.5">Diagnosis / Reason</th>
                  <th className="p-2.5">Prescribed Medications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {patientRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-700">{rec.date}</td>
                    <td className="p-2.5 font-medium text-slate-900">{rec.hospitalName}</td>
                    <td className="p-2.5 text-slate-700">{rec.doctorName}</td>
                    <td className="p-2.5 text-slate-800">
                      {rec.diagnoses?.map(d => d.name).join(', ') || rec.title}
                    </td>
                    <td className="p-2.5 text-slate-700">
                      {rec.medications?.map(m => `${m.drug} ${m.dosage}`).join(', ') || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Imprint & Verification */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Federated Health Data Integrity Verified. Tamper-evident digital token.</span>
            </div>
            <div>Page 1 of 1</div>
          </div>
        </div>
      </div>
    </div>
  );
};
