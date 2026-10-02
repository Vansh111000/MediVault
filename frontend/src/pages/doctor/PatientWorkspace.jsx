import { Link, useParams } from "react-router-dom";
import Icon from "../../components/Icon";
import StatusBadge from "../../components/doctor/StatusBadge";
import { doctor, patients } from "../../data/mockDoctorData";

const mockHistory = {
    "MV-10482": [
        { type: "consultation", title: "Previous consultation", detail: "Routine cardiac review. Advised lifestyle changes.", date: "12 Aug 2026" },
        { type: "diagnosis", title: "Diagnosis", detail: "Primary hypertension", date: "12 Aug 2026" },
        { type: "prescription", title: "Prescription", detail: "Amlodipine 5mg, once daily", date: "12 Aug 2026" },
        { type: "report", title: "Lipid panel report", detail: "Total cholesterol 218 mg/dL", date: "10 Aug 2026" },
    ],
    "MV-10831": [
        { type: "consultation", title: "Previous consultation", detail: "General check-up with no major concerns.", date: "03 Jul 2026" },
        { type: "diagnosis", title: "Diagnosis", detail: "Mild iron deficiency", date: "03 Jul 2026" },
        { type: "prescription", title: "Prescription", detail: "Iron supplement, once daily", date: "03 Jul 2026" },
        { type: "report", title: "Metabolic panel report", detail: "Values within normal range", date: "02 Jul 2026" },
    ],
    "MV-09217": [
        { type: "consultation", title: "Previous consultation", detail: "Follow-up after chest discomfort episode.", date: "22 Aug 2026" },
        { type: "diagnosis", title: "Diagnosis", detail: "Stable angina", date: "22 Aug 2026" },
        { type: "prescription", title: "Prescription", detail: "Atorvastatin 20mg, once daily", date: "22 Aug 2026" },
        { type: "report", title: "ECG report", detail: "Mild ST-segment changes noted", date: "21 Aug 2026" },
    ],
    "MV-11204": [
        { type: "consultation", title: "Previous consultation", detail: "Referred for specialist cardiac review.", date: "30 Aug 2026" },
        { type: "diagnosis", title: "Diagnosis", detail: "Palpitations under evaluation", date: "30 Aug 2026" },
        { type: "prescription", title: "Prescription", detail: "Metoprolol 25mg, twice daily", date: "30 Aug 2026" },
        { type: "report", title: "Echocardiogram report", detail: "Normal heart structure and function", date: "29 Aug 2026" },
    ],
    "MV-08943": [
        { type: "consultation", title: "Previous consultation", detail: "Review of recent lab results.", date: "05 Sep 2026" },
        { type: "diagnosis", title: "Diagnosis", detail: "Type 2 diabetes, controlled", date: "05 Sep 2026" },
        { type: "prescription", title: "Prescription", detail: "Metformin 500mg, twice daily", date: "05 Sep 2026" },
        { type: "report", title: "HbA1c report", detail: "HbA1c 6.8%", date: "04 Sep 2026" },
    ],
    "MV-11377": [
        { type: "consultation", title: "Previous consultation", detail: "Follow-up for recurring fatigue.", date: "14 Sep 2026" },
        { type: "diagnosis", title: "Diagnosis", detail: "Mild anaemia", date: "14 Sep 2026" },
        { type: "prescription", title: "Prescription", detail: "Folic acid 5mg, once daily", date: "14 Sep 2026" },
        { type: "report", title: "Complete blood count", detail: "Haemoglobin slightly low", date: "13 Sep 2026" },
    ],
    "MV-07761": [
        { type: "consultation", title: "Previous consultation", detail: "Routine follow-up. Condition stable.", date: "18 Sep 2026" },
        { type: "diagnosis", title: "Diagnosis", detail: "Chronic heart failure, stable", date: "18 Sep 2026" },
        { type: "prescription", title: "Prescription", detail: "Furosemide 40mg, once daily", date: "18 Sep 2026" },
        { type: "report", title: "Chest X-ray report", detail: "No acute changes", date: "17 Sep 2026" },
    ],
};

