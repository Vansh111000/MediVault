import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import StatusBadge from "../../components/doctor/StatusBadge";
import { patients } from "../../data/mockDoctorData";

const FILTERS = [
    { key: "all", label: "All" },
    { key: "waiting", label: "Waiting" },
    { key: "checked-in", label: "Checked In" },
    { key: "in-room", label: "In Room" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
];

export default function MyPatients() {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");

    const countFor = (key) =>
        key === "all" ? patients.length : patients.filter((p) => p.status === key).length;

    const normalizedQuery = query.trim().toLowerCase();
    const visible = patients.filter((p) => {
        const matchesFilter = filter === "all" || p.status === filter;
        const matchesQuery =
            !normalizedQuery ||
            p.name.toLowerCase().includes(normalizedQuery) ||
            p.id.toLowerCase().includes(normalizedQuery);
        return matchesFilter && matchesQuery;
    });

    return (
        <div className="w-full max-w-[1440px] mx-auto px-margin-mobile sm:px-margin py-space-xl space-y-space-lg">
            <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                    My Patients
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Patients assigned to you for consultation and follow-up.
                </p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg space-y-space-md">
                {/* Search & filter */}
                <div className="flex flex-col md:flex-row md:items-center gap-space-sm">
                    <div className="relative flex-1">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                            search
                        </Icon>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by patient name or ID..."
                            className="w-full pl-9 pr-4 py-2 bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        {FILTERS.map(({ key, label }) => (
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
                                {label} ({countFor(key)})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Patient list */}
                {visible.length === 0 ? (
                    <div className="py-space-xl flex flex-col items-center text-center gap-1">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-space-sm">
                            <Icon className="text-[24px]">person_search</Icon>
                        </div>
                        <h2 className="font-title-md text-title-md text-on-surface font-semibold">No patients found</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                            Try changing your search or filter.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-body-md text-body-md border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
                                    <th className="py-3 px-4 rounded-l-xl">Patient</th>
                                    <th className="py-3 px-3">Patient ID</th>
                                    <th className="py-3 px-3">Age / Sex</th>
                                    <th className="py-3 px-3">Appointment</th>
                                    <th className="py-3 px-3">Visit Type</th>
                                    <th className="py-3 px-3">Status</th>
                                    <th className="py-3 px-4 rounded-r-xl text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container">
                                {visible.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-surface-container-low/50 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <div className="font-title-md text-title-md text-on-surface font-semibold flex items-center gap-1.5">
                                                {patient.name}
                                                {patient.hasAllergy && (
                                                    <span
                                                        className="w-2 h-2 rounded-full bg-error"
                                                        title="Allergy on record"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-3 font-label-sm text-label-sm font-semibold text-on-surface">
                                            {patient.id}
                                        </td>
                                        <td className="py-3.5 px-3 text-on-surface-variant">
                                            {patient.age} yrs • {patient.sex}
                                        </td>
                                        <td className="py-3.5 px-3 font-label-sm text-label-sm font-semibold text-on-surface">
                                            {patient.time}
                                        </td>
                                        <td className="py-3.5 px-3 text-on-surface-variant">{patient.visitType}</td>
                                        <td className="py-3.5 px-3">
                                            <StatusBadge status={patient.status} />
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <Link
                                                to={`/doctor/patients/${patient.id}`}
                                                className="inline-block whitespace-nowrap px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
                                            >
                                                View Patient
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Showing {visible.length} of {patients.length} patients
                </p>
            </div>
        </div>
    );
}
