import { useState } from "react";
import Icon from "../../components/Icon";
import StatCard from "../../components/doctor/StatCard";
import QuickActions from "../../components/doctor/QuickActions";
import PatientQueue from "../../components/doctor/PatientQueue";
import LiveFeed from "../../components/doctor/LiveFeed";
import { doctor, patients, liveFeed, pendingDrafts } from "../../data/mockDoctorData";

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
    const toBeSeen = patients.filter((p) =>
        ["waiting", "checked-in", "upcoming"].includes(p.status),
    );
    const nextPatient = toBeSeen[0];
    const drafts = pendingDrafts.length;

    const percent = (count) => (total === 0 ? 0 : (count / total) * 100);

    const dateLabel = now.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="flex flex-col w-full">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
                {/* Welcome */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">
                                OPD Overview
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] font-medium text-slate-500">
                                {doctor.specialty} Queue
                            </span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {getGreeting(now)}, {doctor.shortName}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Here are your {total} consultations for today, along with new assignments and report updates
                            from the hospital desk.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="px-3.5 py-2 bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-2.5">
                            <Icon className="text-teal-700 text-[20px]">calendar_today</Icon>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-900 font-bold">{dateLabel}</span>
                                <span className="text-[11px] text-slate-500 font-medium">{doctor.shift}</span>
                            </div>
                        </div>
                        <div className="px-3.5 py-2 bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-2.5">
                            <Icon className="text-sky-700 text-[20px]">meeting_room</Icon>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-900 font-bold">{doctor.room}</span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                    {doctor.hospital}, {doctor.wing}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        label="Patients Today"
                        icon="group"
                        tone="primary"
                        value={total}
                        badge="Assigned"
                        caption="Routed by the hospital assistant"
                        progress={100}
                    />
                    <StatCard
                        label="Upcoming"
                        icon="schedule"
                        tone="secondary"
                        value={toBeSeen.length}
                        badge="To be seen"
                        caption={nextPatient ? `Next appointment at ${nextPatient.time}` : "No more appointments"}
                        progress={percent(toBeSeen.length)}
                    />
                    <StatCard
                        label="Completed"
                        icon="check_circle"
                        tone="tertiary"
                        value={completed}
                        badge="Discharged"
                        caption="Consultations finished today"
                        progress={percent(completed)}
                    />
                    <StatCard
                        label="Pending Drafts"
                        icon="draw"
                        tone="error"
                        value={drafts}
                        badge="Needs review"
                        caption="Notes & prescriptions to finalize"
                        progress={percent(drafts)}
                    />
                </div>

                <QuickActions />

                {/* Main split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <section className="lg:col-span-8 flex flex-col gap-6">
                        <PatientQueue patients={patients} />
                    </section>

                    <aside className="lg:col-span-4 flex flex-col gap-6">
                        <LiveFeed items={liveFeed} />
                    </aside>
                </div>
            </div>
        </div>
    );
}
