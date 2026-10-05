import { useState } from "react";
import Icon from "../../components/Icon";
import { patients, FREQUENCIES, initialPrescriptions, todayISO, formatDate } from "../../data/mockData";

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
    medication: "",
    dosage: "",
    frequency: FREQUENCIES[0],
    duration: "",
    instructions: "",
});

export default function Prescriptions() {
    const [form, setForm] = useState(emptyForm);
    const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
    const [created, setCreated] = useState(false);

    const selectedPatient = patients.find((p) => p.id === form.patientId);
    const patientName = (id) => patients.find((p) => p.id === id)?.name ?? "Unknown patient";

    const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const entry = {
            id: `p-${Date.now()}`,
            patientId: form.patientId,
            medication: form.medication.trim(),
            dosage: form.dosage.trim(),
            frequency: form.frequency,
            duration: form.duration.trim(),
            instructions: form.instructions.trim(),
            date: todayISO(),
        };
        setPrescriptions((prev) => [entry, ...prev]);
        setForm(emptyForm());
        setCreated(true);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Prescriptions
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                    Create and review prescriptions for your consultations.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* New prescription form */}
                <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Icon className="text-teal-700 text-[20px]">prescriptions</Icon>
                        <h2 className="text-base font-bold text-slate-900">
                            New Prescription
                        </h2>
                    </div>

                    {created && (
                        <div
                            role="status"
                            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold"
                        >
                            <Icon className="text-[18px]">check_circle</Icon>
                            Prescription created successfully.
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        onChange={() => created && setCreated(false)}
                        className="space-y-4"
                    >
                        <Field id="rx-patient" label="Patient">
                            <select
                                id="rx-patient"
                                required
                                value={form.patientId}
                                onChange={update("patientId")}
                                className={inputClass}
                            >
                                <option value="">Select a patient</option>
                                {patients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.id})
                                    </option>
                                ))}
                            </select>
                            {selectedPatient?.hasAllergy && (
                                <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                                    <Icon className="text-[13px]">warning</Icon>
                                    Allergy on record
                                </span>
                            )}
                        </Field>

                        <Field id="rx-medication" label="Medication">
                            <input
                                id="rx-medication"
                                type="text"
                                required
                                value={form.medication}
                                onChange={update("medication")}
                                placeholder="e.g. Amlodipine"
                                className={inputClass}
                            />
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field id="rx-dosage" label="Dosage">
                                <input
                                    id="rx-dosage"
                                    type="text"
                                    required
                                    value={form.dosage}
                                    onChange={update("dosage")}
                                    placeholder="e.g. 5mg"
                                    className={inputClass}
                                />
                            </Field>

                            <Field id="rx-frequency" label="Frequency">
                                <select
                                    id="rx-frequency"
                                    value={form.frequency}
                                    onChange={update("frequency")}
                                    className={inputClass}
                                >
                                    {FREQUENCIES.map((f) => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <Field id="rx-duration" label="Duration">
                            <input
                                id="rx-duration"
                                type="text"
                                required
                                value={form.duration}
                                onChange={update("duration")}
                                placeholder="e.g. 30 days"
                                className={inputClass}
                            />
                        </Field>

                        <Field id="rx-instructions" label="Instructions">
                            <textarea
                                id="rx-instructions"
                                rows={3}
                                value={form.instructions}
                                onChange={update("instructions")}
                                placeholder="e.g. Take after breakfast"
                                className={inputClass}
                            />
                        </Field>

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                        >
                            Create Prescription
                        </button>
                    </form>
                </section>

                {/* Recent prescriptions */}
                <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Recent Prescriptions
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                                {prescriptions.length} prescription{prescriptions.length === 1 ? "" : "s"}
                            </p>
                        </div>
                    </div>

                    <ul className="space-y-3">
                        {prescriptions.map((rx) => (
                            <li key={rx.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                    <div>
                                        <span className="text-sm font-bold text-slate-900">
                                            {rx.medication}
                                        </span>
                                        <span className="block text-xs text-slate-500 font-medium">
                                            {patientName(rx.patientId)} • <span className="font-mono">{rx.patientId}</span>
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">
                                        {formatDate(rx.date)}
                                    </span>
                                </div>

                                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-200/50">
                                    <div>
                                        <dt className="text-slate-400 text-[11px] font-medium">Dosage</dt>
                                        <dd className="text-slate-900 font-semibold">{rx.dosage}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-400 text-[11px] font-medium">Frequency</dt>
                                        <dd className="text-slate-900 font-semibold">{rx.frequency}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-400 text-[11px] font-medium">Duration</dt>
                                        <dd className="text-slate-900 font-semibold">{rx.duration}</dd>
                                    </div>
                                </dl>

                                {rx.instructions && (
                                    <p className="text-xs text-slate-600 bg-white/70 p-2 rounded-lg border border-slate-200/60">
                                        <span className="font-semibold text-slate-700">Instructions:</span> {rx.instructions}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
