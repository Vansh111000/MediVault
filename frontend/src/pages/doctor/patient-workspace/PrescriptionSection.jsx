import Icon from "../../../components/Icon";
import { FREQUENCIES, createMedicine } from "../../../data/mockClinicalData";

const inputClass = (error) =>
    `w-full px-3 py-2 bg-surface-container-lowest text-on-surface rounded-xl font-body-md text-body-md placeholder:text-outline focus:outline-none focus:ring-2 ${
        error ? "ring-2 ring-error/40 focus:ring-error/40" : "focus:ring-primary/20"
    }`;

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

export default function PrescriptionSection({ medicines, setMedicines, errors, showErrors, allergyLabel }) {
    const update = (id, field) => (e) =>
        setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: e.target.value } : m)));

    const add = () => setMedicines((prev) => [...prev, createMedicine()]);
    const remove = (id) => setMedicines((prev) => prev.filter((m) => m.id !== id));

    return (
        <section className="space-y-space-md">
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <div>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold">Prescription</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Add every medicine for this consultation. Empty rows are ignored.
                    </p>
                </div>
                {allergyLabel && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-error/10 text-error font-label-sm text-label-sm font-medium">
                        <Icon className="text-[14px]">warning</Icon>
                        {allergyLabel}
                    </span>
                )}
            </div>

            {medicines.length === 0 && (
                <p className="px-space-md py-space-sm bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface-variant">
                    No medicines added. Add a medicine if one is prescribed.
                </p>
            )}

            <ul className="space-y-space-sm">
                {medicines.map((m, index) => {
                    const err = (showErrors && errors[m.id]) || {};
                    return (
                        <li key={m.id} className="p-space-md bg-surface-container-low rounded-xl space-y-space-sm">
                            <div className="flex items-center justify-between">
                                <span className="font-label-md text-label-md text-on-surface font-semibold">
                                    Medicine {index + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => remove(m.id)}
                                    aria-label={`Remove medicine ${index + 1}`}
                                    className="inline-flex items-center gap-1 font-label-sm text-label-sm text-error font-semibold hover:underline"
                                >
                                    <Icon className="text-[16px]">delete</Icon>
                                    Remove
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-space-sm">
                                <Field id={`${m.id}-name`} label="Medicine Name" error={err.name} className="lg:col-span-4">
                                    <input
                                        id={`${m.id}-name`}
                                        type="text"
                                        value={m.name}
                                        onChange={update(m.id, "name")}
                                        aria-invalid={!!err.name}
                                        placeholder="e.g. Amlodipine"
                                        className={inputClass(err.name)}
                                    />
                                </Field>
                                <Field id={`${m.id}-dosage`} label="Dosage" error={err.dosage} className="lg:col-span-2">
                                    <input
                                        id={`${m.id}-dosage`}
                                        type="text"
                                        value={m.dosage}
                                        onChange={update(m.id, "dosage")}
                                        aria-invalid={!!err.dosage}
                                        placeholder="e.g. 5 mg"
                                        className={inputClass(err.dosage)}
                                    />
                                </Field>
                                <Field id={`${m.id}-frequency`} label="Frequency" className="lg:col-span-3">
                                    <select
                                        id={`${m.id}-frequency`}
                                        value={m.frequency}
                                        onChange={update(m.id, "frequency")}
                                        className={inputClass(false)}
                                    >
                                        {FREQUENCIES.map((f) => (
                                            <option key={f} value={f}>
                                                {f}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field id={`${m.id}-duration`} label="Duration" error={err.duration} className="lg:col-span-3">
                                    <input
                                        id={`${m.id}-duration`}
                                        type="text"
                                        value={m.duration}
                                        onChange={update(m.id, "duration")}
                                        aria-invalid={!!err.duration}
                                        placeholder="e.g. 30 days"
                                        className={inputClass(err.duration)}
                                    />
                                </Field>
                                <Field id={`${m.id}-instructions`} label="Instructions" className="sm:col-span-2 lg:col-span-12">
                                    <input
                                        id={`${m.id}-instructions`}
                                        type="text"
                                        value={m.instructions}
                                        onChange={update(m.id, "instructions")}
                                        placeholder="e.g. Take after breakfast"
                                        className={inputClass(false)}
                                    />
                                </Field>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <button
                type="button"
                onClick={add}
                className="inline-flex items-center gap-1.5 px-space-md py-2 bg-surface-container-low text-primary rounded-xl font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors"
            >
                <Icon className="text-[18px]">add</Icon>
                Add Medicine
            </button>
        </section>
    );
}
