import { useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import ConsentCell from "./ConsentCell";
import Icon from "../Icon";

const INITIAL_VISIBLE = 5;

const avatarTones = [
    "bg-primary-container text-on-primary-container",
    "bg-secondary-container text-on-secondary-container",
    "bg-surface-container-highest text-on-surface",
    "bg-tertiary/20 text-tertiary",
];

const visitTypeTones = {
    "Follow-up": "bg-surface-container-high text-on-surface-variant",
    "New Consultation": "bg-secondary/10 text-secondary font-medium",
    "Specialist Review": "bg-tertiary/10 text-tertiary font-medium",
    "Lab Review": "bg-surface-container text-outline",
};

const FILTERS = ["all", "waiting", "checked-in", "in-room", "upcoming", "completed"];

const FILTER_LABELS = {
    all: "All",
    waiting: "Waiting",
    "checked-in": "Checked In",
    "in-room": "In Room",
    upcoming: "Upcoming",
    completed: "Completed",
};

function initials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export default function PatientQueue({ patients }) {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [showAll, setShowAll] = useState(false);

    const counts = { all: patients.length };
    FILTERS.slice(1).forEach((key) => {
        counts[key] = patients.filter((p) => p.status === key).length;
    });

    const normalizedQuery = query.trim().toLowerCase();
    const matches = patients.filter((p) => {
        const matchesFilter = filter === "all" || p.status === filter;
        const matchesQuery =
            !normalizedQuery ||
            p.name.toLowerCase().includes(normalizedQuery) ||
            p.id.toLowerCase().includes(normalizedQuery);
        return matchesFilter && matchesQuery;
    });

    const isNarrowed = filter !== "all" || normalizedQuery !== "";
    const visible = showAll || isNarrowed ? matches : matches.slice(0, INITIAL_VISIBLE);
    const hiddenCount = matches.length - visible.length;

    return (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg space-y-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm">
                <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Today's Patients</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Patients assigned to you for consultation by the hospital assistant.
                    </p>
                </div>
                <span className="self-start font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                    Assigned by reception
                </span>
            </div>

            {/* Search & filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-space-sm">
                <div className="relative flex-1">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</Icon>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search your patients by name or Patient ID..."
                        className="w-full pl-9 pr-4 py-2 bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    {FILTERS.map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setFilter(key)}
                            className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-colors ${
                                filter === key
                                    ? "bg-primary text-on-primary font-semibold"
                                    : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant"
                            }`}
                        >
                            {FILTER_LABELS[key]} ({counts[key]})
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left font-body-md text-body-md border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
                            <th className="py-3 px-4 rounded-l-xl">Patient</th>
                            <th className="py-3 px-3">Patient ID</th>
                            <th className="py-3 px-3">Appointment</th>
                            <th className="py-3 px-3">Visit Type</th>
                            <th className="py-3 px-3">Record Access</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {visible.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-10 text-center text-on-surface-variant">
                                    No patients match your search.
                                </td>
                            </tr>
                        )}

                        {visible.map((patient, index) => {
                            const done = patient.status === "completed";
                            const avatar = done
                                ? "bg-surface-container-low text-on-surface-variant"
                                : avatarTones[index % avatarTones.length];

                            return (
                                <tr key={patient.id} className="hover:bg-surface-container-low/50 transition-colors">
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-9 h-9 rounded-full font-semibold flex items-center justify-center font-label-md text-label-md ${avatar}`}
                                            >
                                                {initials(patient.name)}
                                            </div>
                                            <div>
                                                <div className="font-title-md text-title-md font-semibold flex items-center gap-1.5">
                                                    <span className={done ? "line-through text-outline" : "text-on-surface"}>
                                                        {patient.name}
                                                    </span>
                                                    {patient.hasAllergy && (
                                                        <span
                                                            className="w-2 h-2 rounded-full bg-error"
                                                            title="Allergy notice active"
                                                        />
                                                    )}
                                                </div>
                                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                                    {patient.age} yrs • {patient.sex} • {patient.bloodGroup}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td
                                        className={`py-3.5 px-3 font-label-sm text-label-sm font-semibold ${
                                            done ? "text-on-surface-variant" : "text-on-surface"
                                        }`}
                                    >
                                        {patient.id}
                                    </td>

                                    <td className="py-3.5 px-3">
                                        <span
                                            className={`font-label-sm text-label-sm font-semibold ${
                                                done ? "text-outline" : "text-on-surface"
                                            }`}
                                        >
                                            {patient.time}
                                        </span>
                                        <span
                                            className={`block font-body-sm text-body-sm ${
                                                done ? "text-outline" : "text-on-surface-variant"
                                            }`}
                                        >
                                            {patient.location}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-3">
                                        <span
                                            className={`px-2 py-0.5 rounded-md font-label-sm text-label-sm ${
                                                visitTypeTones[patient.visitType] ?? visitTypeTones["Follow-up"]
                                            }`}
                                        >
                                            {patient.visitType}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-3">
                                        <ConsentCell consent={patient.consent} />
                                    </td>

                                    <td className="py-3.5 px-3">
                                        <StatusBadge status={patient.status} />
                                    </td>

                                    <td className="py-3.5 px-4 text-right">
                                        <Link
                                            to={`/doctor/patients/${patient.id}`}
                                            className={`inline-block px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-colors ${
                                                patient.status === "waiting"
                                                    ? "bg-primary text-on-primary font-semibold hover:bg-primary-container shadow-sm"
                                                    : done
                                                      ? "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                                                      : "bg-surface-container-high text-on-surface font-semibold hover:bg-surface-container-highest"
                                            }`}
                                        >
                                            {patient.status === "waiting" ? "Open Vault" : done ? "Summary" : "View"}
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between pt-space-xs font-label-sm text-label-sm text-on-surface-variant">
                <span>
                    Showing {visible.length} of {isNarrowed ? matches.length : patients.length} consultations
                </span>
                {hiddenCount > 0 && (
                    <button
                        type="button"
                        onClick={() => setShowAll(true)}
                        className="text-primary hover:underline font-semibold"
                    >
                        Load remaining {hiddenCount}
                    </button>
                )}
            </div>
        </div>
    );
}
