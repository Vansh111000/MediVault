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
  X
} from 'lucide-react';
import { Footer } from '../Shared/Footer';

export const ReceptionistDashboard = ({ onNavigateHome }) => {
  const {
    patients,
    doctors,
    currentHospital,
    registerPatient,
    checkInPatient,
    updatePatientProfile,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('list'); // 'list', 'register', 'patient-detail'
  const [selectedPatient, setSelectedPatient] = useState(patients[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
