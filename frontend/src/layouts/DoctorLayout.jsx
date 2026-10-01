import { Outlet } from "react-router-dom";
import DoctorHeader from "../components/doctor/DoctorHeader";
import Footer from "../components/Footer";

export default function DoctorLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-surface font-body-md text-body-md text-on-surface antialiased">
            <DoctorHeader />

            <main className="flex-1 w-full bg-surface">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}