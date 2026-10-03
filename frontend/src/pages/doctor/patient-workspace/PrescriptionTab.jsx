import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Icon from "../../../components/Icon";
import { FREQUENCIES, initialPrescriptions, todayISO, formatDate } from "../../../data/mockClinicalData";

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

export default function PrescriptionTab() {
    const { patient, allergyLabel, rx } = useOutletContext();
    const { form, setForm, items, setItems } = rx;
    const [created, setCreated] = useState(false);

    const previous = initialPrescriptions.filter((p) => p.patientId === patient.id);
    const all = [...items, ...previous];

    const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const entry = {
            id: `p-${Date.now()}`,
            patientId: patient.id,
            medication: form.medication.trim(),
            dosage: form.dosage.trim(),
            frequency: form.frequency,
            duration: form.duration.trim(),
            instructions: form.instructions.trim(),
            date: todayISO(),
        };
        setItems((prev) => [entry, ...prev]);
        setForm({ medication: "", dosage: "", frequency: FREQUENCIES[0], duration: "", instructions: "" });
        setCreated(true);
    };

    return (
        <section className="space-y-space-md">
            <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Prescription</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Create a prescription for {patient.name}.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                <div className="lg:col-span-6 space-y-space-md">
                    {allergyLabel && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-error/10 text-error font-label-sm text-label-sm font-medium">
                            <Icon className="text-[14px]">warning</Icon>
                            {allergyLabel}
                        </span>
                    )}

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
                            className="w-full sm:w-auto px-space-lg py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                        >
                            Create Prescription
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-6 space-y-space-sm">
                    <h3 className="font-title-md text-title-md text-on-surface font-bold">Prescriptions</h3>

                    {all.length === 0 ? (
                        <p className="font-body-md text-body-md text-on-surface-variant">
                            No prescriptions for this patient yet.
                        </p>
                    ) : (
                        <ul className="space-y-space-sm">
                            {all.map((p) => (
                                <li key={p.id} className="p-space-md bg-surface-container-low rounded-xl space-y-1">
                                    <div className="flex flex-wrap items-center justify-between gap-1">
                                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                                            {p.medication} {p.dosage}
                                        </span>
                                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                                            {formatDate(p.date)}
                                        </span>
                                    </div>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                                        {p.frequency} • {p.duration}
                                    </p>
                                    {p.instructions && (
                                        <p className="font-body-sm text-body-sm text-outline">{p.instructions}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    );
}
