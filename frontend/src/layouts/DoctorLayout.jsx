import { Outlet } from "react-router-dom";
import DoctorHeader from "../components/doctor/DoctorHeader";
import { Footer } from "../components/Shared/Footer";

export default function DoctorLayout({ onNavigateHome }) {
    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans antialiased">
            <DoctorHeader onNavigateHome={onNavigateHome} />

            <main className="flex-1 w-full bg-[#f8fafc]">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}