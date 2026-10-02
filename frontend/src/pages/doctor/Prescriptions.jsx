import { useState } from "react";
import Icon from "../../components/Icon";
import { patients } from "../../data/mockDoctorData";
import { FREQUENCIES, initialPrescriptions, todayISO, formatDate } from "../../data/mockClinicalData";

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
        <div className="w-full max-w-[1440px] mx-auto px-margin-mobile sm:px-margin py-space-xl space-y-space-lg">
            <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                    Prescriptions
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Create and review prescriptions for your consultations.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                {/* New prescription form */}
                <section className="lg:col-span-5 bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg space-y-space-md">
                    <div className="flex items-center gap-2">
                        <Icon className="text-primary text-[20px]">prescriptions</Icon>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            New Prescription
                        </h2>
                    </div>

                    {created && (
                        <div
                            role="status"
                            className="flex items-center gap-2 px-space-md py-space-sm rounded-xl bg-tertiary/10 text-tertiary font-label-md text-label-md font-semibold"
                        >
                            <Icon className="text-[18px]">check_circle</Icon>
                            Prescription created successfully.
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        onChange={() => created && setCreated(false)}
                        className="space-y-space-md"
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
                                <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-error/10 text-error font-label-sm text-label-sm font-medium">
                                    <Icon className="text-[14px]">warning</Icon>
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
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
                            className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                        >
                            Create Prescription
                        </button>
                    </form>
                </section>

                {/* Recent prescriptions */}
                <section className="lg:col-span-7 bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg space-y-space-md">
                    <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            Recent Prescriptions
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {prescriptions.length} prescription{prescriptions.length === 1 ? "" : "s"}
                        </p>
                    </div>

                    <ul className="space-y-space-sm">
                        {prescriptions.map((rx) => (
                            <li key={rx.id} className="p-space-md bg-surface-container-low rounded-xl space-y-space-sm">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                    <div>
                                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                                            {rx.medication}
                                        </span>
                                        <span className="block font-body-sm text-body-sm text-on-surface-variant">
                                            {patientName(rx.patientId)} • {rx.patientId}
                                        </span>
                                    </div>
                                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                                        {formatDate(rx.date)}
                                    </span>
                                </div>

                                <dl className="grid grid-cols-3 gap-space-sm font-body-sm text-body-sm">
                                    <div>
                                        <dt className="text-outline">Dosage</dt>
                                        <dd className="text-on-surface font-semibold">{rx.dosage}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-outline">Frequency</dt>
                                        <dd className="text-on-surface font-semibold">{rx.frequency}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-outline">Duration</dt>
                                        <dd className="text-on-surface font-semibold">{rx.duration}</dd>
                                    </div>
                                </dl>

                                {rx.instructions && (
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                                        {rx.instructions}
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
