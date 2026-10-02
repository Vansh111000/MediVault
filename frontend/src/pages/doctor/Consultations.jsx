import { useState } from "react";
import Icon from "../../components/Icon";
import { patients } from "../../data/mockDoctorData";
import { initialConsultations, todayISO, formatDate } from "../../data/mockClinicalData";

const VISIT_TYPES = ["Follow-up", "New Consultation", "Specialist Review", "Lab Review"];

const inputClass =
    "w-full px-3 py-2 bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20";

function Field({ id, label, children }) {
    return (
        <div>
            <label htmlFor={id} className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
                {label}
            </label>
            {children}
        </div>
    );
}

const emptyForm = () => ({
    patientId: "",
    visitType: "Follow-up",
    symptoms: "",
    diagnosis: "",
    notes: "",
    date: todayISO(),
});

export default function Consultations() {
    const [form, setForm] = useState(emptyForm);
    const [consultations, setConsultations] = useState(initialConsultations);
    const [saved, setSaved] = useState(false);

    const patientName = (id) => patients.find((p) => p.id === id)?.name ?? "Unknown patient";

    const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handlePatientChange = (e) => {
        const id = e.target.value;
        const match = patients.find((p) => p.id === id);
        setForm((prev) => ({ ...prev, patientId: id, visitType: match ? match.visitType : prev.visitType }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const entry = {
            id: `c-${Date.now()}`,
            patientId: form.patientId,
            visitType: form.visitType,
            symptoms: form.symptoms.trim(),
            diagnosis: form.diagnosis.trim(),
            notes: form.notes.trim(),
            date: form.date,
            status: "Saved",
        };
        setConsultations((prev) => [entry, ...prev]);
        setForm(emptyForm());
        setSaved(true);
    };

    return (
        <div className="w-full max-w-[1440px] mx-auto px-margin-mobile sm:px-margin py-space-xl space-y-space-lg">
            <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                    Consultations
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Create and review consultation records for your patients.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                {/* New consultation form */}
                <section className="lg:col-span-5 bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg space-y-space-md">
                    <div className="flex items-center gap-2">
                        <Icon className="text-primary text-[20px]">edit_note</Icon>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">New Consultation</h2>
                    </div>

                    {saved && (
                        <div
                            role="status"
                            className="flex items-center gap-2 px-space-md py-space-sm rounded-xl bg-tertiary/10 text-tertiary font-label-md text-label-md font-semibold"
                        >
                            <Icon className="text-[18px]">check_circle</Icon>
                            Consultation saved successfully.
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        onChange={() => saved && setSaved(false)}
                        className="space-y-space-md"
                    >
                        <Field id="consult-patient" label="Patient">
                            <select
                                id="consult-patient"
                                required
                                value={form.patientId}
                                onChange={handlePatientChange}
                                className={inputClass}
                            >
                                <option value="">Select a patient</option>
                                {patients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.id})
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                            <Field id="consult-visit" label="Visit Type">
                                <select
                                    id="consult-visit"
                                    value={form.visitType}
                                    onChange={update("visitType")}
                                    className={inputClass}
                                >
                                    {VISIT_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field id="consult-date" label="Date">
                                <input
                                    id="consult-date"
                                    type="date"
                                    required
                                    value={form.date}
                                    onChange={update("date")}
                                    className={inputClass}
                                />
                            </Field>
                        </div>

                        <Field id="consult-symptoms" label="Symptoms / Reason for Visit">
                            <textarea
                                id="consult-symptoms"
                                required
                                rows={3}
                                value={form.symptoms}
                                onChange={update("symptoms")}
                                placeholder="Describe the symptoms or reason for the visit"
                                className={inputClass}
                            />
                        </Field>

                        <Field id="consult-diagnosis" label="Diagnosis">
                            <input
                                id="consult-diagnosis"
                                type="text"
                                required
                                value={form.diagnosis}
                                onChange={update("diagnosis")}
                                placeholder="e.g. Primary hypertension"
                                className={inputClass}
                            />
                        </Field>

                        <Field id="consult-notes" label="Treatment / Clinical Notes">
                            <textarea
                                id="consult-notes"
                                rows={4}
                                value={form.notes}
                                onChange={update("notes")}
                                placeholder="Treatment plan and clinical notes"
                                className={inputClass}
                            />
                        </Field>

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                        >
                            Save Consultation
                        </button>
                    </form>
                </section>

                {/* Recent consultations */}
                <section className="lg:col-span-7 bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg space-y-space-md">
                    <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            Recent Consultations
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {consultations.length} consultation{consultations.length === 1 ? "" : "s"}
                        </p>
                    </div>

                    <ul className="space-y-space-sm">
                        {consultations.map((c) => (
                            <li key={c.id} className="p-space-md bg-surface-container-low rounded-xl space-y-1">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                    <span className="font-title-md text-title-md text-on-surface font-semibold">
                                        {patientName(c.patientId)}
                                    </span>
                                    <span
                                        className={`px-2 py-0.5 rounded-md font-label-sm text-label-sm font-medium ${
                                            c.status === "Saved"
                                                ? "bg-primary/10 text-primary"
                                                : "bg-tertiary/10 text-tertiary"
                                        }`}
                                    >
                                        {c.status}
                                    </span>
                                </div>
                                <p className="font-body-md text-body-md text-on-surface">{c.diagnosis}</p>
                                <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 font-body-sm text-body-sm text-on-surface-variant">
                                    <span>{c.visitType}</span>
                                    <span>{formatDate(c.date)}</span>
                                    <span>{c.patientId}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
