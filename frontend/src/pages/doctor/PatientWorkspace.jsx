import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useParams, useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";
import StatusBadge from "../../components/doctor/StatusBadge";
import { toDisplayStatus, toDisplayVisitType } from "../../components/doctor/patientDisplay";
import VisitSummary from "./patient-workspace/VisitSummary";
import api from "../../services/api";

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
    return (name || "?")
        .split(" ")
        .map((part) => part[0] || "")
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function getAllergyLabel(patient) {
    if (!patient?.allergies || patient.allergies.length === 0) return null;
    const list = patient.allergies.map(a => typeof a === 'string' ? a : a.allergen || a.name || 'Allergen').filter(Boolean);
    return list.length > 0 ? `Allergy: ${list.join(", ")}` : null;
}

function getBodyMeasurements(patient) {
    const vitals = patient?.vitals || {};
    return {
        height: vitals.height ? `${vitals.height} cm` : "--",
        weight: vitals.weight ? `${vitals.weight} kg` : "--",
    };
}

function getRecordAvailability(patient) {
    if (patient.status === "completed") return "Visit summary available";
    if (!patient.consent || patient.consent.type === "none" || patient.consent.type === "local") {
        return "Local Hospital Records Only";
    }
    return patient.consent.label || "Records available";
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

function WorkspaceBody({ patient, visitId, initialConsultation }) {
    const [consultForm, setConsultForm] = useState({
        clinicalNote: initialConsultation?.clinicalNote || "",
        chiefComplaint: "",
        diagnosis: "",
    });
    const [consultStatus, setConsultStatus] = useState(
        initialConsultation?.status === "completed"
            ? "completed"
            : initialConsultation?.status === "draft"
            ? "draft"
            : "not-started"
    );
    const [completedRecord, setCompletedRecord] = useState(
        initialConsultation?.status === "completed"
            ? {
                  consultation: {
                      id: initialConsultation._id,
                      date: initialConsultation.completedAt || initialConsultation.createdAt,
                      doctor: initialConsultation.doctor?.name || "Attending Physician",
                      hospital: initialConsultation.hospital?.name || "Medical Center",
                      clinicalNote: initialConsultation.clinicalNote,
                      reason: "Clinical Consultation",
                  },
                  prescription: null,
              }
            : null
    );
    const [existingConsultationId, setExistingConsultationId] = useState(initialConsultation?._id || null);

    const allergyLabel = getAllergyLabel(patient);
    const measurements = getBodyMeasurements(patient);
    const { height, weight } = measurements;

    const profileDetails = [
        { label: "Age", value: `${patient.age || "--"} yrs` },
        { label: "Sex", value: patient.gender || "--" },
        { label: "Height", value: height },
        { label: "Weight", value: weight },
        { label: "Blood Group", value: patient.bloodGroup || "--" },
    ];

    // Context passed down to tab routes via Outlet
    const context = {
        patient,
        visitId,
        allergyLabel,
        consult: {
            consultationId: existingConsultationId,
            setConsultationId: setExistingConsultationId,
            form: consultForm,
            setForm: setConsultForm,
            status: consultStatus,
            setStatus: setConsultStatus,
            completed: completedRecord,
            setCompleted: setCompletedRecord,
            initialConsultation,
        },
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
            <Link
                to="/doctor"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
            >
                <Icon className="text-[18px]">arrow_back</Icon>
                Back to Dashboard
            </Link>

            {/* Patient context card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 font-bold text-xl flex items-center justify-center">
                            {initials(patient.name)}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{patient.name}</h1>
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                                    {patient.mediVaultId || "—"}
                                </span>
                            </div>
                            <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-1.5 text-xs">
                                {profileDetails.map(({ label, value }) => (
                                    <div key={label} className="flex items-baseline gap-1">
                                        <dt className="text-slate-400 font-medium">{label}:</dt>
                                        <dd className="text-slate-700 font-semibold">{value}</dd>
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
                        <StatusBadge status={toDisplayStatus(patient.status)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                    <InfoRow icon="assignment" label="Visit type" value={toDisplayVisitType(patient.visitType)} />
                    <InfoRow icon="schedule" label="Appointment time" value={patient.appointmentDate ? `${patient.appointmentDate} • ${patient.time}` : patient.time || "--"} />
                    <InfoRow icon="medical_services" label="Reason for visit" value={patient.reasonForVisit || "General Consultation"} />
                    <InfoRow icon="folder_shared" label="Records" value={getRecordAvailability(patient)} />
                </div>

                {(patient.reportedSymptoms || (patient.preliminaryVitals && Object.keys(patient.preliminaryVitals).length > 0)) && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-700">
                        {patient.reportedSymptoms && (
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">Symptoms:</span>
                                <span>{patient.reportedSymptoms}</span>
                            </div>
                        )}
                        {patient.preliminaryVitals?.bp && (
                            <div className="flex items-center gap-1">
                                <span className="text-slate-500 font-medium">BP:</span>
                                <span className="font-semibold text-slate-900">{patient.preliminaryVitals.bp}</span>
                            </div>
                        )}
                        {patient.preliminaryVitals?.pulse && (
                            <div className="flex items-center gap-1">
                                <span className="text-slate-500 font-medium">Pulse:</span>
                                <span className="font-semibold text-slate-900">{patient.preliminaryVitals.pulse}</span>
                            </div>
                        )}
                        {patient.preliminaryVitals?.spO2 && (
                            <div className="flex items-center gap-1">
                                <span className="text-slate-500 font-medium">SpO2:</span>
                                <span className="font-semibold text-slate-900">{patient.preliminaryVitals.spO2}</span>
                            </div>
                        )}
                        {patient.preliminaryVitals?.temp && (
                            <div className="flex items-center gap-1">
                                <span className="text-slate-500 font-medium">Temp:</span>
                                <span className="font-semibold text-slate-900">{patient.preliminaryVitals.temp}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tab navigation and content */}
            {patient.status === "completed" ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
                    <VisitSummary patient={patient} />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
                    <nav
                        aria-label="Patient workspace sections"
                        className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto"
                    >
                        {tabs.map((tab) => (
                            <NavLink
                                key={tab.to}
                                to={visitId ? `${tab.to}?visitId=${visitId}` : tab.to}
                                className={tabClass}
                            >
                                <Icon className="text-[18px]">{tab.icon}</Icon>
                                {tab.label}
                            </NavLink>
                        ))}
                    </nav>
                    <Outlet context={context} />
                </div>
            )}
        </div>
    );
}

