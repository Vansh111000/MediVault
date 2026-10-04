import { useState } from "react";
import Icon from "../../components/Icon";
import { patients } from "../../data/mockDoctorData";
import { medicalRecords, formatDate } from "../../data/mockClinicalData";

const recordTypes = {
    consultation: { label: "Consultation", icon: "stethoscope", tone: "bg-teal-50 text-teal-700 border border-teal-200/60" },
    diagnosis: { label: "Diagnosis", icon: "diagnosis", tone: "bg-sky-50 text-sky-700 border border-sky-200/60" },
    prescription: { label: "Prescription", icon: "medication", tone: "bg-emerald-50 text-emerald-700 border border-emerald-200/60" },
    report: { label: "Report", icon: "description", tone: "bg-slate-100 text-slate-700 border border-slate-200/60" },
};

function initials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export default function MedicalRecords() {
    const [patientId, setPatientId] = useState("");

    const patient = patients.find((p) => p.id === patientId);
    const records = patient ? (medicalRecords[patient.id] ?? []) : [];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Medical Records
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                    Review authorized patient history, reports, diagnoses and prescriptions.
                </p>
            </div>

            {/* Patient selector */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
                <label
                    htmlFor="record-patient"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                >
                    Select Patient
                </label>
                <div className="relative max-w-md">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                        person_search
                    </Icon>
                    <select
                        id="record-patient"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
                    >
                        <option value="">Select a patient</option>
                        {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name} ({p.id})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {!patient ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs min-h-[280px] flex flex-col items-center justify-center text-center p-8 gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center">
                        <Icon className="text-[26px]">folder_shared</Icon>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                        Select a patient from the dropdown above to view medical records.
                    </p>
                </div>
            ) : (
                <>
                    {/* Patient summary */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 font-bold text-base flex items-center justify-center">
                                {initials(patient.name)}
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {patient.name}
                                    </h2>
                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                                        {patient.id}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {patient.age} yrs • {patient.sex} • Blood group {patient.bloodGroup}
                                </p>
                            </div>
                        </div>

                        {patient.hasAllergy && (
                            <span className="self-start md:self-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                                <Icon className="text-[13px]">warning</Icon>
                                Allergy on record
                            </span>
                        )}
                    </div>

                    {/* Medical history */}
                    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                        <div className="pb-2 border-b border-slate-100">
                            <h2 className="text-base font-bold text-slate-900">
                                Medical History
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                                Previous records are read-only.
                            </p>
                        </div>

                        {records.length === 0 ? (
                            <div className="py-12 flex flex-col items-center text-center gap-1">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center mb-2">
                                    <Icon className="text-[24px]">folder_off</Icon>
                                </div>
                                <h3 className="text-base font-bold text-slate-900">
                                    No previous records
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Medical history will appear here when records are available.
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {records.map((record) => {
                                    const type = recordTypes[record.type];
                                    return (
                                        <li
                                            key={`${record.type}-${record.title}`}
                                            className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-3"
                                        >
                                            <span className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 text-teal-700 flex items-center justify-center shrink-0">
                                                <Icon className="text-[20px]">{type.icon}</Icon>
                                            </span>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex flex-wrap items-center justify-between gap-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-900">
                                                            {record.title}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${type.tone}`}
                                                        >
                                                            {type.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {formatDate(record.date)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-700 font-medium">
                                                    {record.description}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                                    <span className="text-[11px] text-slate-500 font-medium">
                                                        {record.source}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold">
                                                        Historical record
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
