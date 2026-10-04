import { useState } from "react";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import Icon from "../../components/Icon";
import StatusBadge from "../../components/doctor/StatusBadge";
import { patients } from "../../data/mockDoctorData";
import { createMedicine, getAllergyLabel, getBodyMeasurements } from "../../data/mockClinicalData";

const tabs = [
    { label: "Consultation", to: "consultation", icon: "stethoscope" },
    { label: "Medical Records", to: "records", icon: "folder_shared" },
];

const tabClass = ({ isActive }) =>
    `inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
        isActive
            ? "bg-teal-700 text-white shadow-xs"
            : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
    }`;

function initials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function getRecordAvailability(patient) {
    if (patient.status === "completed") return "Visit summary available";
    if (patient.consent.type === "none") return "No previous records";
    return patient.consent.label;
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shrink-0">
                <Icon className="text-[18px]">{icon}</Icon>
            </span>
            <div className="flex flex-col">
                <span className="text-[11px] text-slate-500 font-medium">{label}</span>
                <span className="text-xs font-bold text-slate-900">{value}</span>
            </div>
        </div>
    );
}

function WorkspaceBody({ patient }) {
    const [consultForm, setConsultForm] = useState({
        chiefComplaint: "",
        symptoms: "",
        examination: "",
        diagnosis: "",
        treatment: "",
        followUp: "",
    });
    const [medicines, setMedicines] = useState(() => [createMedicine()]);
    const [consultStatus, setConsultStatus] = useState("not-started"); // not-started | draft | completed
    const [completedRecord, setCompletedRecord] = useState(null);

    const allergyLabel = getAllergyLabel(patient);
    const { height, weight } = getBodyMeasurements(patient);
    const profileDetails = [
        { label: "Age", value: `${patient.age} yrs` },
        { label: "Sex", value: patient.sex },
        { label: "Height", value: height },
        { label: "Weight", value: weight },
        { label: "Blood Group", value: patient.bloodGroup },
    ];

    const context = {
        patient,
        allergyLabel,
        consult: {
            form: consultForm,
            setForm: setConsultForm,
            medicines,
            setMedicines,
            status: consultStatus,
            setStatus: setConsultStatus,
            completed: completedRecord,
            setCompleted: setCompletedRecord,
        },
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
            <Link
                to="/doctor/patients"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
            >
                <Icon className="text-[18px]">arrow_back</Icon>
                Back to My Patients
            </Link>

            {/* Patient context */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 font-bold text-xl flex items-center justify-center">
                            {initials(patient.name)}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                    {patient.name}
                                </h1>
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                                    {patient.id}
                                </span>
                            </div>
                            <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-1.5 text-xs">
                                {profileDetails.map(({ label, value }) => (
                                    <div key={label} className="flex items-baseline gap-1">
                                        <dt className="text-slate-400 font-medium">{label}:</dt>
                                        <dd className="text-slate-700 font-semibold">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {allergyLabel && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                                <Icon className="text-[13px]">warning</Icon>
                                {allergyLabel}
                            </span>
                        )}
                        <StatusBadge status={patient.status} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                    <InfoRow icon="assignment" label="Visit type" value={patient.visitType} />
                    <InfoRow icon="schedule" label="Appointment time" value={patient.time} />
                    <InfoRow icon="location_on" label="Location" value={patient.location} />
                    <InfoRow icon="folder_shared" label="Records" value={getRecordAvailability(patient)} />
                </div>
            </div>

            {/* Workspace: tabs + section content */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
                <nav
                    aria-label="Patient workspace sections"
                    className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto"
                >
                    {tabs.map((tab) => (
                        <NavLink key={tab.to} to={tab.to} className={tabClass}>
                            <Icon className="text-[18px]">{tab.icon}</Icon>
                            {tab.label}
                        </NavLink>
                    ))}
                </nav>

                <Outlet context={context} />
            </div>
        </div>
    );
}

export default function PatientWorkspace() {
    const { patientId } = useParams();
    const patient = patients.find((p) => p.id === patientId);

    if (!patient) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs min-h-[320px] flex flex-col items-center justify-center text-center p-8 gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center">
                        <Icon className="text-[26px]">person_off</Icon>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Patient not found</h1>
                    <p className="text-xs text-slate-500 max-w-md font-medium">
                        We couldn't find a patient with ID {patientId}.
                    </p>
                    <Link
                        to="/doctor/patients"
                        className="mt-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                    >
                        Back to My Patients
                    </Link>
                </div>
            </div>
        );
    }

    return <WorkspaceBody key={patient.id} patient={patient} />;
}
