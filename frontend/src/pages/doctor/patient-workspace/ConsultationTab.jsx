import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Icon from "../../../components/Icon";
import AISummaryCard from "./AISummaryCard";
import PrescriptionSection from "./PrescriptionSection";
import { doctor, todayISO, formatDate } from "../../../data/mockData";

const inputClass = (error) =>
    `w-full px-3 py-2 bg-slate-50 border text-slate-900 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
        error
            ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
            : "border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
    }`;

const statusStyles = {
    "not-started": { label: "Not started", tone: "bg-slate-100 text-slate-600 border border-slate-200" },
    draft: { label: "Draft", tone: "bg-sky-50 text-sky-700 border border-sky-200" },
    completed: { label: "Completed", tone: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
};

function Field({ id, label, error, className = "", children }) {
    return (
        <div className={className}>
            <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1">
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-[11px] text-rose-600 font-semibold">{error}</p>}
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
            <dt className="text-slate-400 text-[11px] font-semibold">{label}</dt>
            <dd className="text-slate-800 text-xs font-medium whitespace-pre-line mt-0.5">{children}</dd>
        </div>
    );
}

function CompletedPanel({ patient, record }) {
    const { consultation: c, prescription: p } = record;

    return (
        <div className="space-y-4">
            <div
                role="status"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold"
            >
                <Icon className="text-[18px]">check_circle</Icon>
                Consultation completed successfully.
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <RecapRow label="Chief complaint / reason for visit">{c.reason}</RecapRow>
                <RecapRow label="Diagnosis">{c.diagnosis}</RecapRow>
                <RecapRow label="Symptoms / clinical notes">{c.symptoms}</RecapRow>
                <RecapRow label="Examination / observations">{c.examination}</RecapRow>
                <RecapRow label="Treatment / advice">{c.treatment}</RecapRow>
                <RecapRow label="Follow-up / next steps">{c.followUp}</RecapRow>
            </dl>

            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Prescription</h3>
                {!p ? (
                    <p className="text-xs text-slate-500 font-medium">No medicines prescribed.</p>
                ) : (
                    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {p.medications.map((m, index) => (
                            <li key={`${m.name}-${index}`} className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl">
                                <span className="text-xs font-bold text-slate-900">
                                    {m.name} {m.dosage}
                                </span>
                                <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                                    {m.frequency} • {m.duration}
                                </span>
                                {m.instructions && (
                                    <span className="block text-[11px] text-slate-400 mt-0.5">Instructions: {m.instructions}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
                Saved for this session only.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                    to="/doctor"
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                >
                    Back to Dashboard
                </Link>
                <Link
                    to={`/doctor/patients/${patient.id}/records`}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs"
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
        <section className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-2 border-b border-slate-100">
                <div>
                    <h2 className="text-base font-bold text-slate-900">Current Consultation</h2>
                    <p className="text-xs text-slate-500 font-medium">
                        {patient.visitType} • {formatDate(todayISO())}
                    </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badge.tone}`}>
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
                    className="space-y-6"
                >
                    {/* Consultation */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900">Consultation Evaluation</h3>

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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <hr className="border-slate-200/80" />

                    {/* Prescription */}
                    <PrescriptionSection
                        medicines={medicines}
                        setMedicines={setMedicines}
                        errors={result.meds}
                        showErrors={submitted}
                        allergyLabel={allergyLabel}
                    />

                    <hr className="border-slate-200/80" />

                    {/* Actions */}
                    <div className="space-y-3">
                        {draftSaved && (
                            <div
                                role="status"
                                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200/80 text-xs font-semibold"
                            >
                                <Icon className="text-[18px]">save</Icon>
                                Draft saved.
                            </div>
                        )}
                        {submitted && result.hasErrors && (
                            <div
                                role="alert"
                                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200/80 text-xs font-semibold"
                            >
                                <Icon className="text-[18px]">error</Icon>
                                Please complete the highlighted fields.
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                            >
                                Complete Consultation
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs"
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