export default function PatientWorkspace() {
    const { patientId } = useParams();
    const [searchParams] = useSearchParams();
    const visitIdFromUrl = searchParams.get("visitId");

    const [patientData, setPatientData] = useState(null);
    const [activeVisitId, setActiveVisitId] = useState(visitIdFromUrl || null);
    const [initialConsult, setInitialConsult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);
        setNotFound(false);

        async function loadData() {
            try {
                let resolvedPatient = null;
                let resolvedVisit = null;
                let resolvedConsultations = [];

                if (visitIdFromUrl) {
                    // Fetch directly by visit ID – validates doctor assignment on backend
                    const visitRes = await api.getVisitById(visitIdFromUrl);
                    if (visitRes?.data?.visit) {
                        resolvedVisit = visitRes.data.visit;
                        resolvedPatient = resolvedVisit.patient;
                        resolvedConsultations = visitRes.data.consultations || [];
                    }
                }

                // If patient not resolved from visit, fetch patient by ObjectId
                if (!resolvedPatient && patientId) {
                    const patRes = await api.getPatient(patientId);
                    if (patRes?.data) {
                        resolvedPatient = patRes.data;
                    }
                }

                // If we don't have a visit yet, fetch doctor's visits for this patient
                if (!resolvedVisit && resolvedPatient) {
                    const visitsRes = await api.getVisits({ patientId: resolvedPatient._id || resolvedPatient.id });
                    if (visitsRes?.data && visitsRes.data.length > 0) {
                        resolvedVisit = visitsRes.data[0];
                    }
                }

                if (!resolvedPatient) {
                    if (isMounted) setNotFound(true);
                    return;
                }

                // Determine visit ID and status
                const visitId = resolvedVisit?._id || resolvedVisit?.id || visitIdFromUrl || null;
                const status = resolvedVisit?.status === "in_queue" ? "waiting"
                    : resolvedVisit?.status === "completed" ? "completed"
                    : "checked-in";

                const time = resolvedVisit?.checkInTime
                    ? new Date(resolvedVisit.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                    : "--";

                // Check consent for cross-hospital records
                let consentInfo = { type: "local", label: "Local Hospital Records Only" };
                try {
                    const consentRes = await api.getPatientConsents(resolvedPatient._id || resolvedPatient.id);
                    if (consentRes?.data && Array.isArray(consentRes.data)) {
                        const approvedConsent = consentRes.data.find(c => c.status === "approved" && new Date(c.expiresAt) > new Date());
                        if (approvedConsent) {
                            consentInfo = { type: "approved", label: "Approved Cross-Hospital Access" };
                        } else {
                            const pendingConsent = consentRes.data.find(c => c.status === "pending");
                            if (pendingConsent) {
                                consentInfo = { type: "pending", label: "Consent Pending Approval" };
                            }
                        }
                    }
                } catch (_) {}

                const appointmentDateStr = resolvedVisit?.appointmentDate
                    ? new Date(resolvedVisit.appointmentDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })
                    : "";
                const appointmentTimeStr = resolvedVisit?.appointmentTime || time;

                if (isMounted) {
                    setActiveVisitId(visitId);
                    setInitialConsult(resolvedConsultations[0] || null);
                    setPatientData({
                        id: resolvedPatient._id || resolvedPatient.id,
                        _id: resolvedPatient._id || resolvedPatient.id,
                        mediVaultId: resolvedPatient.mediVaultId,
                        name: resolvedPatient.name,
                        age: resolvedPatient.age,
                        gender: resolvedPatient.gender,
                        bloodGroup: resolvedPatient.bloodGroup,
                        phone: resolvedPatient.phone,
                        email: resolvedPatient.email,
                        allergies: resolvedPatient.allergies || [],
                        chronicConditions: resolvedPatient.chronicConditions || [],
                        vitals: resolvedVisit?.preliminaryVitals && Object.keys(resolvedVisit.preliminaryVitals).length > 0
                            ? { ...resolvedPatient.vitals, ...resolvedVisit.preliminaryVitals }
                            : (resolvedPatient.vitals || {}),
                        status,
                        rawStatus: resolvedVisit?.status || "checked_in",
                        time: appointmentTimeStr,
                        appointmentDate: appointmentDateStr,
                        appointmentTime: appointmentTimeStr,
                        visitType: resolvedVisit?.visitType || "New Consultation",
                        reasonForVisit: resolvedVisit?.reasonForVisit || "General Consultation",
                        reportedSymptoms: resolvedVisit?.reportedSymptoms || "",
                        preliminaryVitals: resolvedVisit?.preliminaryVitals || {},
                        tokenNumber: resolvedVisit?.tokenNumber || "",
                        consent: consentInfo,
                    });
                }
            } catch (err) {
                if (isMounted) {
                    if (err.status === 404) {
                        setNotFound(true);
                    } else if (err.status === 403) {
                        setError(err.message || "Access denied. You are not assigned to this visit.");
                    } else {
                        setError(err.message || "Failed to load patient record.");
                    }
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadData();
        return () => { isMounted = false; };
    }, [patientId, visitIdFromUrl]);

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs min-h-[320px] flex flex-col items-center justify-center text-center p-8 gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-teal-700 border-t-transparent animate-spin" />
                    <p className="text-sm font-semibold text-slate-700">Loading patient record…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs min-h-[320px] flex flex-col items-center justify-center text-center p-8 gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center justify-center">
                        <Icon className="text-[26px]">error_outline</Icon>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Access Restricted</h1>
                    <p className="text-xs text-slate-500 max-w-md font-medium">{error}</p>
                    <Link
                        to="/doctor"
                        className="mt-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (notFound || !patientData) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs min-h-[320px] flex flex-col items-center justify-center text-center p-8 gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center">
                        <Icon className="text-[26px]">person_off</Icon>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Patient not found</h1>
                    <p className="text-xs text-slate-500 max-w-md font-medium">
                        We couldn't find a patient record for this ID. The patient may not be assigned to you, or the ID may be incorrect.
                    </p>
                    <Link
                        to="/doctor"
                        className="mt-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <WorkspaceBody
            key={patientData.id}
            patient={patientData}
            visitId={activeVisitId}
            initialConsultation={initialConsult}
        />
    );
}
