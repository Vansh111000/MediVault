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
import MyPatients from "./pages/doctor/MyPatients";
import PatientWorkspace from "./pages/doctor/PatientWorkspace";
import MedicalRecordsTab from "./pages/doctor/patient-workspace/MedicalRecordsTab";
import ConsultationTab from "./pages/doctor/patient-workspace/ConsultationTab";
import MedicalRecords from "./pages/doctor/MedicalRecords";
import Consultations from "./pages/doctor/Consultations";
import Prescriptions from "./pages/doctor/Prescriptions";

const DoctorPortal = () => {
    return (
        <Routes>
            <Route path="/doctor" element={<DoctorLayout />}>
                <Route index element={<DoctorDashboard />} />

                <Route path="patients" element={<MyPatients />} />

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
                        element={
                            <Navigate to="../consultation" replace />
                        }
                    />

                    <Route
                        path="prescription"
                        element={
                            <Navigate to="../consultation" replace />
                        }
                    />
                </Route>

                <Route path="records" element={<MedicalRecords />} />

                <Route path="consultations" element={<Consultations />} />

                <Route path="prescriptions" element={<Prescriptions />} />
            </Route>
        </Routes>
    );
};

const MainLayout = () => {
    const navigate = useNavigate();

    const [currentView, setCurrentView] = useState("landing");
    const [authMode, setAuthMode] = useState("login");

    const handleOpenAuth = (mode = "login") => {
        setAuthMode(mode);
        setCurrentView("auth");
    };

    const handleNavigateToPortal = () => {
        setCurrentView("patient");
    };

    const handleNavigateToDoctor = () => {
        setCurrentView("doctor");
        navigate("/doctor");
    };

    const handleNavigateToReceptionist = () => {
        setCurrentView("receptionist");
    };

    const handleNavigateHome = () => {
        setCurrentView("landing");
        navigate("/");
    };

    const handleAuthSuccess = (role) => {
        if (role === "doctor") {
            handleNavigateToDoctor();
        } else if (role === "receptionist") {
            setCurrentView("receptionist");
        } else {
            setCurrentView("patient");
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-teal-600 selection:text-white">

            {currentView === "landing" && (
                <LandingPageView
                    onOpenAuth={handleOpenAuth}
                    onNavigateToDoctor={handleNavigateToDoctor}
                    onNavigateToAssistant={handleNavigateToReceptionist}
                    onNavigateToPortal={handleNavigateToPortal}
                />
            )}

            {currentView === "auth" && (
                <AuthPage
                    initialMode={authMode}
                    onBack={handleNavigateHome}
                    onAuthSuccess={handleAuthSuccess}
                />
            )}

            {currentView === "doctor" && (
                <DoctorPortal />
            )}

            {currentView === "patient" && (
                <PatientDashboard
                    onLogout={handleNavigateHome}
                    onNavigateToDoctor={handleNavigateToDoctor}
                />
            )}

            {currentView === "receptionist" && (
                <ReceptionistDashboard
                    onNavigateHome={handleNavigateHome}
                />
            )}

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