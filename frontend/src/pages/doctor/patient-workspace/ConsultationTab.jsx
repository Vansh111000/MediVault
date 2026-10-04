import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Icon from "../../../components/Icon";
import AISummaryCard from "./AISummaryCard";
import PrescriptionSection from "./PrescriptionSection";
import { doctor } from "../../../data/mockDoctorData";
import { todayISO, formatDate } from "../../../data/mockClinicalData";

const inputClass = (error) =>
    `w-full px-3 py-2 bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md placeholder:text-outline focus:outline-none focus:ring-2 ${
        error ? "ring-2 ring-error/40 focus:ring-error/40" : "focus:ring-primary/20"
    }`;

const statusStyles = {
    "not-started": { label: "Not started", tone: "bg-surface-container text-on-surface-variant" },
    draft: { label: "Draft", tone: "bg-secondary/10 text-secondary" },
    completed: { label: "Completed", tone: "bg-tertiary/10 text-tertiary" },
};

function Field({ id, label, error, className = "", children }) {
    return (
        <div className={className}>
            <label htmlFor={id} className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
                {label}
            </label>
            {children}
            {error && <p className="mt-1 font-body-sm text-body-sm text-error">{error}</p>}
        </div>
    );
}

const isBlank = (value) => value.trim() === "";
const hasContent = (m) => [m.name, m.dosage, m.duration, m.instructions].some((v) => !isBlank(v));

function validate(form, medicines) {
    const fields = {};
    if (isBlank(form.chiefComplaint)) fields.chiefComplaint = "Required";
    if (isBlank(form.diagnosis)) fields.diagnosis = "Required";

    const meds = {};
    medicines.forEach((m) => {
        if (!hasContent(m)) return;
        const e = {};
        if (isBlank(m.name)) e.name = "Required";
        if (isBlank(m.dosage)) e.dosage = "Required";
        if (isBlank(m.duration)) e.duration = "Required";
        if (Object.keys(e).length > 0) meds[m.id] = e;
    });

    const order = [];
    if (fields.chiefComplaint) order.push("consult-complaint");
    if (fields.diagnosis) order.push("consult-diagnosis");
    medicines.forEach((m) => {
        ["name", "dosage", "duration"].forEach((f) => {
            if (meds[m.id]?.[f]) order.push(`${m.id}-${f}`);
        });
    });

    return { fields, meds, order, hasErrors: order.length > 0 };
}

function buildConsultationRecord(patient, form, medicines) {
    const date = todayISO();
    const stamp = Date.now();
    const medications = medicines.filter(hasContent).map((m) => ({
        name: m.name.trim(),
        dosage: m.dosage.trim(),
        frequency: m.frequency,
        duration: m.duration.trim(),
        instructions: m.instructions.trim(),
    }));

    return {
        consultation: {
            id: `${patient.id}-c-${stamp}`,
            date,
            doctor: doctor.name,
            hospital: doctor.hospital,
            visitType: patient.visitType,
            reason: form.chiefComplaint.trim(),
            symptoms: form.symptoms.trim(),
            examination: form.examination.trim(),
            diagnosis: form.diagnosis.trim(),
            treatment: form.treatment.trim(),
            followUp: form.followUp.trim(),
        },
        prescription:
            medications.length > 0
                ? {
                      id: `${patient.id}-p-${stamp}`,
                      date,
                      doctor: doctor.name,
                      hospital: doctor.hospital,
                      status: "Active",
                      medications,
                  }
                : null,
    };
}

function RecapRow({ label, children }) {
    if (!children) return null;
    return (
        <div>
            <dt className="font-body-sm text-body-sm text-outline">{label}</dt>
            <dd className="font-body-md text-body-md text-on-surface whitespace-pre-line">{children}</dd>
        </div>
    );
}

