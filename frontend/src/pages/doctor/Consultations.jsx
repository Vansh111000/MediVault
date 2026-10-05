import { useState } from "react";
import Icon from "../../components/Icon";
import { patients, initialConsultations, todayISO, formatDate } from "../../data/mockData";

const VISIT_TYPES = ["Follow-up", "New Consultation", "Specialist Review", "Lab Review"];

const inputClass =
    "w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all";

function Field({ id, label, children }) {
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1">
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
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Consultations
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                    Create and review consultation records for your patients.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* New consultation form */}
                <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Icon className="text-teal-700 text-[20px]">edit_note</Icon>
                        <h2 className="text-base font-bold text-slate-900">New Consultation</h2>
                    </div>

                    {saved && (
                        <div
                            role="status"
                            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold"
                        >
                            <Icon className="text-[18px]">check_circle</Icon>
                            Consultation saved successfully.
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        onChange={() => saved && setSaved(false)}
                        className="space-y-4"
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                        >
                            Save Consultation
                        </button>
                    </form>
                </section>

                {/* Recent consultations */}
                <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Recent Consultations
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                                {consultations.length} consultation{consultations.length === 1 ? "" : "s"}
                            </p>
                        </div>
                    </div>

                    <ul className="space-y-3">
                        {consultations.map((c) => (
                            <li key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                    <span className="text-sm font-bold text-slate-900">
                                        {patientName(c.patientId)}
                                    </span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                            c.status === "Saved"
                                                ? "bg-teal-50 text-teal-700 border border-teal-200/60"
                                                : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                        }`}
                                    >
                                        {c.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-700 font-medium">{c.diagnosis}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium pt-0.5">
                                    <span className="font-semibold text-slate-600">{c.visitType}</span>
                                    <span>•</span>
                                    <span>{formatDate(c.date)}</span>
                                    <span>•</span>
                                    <span className="font-mono text-slate-600">{c.patientId}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
