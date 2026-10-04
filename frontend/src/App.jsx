import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPageView } from './components/LandingPage/LandingPageView';
import { AuthPage } from './components/Auth/AuthPage';
import { PatientDashboard } from './components/PatientView/PatientDashboard';
import MediVaultDoctorPage from './components/DoctorView/MediVaultDoctorPage';
import { ReceptionistDashboard } from './components/ReceptionistView/ReceptionistDashboard';
import { ToastContainer } from './components/Shared/ToastContainer';

const MainLayout = () => {
  const { switchRole } = useApp();
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'auth', 'doctor', 'patient', 'receptionist'
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setCurrentView('auth');
  };

  const handleNavigateToPortal = () => {
    switchRole('patient');
    setCurrentView('patient');
  };

  const handleNavigateToDoctor = () => {
    switchRole('doctor');
    setCurrentView('doctor');
  };

  const handleNavigateToReceptionist = () => {
    switchRole('assistant');
    setCurrentView('receptionist');
  };

  const handleNavigateHome = () => {
    setCurrentView('landing');
  };

  const handleAuthSuccess = (role) => {
    if (role === 'doctor') {
      setCurrentView('doctor');
    } else if (role === 'receptionist') {
      setCurrentView('receptionist');
    } else {
      setCurrentView('patient');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-teal-600 selection:text-white">
      {/* 1. Landing View */}
      {currentView === 'landing' && (
        <LandingPageView
          onOpenAuth={handleOpenAuth}
          onNavigateToDoctor={handleNavigateToDoctor}
          onNavigateToAssistant={handleNavigateToReceptionist}
          onNavigateToPortal={handleNavigateToPortal}
        />
      )}

      {/* 2. Sign In / Sign Up Auth Page */}
      {currentView === 'auth' && (
        <AuthPage
          initialMode={authMode}
          onBack={handleNavigateHome}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* 3. Doctor Page (Preserved MediVault Main Doctor Page) */}
      {currentView === 'doctor' && (
        <MediVaultDoctorPage
          onNavigateToLanding={handleNavigateHome}
          onOpenAuth={handleOpenAuth}
          onNavigateToPatient={handleNavigateToPortal}
          onNavigateToReceptionist={handleNavigateToReceptionist}
        />
      )}

      {/* 4. Patient Portal (Read-only view) */}
      {currentView === 'patient' && (
        <PatientDashboard
          onLogout={handleNavigateHome}
          onNavigateToDoctor={handleNavigateToDoctor}
        />
      )}

      {/* 5. Receptionist / Frontdesk Administrator View */}
      {currentView === 'receptionist' && (
        <ReceptionistDashboard
          onNavigateHome={handleNavigateHome}
        />
      )}

      {/* Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
