import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DoctorLayout from "./layouts/DoctorLayout";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import MyPatients from "./pages/doctor/MyPatients";
import PatientWorkspace from "./pages/doctor/PatientWorkspace";
import EmptyState from "./components/doctor/EmptyState";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<LandingPage />} />

                <Route path="/doctor" element={<DoctorLayout />}>

                    <Route index element={<DoctorDashboard />} />

                    <Route path="patients" element={<MyPatients />} />

                    <Route path="patients/:patientId" element={<PatientWorkspace />} />

                    <Route
                        path="records"
                        element={
                            <EmptyState
                                icon="folder_shared"
                                title="Medical Records"
                                description="Authorized patient medical records will be available here."
                            />
                        }
                    />

                    <Route
                        path="consultations"
                        element={
                            <EmptyState
                                icon="edit_note"
                                title="Consultations"
                                description="Create and manage patient consultation records here."
                            />
                        }
                    />

                    <Route
                        path="prescriptions"
                        element={
                            <EmptyState
                                icon="prescriptions"
                                title="Prescriptions"
                                description="Create and manage prescriptions for your consultations here."
                            />
                        }
                    />

                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </BrowserRouter>
    );
}