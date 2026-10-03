import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DoctorLayout from "./layouts/DoctorLayout";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import MyPatients from "./pages/doctor/MyPatients";
import PatientWorkspace from "./pages/doctor/PatientWorkspace";
import MedicalRecordsTab from "./pages/doctor/patient-workspace/MedicalRecordsTab";
import AISummaryTab from "./pages/doctor/patient-workspace/AISummaryTab";
import ConsultationTab from "./pages/doctor/patient-workspace/ConsultationTab";
import PrescriptionTab from "./pages/doctor/patient-workspace/PrescriptionTab";
import MedicalRecords from "./pages/doctor/MedicalRecords";
import Consultations from "./pages/doctor/Consultations";
import Prescriptions from "./pages/doctor/Prescriptions";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<LandingPage />} />

                <Route path="/doctor" element={<DoctorLayout />}>

                    <Route index element={<DoctorDashboard />} />

                    <Route path="patients" element={<MyPatients />} />

                    <Route path="patients/:patientId" element={<PatientWorkspace />}>
                        <Route index element={<Navigate to="records" replace />} />
                        <Route path="records" element={<MedicalRecordsTab />} />
                        <Route path="summary" element={<AISummaryTab />} />
                        <Route path="consultation" element={<ConsultationTab />} />
                        <Route path="prescription" element={<PrescriptionTab />} />
                    </Route>

                    <Route path="records" element={<MedicalRecords />} />

                    <Route path="consultations" element={<Consultations />} />

                    <Route path="prescriptions" element={<Prescriptions />} />

                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </BrowserRouter>
    );
}