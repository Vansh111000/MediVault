import { useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import Icon from "../Icon";
import { toDisplayStatus, toDisplayVisitType } from "./patientDisplay";

const avatarTones = [
    "bg-teal-50 text-teal-700 border border-teal-200/60",
    "bg-sky-50 text-sky-700 border border-sky-200/60",
    "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
];

const visitTypeTones = {
    "Follow-up": "bg-slate-100 text-slate-700 border border-slate-200/60",
    "New Consultation": "bg-sky-50 text-sky-700 border border-sky-200/60 font-semibold",
};

const FILTERS = ["waiting", "upcoming", "completed"];
const FILTER_LABELS = { waiting: "Waiting", upcoming: "Upcoming", completed: "Completed" };

function initials(name) {
    return (name || "?")
        .split(" ")
        .map((part) => part[0] || "")
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export default function PatientQueue({ patients, onRefresh }) {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");

    const counts = {};
    FILTERS.forEach((key) => {
        counts[key] = patients.filter((p) => toDisplayStatus(p.status) === key).length;
    });

    const normalizedQuery = query.trim().toLowerCase();
    const matches = patients.filter((p) => {
        const matchesFilter = filter === "all" || toDisplayStatus(p.status) === filter;
        const matchesQuery =
            !normalizedQuery ||
            (p.name || "").toLowerCase().includes(normalizedQuery) ||
            (p.mediVaultId || "").toLowerCase().includes(normalizedQuery) ||
            (p.tokenNumber || "").toLowerCase().includes(normalizedQuery);
        return matchesFilter && matchesQuery;
    });

    return (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Today's Patients</h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Patients assigned to you from the hospital queue.
                    </p>
                </div>
                {onRefresh && (
                    <button
                        type="button"
                        onClick={onRefresh}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 transition-all"
                    >
                        <Icon className="text-[16px]">refresh</Icon>
                        Refresh
                    </button>
                )}
            </div>

            {/* Search & filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-1">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</Icon>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name, MediVault ID or token..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-medium transition-all"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    {FILTERS.map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setFilter(filter === key ? "all" : key)}
                            className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                                filter === key
                                    ? "bg-teal-700 text-white font-bold shadow-xs"
                                    : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-semibold"
                            }`}
                        >
                            {FILTER_LABELS[key]} ({counts[key]})
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                            <th className="py-3 px-4">Patient</th>
                            <th className="py-3 px-3">MediVault ID</th>
                            <th className="py-3 px-3">Appointment</th>
                            <th className="py-3 px-3">Visit Type</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {matches.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                                    {patients.length === 0
                                        ? "No patients assigned to you today."
                                        : "No patients match your search."}
                                </td>
                            </tr>
                        )}

                        {matches.map((patient, index) => {
                            const done = patient.status === "completed";
                            const avatar = done
                                ? "bg-slate-100 text-slate-500 border border-slate-200"
                                : avatarTones[index % avatarTones.length];

                            return (
                                <tr key={patient.visitId || patient._id || patient.id || index} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${avatar}`}>
                                                {initials(patient.name)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                                                    <span className={done ? "line-through text-slate-400" : "text-slate-900"}>
                                                        {patient.name}
                                                    </span>
                                                    {patient.hasAllergy && (
                                                        <span
                                                            className="w-2 h-2 rounded-full bg-rose-500"
                                                            title="Allergy notice active"
                                                        />
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-slate-500 font-medium">
                                                    {patient.age} yrs • {patient.gender} • {patient.bloodGroup}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className={`py-3 px-3 font-semibold text-xs ${done ? "text-slate-400" : "text-slate-900 font-mono"}`}>
                                        {patient.mediVaultId || <span className="text-slate-300 italic">—</span>}
                                    </td>

                                    <td className="py-3 px-3">
                                        <span className={`font-semibold block ${done ? "text-slate-400" : "text-slate-900"}`}>
                                            {patient.time}
                                        </span>
                                        {patient.tokenNumber && (
                                            <span className="text-[10px] text-slate-400 font-medium">{patient.tokenNumber}</span>
                                        )}
                                    </td>

                                    <td className="py-3 px-3">
                                        <span className={`px-2 py-0.5 rounded-md text-[11px] ${visitTypeTones[toDisplayVisitType(patient.visitType)] || "bg-slate-100 text-slate-600"}`}>
                                            {toDisplayVisitType(patient.visitType)}
                                        </span>
                                        {patient.reasonForVisit && (
                                            <span className="block text-[10px] text-slate-500 font-medium truncate max-w-[150px]" title={patient.reasonForVisit}>
                                                {patient.reasonForVisit}
                                            </span>
                                        )}
                                    </td>

                                    <td className="py-3 px-3">
                                        <StatusBadge status={toDisplayStatus(patient.status)} />
                                    </td>

                                    <td className="py-3 px-4 text-right">
                                        {(patient._id || patient.id) && (
                                            <Link
                                                to={patient.visitId ? `/doctor/patients/${patient._id || patient.id}?visitId=${patient.visitId}` : `/doctor/patients/${patient._id || patient.id}`}
                                                className={`inline-block whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                                    toDisplayStatus(patient.status) === "waiting"
                                                        ? "bg-teal-700 hover:bg-teal-800 text-white shadow-xs"
                                                        : done
                                                          ? "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs"
                                                          : "bg-white hover:bg-slate-50 text-teal-700 border border-teal-200 shadow-xs"
                                                }`}
                                            >
                                                {toDisplayStatus(patient.status) === "waiting" ? "Open Vault" : done ? "Summary" : "View"}
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="pt-1 text-xs text-slate-500">
                Showing {matches.length} of {patients.length} patients
            </div>
        </div>
    );
}
