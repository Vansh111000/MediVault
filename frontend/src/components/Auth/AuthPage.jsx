import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  ArrowLeft,
  User,
  Stethoscope,
  ClipboardList,
  Lock,
  Mail,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Footer } from '../Shared/Footer';

export const AuthPage = ({ initialMode = 'login', onBack, onAuthSuccess }) => {
  const {
    login,
    registerStaff,
    claimPatientAccount,
    hospitals,
    showToast
  } = useApp();

  // Mode: 'login' | 'signup' (staff only) | 'claim' (patient account activation)
  const [mode, setMode] = useState(initialMode);
  const [selectedRole, setSelectedRole] = useState('patient'); // 'patient' | 'doctor' | 'assistant'
  const [loading, setLoading] = useState(false);

  // Preselect role from URL if present (?role=doctor|assistant|patient)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      if (roleParam) {
        const normalized = roleParam === 'receptionist' ? 'assistant' : roleParam;
        if (['doctor', 'assistant', 'patient'].includes(normalized)) {
          setSelectedRole(normalized);
        }
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0]?.id || hospitals[0]?._id || '');
  const [doctorSpecialty, setDoctorSpecialty] = useState('Cardiology & Attending Physician');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  // Patient Activation Form states
  const [mediVaultId, setMediVaultId] = useState('');
  const [activationCode, setActivationCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'claim') {
        // Patient Claim / Activation Flow
        if (!mediVaultId || !activationCode || !password) {
          showToast('Validation Error', 'MediVault ID, activation code and password are required', 'error');
          setLoading(false);
          return;
        }

        await claimPatientAccount({
          mediVaultId: mediVaultId.trim().toUpperCase(),
          activationCode: activationCode.trim(),
          password,
          email: email || undefined
        });

        onAuthSuccess('patient');
      } else if (mode === 'signup') {
        // Staff Registration Flow (Patients cannot self-register!)
        if (selectedRole === 'patient') {
          showToast(
            'Patient Notice',
            'Patients cannot self-register online. Please visit hospital reception or activate your issued MediVault ID.',
            'error'
          );
          setLoading(false);
          return;
        }

        if (!name || !email || !password) {
          showToast('Validation Error', 'Please complete all required fields', 'error');
          setLoading(false);
          return;
        }

        await registerStaff({
          name,
          email,
          password,
          role: selectedRole === 'receptionist' ? 'receptionist' : 'doctor',
          hospitalId: selectedHospitalId || hospitals[0]?.id || hospitals[0]?._id,
          specialty: selectedRole === 'doctor' ? doctorSpecialty : undefined,
          licenseNumber: selectedRole === 'doctor' ? licenseNumber || `MED-${Math.floor(10000 + Math.random() * 90000)}` : undefined,
          employeeId: selectedRole === 'receptionist' ? employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
          phone
        });

        onAuthSuccess(selectedRole);
      } else {
        // Login Flow (All roles)
        if (!email || !password) {
          showToast('Validation Error', 'Please enter your email or ID and password', 'error');
          setLoading(false);
          return;
        }

        const res = await login(email, password);
        onAuthSuccess(res.role || selectedRole);
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
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
              {mode === 'login'
                ? 'Sign In to MediVault'
                : mode === 'claim'
                ? 'Activate Patient Account'
                : 'Register Medical Staff'}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'login'
                ? 'Select your role to access your workspace'
                : mode === 'claim'
                ? 'Enter your clinic-issued MediVault ID and verification code'
                : 'Register an authorized hospital doctor or assistant profile'}
            </p>
          </div>

          {/* Role Selector Tabs (Only in login and staff signup mode) */}
          {mode !== 'claim' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Workspace Role</label>
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
                  onClick={() => setSelectedRole('assistant')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                    selectedRole === 'assistant' || selectedRole === 'receptionist'
                      ? 'border-teal-700 bg-slate-100 text-slate-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <ClipboardList className="w-5 h-5 mb-1 text-teal-700" />
                  <span>Assistant</span>
                </button>
              </div>
            </div>
          )}

          {/* Notice when Patient role is selected in Sign Up mode */}
          {mode === 'signup' && selectedRole === 'patient' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Patient Registration Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                To prevent duplicate identities and ensure verified medical ownership, <strong>patients cannot self-register online</strong>.
                Your permanent MediVault ID is issued in-person by an authorized hospital assistant.
              </p>
              <button
                type="button"
                onClick={() => setMode('claim')}
                className="w-full mt-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                I have a MediVault ID & Code → Activate Now
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CLAIM MODE: MediVault ID + Activation Code */}
            {mode === 'claim' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    MediVault Permanent ID *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. MV-20002"
                      value={mediVaultId}
                      onChange={(e) => setMediVaultId(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 uppercase font-mono font-bold focus:outline-none focus:border-teal-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Activation Code (From Clinic Slip) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. ACT-771920"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-teal-600 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {/* SIGNUP MODE: Full Name for Staff */}
            {mode === 'signup' && selectedRole !== 'patient' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'doctor' ? 'Dr. Sarah Sharma' : 'Staff Member Name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 transition-colors"
                />
              </div>
            )}

            {/* Email Field */}
            {!(mode === 'signup' && selectedRole === 'patient') && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {mode === 'login'
                    ? 'Email Address or MediVault ID'
                    : 'Account Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required={mode !== 'claim'}
                    placeholder={
                      selectedRole === 'doctor'
                        ? 'doctor@medivault.com'
                        : selectedRole === 'receptionist'
                        ? 'reception@medivault.com'
                        : 'patient@medivault.com or MV-10001'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Hospital Selection for Staff Signup */}
            {mode === 'signup' && selectedRole !== 'patient' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Affiliated Hospital ({hospitals.length} Available) *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={selectedHospitalId}
                      onChange={(e) => setSelectedHospitalId(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-semibold focus:outline-none focus:border-teal-700 transition-colors"
                    >
                      {hospitals.map((h) => (
                        <option key={h.id || h._id} value={h.id || h._id}>
                          {h.name} • {h.city || h.location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedRole === 'doctor' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Specialty *</label>
                    <input
                      type="text"
                      placeholder="e.g. Cardiology & Critical Care"
                      value={doctorSpecialty}
                      onChange={(e) => setDoctorSpecialty(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                )}
              </>
            )}

            {/* Password Field */}
            {!(mode === 'signup' && selectedRole === 'patient') && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {mode === 'claim' ? 'Create Secure Password *' : 'Password *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            {!(mode === 'signup' && selectedRole === 'patient') && (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-teal-950/10 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : mode === 'login' ? (
                  <span>Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
                ) : mode === 'claim' ? (
                  <span>Activate & Login Patient</span>
                ) : (
                  <span>Register {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Account</span>
                )}
              </button>
            )}
          </form>

          {/* Toggle between Sign In, Staff Sign Up, and Claim Account */}
          <div className="text-center pt-2 border-t border-slate-100 space-y-1.5">
            {mode === 'login' ? (
              <>
                <p className="text-xs text-slate-500">
                  New staff member?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setSelectedRole('doctor');
                    }}
                    className="font-bold text-teal-700 hover:underline"
                  >
                    Register Staff
                  </button>
                </p>
                <p className="text-xs text-slate-500">
                  Patient with hospital slip?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('claim')}
                    className="font-bold text-teal-700 hover:underline"
                  >
                    Activate Patient Account
                  </button>
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-500">
                Already have an activated account?{' '}
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

      <Footer />
    </div>
  );
};
