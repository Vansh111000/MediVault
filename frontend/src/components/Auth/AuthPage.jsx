import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HOSPITALS } from '../../data/mockData';
import { Shield, ArrowLeft, User, Stethoscope, ClipboardList, CheckCircle2, Lock, Mail, Phone, Calendar, Heart, Building2 } from 'lucide-react';
import { Footer } from '../Shared/Footer';

export const AuthPage = ({ initialMode = 'login', onBack, onAuthSuccess }) => {
  const { switchRole, registerPatient, doctors, patients, showToast } = useApp();

  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [selectedRole, setSelectedRole] = useState('patient'); // 'patient', 'doctor', 'receptionist'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(HOSPITALS[0].name);
  const [doctorSpecialty, setDoctorSpecialty] = useState('General Medicine & Surgery');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === 'signup') {
      if (!name) {
        showToast('Error', 'Please enter your name', 'error');
        return;
      }

      if (selectedRole === 'patient') {
        const newPatient = registerPatient({
          name,
          age: parseInt(age, 10) || 28,
          gender,
          bloodGroup,
          phone: phone || '+1 (555) 234-5678',
          email: email || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          chronicConditions: medicalHistory ? medicalHistory.split(',').map(c => c.trim()) : ['None recorded']
        });
        switchRole('patient');
        showToast('Welcome to MediVault', `Account created successfully for ${name}!`, 'success');
        onAuthSuccess('patient');
      } else if (selectedRole === 'doctor') {
        switchRole('doctor');
        showToast('Doctor Profile Active', `Welcome Dr. ${name}, affiliated with ${selectedHospital}!`, 'success');
        onAuthSuccess('doctor');
      } else {
        switchRole('assistant');
        showToast('Receptionist Desk Active', `Welcome ${name} at ${selectedHospital}!`, 'success');
        onAuthSuccess('receptionist');
      }
    } else {
      // Login mode
      if (selectedRole === 'doctor') {
        switchRole('doctor');
        showToast('Signed In', `Welcome back, ${doctors[0]?.name || 'Doctor'}!`, 'success');
        onAuthSuccess('doctor');
      } else if (selectedRole === 'receptionist') {
        switchRole('assistant');
        showToast('Signed In', 'Welcome back to Hospital Frontdesk / Reception!', 'success');
        onAuthSuccess('receptionist');
      } else {
        switchRole('patient');
        showToast('Signed In', `Welcome back, ${patients[0]?.name || 'Patient'}!`, 'success');
        onAuthSuccess('patient');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between font-sans">
      {/* Top Header with Back Button */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-slate-900">MediVault</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-teal-950/5 p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {mode === 'login' ? 'Sign In to MediVault' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'login'
                ? 'Select your role to access your dedicated workspace'
                : 'Enter your details to register on the platform'}
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Select Role</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('patient')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                  selectedRole === 'patient'
                    ? 'border-teal-700 bg-slate-100 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <User className="w-5 h-5 mb-1 text-teal-700" />
                <span>Patient</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('doctor')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                  selectedRole === 'doctor'
                    ? 'border-teal-700 bg-slate-100 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <Stethoscope className="w-5 h-5 mb-1 text-teal-700" />
                <span>Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('receptionist')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                  selectedRole === 'receptionist'
                    ? 'border-teal-700 bg-slate-100 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <ClipboardList className="w-5 h-5 mb-1 text-teal-700" />
                <span>Receptionist</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'doctor' ? 'Dr. Sarah Sharma' : 'e.g. Aarav Mehta'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {selectedRole === 'doctor' ? 'Doctor ID or Email' : selectedRole === 'receptionist' ? 'Staff ID or Email' : 'Email or Patient ID'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    selectedRole === 'doctor'
                      ? 'dr.sharma@medivault.com'
                      : selectedRole === 'receptionist'
                      ? 'reception@citycare.com'
                      : 'aarav.mehta@gmail.com'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 transition-colors"
                />
              </div>
            </div>

            {/* Hospital Selection for Doctor & Receptionist */}
            {mode === 'signup' && (selectedRole === 'doctor' || selectedRole === 'receptionist') && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Hospital / Medical Institution * ({HOSPITALS.length} Available)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-semibold focus:outline-none focus:border-teal-700 transition-colors"
                  >
                    {HOSPITALS.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name} • {h.location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {mode === 'signup' && selectedRole === 'patient' && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="34"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
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
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
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
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-teal-950/10 flex items-center justify-center gap-2 mt-2"
            >
              <span>{mode === 'login' ? `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}` : 'Create Account & Proceed'}</span>
            </button>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="text-center pt-2 border-t border-slate-100">
            {mode === 'login' ? (
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-bold text-teal-700 hover:underline"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-teal-700 hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <Footer />
    </div>
  );
};
