import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import DoctorHeader from "../components/doctor/DoctorHeader";
import { Footer } from "../components/Shared/Footer";
import api from "../services/api";

/**
 * DoctorLayout – fetches the authenticated doctor's profile once and
 * passes it down to DoctorHeader. This ensures the header always shows
 * the currently logged-in doctor's real details.
 */
export default function DoctorLayout({ onNavigateHome }) {
    const [doctorInfo, setDoctorInfo] = useState(null);

    useEffect(() => {
        let isMounted = true;
        api.getDoctorDashboard()
            .then((res) => {
                if (isMounted && res?.data) {
                    setDoctorInfo({
                        doctorName: res.data.doctor?.name || null,
                        specialty: res.data.doctor?.specialty || null,
                        hospitalName: res.data.activeHospital?.name || null,
                    });
                }
            })
            .catch(() => {});
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans antialiased">
            <DoctorHeader
                onNavigateHome={onNavigateHome}
                doctorName={doctorInfo?.doctorName}
                specialty={doctorInfo?.specialty}
                hospitalName={doctorInfo?.hospitalName}
            />

            <main className="flex-1 w-full bg-[#f8fafc]">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
