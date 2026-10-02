import { useState } from "react";
import Icon from "../../components/Icon";
import { patients } from "../../data/mockDoctorData";
import { medicalRecords, formatDate } from "../../data/mockClinicalData";

const recordTypes = {
    consultation: { label: "Consultation", icon: "stethoscope", tone: "bg-primary/10 text-primary" },
    diagnosis: { label: "Diagnosis", icon: "diagnosis", tone: "bg-secondary/10 text-secondary" },
    prescription: { label: "Prescription", icon: "medication", tone: "bg-tertiary/10 text-tertiary" },
    report: { label: "Report", icon: "description", tone: "bg-surface-container text-on-surface-variant" },
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
        <div className="w-full max-w-[1440px] mx-auto px-margin-mobile sm:px-margin py-space-xl space-y-space-lg">
            <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                    Medical Records
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Review authorized patient history, reports, diagnoses and prescriptions.
                </p>
            </div>

            {/* Patient selector */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg">
                <label
                    htmlFor="record-patient"
                    className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1"
                >
                    Patient
                </label>
                <div className="relative max-w-md">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                        person_search
                    </Icon>
                    <select
                        id="record-patient"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm min-h-[280px] flex flex-col items-center justify-center text-center px-space-xl gap-space-sm">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="text-[28px]">folder_shared</Icon>
                    </div>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">
                        Select a patient to view medical records.
                    </p>
                </div>
            ) : (
                <>
                    {/* Patient summary */}
                    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                        <div className="flex items-center gap-space-md">
                            <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container font-bold text-[18px] flex items-center justify-center">
                                {initials(patient.name)}
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-space-sm">
                                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                                        {patient.name}
                                    </h2>
                                    <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                                        {patient.id}
                                    </span>
                                </div>
                                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                                    {patient.age} yrs • {patient.sex} • Blood group {patient.bloodGroup}
                                </p>
                            </div>
                        </div>

                        {patient.hasAllergy && (
                            <span className="self-start inline-flex items-center gap-1 px-2 py-1 rounded-md bg-error/10 text-error font-label-sm text-label-sm font-medium">
                                <Icon className="text-[14px]">warning</Icon>
                                Allergy on record
                            </span>
                        )}
                    </div>

                    {/* Medical history */}
                    <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg space-y-space-md">
                        <div>
                            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                                Medical History
                            </h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                                Previous records are read-only.
                            </p>
                        </div>

                        {records.length === 0 ? (
                            <div className="py-space-xl flex flex-col items-center text-center gap-1">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-space-sm">
                                    <Icon className="text-[24px]">folder_off</Icon>
                                </div>
                                <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                                    No previous records
                                </h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    Medical history will appear here when records are available.
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-space-sm">
                                {records.map((record) => {
                                    const type = recordTypes[record.type];
                                    return (
                                        <li
                                            key={`${record.type}-${record.title}`}
                                            className="p-space-md bg-surface-container-low rounded-xl flex items-start gap-space-sm"
                                        >
                                            <span className="w-9 h-9 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shrink-0">
                                                <Icon className="text-[20px]">{type.icon}</Icon>
                                            </span>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex flex-wrap items-center justify-between gap-1">
                                                    <div className="flex flex-wrap items-center gap-space-sm">
                                                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                                                            {record.title}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-0.5 rounded-md font-label-sm text-label-sm font-medium ${type.tone}`}
                                                        >
                                                            {type.label}
                                                        </span>
                                                    </div>
                                                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                                                        {formatDate(record.date)}
                                                    </span>
                                                </div>
                                                <p className="font-body-md text-body-md text-on-surface">
                                                    {record.description}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-space-sm">
                                                    <span className="font-body-sm text-body-sm text-outline">
                                                        {record.source}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
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
