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
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    My Patients
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                    Patients assigned to you for consultation and follow-up.
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                {/* Search & filter */}
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="relative flex-1">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                            search
                        </Icon>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by patient name or ID..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-medium transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        {FILTERS.map(({ key, label }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setFilter(key)}
                                className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                                    filter === key
                                        ? "bg-teal-700 text-white font-bold shadow-xs"
                                        : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-semibold"
                                }`}
                            >
                                {label} ({countFor(key)})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Patient list */}
                {visible.length === 0 ? (
                    <div className="py-12 flex flex-col items-center text-center gap-1">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center mb-2">
                            <Icon className="text-[24px]">person_search</Icon>
                        </div>
                        <h2 className="text-base font-bold text-slate-900">No patients found</h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Try changing your search or filter.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                                    <th className="py-3 px-4">Patient</th>
                                    <th className="py-3 px-3">Patient ID</th>
                                    <th className="py-3 px-3">Age / Sex</th>
                                    <th className="py-3 px-3">Appointment</th>
                                    <th className="py-3 px-3">Visit Type</th>
                                    <th className="py-3 px-3">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {visible.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                {patient.name}
                                                {patient.hasAllergy && (
                                                    <span
                                                        className="w-2 h-2 rounded-full bg-rose-500"
                                                        title="Allergy on record"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-3 font-semibold text-slate-900 font-mono">
                                            {patient.id}
                                        </td>
                                        <td className="py-3.5 px-3 text-slate-500 font-medium">
                                            {patient.age} yrs • {patient.sex}
                                        </td>
                                        <td className="py-3.5 px-3 font-semibold text-slate-900">
                                            {patient.time}
                                        </td>
                                        <td className="py-3.5 px-3 text-slate-600 font-medium">{patient.visitType}</td>
                                        <td className="py-3.5 px-3">
                                            <StatusBadge status={patient.status} />
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <Link
                                                to={`/doctor/patients/${patient.id}`}
                                                className="inline-block whitespace-nowrap px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
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

                <p className="text-xs text-slate-500 font-medium">
                    Showing {visible.length} of {patients.length} patients
                </p>
            </div>
        </div>
    );
}
