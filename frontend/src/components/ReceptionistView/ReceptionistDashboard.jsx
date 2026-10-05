import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  ArrowLeft,
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  FileText,
  Calendar,
  Building2,
  Stethoscope,
  Heart,
  Plus,
  Phone,
  Mail,
  Edit,
  Activity,
  Save,
  Clock,
  LogOut
} from 'lucide-react';
import { Footer } from '../Shared/Footer';

export const ReceptionistDashboard = ({ onNavigateHome }) => {
  const { patients, doctors, currentHospital, registerPatient, checkInPatient, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('list'); // 'list', 'register', 'patient-detail'
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // New Patient Form State
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState('Male');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBloodGroup, setNewBloodGroup] = useState('O+');
  const [newHistory, setNewHistory] = useState('');
  const [newAllergies, setNewAllergies] = useState('');
  const [assignedDoctorId, setAssignedDoctorId] = useState(doctors[0]?.id || '');
  const [visitReason, setVisitReason] = useState('General Consultation');

  // Edit Patient State
  const [isEditing, setIsEditing] = useState(false);
  const [editBp, setEditBp] = useState('120/80 mmHg');
  const [editPulse, setEditPulse] = useState('72 bpm');
  const [editNotes, setEditNotes] = useState('');

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mediVaultId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!newName) {
      showToast('Error', 'Patient name is required', 'error');
      return;
    }

    const created = registerPatient({
      name: newName,
      age: parseInt(newAge, 10) || 30,
      gender: newGender,
      phone: newPhone || '+1 (555) 123-4567',
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      bloodGroup: newBloodGroup,
      chronicConditions: newHistory ? [newHistory] : ['None recorded'],
      allergies: newAllergies ? [{ allergen: newAllergies, reaction: 'Moderate', severity: 'Mild' }] : []
    });

    if (assignedDoctorId) {
      checkInPatient({
        patientId: created.id,
        doctorId: assignedDoctorId,
        priority: 'Routine',
        reason: visitReason
      });
    }

    showToast('Success', `Registered ${newName} and assigned to Dr. ${doctors.find(d => d.id === assignedDoctorId)?.name || 'Doctor'}!`, 'success');

    // Reset Form
    setNewName('');
    setNewAge('');
    setNewPhone('');
    setNewEmail('');
    setNewHistory('');
    setNewAllergies('');
    setSelectedPatient(created);
    setActiveTab('list');
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setEditBp(patient.vitals?.bp || '120/80 mmHg');
    setEditPulse(patient.vitals?.heartRate || '72 bpm');
    setIsEditing(false);
    setActiveTab('patient-detail');
  };

  const handleSavePatientUpdates = () => {
    setIsEditing(false);
    showToast('Record Updated', `Vitals and notes updated for ${selectedPatient.name} with doctor's authorization.`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-[#f8fafc] sticky top-0 z-40">
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
                <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">RECEPTIONIST DESK</span>
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

            {/* Static Logout Button */}
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
                <p className="text-xs text-slate-700 font-medium">View and manage registered patients and assigned consultations.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient by name or ID..."
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
                    <th className="p-3">Patient ID</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Blood Group</th>
                    <th className="p-3">Registered Hospital</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => handleSelectPatient(p)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-extrabold flex items-center justify-center text-xs">
                            {p.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <strong className="text-slate-900 block font-bold">{p.name}</strong>
                            <span className="text-[11px] text-slate-700 font-medium">{p.age} yrs • {p.gender}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-slate-800 font-semibold">
                        {p.mediVaultId || p.id}
                      </td>

                      <td className="p-3 text-slate-800">
                        <div className="font-semibold text-slate-900">{p.phone}</div>
                        <div className="text-[11px] text-slate-600 font-medium">{p.email}</div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-extrabold text-slate-900 border border-slate-200">
                          {p.bloodGroup}
                        </span>
                      </td>

                      <td className="p-3 text-slate-800 font-medium">
                        {p.homeHospital || currentHospital.name}
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPatient(p);
                          }}
                          className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                        >
                          View & Edit Record
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER NEW PATIENT */}
        {activeTab === 'register' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Register New Patient</h2>
              <p className="text-xs text-slate-500 mt-0.5">Create a new MediVault electronic record and assign to an on-duty doctor.</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Age *</label>
                    <input
                      type="number"
                      required
                      placeholder="29"
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
                    <label className="text-xs font-bold text-slate-700 block mb-1">Blood</label>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 987-6543"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Known Medical History / Chronic Conditions</label>
                  <input
                    type="text"
                    placeholder="e.g. Mild Asthma, Hypertension"
                    value={newHistory}
                    onChange={(e) => setNewHistory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Peanuts"
                    value={newAllergies}
                    onChange={(e) => setNewAllergies(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Assign Doctor */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-700" />
                  <span>Assign Doctor & Create Consultation Token</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Consulting Doctor</label>
                    <select
                      value={assignedDoctorId}
                      onChange={(e) => setAssignedDoctorId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-700 font-semibold"
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.specialty})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Reason for Visit</label>
                    <input
                      type="text"
                      placeholder="e.g. Annual Checkup, Fever, Follow-up"
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
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-teal-950/10 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register & Assign Patient</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: PATIENT DETAIL & RECORD EDITOR */}
        {activeTab === 'patient-detail' && selectedPatient && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white font-black text-lg flex items-center justify-center">
                    {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{selectedPatient.name}</h2>
                    <p className="text-xs text-slate-500">ID: {selectedPatient.mediVaultId || selectedPatient.id} • {selectedPatient.age} yrs • {selectedPatient.gender}</p>
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
                    <span>{isEditing ? 'Cancel Edit' : 'Edit Patient Records'}</span>
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
                    Blood Group: <strong>{selectedPatient.bloodGroup}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Allergies: {selectedPatient.allergies?.[0]?.allergen || 'None recorded'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Home Hospital</span>
                  <div className="text-xs font-semibold text-slate-900">{selectedPatient.homeHospital || currentHospital.name}</div>
                  <div className="text-[11px] text-slate-500">Registered: {selectedPatient.registeredDate || '2026-01-15'}</div>
                </div>
              </div>

              {/* Editable Frontdesk Vitals Section */}
              {isEditing ? (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-teal-700" />
                    <span>Update Triage Vitals (Authorized with Doctor's Protocol)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Blood Pressure</label>
                      <input
                        type="text"
                        value={editBp}
                        onChange={(e) => setEditBp(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Pulse / Heart Rate</label>
                      <input
                        type="text"
                        value={editPulse}
                        onChange={(e) => setEditPulse(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Frontdesk Reception Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Patient checked in on time"
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
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Clean Footer */}
      <Footer />
    </div>
  );
};
