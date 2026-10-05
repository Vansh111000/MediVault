import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlainLanguageExplainerModal } from '../Shared/PlainLanguageExplainerModal';
import { Footer } from '../Shared/Footer';
import { SummaryPointsList } from '../../utils/summaryFormatter';
import {
  Shield,
  ArrowLeft,
  FileText,
  Pill,
  ShieldCheck,
  Building2,
  Stethoscope,
  Calendar,
  Sparkles,
  CheckCircle2,
  Lock,
  User,
  ExternalLink,
  Check,
  AlertCircle,
  LogOut
} from 'lucide-react';

export const PatientDashboard = ({ onLogout }) => {
  const { currentPatient, records, consentRequests, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('records'); // 'records', 'prescriptions', 'consents'
  const [selectedRecordForExplain, setSelectedRecordForExplain] = useState(null);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);

  // Filter records for this patient
  const patientRecords = records.filter(r => r.patientId === currentPatient.id);

  // Extract all medications
  const allMedications = patientRecords
    .filter(r => r.medications && r.medications.length > 0)
    .flatMap(r => r.medications.map(m => ({
      ...m,
      doctorName: r.doctorName,
      hospitalName: r.hospitalName,
      date: r.date
    })));

  // Deduplicate medications
  const uniqueMedications = allMedications.filter((med, idx, self) =>
    idx === self.findIndex(m => m.drug.toLowerCase() === med.drug.toLowerCase())
  );

  const [consents, setConsents] = useState([
    {
      id: 'REQ-8821',
      hospital: 'CityCare Hospital',
      doctor: 'Dr. Sarah Sharma, MD',
      purpose: 'Cardiology OPD Consultation & ECG review',
      grantedDate: 'Today, 09:30 AM',
      status: 'Active'
    },
    {
      id: 'REQ-8794',
      hospital: 'St. Jude Medical Center',
      doctor: 'Dr. Arvind Patel, MD',
      purpose: 'Endocrinology follow-up and HbA1c review',
      grantedDate: '15 Oct 2026',
      status: 'Expired'
    }
  ]);

  const handleRevokeConsent = (id) => {
    setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'Revoked' } : c));
    showToast('Access Revoked', 'Hospital access permission was terminated.', 'warning');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      {/* Clean Navbar */}
      <nav className="bg-[#f8fafc] sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block leading-tight">MediVault</span>
                <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">PATIENT PORTAL</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center text-xs border border-slate-200">
                {currentPatient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-bold text-slate-900">{currentPatient.name}</div>
                <div className="text-[11px] text-slate-700 font-medium">ID: {currentPatient.mediVaultId || currentPatient.id}</div>
              </div>
            </div>

            {/* Static Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors ml-2 py-1 px-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Header Area & Patient Basic Details */}
      <div className="w-full px-4 sm:px-6 lg:px-10 pt-8 pb-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {currentPatient.name}
            </h1>
            <p className="text-xs text-slate-700 font-medium mt-1">
              Read-only medical records, active doctor prescriptions, and hospital privacy access permissions.
            </p>
          </div>
        </div>

        {/* Basic Patient Details Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Patient ID</span>
            <strong className="text-slate-900 font-bold">{currentPatient.mediVaultId || currentPatient.id}</strong>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Contact Number</span>
            <strong className="text-slate-900 font-bold">{currentPatient.phone || '+91 98450-39182'}</strong>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Date of Birth</span>
            <strong className="text-slate-900 font-bold">{currentPatient.dob || '1992-04-18'} ({currentPatient.age} yrs)</strong>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Gender & Blood</span>
            <strong className="text-slate-900 font-bold">{currentPatient.gender} • {currentPatient.bloodGroup}</strong>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Email Address</span>
            <span className="text-slate-900 font-semibold truncate block">{currentPatient.email || 'aarav.mehta@example.com'}</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Emergency Contact</span>
            <div className="text-slate-900 font-bold leading-tight">
              {currentPatient.emergencyContact?.name || 'Ananya Mehta'} ({currentPatient.emergencyContact?.relation || 'Spouse'})
              <span className="text-[11px] text-slate-700 font-semibold block mt-0.5 font-mono">
                {currentPatient.emergencyContact?.phone || '+91 98450-39182'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full px-4 sm:px-6 lg:px-10 space-y-6 pt-2 flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'records'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Medical Records ({patientRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'prescriptions'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Active Prescriptions ({uniqueMedications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('consents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'consents'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Hospital Access & Permissions</span>
          </button>
        </div>

        {/* TAB 1: MEDICAL RECORDS */}
        {activeTab === 'records' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Medical Consultation Records</h2>
                <p className="text-xs text-slate-700 font-medium">Complete historical health timeline recorded and verified by consulting doctors.</p>
              </div>

              {patientRecords.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-600 font-medium">
                  No medical records found for this profile.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {patientRecords.map((record) => (
                    <div key={record.id} className="py-4 first:pt-0 last:pb-0 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {record.category === 'Prescription' ? 'Doctor Visit' : record.category}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900">{record.title}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-700 font-semibold">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {record.date}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            {record.hospitalName}
                          </span>
                        </div>
                      </div>

                      {/* Summary formatted as clean bullet points */}
                      <SummaryPointsList text={record.summary} />

                      {/* Medicines preview */}
                      {record.medications && record.medications.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-700 mr-1">Prescribed:</span>
                          {record.medications.map((m, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200 text-[11px] font-semibold">
                              {m.drug} ({m.dosage})
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-slate-700 text-[11px] font-medium">
                          Consulting Doctor: <strong className="text-slate-950 font-bold">{record.doctorName}</strong> ({record.specialty})
                        </span>

                        <button
                          onClick={() => setSelectedRecordForExplain(record)}
                          className="text-teal-700 hover:text-teal-900 font-bold text-xs flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Explain in Simple Terms</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRESCRIPTIONS & MEDICATIONS */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Current Prescribed Medications</h2>
              <p className="text-xs text-slate-700 font-medium">Prescriptions authorized by your doctors across hospital visits.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 text-slate-800 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Medication Name</th>
                    <th className="p-3">Dosage & Frequency</th>
                    <th className="p-3">Prescribed By</th>
                    <th className="p-3">Facility</th>
                    <th className="p-3">Date Prescribed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {uniqueMedications.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-slate-600 font-medium">
                        No active medications recorded.
                      </td>
                    </tr>
                  ) : (
                    uniqueMedications.map((med, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
                              <Pill className="w-3.5 h-3.5" />
                            </div>
                            <strong className="text-slate-900 font-bold text-xs">{med.drug}</strong>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {med.dosage} • {med.frequency}
                        </td>
                        <td className="p-3 text-slate-900 font-semibold">
                          {med.doctorName}
                        </td>
                        <td className="p-3 text-slate-800 font-medium">
                          {med.hospitalName}
                        </td>
                        <td className="p-3 text-slate-800 font-medium">
                          {med.date}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: HOSPITAL ACCESS & CONSENTS */}
        {activeTab === 'consents' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hospital Access & Privacy Permissions</h2>
              <p className="text-xs text-slate-500">Control which doctors and healthcare facilities can view your medical records.</p>
            </div>

            <div className="divide-y divide-slate-100">
              {consents.map((c) => (
                <div key={c.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-slate-900">{c.hospital}</strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {c.status}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <span className="text-slate-500">Doctor:</span>{' '}
                      <strong className="text-slate-800 font-semibold">{c.doctor}</strong>
                    </div>
                    {c.purpose && (
                      <div className="text-slate-600">
                        <span className="text-slate-500">Purpose:</span>{' '}
                        <span className="text-slate-700">{c.purpose}</span>
                      </div>
                    )}
                    <div className="text-slate-600">
                      <span className="text-slate-500">Granted:</span>{' '}
                      <span className="text-slate-700">{c.grantedDate}</span>
                    </div>
                  </div>

                  <div>
                    {c.status === 'Active' && (
                      <button
                        onClick={() => handleRevokeConsent(c.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-bold text-xs border border-slate-300 transition-colors shadow-xs"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clean Footer */}
      <Footer />

      {/* Plain Language Explainer Modal */}
      <PlainLanguageExplainerModal
        isOpen={!!selectedRecordForExplain}
        onClose={() => setSelectedRecordForExplain(null)}
        record={selectedRecordForExplain}
      />
    </div>
  );
};
