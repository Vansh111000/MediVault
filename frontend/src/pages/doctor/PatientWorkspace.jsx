import { useState } from "react";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import Icon from "../../components/Icon";
import StatusBadge from "../../components/doctor/StatusBadge";
import { patients } from "../../data/mockDoctorData";
import { FREQUENCIES, getAllergyLabel } from "../../data/mockClinicalData";

const tabs = [
    { label: "Medical Records", to: "records", icon: "folder_shared" },
    { label: "AI Summary", to: "summary", icon: "auto_awesome" },
    { label: "Consultation", to: "consultation", icon: "stethoscope" },
    { label: "Prescription", to: "prescription", icon: "medication" },
];

const tabClass = ({ isActive }) =>
    `inline-flex items-center gap-2 whitespace-nowrap px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-colors ${
        isActive
            ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
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
        <div className="flex items-center gap-space-sm">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="text-[18px]">{icon}</Icon>
            </span>
            <div className="flex flex-col">
                <span className="font-body-sm text-body-sm text-on-surface-variant">{label}</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">{value}</span>
            </div>
        </div>
    );
}

function WorkspaceBody({ patient }) {
    const [consultForm, setConsultForm] = useState({
        chiefComplaint: "",
        symptoms: "",
        diagnosis: "",
        notes: "",
    });
    const [consultStatus, setConsultStatus] = useState("not-started");
    const [rxForm, setRxForm] = useState({
        medication: "",
        dosage: "",
        frequency: FREQUENCIES[0],
        duration: "",
        instructions: "",
    });
    const [newPrescriptions, setNewPrescriptions] = useState([]);

    const allergyLabel = getAllergyLabel(patient);

    const context = {
        patient,
        allergyLabel,
        consult: { form: consultForm, setForm: setConsultForm, status: consultStatus, setStatus: setConsultStatus },
        rx: { form: rxForm, setForm: setRxForm, items: newPrescriptions, setItems: setNewPrescriptions },
    };

    return (
        <div className="w-full max-w-[1440px] mx-auto px-margin-mobile sm:px-margin py-space-xl space-y-space-lg">
            <Link
                to="/doctor/patients"
                className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:underline"
            >
                <Icon className="text-[18px]">arrow_back</Icon>
                Back to My Patients
            </Link>

            {/* Patient context: always visible */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg space-y-space-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-md">
                        <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container font-bold text-[22px] flex items-center justify-center">
                            {initials(patient.name)}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-space-sm">
                                <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
                                    {patient.name}
                                </h1>
                                <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                                    {patient.id}
                                </span>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                                {patient.age} yrs • {patient.sex} • Blood group {patient.bloodGroup}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-space-sm">
                        {allergyLabel && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-error/10 text-error font-label-sm text-label-sm font-medium">
                                <Icon className="text-[14px]">warning</Icon>
                                {allergyLabel}
                            </span>
                        )}
                        <StatusBadge status={patient.status} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md pt-space-md border-t border-surface-container">
                    <InfoRow icon="assignment" label="Visit type" value={patient.visitType} />
                    <InfoRow icon="schedule" label="Appointment time" value={patient.time} />
                    <InfoRow icon="location_on" label="Location" value={patient.location} />
                    <InfoRow icon="folder_shared" label="Records" value={getRecordAvailability(patient)} />
                </div>
            </div>

            {/* Workspace: tabs + section content */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg space-y-space-lg">
                <nav
                    aria-label="Patient workspace sections"
                    className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl overflow-x-auto"
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
            <div className="w-full max-w-[1440px] mx-auto px-margin-mobile sm:px-margin py-space-xl">
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm min-h-[320px] flex flex-col items-center justify-center text-center px-space-xl gap-space-sm">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="text-[28px]">person_off</Icon>
                    </div>
                    <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Patient not found</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                        We couldn't find a patient with ID {patientId}.
                    </p>
                    <Link
                        to="/doctor/patients"
                        className="mt-space-sm px-space-lg py-space-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                    >
                        Back to My Patients
                    </Link>
                </div>
            </div>
        );
    }

    return <WorkspaceBody key={patient.id} patient={patient} />;
}
