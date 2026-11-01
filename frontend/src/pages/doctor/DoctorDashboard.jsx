import { useState, useEffect } from "react";
import StatCard from "../../components/doctor/StatCard";
import PatientQueue from "../../components/doctor/PatientQueue";
import { doctor as defaultDoctor, patients as defaultPatients, pendingDrafts } from "../../data/mockData";
import { useApp } from "../../context/AppContext";
import api from "../../services/api";

function getGreeting(date) {
    const hour = date.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

export default function DoctorDashboard() {
    const [now] = useState(() => new Date());
    const { currentDoctor, activeVisits } = useApp();
    const [dashboardStats, setDashboardStats] = useState(null);

    useEffect(() => {
        let isMounted = true;
        api.getDoctorDashboard()
            .then((res) => {
                if (isMounted && res?.data?.stats) {
                    setDashboardStats(res.data.stats);
                }
            })
            .catch(() => {});
        return () => {
            isMounted = false;
        };
    }, []);

    const doctorName = currentDoctor?.name || defaultDoctor.shortName;
    const total = dashboardStats?.totalToday ?? (activeVisits.length > 0 ? activeVisits.length : defaultPatients.length);
    const completed = dashboardStats?.completed ?? defaultPatients.filter((p) => p.status === "completed").length;
    const upcoming = dashboardStats?.upcoming ?? defaultPatients.filter((p) =>
        ["waiting", "checked-in", "upcoming"].includes(p.status),
    ).length;
    const draftsCount = dashboardStats?.pendingDraftsCount ?? pendingDrafts.length;

    // Map real backend activeVisits to the shape PatientQueue expects,
    // falling back to the rich mock data when no real visits are loaded yet.
    const queuePatients = activeVisits.length > 0
        ? activeVisits.map((v) => ({
            id: v.patientId || v._id || v.id,
            name: v.patientName || 'Unknown Patient',
            age: v.age || 30,
            gender: v.gender || 'Unknown',
            bloodGroup: v.bloodGroup || 'O+',
            status: v.status === 'In Doctor Queue' ? 'waiting'
                  : v.status === 'Completed' ? 'completed'
                  : 'checked-in',
            time: v.checkInTime
                ? new Date(v.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : 'Now',
            visitType: 'new',
            tokenNumber: v.tokenNumber,
            hasAllergy: false,
        }))
        : defaultPatients;

    return (
        <div className="flex flex-col w-full">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {getGreeting(now)}, {doctorName}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        You have {total} patients today.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Patients Today" icon="group" tone="primary" value={total} />
                    <StatCard label="Upcoming" icon="schedule" tone="secondary" value={upcoming} />
                    <StatCard label="Completed" icon="check_circle" tone="tertiary" value={completed} />
                    <StatCard label="Pending Drafts" icon="draw" tone="error" value={draftsCount} />
                </div>

                <PatientQueue patients={queuePatients} />
            </div>
        </div>
    );
}
