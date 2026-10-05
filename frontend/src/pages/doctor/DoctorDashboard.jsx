import { useState } from "react";
import StatCard from "../../components/doctor/StatCard";
import PatientQueue from "../../components/doctor/PatientQueue";
import { doctor, patients, pendingDrafts } from "../../data/mockDoctorData";

function getGreeting(date) {
    const hour = date.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

export default function DoctorDashboard() {
    const [now] = useState(() => new Date());

    const total = patients.length;
    const completed = patients.filter((p) => p.status === "completed").length;
    const upcoming = patients.filter((p) =>
        ["waiting", "checked-in", "upcoming"].includes(p.status),
    ).length;

    return (
        <div className="flex flex-col w-full">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {getGreeting(now)}, {doctor.shortName}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        You have {total} patients today.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Patients Today" icon="group" tone="primary" value={total} />
                    <StatCard label="Upcoming" icon="schedule" tone="secondary" value={upcoming} />
                    <StatCard label="Completed" icon="check_circle" tone="tertiary" value={completed} />
                    <StatCard label="Pending Drafts" icon="draw" tone="error" value={pendingDrafts.length} />
                </div>

                <PatientQueue patients={patients} />
            </div>
        </div>
    );
}
