import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import React, { useState } from "react";

import { AppProvider } from "./context/AppContext";
import { LandingPageView } from "./components/LandingPage/LandingPageView";
import { AuthPage } from "./components/Auth/AuthPage";
import { PatientDashboard } from "./components/PatientView/PatientDashboard";
import { ReceptionistDashboard } from "./components/ReceptionistView/ReceptionistDashboard";
import { ToastContainer } from "./components/Shared/ToastContainer";

import DoctorLayout from "./layouts/DoctorLayout";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientWorkspace from "./pages/doctor/PatientWorkspace";
import MedicalRecordsTab from "./pages/doctor/patient-workspace/MedicalRecordsTab";
import ConsultationTab from "./pages/doctor/patient-workspace/ConsultationTab";
import MedicalRecords from "./pages/doctor/MedicalRecords";
import Consultations from "./pages/doctor/Consultations";
import Prescriptions from "./pages/doctor/Prescriptions";


const MainLayout = () => {
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState("login");

    const handleOpenAuth = (mode = "login", role = null) => {
        setAuthMode(mode);
        if (role) {
            navigate(`/login?role=${role}`);
        } else {
            navigate("/login");
        }
    };

    const handleNavigateToPortal = () => {
        navigate("/patient");
    };

    const handleNavigateToDoctor = () => {
        navigate("/doctor");
    };

    const handleNavigateToAssistant = () => {
        navigate("/assistant");
    };

    const handleNavigateHome = () => {
        navigate("/");
    };

    const handleAuthSuccess = (role) => {
        if (role === "doctor") {
            handleNavigateToDoctor();
        } else if (role === "receptionist" || role === "assistant") {
            handleNavigateToAssistant();
        } else {
            handleNavigateToPortal();
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-teal-600 selection:text-white">
            <Routes>
                <Route
                    path="/"
                    element={
                        <LandingPageView
                            onOpenAuth={handleOpenAuth}
                            onNavigateToDoctor={handleNavigateToDoctor}
                            onNavigateToAssistant={handleNavigateToAssistant}
                            onNavigateToPortal={handleNavigateToPortal}
                        />
                    }
                />

                <Route
                    path="/login"
                    element={
                        <AuthPage
                            initialMode={authMode}
                            onBack={handleNavigateHome}
                            onAuthSuccess={handleAuthSuccess}
                        />
                    }
                />

                <Route
                    path="/assistant"
                    element={
                        <ReceptionistDashboard
                            onNavigateHome={handleNavigateHome}
                        />
                    }
                />

                <Route
                    path="/receptionist"
                    element={<Navigate to="/assistant" replace />}
                />

                <Route
                    path="/patient"
                    element={
                        <PatientDashboard
                            onLogout={handleNavigateHome}
                            onNavigateToDoctor={handleNavigateToDoctor}
                        />
                    }
                />

                <Route path="/doctor" element={<DoctorLayout onNavigateHome={handleNavigateHome} />}>
                    <Route index element={<DoctorDashboard />} />

                    <Route path="patients/:patientId" element={<PatientWorkspace />}>
                        <Route
                            index
                            element={<Navigate to="consultation" replace />}
                        />
                        <Route
                            path="consultation"
                            element={<ConsultationTab />}
                        />
                        <Route
                            path="records"
                            element={<MedicalRecordsTab />}
                        />
                        <Route
                            path="summary"
                            element={<Navigate to="../consultation" replace />}
                        />
                        <Route
                            path="prescription"
                            element={<Navigate to="../consultation" replace />}
                        />
                    </Route>

                    <Route path="records" element={<MedicalRecords />} />
                    <Route path="consultations" element={<Consultations />} />
                    <Route path="prescriptions" element={<Prescriptions />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ToastContainer />
        </div>
    );
};

function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <MainLayout />
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;