const historyIcons = {
    consultation: "stethoscope",
    diagnosis: "diagnosis",
    prescription: "medication",
    report: "description",
};

function initials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
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

    const isCompleted = patient.status === "completed";
    const history = mockHistory[patient.id] ?? [];
    const source = patient.consent.type === "cross-hospital" ? patient.consent.hospital : doctor.hospital;
    const recordAvailability = isCompleted ? "Visit summary available" : patient.consent.label;

    return (
        <div className="w-full max-w-[1440px] mx-auto px-margin-mobile sm:px-margin py-space-xl space-y-space-lg">
            <Link
                to="/doctor/patients"
                className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:underline"
            >
                <Icon className="text-[18px]">arrow_back</Icon>
                Back to My Patients
            </Link>

            {/* Patient header */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md">
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
                    {patient.hasAllergy && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-error/10 text-error font-label-sm text-label-sm font-medium">
                            <Icon className="text-[14px]">warning</Icon>
                            Allergy on record
                        </span>
                    )}
                    <StatusBadge status={patient.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                {/* Medical history */}
                <section className="lg:col-span-8 bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg space-y-space-md">
                    <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Medical History</h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Previous consultations, diagnoses, prescriptions and reports.
                        </p>
                    </div>

                    {history.length === 0 ? (
                        <div className="py-space-xl flex flex-col items-center text-center gap-1">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-space-sm">
                                <Icon className="text-[24px]">folder_off</Icon>
                            </div>
                            <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                                No previous records
                            </h3>
                            <p className="font-body-md text-body-md text-on-surface-variant">
                                This is a new patient. History will appear here after the first consultation.
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-space-sm">
                            {history.map((item) => (
                                <li
                                    key={item.title}
                                    className="p-space-md bg-surface-container-low rounded-xl flex items-start gap-space-sm"
                                >
                                    <span className="w-9 h-9 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shrink-0">
                                        <Icon className="text-[20px]">{historyIcons[item.type]}</Icon>
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-1">
                                            <span className="font-label-md text-label-md text-on-surface font-semibold">
                                                {item.title}
                                            </span>
                                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                                                {item.date}
                                            </span>
                                        </div>
                                        <p className="font-body-md text-body-md text-on-surface mt-0.5">{item.detail}</p>
                                        <span className="font-body-sm text-body-sm text-outline">{source}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <aside className="lg:col-span-4 flex flex-col gap-space-lg">
                    {/* Visit information */}
                    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg space-y-space-md">
                        <h2 className="font-title-md text-title-md text-on-surface font-bold">Visit Information</h2>
                        <InfoRow icon="schedule" label="Appointment time" value={patient.time} />
                        <InfoRow icon="location_on" label="Location" value={patient.location} />
                        <InfoRow icon="assignment" label="Visit type" value={patient.visitType} />
                    </div>

                    {/* Current visit */}
                    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg space-y-space-md">
                        <h2 className="font-title-md text-title-md text-on-surface font-bold">Current Visit</h2>

                        <dl className="space-y-space-sm font-body-md text-body-md">
                            <div className="flex items-center justify-between gap-space-sm">
                                <dt className="text-on-surface-variant">Visit type</dt>
                                <dd className="text-on-surface font-semibold">{patient.visitType}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-space-sm">
                                <dt className="text-on-surface-variant">Status</dt>
                                <dd>
                                    <StatusBadge status={patient.status} />
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-space-sm">
                                <dt className="text-on-surface-variant">Records</dt>
                                <dd className="text-on-surface font-semibold text-right">{recordAvailability}</dd>
                            </div>
                        </dl>

                        <div className="flex flex-col gap-space-sm pt-space-xs">
                            <Link
                                to={isCompleted ? "/doctor/records" : "/doctor/consultations"}
                                className="w-full text-center py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                            >
                                {isCompleted ? "View Summary" : "Start Consultation"}
                            </Link>
                            <Link
                                to="/doctor/records"
                                className="w-full text-center py-2.5 bg-surface-container-low text-on-surface rounded-xl font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors"
                            >
                                View Medical Records
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
