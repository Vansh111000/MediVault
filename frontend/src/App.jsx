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


import { useApp } from "./context/AppContext";

const RoleRoute = ({ allowedRoles, children }) => {
    const { isAuthenticated, currentRole, authLoading } = useApp();

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const normalizedRole = currentRole === "receptionist" ? "assistant" : currentRole;
    if (!allowedRoles.includes(normalizedRole)) {
        if (normalizedRole === "doctor") {
            return <Navigate to="/doctor" replace />;
        } else if (normalizedRole === "assistant") {
            return <Navigate to="/assistant" replace />;
        } else {
            return <Navigate to="/patient" replace />;
        }
    }

    return children;
};

const MainLayout = () => {
    const navigate = useNavigate();
    const { isAuthenticated, currentRole, logout } = useApp();
    const [authMode, setAuthMode] = useState("login");

    const handleOpenAuth = (mode = "login", role = null) => {
        if (isAuthenticated) {
            const normalizedRole = currentRole === "receptionist" ? "assistant" : currentRole;
            if (normalizedRole === "doctor") {
                navigate("/doctor");
            } else if (normalizedRole === "assistant") {
                navigate("/assistant");
            } else {
                navigate("/patient");
            }
            return;
        }
        setAuthMode(mode);
        if (role) {
            navigate(`/login?role=${role}`);
        } else {
            navigate("/login");
        }
    };

    const handleNavigateToPortal = () => {
        if (isAuthenticated) {
            const normalizedRole = currentRole === "receptionist" ? "assistant" : currentRole;
            if (normalizedRole === "doctor") navigate("/doctor");
            else if (normalizedRole === "assistant") navigate("/assistant");
            else navigate("/patient");
        } else {
            navigate("/login?role=patient");
        }
    };

    const handleNavigateToDoctor = () => {
        if (isAuthenticated) {
            const normalizedRole = currentRole === "receptionist" ? "assistant" : currentRole;
            if (normalizedRole === "doctor") navigate("/doctor");
            else if (normalizedRole === "assistant") navigate("/assistant");
            else navigate("/patient");
        } else {
            navigate("/login?role=doctor");
        }
    };

    const handleNavigateToAssistant = () => {
        if (isAuthenticated) {
            const normalizedRole = currentRole === "receptionist" ? "assistant" : currentRole;
            if (normalizedRole === "doctor") navigate("/doctor");
            else if (normalizedRole === "assistant") navigate("/assistant");
            else navigate("/patient");
        } else {
            navigate("/login?role=assistant");
        }
    };

    const handleNavigateHome = () => {
        navigate("/");
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleAuthSuccess = (role) => {
        if (role === "doctor") {
            navigate("/doctor", { replace: true });
        } else if (role === "receptionist" || role === "assistant") {
            navigate("/assistant", { replace: true });
        } else {
            navigate("/patient", { replace: true });
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
                        isAuthenticated ? (
                            <Navigate
                                to={
                                    currentRole === "doctor"
                                        ? "/doctor"
                                        : currentRole === "receptionist" || currentRole === "assistant"
                                        ? "/assistant"
                                        : "/patient"
                                }
                                replace
                            />
                        ) : (
                            <AuthPage
                                initialMode={authMode}
                                onBack={handleNavigateHome}
                                onAuthSuccess={handleAuthSuccess}
                            />
                        )
                    }
                />

                <Route
                    path="/assistant"
                    element={
                        <RoleRoute allowedRoles={["assistant", "hospital_admin", "super_admin"]}>
                            <ReceptionistDashboard
                                onNavigateHome={handleNavigateHome}
                            />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/receptionist"
                    element={<Navigate to="/assistant" replace />}
                />

                <Route
                    path="/patient"
                    element={
                        <RoleRoute allowedRoles={["patient"]}>
                            <PatientDashboard
                                onLogout={handleLogout}
                                onNavigateHome={handleNavigateHome}
                                onNavigateToDoctor={handleNavigateToDoctor}
                            />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/doctor"
                    element={
                        <RoleRoute allowedRoles={["doctor"]}>
                            <DoctorLayout onNavigateHome={handleNavigateHome} />
                        </RoleRoute>
                    }
                >
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