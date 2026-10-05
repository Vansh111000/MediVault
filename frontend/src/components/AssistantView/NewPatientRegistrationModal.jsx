import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, X, Building2, CheckCircle2, ShieldAlert } from 'lucide-react';

export const NewPatientRegistrationModal = ({ isOpen, onClose, onRegistered }) => {
  const { currentHospital, registerPatient, showToast } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    address: '',
    allergens: '',
    chronicConditions: '',
    bp: '120/80 mmHg',
    heartRate: '72 bpm',
    emergencyName: '',
    emergencyPhone: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('Missing Fields', 'Please provide at least full name and phone number.', 'error');
      return;
    }

    const allergies = formData.allergens.trim()
      ? formData.allergens.split(',').map(a => ({ allergen: a.trim(), severity: 'Moderate', identified: new Date().toISOString().split('T')[0] }))
      : [];

    const conditions = formData.chronicConditions.trim()
      ? formData.chronicConditions.split(',').map(c => ({ condition: c.trim(), diagnosedDate: new Date().toISOString().split('T')[0], status: 'Active' }))
      : [];

    const newPat = registerPatient({
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      allergies,
      chronicConditions: conditions,
      vitals: {
        bp: formData.bp,
        heartRate: formData.heartRate,
        spO2: '98%',
        weight: '70 kg',
        height: '172 cm',
        bmi: '23.6',
        bloodGlucose: '95 mg/dL'
      },
      emergencyContact: {
        name: formData.emergencyName || 'Primary Relative',
        relation: 'Relative',
        phone: formData.emergencyPhone || formData.phone
      }
    });

    if (onRegistered) onRegistered(newPat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl p-6 sm:p-8 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Create New Patient Account</h3>
              <p className="text-xs text-slate-400">
                Register first-time hospital visitor & generate federated MediVault ID at {currentHospital.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jonathan Brand"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Mobile Contact Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
                placeholder="35"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          {/* Known Allergies & Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Known Drug Allergies (Comma separated)</label>
              <input
                type="text"
                value={formData.allergens}
                onChange={e => setFormData({ ...formData, allergens: e.target.value })}
                placeholder="e.g. Penicillin, Sulfa"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Chronic Conditions (Comma separated)</label>
              <input
                type="text"
                value={formData.chronicConditions}
                onChange={e => setFormData({ ...formData, chronicConditions: e.target.value })}
                placeholder="e.g. Hypertension, Asthma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Vitals Intake */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Triage Blood Pressure</label>
              <input
                type="text"
                value={formData.bp}
                onChange={e => setFormData({ ...formData, bp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Pulse / Heart Rate</label>
              <input
                type="text"
                value={formData.heartRate}
                onChange={e => setFormData({ ...formData, heartRate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Emergency Contact Name</label>
              <input
                type="text"
                value={formData.emergencyName}
                onChange={e => setFormData({ ...formData, emergencyName: e.target.value })}
                placeholder="e.g. Sarah Brand (Spouse)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Emergency Phone</label>
              <input
                type="text"
                value={formData.emergencyPhone}
                onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="+1 (555) 999-8877"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Cryptographic keys & MediVault ID will be auto-generated.
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
                <span>Create & Register Patient</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
