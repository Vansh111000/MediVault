import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
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

export const PatientDashboard = ({ onLogout, onNavigateHome }) => {
  const { currentPatient, records, activeVisits, consentRequests, revokeConsent, respondConsentRequest, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('records'); // 'records', 'prescriptions', 'consents'
  const [selectedRecordForExplain, setSelectedRecordForExplain] = useState(null);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState('');

  // Filter only records that belong strictly to this patient (no loose fallbacks)
  const patientRecords = records.filter(
    (r) =>
      r.patientId &&
      (r.patientId === currentPatient?.id ||
       r.patientId === currentPatient?._id ||
       r.patientId === currentPatient?.mediVaultId)
  );

  // Extract all medications from authentic records
  const allMedications = patientRecords
    .filter((r) => r.medications && r.medications.length > 0)
    .flatMap((r) =>
      r.medications.map((m) => ({
        ...m,
        drug: m.drug || m.name,
        doctorName: r.doctorName,
        hospitalName: r.hospitalName,
        date: r.date,
      }))
    );

  // Deduplicate medications
  const uniqueMedications = allMedications.filter(
    (med, idx, self) =>
      med.drug &&
      idx === self.findIndex((m) => m.drug && m.drug.toLowerCase() === med.drug.toLowerCase())
  );

  // Real hospital consent requests for this patient (no hardcoded mock data)
  const patientConsents = consentRequests.filter((c) => {
    const cPatId = String(c.patientId?._id || c.patientId?.id || c.patientId || '');
    const curId = String(currentPatient?.id || currentPatient?._id || '');
    const curMvId = String(currentPatient?.mediVaultId || '');
    return Boolean(cPatId) && (cPatId === curId || (curMvId && cPatId === curMvId));
  });

  const patientAppointments = (activeVisits || []).filter((visit) => {
    const visitPatientId = String(visit.patientId?._id || visit.patientId?.id || visit.patientId || '');
    const patientId = String(currentPatient?.id || currentPatient?._id || '');
    return visitPatientId && patientId && visitPatientId === patientId;
  }).sort((a, b) => new Date(b.appointmentDate || b.checkInTime || 0) - new Date(a.appointmentDate || a.checkInTime || 0));

  const handleRevokeConsent = async (id) => {
    try {
      if (revokeConsent) await revokeConsent(id);
    } catch (e) {
      showToast('Error', e.message || 'Failed to revoke consent', 'error');
    }
  };

  const handleRespondConsent = async (id, approved) => {
    try {
      if (respondConsentRequest) await respondConsentRequest(id, approved);
    } catch (e) {
      showToast('Error', e.message || 'Failed to respond to consent request', 'error');
    }
  };

  const handleGenerateAiSummary = async () => {
    setAiSummaryLoading(true);
    setAiSummaryError('');
    try {
      const response = await api.generatePatientAiSummary();
      setAiSummary(response?.data?.text || 'No summary was returned. Please try again.');
    } catch (error) {
      setAiSummaryError(error.message || 'Unable to generate your summary right now.');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // Only display details that have ACTUALLY been entered (strictly no fabricated/fake values)
  const enteredDetails = [];

  if (currentPatient?.mediVaultId || currentPatient?.id) {
    enteredDetails.push({
      key: 'id',
      label: 'Patient ID',
      value: currentPatient.mediVaultId || currentPatient.id,
      isBold: true
    });
  }

  if (currentPatient?.phone && currentPatient.phone.trim() && currentPatient.phone !== '—') {
    enteredDetails.push({
      key: 'phone',
      label: 'Contact Number',
      value: currentPatient.phone,
      isBold: true
    });
  }

  const hasDob = !!currentPatient?.dob;
  const hasAge = currentPatient?.age !== undefined && currentPatient?.age !== null && currentPatient?.age !== '' && currentPatient?.age !== 0;
  if (hasDob && hasAge) {
    enteredDetails.push({
      key: 'dob',
      label: 'Date of Birth',
      value: `${new Date(currentPatient.dob).toLocaleDateString()} (${currentPatient.age} yrs)`,
      isBold: true
    });
  } else if (hasDob) {
    enteredDetails.push({
      key: 'dob',
      label: 'Date of Birth',
      value: new Date(currentPatient.dob).toLocaleDateString(),
      isBold: true
    });
  } else if (hasAge) {
    enteredDetails.push({
      key: 'age',
      label: 'Age',
      value: `${currentPatient.age} yrs`,
      isBold: true
    });
  }

  const gender = currentPatient?.gender && currentPatient.gender !== 'Other' ? currentPatient.gender : (currentPatient?.gender || '');
  const blood = currentPatient?.bloodGroup && currentPatient.bloodGroup !== 'Unknown' ? currentPatient.bloodGroup : '';
  if (gender && blood) {
    enteredDetails.push({
      key: 'gender-blood',
      label: 'Gender & Blood',
      value: `${gender} • ${blood}`,
      isBold: true
    });
  } else if (gender) {
    enteredDetails.push({
      key: 'gender',
      label: 'Gender',
      value: gender,
      isBold: true
    });
  } else if (blood) {
    enteredDetails.push({
      key: 'blood',
      label: 'Blood Group',
      value: blood,
      isBold: true
    });
  }

  if (currentPatient?.email && currentPatient.email.trim() && currentPatient.email !== '—') {
    enteredDetails.push({
      key: 'email',
      label: 'Email Address',
      value: currentPatient.email
    });
  }

  // Emergency contact: only show if explicitly entered with a real name (ignore placeholder fallbacks)
  const emName = currentPatient?.emergencyContact?.name?.trim();
  const emRelation = currentPatient?.emergencyContact?.relation?.trim();
  const emPhone = currentPatient?.emergencyContact?.phone?.trim();
  const isGenericEmName = !emName || emName === 'Family Contact' || emName === 'Relative' || emName === '—';

  if (!isGenericEmName) {
    enteredDetails.push({
      key: 'emergency',
      label: 'Emergency Contact',
      value: `${emName}${emRelation ? ` (${emRelation})` : ''}`,
      subValue: emPhone,
      isBold: true
    });
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      {/* Clean Navbar */}
      <nav className="bg-[#f8fafc] sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (selectedRecordDetail || selectedRecordForExplain) {
                  setSelectedRecordDetail(null);
                  setSelectedRecordForExplain(null);
                } else if (activeTab !== 'records') {
                  setActiveTab('records');
                } else if (onNavigateHome) {
                  onNavigateHome();
                }
              }}
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
                {(currentPatient?.name || 'Patient')
                  .split(' ')
                  .filter(Boolean)
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'PT'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-bold text-slate-900">{currentPatient?.name || 'Patient'}</div>
                <div className="text-[11px] text-slate-700 font-medium">ID: {currentPatient?.mediVaultId || currentPatient?.id || '—'}</div>
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
              Welcome, {currentPatient?.name || 'Patient'}
            </h1>
            <p className="text-xs text-slate-700 font-medium mt-1">
              Read-only medical records, active doctor prescriptions, and hospital privacy access permissions.
            </p>
          </div>
        </div>

        {/* Basic Patient Details Card (Only actual entered details) */}
        {enteredDetails.length > 0 && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-start gap-x-8 gap-y-3 text-xs">
            {enteredDetails.map((item) => (
              <div key={item.key} className="min-w-[120px]">
                <span className="text-[11px] font-semibold text-slate-500 block">{item.label}</span>
                {item.isBold ? (
                  <strong className="text-slate-900 font-bold block">{item.value}</strong>
                ) : (
                  <span className="text-slate-900 font-semibold truncate block">{item.value}</span>
                )}
                {item.subValue && (
                  <span className="text-[11px] text-slate-700 font-semibold block mt-0.5 font-mono">
                    {item.subValue}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
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

              <section className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Sparkles className="h-4 w-4 text-teal-700" />AI summary of your past records</h3>
                    <p className="mt-1 text-xs text-slate-600">Gemini creates a short summary from your completed consultations. Your record text is sent to Google Gemini when you request a summary.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAiSummary}
                    disabled={aiSummaryLoading || patientRecords.length === 0}
                    className="shrink-0 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {aiSummaryLoading ? 'Summarizing...' : aiSummary ? 'Refresh summary' : 'Summarize my records'}
                  </button>
                </div>
                {aiSummaryError && <p role="alert" className="text-xs font-medium text-rose-700">{aiSummaryError}</p>}
                {aiSummary && <div className="rounded-xl border border-teal-100 bg-white p-3 text-sm text-slate-800"><SummaryPointsList text={aiSummary} /></div>}
                {patientRecords.length === 0 && <p className="text-xs text-slate-500">A summary will be available after completed consultations are added to your chart.</p>}
                <p className="text-[11px] text-slate-500">Informational only; AI summaries can be incomplete or inaccurate. Ask your clinician about medical decisions.</p>
              </section>

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
              <p className="text-xs text-slate-500">Review your appointments and control which hospitals and care teams can view your medical records.</p>
              <section className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900">Appointments and hospital care</h3>
                  <span className="text-xs font-semibold text-slate-600">{patientAppointments.length} appointment{patientAppointments.length === 1 ? '' : 's'}</span>
                </div>
                {patientAppointments.length === 0 ? (
                  <p className="py-3 text-center text-xs text-slate-500">No appointments or hospital visits are linked to your profile yet.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {patientAppointments.map((visit) => {
                      const status = visit.status || visit.rawStatus || 'Scheduled';
                      const dateValue = visit.appointmentDate || visit.checkInTime;
                      const dateText = dateValue ? new Date(dateValue).toLocaleDateString() : 'Date not set';
                      const doctors = visit.assignedDoctors?.length ? visit.assignedDoctors.map((doctor) => doctor.name || doctor).join(', ') : (visit.assignedDoctorName && visit.assignedDoctorName !== 'Attending Physician' ? visit.assignedDoctorName : 'Doctor not assigned yet');
                      return (
                        <article key={visit.id || visit._id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 font-bold text-slate-900"><Building2 className="h-4 w-4 text-teal-700" />{visit.hospitalName || visit.hospital?.name || 'Hospital'}</div>
                            <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">{status}</span>
                          </div>
                          <div className="text-xs text-slate-600"><span className="font-semibold">Doctor:</span> {doctors}</div>
                          <div className="text-xs text-slate-600"><span className="font-semibold">Appointment:</span> {dateText}{visit.appointmentTime ? ` at ${visit.appointmentTime}` : ''}</div>
                          {visit.reasonForVisit && <div className="text-xs text-slate-600"><span className="font-semibold">Reason:</span> {visit.reasonForVisit}</div>}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {patientConsents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-medium">
                No hospital access requests or permissions recorded for your profile.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {patientConsents.map((c) => {
                  const hospitalTitle = c.hospitalName || c.requestingHospitalName || c.hospital?.name || (typeof c.hospital === 'string' ? c.hospital : 'Medical Facility');
                  const docTitle = c.doctorName || c.requestingDoctorName || c.doctor?.name || (typeof c.doctor === 'string' ? c.doctor : 'Attending Physician');
                  const isConsentActive = c.status === 'Active' || c.status === 'APPROVED_ACTIVE' || c.rawStatus === 'approved';
                  const isConsentPending = c.status === 'Pending' || c.status === 'PENDING' || c.rawStatus === 'pending';
                  const isConsentRevoked = c.status === 'Revoked' || c.status === 'REVOKED' || c.rawStatus === 'revoked';

                  const badgeClass = isConsentActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isConsentPending
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : isConsentRevoked
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200';

                  const displayLabel = isConsentActive
                    ? 'Active'
                    : isConsentPending
                    ? 'Pending'
                    : isConsentRevoked
                    ? 'Revoked'
                    : 'Expired';

                  return (
                    <div key={c.id || c._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-slate-900">{hospitalTitle}</strong>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                            {displayLabel}
                          </span>
                        </div>
                        <div className="text-slate-600">
                          <span className="text-slate-500">Doctor:</span>{' '}
                          <strong className="text-slate-800 font-semibold">{docTitle}</strong>
                        </div>
                        {c.purpose && (
                          <div className="text-slate-600">
                            <span className="text-slate-500">Purpose:</span>{' '}
                            <span className="text-slate-700">{c.purpose}</span>
                          </div>
                        )}
                        {(c.grantedDate || c.grantedAt || c.createdAt) && (
                          <div className="text-slate-600">
                            <span className="text-slate-500">{isConsentActive ? 'Granted:' : 'Date:'}</span>{' '}
                            <span className="text-slate-700">{c.grantedDate || new Date(c.grantedAt || c.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isConsentActive && (
                          <button
                            type="button"
                            onClick={() => handleRevokeConsent(c.id || c._id)}
                            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 font-bold text-xs border border-rose-200 transition-colors shadow-xs"
                          >
                            Revoke Access
                          </button>
                        )}
                        {isConsentPending && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRespondConsent(c.id || c._id, true)}
                              className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors shadow-xs"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRespondConsent(c.id || c._id, false)}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors shadow-xs"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
