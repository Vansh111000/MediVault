import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  ArrowLeft,
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  Building2,
  Stethoscope,
  Phone,
  Mail,
  Edit,
  Activity,
  Save,
  LogOut,
  KeyRound,
  Printer,
  X,
  Plus,
  UserCheck,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Footer } from '../Shared/Footer';

export const ReceptionistDashboard = ({ onNavigateHome }) => {
  const {
    patients,
    doctors,
    activeVisits,
    currentHospital,
    registerPatient,
    checkInPatient,
    assignDoctorToVisit,
    removeDoctorFromVisit,
    lookupPatientByExactMediVaultId,
    addPatientToHospitalDirectory,
    updatePatientProfile,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('list'); // 'list', 'register', 'lookup', 'patient-detail'
  const [selectedPatient, setSelectedPatient] = useState(patients[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exact MediVault ID Lookup State
  const [exactLookupId, setExactLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isAddingToDirectory, setIsAddingToDirectory] = useState(false);

  // New Patient Slip Modal State
  const [registrationSlip, setRegistrationSlip] = useState(null);

  // New Patient Form State
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState('Male');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBloodGroup, setNewBloodGroup] = useState('O+');
  const [newHistory, setNewHistory] = useState('');
  const [newAllergies, setNewAllergies] = useState('');
  const [assignedDoctorId, setAssignedDoctorId] = useState(doctors[0]?.id || doctors[0]?._id || '');
  const [visitReason, setVisitReason] = useState('General Consultation');

  // Visit creation for selected patient
  const [newVisitReason, setNewVisitReason] = useState('General Consultation');
  const [newVisitPriority, setNewVisitPriority] = useState('Routine');
  const [selectedDoctorIds, setSelectedDoctorIds] = useState(doctors[0] ? [doctors[0].id || doctors[0]._id] : []);
  const [additionalDoctorMap, setAdditionalDoctorMap] = useState({});
  const [isCreatingVisit, setIsCreatingVisit] = useState(false);

  // Edit Patient State
  const [isEditing, setIsEditing] = useState(false);
  const [editBp, setEditBp] = useState('120/80 mmHg');
  const [editPulse, setEditPulse] = useState('72 bpm');
  const [editNotes, setEditNotes] = useState('');

  const filteredPatients = patients.filter((p) =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.mediVaultId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.phone || '').includes(searchQuery)
  );

  const handleExactLookup = async (e) => {
    e?.preventDefault();
    if (!exactLookupId.trim()) {
      showToast('Validation Error', 'Please enter an exact MediVault ID (e.g. MV-XXXXX)', 'error');
      return;
    }
    setIsLookingUp(true);
    setLookupResult(null);
    try {
      const data = await lookupPatientByExactMediVaultId(exactLookupId.trim());
      setLookupResult(data);
    } catch (err) {
      // Handled in toast
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAddExistingToDirectory = async () => {
    if (!lookupResult?.patient?._id) return;
    setIsAddingToDirectory(true);
    try {
      const added = await addPatientToHospitalDirectory({
        patientId: lookupResult.patient._id,
        mediVaultId: lookupResult.patient.mediVaultId
      });
      setSelectedPatient(added);
      setActiveTab('patient-detail');
      setLookupResult(null);
      setExactLookupId('');
    } catch (err) {
      // Handled in toast
    } finally {
      setIsAddingToDirectory(false);
    }
  };

  const handleStartNewVisit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (selectedDoctorIds.length === 0) {
      showToast('Validation Error', 'Please select at least one attending doctor', 'error');
      return;
    }
    setIsCreatingVisit(true);
    try {
      const visit = await checkInPatient({
        patientId: selectedPatient.id || selectedPatient._id,
        assignedDoctorIds: selectedDoctorIds,
        doctorId: selectedDoctorIds[0],
        reason: newVisitReason,
        priority: newVisitPriority,
        triageVitals: {
          bp: editBp,
          pulse: editPulse
        }
      });
      showToast('Visit Created', `Token ${visit.tokenNumber} issued with ${selectedDoctorIds.length} doctor(s) assigned.`, 'success');
      setNewVisitReason('General Consultation');
    } catch (err) {
      // Handled in toast
    } finally {
      setIsCreatingVisit(false);
    }
  };

  const handleAddDoctorToOngoingVisit = async (visitId) => {
    const docId = additionalDoctorMap[visitId];
    if (!docId) {
      showToast('Validation Error', 'Please select a doctor to assign', 'error');
      return;
    }
    try {
      await assignDoctorToVisit(visitId, docId);
      setAdditionalDoctorMap(prev => ({ ...prev, [visitId]: '' }));
    } catch (e) {
      // Handled
    }
  };

  const handleRemoveDoctorFromOngoingVisit = async (visitId, doctorId) => {
    try {
      await removeDoctorFromVisit(visitId, doctorId);
    } catch (e) {
      // Handled
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!newName || !newPhone) {
      showToast('Validation Error', 'Patient name and phone number are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await registerPatient({
        name: newName,
        age: parseInt(newAge, 10) || 30,
        gender: newGender,
        phone: newPhone,
        email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@medivault.io`,
        bloodGroup: newBloodGroup,
        chronicConditions: newHistory ? [newHistory] : [],
        allergies: newAllergies ? [{ allergen: newAllergies, reaction: 'Moderate', severity: 'Mild' }] : []
      });

      let tokenNumber = 'R-101';
      let doctorName = 'Attending Doctor';

      if (assignedDoctorId && created) {
        const visit = await checkInPatient({
          patientId: created.id || created._id,
          doctorId: assignedDoctorId,
          priority: 'Routine',
          reason: visitReason
        });
        if (visit?.tokenNumber) tokenNumber = visit.tokenNumber;
        const doc = doctors.find((d) => d.id === assignedDoctorId || d._id === assignedDoctorId);
        if (doc) doctorName = doc.name;
      }

      // Show the Patient Account Slip modal so receptionist can print or read code to patient
      setRegistrationSlip({
        name: created.name,
        mediVaultId: created.mediVaultId,
        activationCode: created.activationCode,
        phone: created.phone,
        doctorName,
        tokenNumber
      });

      // Reset Form
      setNewName('');
      setNewAge('');
      setNewPhone('');
      setNewEmail('');
      setNewHistory('');
      setNewAllergies('');
      setSelectedPatient(created);
    } catch (err) {
      // Toast already shown
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setEditBp(patient.vitals?.bp || '120/80 mmHg');
    setEditPulse(patient.vitals?.heartRate || '72 bpm');
    setIsEditing(false);
    setActiveTab('patient-detail');
  };

  const handleSavePatientUpdates = async () => {
    if (!selectedPatient) return;
    try {
      await updatePatientProfile(selectedPatient.id || selectedPatient._id, {
        vitals: {
          ...selectedPatient.vitals,
          bp: editBp,
          heartRate: editPulse
        }
      });
      setIsEditing(false);
    } catch (e) {
      // Handled
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-[#f8fafc] sticky top-0 z-40 border-b border-slate-200/80">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateHome}
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
                <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">
                  RECEPTIONIST & ADMISSIONS DESK
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-teal-700" />
              <span>{currentHospital.name}</span>
            </div>

            <button
              onClick={() => setActiveTab('register')}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New Patient</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors ml-2 py-1 px-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="w-full px-4 sm:px-6 lg:px-10 pt-8 space-y-6 flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Patients ({patients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Patient</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('lookup');
                setLookupResult(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'lookup'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Lookup by MediVault ID</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ALL PATIENTS LIST */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Hospital Patient Directory</h2>
                <p className="text-xs text-slate-700 font-medium">
                  Search permanent MediVault identities or register new clinic encounters.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient by MediVault ID, name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-500 font-medium focus:outline-none focus:border-teal-700"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 text-slate-800 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Patient Name</th>
                    <th className="p-3">MediVault ID</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Blood Group</th>
                    <th className="p-3">Account Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((p) => (
                    <tr
                      key={p.id || p._id}
                      onClick={() => handleSelectPatient(p)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-extrabold flex items-center justify-center text-xs">
                            {(p.name || 'P')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <strong className="text-slate-900 block font-bold">{p.name}</strong>
                            <span className="text-[11px] text-slate-700 font-medium">
                              {p.age} yrs • {p.gender}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-mono font-bold text-teal-800">
                        {p.mediVaultId || p.id}
                      </td>

                      <td className="p-3 text-slate-800">
                        <div className="font-semibold text-slate-900">{p.phone}</div>
                        <div className="text-[11px] text-slate-600 font-medium">{p.email}</div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200">
                          {p.bloodGroup || 'O+'}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            p.isClaimed
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {p.isClaimed ? 'Activated' : 'Unclaimed'}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          type="button"
                          className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-800 font-bold text-[11px] transition-colors"
                        >
                          View File
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        No matching patients found in MediVault directory.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER NEW PATIENT */}
        {activeTab === 'register' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Patient Identity Registration</h2>
              <p className="text-xs text-slate-600 mt-1">
                Authorized frontdesk issuance of permanent MediVault ID and initial unclaimed verification slip.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="32"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={newBloodGroup}
                    onChange={(e) => setNewBloodGroup(e.target.value)}
                    className="w-full px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  >
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Known Medical History / Chronic Conditions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mild Asthma, Hypertension"
                    value={newHistory}
                    onChange={(e) => setNewHistory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Known Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Peanuts"
                    value={newAllergies}
                    onChange={(e) => setNewAllergies(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Assign Doctor Section */}
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-700" />
                  <span>Immediate Check-In & Doctor Assignment</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Consulting Doctor
                    </label>
                    <select
                      value={assignedDoctorId}
                      onChange={(e) => setAssignedDoctorId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-700 font-semibold"
                    >
                      {doctors.map((d) => (
                        <option key={d.id || d._id} value={d.id || d._id}>
                          {d.name} ({d.specialty})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Reason for Visit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Health Checkup, Fever, Consultation"
                      value={visitReason}
                      onChange={(e) => setVisitReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-700 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-teal-950/10 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : 'Register Permanent Identity'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2.5: EXACT MEDIVAULT ID LOOKUP */}
        {activeTab === 'lookup' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Exact MediVault ID Lookup</h2>
              <p className="text-xs text-slate-600 mt-1">
                Lookup an existing patient across the MediVault network using their unique permanent MediVault ID.
                Add returning patients to your local hospital directory without creating duplicate identities.
              </p>
            </div>

            <form onSubmit={handleExactLookup} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. MV-2025-1001 or MV-2026-0001"
                  value={exactLookupId}
                  onChange={(e) => setExactLookupId(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-700"
                />
              </div>
              <button
                type="submit"
                disabled={isLookingUp}
                className="bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>{isLookingUp ? 'Searching...' : 'Search Patient'}</span>
              </button>
            </form>

            {lookupResult && (
              <div className="p-5 rounded-2xl border border-teal-200/80 bg-teal-50/40 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-teal-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-700 text-white font-extrabold flex items-center justify-center text-sm">
                      {(lookupResult.patient.name || 'P')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{lookupResult.patient.name}</h3>
                      <p className="text-xs text-slate-600">
                        Permanent ID: <span className="font-mono font-bold text-teal-800">{lookupResult.patient.mediVaultId}</span>
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      lookupResult.alreadyInDirectory
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {lookupResult.alreadyInDirectory ? 'In Hospital Directory' : 'External Global Patient'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Contact Phone</span>
                    <strong className="text-slate-800">{lookupResult.patient.phone || 'Protected'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Demographics</span>
                    <strong className="text-slate-800">
                      {lookupResult.patient.age ? `${lookupResult.patient.age} yrs` : '—'} • {lookupResult.patient.gender || '—'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Global Identity</span>
                    <strong className="text-slate-800">Single Verified Account</strong>
                  </div>
                </div>

                {lookupResult.alreadyInDirectory ? (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSelectPatient(lookupResult.patient)}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Open Patient File</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 space-y-3">
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        This patient belongs to the global MediVault network. Adding them to {currentHospital.name} will create a local hospital directory link without duplicating their permanent medical identity.
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddExistingToDirectory}
                        disabled={isAddingToDirectory}
                        className="bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{isAddingToDirectory ? 'Adding to Directory...' : 'Add Patient to Hospital Directory'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PATIENT DETAIL & TRIAGE VITALS */}
        {activeTab === 'patient-detail' && selectedPatient && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white font-black text-lg flex items-center justify-center">
                    {(selectedPatient.name || 'P')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{selectedPatient.name}</h2>
                    <p className="text-xs text-slate-500">
                      ID: {selectedPatient.mediVaultId || selectedPatient.id} • {selectedPatient.age} yrs •{' '}
                      {selectedPatient.gender}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('list')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Directory</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Cancel Edit' : 'Edit Triage Vitals'}</span>
                  </button>
                </div>
              </div>

              {/* Vitals and Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Contact Information</span>
                  <div className="text-xs font-bold text-slate-900">{selectedPatient.phone}</div>
                  <div className="text-[11px] text-slate-500">{selectedPatient.email}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Medical Summary</span>
                  <div className="text-xs font-semibold text-slate-900">
                    Blood Group: <strong>{selectedPatient.bloodGroup || 'O+'}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Allergies: {selectedPatient.allergies?.[0]?.allergen || 'None recorded'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Current Vitals</span>
                  <div className="text-xs font-semibold text-slate-900">
                    BP: {selectedPatient.vitals?.bp || editBp} | Pulse: {selectedPatient.vitals?.heartRate || editPulse}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Account: {selectedPatient.isClaimed ? 'Activated Patient Account' : 'Unclaimed Account'}
                  </div>
                </div>
              </div>

              {/* Editable Frontdesk Vitals Section */}
              {isEditing && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-teal-700" />
                    <span>Update Triage Vitals (Reception Check-in Desk)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Blood Pressure
                      </label>
                      <input
                        type="text"
                        value={editBp}
                        onChange={(e) => setEditBp(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Pulse / Heart Rate
                      </label>
                      <input
                        type="text"
                        value={editPulse}
                        onChange={(e) => setEditPulse(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Reception Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Patient checked in on schedule"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={handleSavePatientUpdates}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Record Changes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ENCOUNTERS & MULTI-DOCTOR ASSIGNMENTS */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-700" />
                  <span>Hospital Encounters & Multiple Doctor Assignments</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Check-in patient for a new encounter with one or more doctors, or manage doctor assignments for ongoing visits.
                </p>
              </div>

              {/* Form: Start New Encounter with Multiple Doctors */}
              <form onSubmit={handleStartNewVisit} className="p-5 rounded-2xl bg-teal-50/40 border border-teal-200/70 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-teal-700" />
                    <span>Create New Encounter / Check-In</span>
                  </span>
                  <span className="text-[11px] font-semibold text-teal-800">
                    {selectedDoctorIds.length} Doctor(s) Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Reason for Visit</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chest pain evaluation, Routine follow-up"
                      value={newVisitReason}
                      onChange={(e) => setNewVisitReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-700 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Triage Priority</label>
                    <select
                      value={newVisitPriority}
                      onChange={(e) => setNewVisitPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-700 font-semibold"
                    >
                      <option value="Routine">Routine (Regular OPD)</option>
                      <option value="Urgent">Urgent (Priority attention)</option>
                      <option value="Emergency">Emergency (Immediate)</option>
                    </select>
                  </div>
                </div>

                {/* Multi-Doctor Selection */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    Select Attending Doctor(s) <span className="text-teal-700 font-normal">(Multiple doctors can be assigned to the same visit)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {doctors.map((doc) => {
                      const docId = doc.id || doc._id;
                      const isSelected = selectedDoctorIds.includes(docId);
                      return (
                        <label
                          key={docId}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDoctorIds(prev => [...prev, docId]);
                              } else {
                                setSelectedDoctorIds(prev => prev.filter(id => id !== docId));
                              }
                            }}
                            className="w-4 h-4 rounded text-teal-700 focus:ring-teal-500"
                          />
                          <div className="text-xs min-w-0">
                            <span className="font-bold block truncate">{doc.name}</span>
                            <span className={`text-[10px] block truncate ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                              {doc.specialty || 'General Physician'}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isCreatingVisit || selectedDoctorIds.length === 0}
                    className="bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isCreatingVisit ? 'Checking in...' : 'Check-In & Issue Token'}</span>
                  </button>
                </div>
              </form>

              {/* Existing Encounters List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Active & Recent Hospital Encounters
                </h4>

                {(() => {
                  const patientVisits = (activeVisits || []).filter(
                    (v) =>
                      v.patientId === selectedPatient.id ||
                      v.patientId === selectedPatient._id ||
                      v.patient?._id === selectedPatient._id ||
                      v.patient?.mediVaultId === selectedPatient.mediVaultId
                  );

                  if (patientVisits.length === 0) {
                    return (
                      <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-2xl">
                        No hospital encounters recorded yet for this patient at {currentHospital.name}.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {patientVisits.map((visit) => {
                        const visitId = visit.id || visit._id;
                        const assignedDocs = visit.assignedDoctors || (visit.doctorId ? [doctors.find(d => (d.id || d._id) === visit.doctorId) || { name: 'Assigned Doctor', id: visit.doctorId }] : []);
                        
                        return (
                          <div key={visitId} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg bg-teal-700 text-white font-mono font-bold text-xs">
                                  Token {visit.tokenNumber || '—'}
                                </span>
                                <span className="text-xs font-bold text-slate-900">{visit.reason}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                                  {visit.priority || 'Routine'}
                                </span>
                              </div>
                              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{visit.checkInTime || 'Today'} • Status: <strong>{visit.status || 'Waiting'}</strong></span>
                              </span>
                            </div>

                            {/* Assigned Doctors */}
                            <div className="pt-2 border-t border-slate-200/70 space-y-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                Assigned Attending Doctors ({assignedDocs.length})
                              </span>
                              
                              <div className="flex flex-wrap gap-2 items-center">
                                {assignedDocs.map((docItem, idx) => {
                                  const docObj = docItem.doctor || docItem;
                                  const docId = docObj._id || docObj.id || docObj;
                                  const docName = docObj.name || (doctors.find(d => (d.id || d._id) === docId)?.name) || 'Attending Doctor';
                                  const status = docItem.consultationStatus || 'assigned';

                                  return (
                                    <div
                                      key={idx}
                                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs"
                                    >
                                      <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                                      <span className="font-bold">{docName}</span>
                                      <span className="text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-semibold">
                                        {status}
                                      </span>
                                      <button
                                        type="button"
                                        title="Safely remove doctor if no consultation note recorded"
                                        onClick={() => handleRemoveDoctorFromOngoingVisit(visitId, docId)}
                                        className="ml-1 text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Inline Add Doctor to Ongoing Visit */}
                              <div className="flex items-center gap-2 pt-1">
                                <select
                                  value={additionalDoctorMap[visitId] || ''}
                                  onChange={(e) => setAdditionalDoctorMap(prev => ({ ...prev, [visitId]: e.target.value }))}
                                  className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 font-medium focus:outline-none focus:border-teal-700"
                                >
                                  <option value="">-- Add another doctor to this visit --</option>
                                  {doctors.map(d => {
                                    const dId = d.id || d._id;
                                    return (
                                      <option key={dId} value={dId}>
                                        {d.name} ({d.specialty || 'General'})
                                      </option>
                                    );
                                  })}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleAddDoctorToOngoingVisit(visitId)}
                                  className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Assign</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* REGISTRATION CONFIRMATION SLIP MODAL */}
      {registrationSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                </div>
                <span className="font-bold text-slate-900 text-sm">Patient Registration Slip</span>
              </div>
              <button
                onClick={() => setRegistrationSlip(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-dashed border-teal-600/40 rounded-2xl p-5 space-y-3 font-mono">
              <div className="text-center pb-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-base">{registrationSlip.name}</h3>
                <span className="text-[11px] text-slate-500">MediVault Health Identity</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Permanent ID:</span>
                  <strong className="text-teal-800 text-sm">{registrationSlip.mediVaultId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Activation Code:</span>
                  <strong className="text-amber-700 text-sm font-black bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {registrationSlip.activationCode}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Doctor:</span>
                  <span className="text-slate-900 font-semibold">{registrationSlip.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Queue Token:</span>
                  <strong className="text-slate-900">{registrationSlip.tokenNumber}</strong>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-200 leading-relaxed font-sans">
                Please hand this slip to the patient. They can securely activate their account at <strong>medivault.io</strong> using their <strong>MediVault ID</strong> and <strong>Activation Code</strong> (valid for 7 days).
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Slip</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegistrationSlip(null);
                  setActiveTab('list');
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
