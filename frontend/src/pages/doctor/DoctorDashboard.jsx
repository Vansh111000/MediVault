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
    return "Good morning";
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

            <div className="w-full max-w-[1440px] mx-auto px-margin-mobile sm:px-margin py-space-xl space-y-space-xl">
                {/* Welcome */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                                OPD Overview
                            </span>
                            <span className="text-outline">•</span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                                {doctor.specialty} Queue
                            </span>
                        </div>
                        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                            {getGreeting(now)}, {doctor.shortName}
                        </h1>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                            Here are your {total} consultations for today, along with new assignments and report updates
                            from the hospital desk.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-space-sm">
                        <div className="px-space-md py-space-sm bg-surface-container-lowest rounded-xl shadow-sm flex items-center gap-space-sm">
                            <Icon className="text-primary text-[20px]">calendar_today</Icon>
                            <div className="flex flex-col">
                                <span className="font-label-sm text-label-sm text-on-surface font-semibold">{dateLabel}</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">{doctor.shift}</span>
                            </div>
                        </div>
                        <div className="px-space-md py-space-sm bg-surface-container-lowest rounded-xl shadow-sm flex items-center gap-space-sm">
                            <Icon className="text-secondary text-[20px]">meeting_room</Icon>
                            <div className="flex flex-col">
                                <span className="font-label-sm text-label-sm text-on-surface font-semibold">{doctor.room}</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                    {doctor.hospital}, {doctor.wing}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter">
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                    <section className="lg:col-span-8 flex flex-col gap-space-lg">
                        <PatientQueue patients={patients} />
                    </section>

                    <aside className="lg:col-span-4 flex flex-col gap-space-lg">
                        <LiveFeed items={liveFeed} />                    </aside>
                </div>
            </div>
        </div>
    );
}
