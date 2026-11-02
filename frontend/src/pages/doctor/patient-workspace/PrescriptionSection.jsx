import Icon from "../../../components/Icon";
import { FREQUENCIES, createMedicine } from "../../../data/mockData";

const inputClass = (error) =>
    `w-full px-3 py-2 bg-slate-50 border text-slate-900 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
        error
            ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
            : "border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
    }`;

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

export default function PrescriptionSection({ medicines, setMedicines, errors, showErrors, allergyLabel }) {
    const update = (id, field) => (e) =>
        setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: e.target.value } : m)));

    const add = () => setMedicines((prev) => [...prev, createMedicine()]);
    const remove = (id) => setMedicines((prev) => prev.filter((m) => m.id !== id));

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Prescription</h3>
                    <p className="text-xs text-slate-500 font-medium">
                        Add every medicine for this consultation. Empty rows are ignored.
                    </p>
                </div>
                {allergyLabel && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                        <Icon className="text-[14px]">warning</Icon>
                        {allergyLabel}
                    </span>
                )}
            </div>

            {medicines.length === 0 && (
                <p className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-500 font-medium">
                    No medicines added. Add a medicine if one is prescribed.
                </p>
            )}

            <ul className="space-y-3">
                {medicines.map((m, index) => {
                    const err = (showErrors && errors[m.id]) || {};
                    return (
                        <li key={m.id} className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900">
                                    Medicine {index + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => remove(m.id)}
                                    aria-label={`Remove medicine ${index + 1}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-rose-600 font-semibold hover:bg-rose-50 transition-colors"
                                >
                                    <Icon className="text-[16px]">delete</Icon>
                                    Remove
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
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
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
                <Icon className="text-[18px]">add</Icon>
                Add Medicine
            </button>
        </section>
    );
}