function CompletedPanel({ patient, record }) {
    const { consultation: c, prescription: p } = record;

    return (
        <div className="space-y-space-md">
            <div
                role="status"
                className="flex items-center gap-2 px-space-md py-space-sm rounded-xl bg-tertiary/10 text-tertiary font-label-md text-label-md font-semibold"
            >
                <Icon className="text-[18px]">check_circle</Icon>
                Consultation completed successfully.
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <RecapRow label="Chief complaint / reason for visit">{c.reason}</RecapRow>
                <RecapRow label="Diagnosis">{c.diagnosis}</RecapRow>
                <RecapRow label="Symptoms / clinical notes">{c.symptoms}</RecapRow>
                <RecapRow label="Examination / observations">{c.examination}</RecapRow>
                <RecapRow label="Treatment / advice">{c.treatment}</RecapRow>
                <RecapRow label="Follow-up / next steps">{c.followUp}</RecapRow>
            </dl>

            <div className="space-y-space-sm">
                <h3 className="font-title-md text-title-md text-on-surface font-bold">Prescription</h3>
                {!p ? (
                    <p className="font-body-md text-body-md text-on-surface-variant">No medicines prescribed.</p>
                ) : (
                    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-space-sm">
                        {p.medications.map((m, index) => (
                            <li key={`${m.name}-${index}`} className="px-space-md py-space-sm bg-surface-container-low rounded-xl">
                                <span className="font-label-md text-label-md text-on-surface font-semibold">
                                    {m.name} {m.dosage}
                                </span>
                                <span className="block font-body-sm text-body-sm text-on-surface-variant">
                                    {m.frequency} • {m.duration}
                                </span>
                                {m.instructions && (
                                    <span className="block font-body-sm text-body-sm text-outline">{m.instructions}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <p className="font-body-sm text-body-sm text-outline">
                Saved for this session only. 
            </p>

            <div className="flex flex-wrap items-center gap-space-sm">
                <Link
                    to="/doctor/patients"
                    className="px-space-lg py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                >
                    Back to My Patients
                </Link>
                <Link
                    to={`/doctor/patients/${patient.id}/records`}
                    className="px-space-lg py-2.5 bg-surface-container-low text-on-surface rounded-xl font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors"
                >
                    View Medical Records
                </Link>
            </div>
        </div>
    );
}

export default function ConsultationTab() {
    const { patient, allergyLabel, consult } = useOutletContext();
    const { form, setForm, medicines, setMedicines, status, setStatus, completed, setCompleted } = consult;

    const [submitted, setSubmitted] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);

    const result = validate(form, medicines);
    const badge = statusStyles[status];
    const err = submitted ? result.fields : {};

    const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSaveDraft = () => {
        setStatus("draft");
        setDraftSaved(true);
    };

    const handleComplete = (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (result.hasErrors) {
            document.getElementById(result.order[0])?.focus();
            return;
        }
        setCompleted(buildConsultationRecord(patient, form, medicines));
        setStatus("completed");
    };

    return (
        <section className="space-y-space-lg">
            <div className="flex flex-wrap items-start justify-between gap-space-sm">
                <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Current Consultation</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {patient.visitType} • {formatDate(todayISO())}
                    </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${badge.tone}`}>
                    {badge.label}
                </span>
            </div>

            <AISummaryCard patient={patient} allergyLabel={allergyLabel} />

            {completed ? (
                <CompletedPanel patient={patient} record={completed} />
            ) : (
                <form
                    noValidate
                    onSubmit={handleComplete}
                    onChange={() => draftSaved && setDraftSaved(false)}
                    className="space-y-space-lg"
                >
                    {/* Consultation */}
                    <section className="space-y-space-md">
                        <h3 className="font-title-md text-title-md text-on-surface font-bold">Consultation</h3>

                        <Field id="consult-complaint" label="Chief Complaint / Reason for Visit" error={err.chiefComplaint}>
                            <input
                                id="consult-complaint"
                                type="text"
                                value={form.chiefComplaint}
                                onChange={update("chiefComplaint")}
                                aria-invalid={!!err.chiefComplaint}
                                placeholder="e.g. Chest discomfort for 3 days"
                                className={inputClass(err.chiefComplaint)}
                            />
                        </Field>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                            <Field id="consult-symptoms" label="Symptoms / Clinical Notes">
                                <textarea
                                    id="consult-symptoms"
                                    rows={3}
                                    value={form.symptoms}
                                    onChange={update("symptoms")}
                                    placeholder="Symptoms, onset, duration, relevant notes"
                                    className={inputClass(false)}
                                />
                            </Field>
                            <Field id="consult-exam" label="Examination / Observations">
                                <textarea
                                    id="consult-exam"
                                    rows={3}
                                    value={form.examination}
                                    onChange={update("examination")}
                                    placeholder="e.g. BP, pulse, findings on examination"
                                    className={inputClass(false)}
                                />
                            </Field>
                        </div>

                        <Field id="consult-diagnosis" label="Diagnosis" error={err.diagnosis}>
                            <input
                                id="consult-diagnosis"
                                type="text"
                                value={form.diagnosis}
                                onChange={update("diagnosis")}
                                aria-invalid={!!err.diagnosis}
                                placeholder="e.g. Primary hypertension"
                                className={inputClass(err.diagnosis)}
                            />
                        </Field>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                            <Field id="consult-treatment" label="Treatment / Advice">
                                <textarea
                                    id="consult-treatment"
                                    rows={3}
                                    value={form.treatment}
                                    onChange={update("treatment")}
                                    placeholder="Treatment plan and advice given"
                                    className={inputClass(false)}
                                />
                            </Field>
                            <Field id="consult-followup" label="Follow-up / Next Steps">
                                <textarea
                                    id="consult-followup"
                                    rows={3}
                                    value={form.followUp}
                                    onChange={update("followUp")}
                                    placeholder="e.g. Review in 4 weeks, repeat blood test"
                                    className={inputClass(false)}
                                />
                            </Field>
                        </div>
                    </section>

                    <hr className="border-surface-container" />

                    {/* Prescription */}
                    <PrescriptionSection
                        medicines={medicines}
                        setMedicines={setMedicines}
                        errors={result.meds}
                        showErrors={submitted}
                        allergyLabel={allergyLabel}
                    />

                    <hr className="border-surface-container" />

                    {/* Actions */}
                    <div className="space-y-space-sm">
                        {draftSaved && (
                            <div
                                role="status"
                                className="flex items-center gap-2 px-space-md py-space-sm rounded-xl bg-secondary/10 text-secondary font-label-md text-label-md font-semibold"
                            >
                                <Icon className="text-[18px]">save</Icon>
                                Draft saved.
                            </div>
                        )}
                        {submitted && result.hasErrors && (
                            <div
                                role="alert"
                                className="flex items-center gap-2 px-space-md py-space-sm rounded-xl bg-error/10 text-error font-label-md text-label-md font-semibold"
                            >
                                <Icon className="text-[18px]">error</Icon>
                                Please complete the highlighted fields.
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-space-sm">
                            <button
                                type="submit"
                                className="px-space-lg py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                            >
                                Complete Consultation
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                className="px-space-lg py-2.5 bg-surface-container-low text-on-surface rounded-xl font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors"
                            >
                                Save Draft
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </section>
    );
}
