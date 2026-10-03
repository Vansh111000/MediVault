import { useOutletContext } from "react-router-dom";
import Icon from "../../../components/Icon";
import { todayISO, formatDate } from "../../../data/mockClinicalData";

const inputClass =
    "w-full px-3 py-2 bg-surface-container-low text-on-surface rounded-xl font-body-md text-body-md placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-70";

const statusStyles = {
    "not-started": { label: "Not started", tone: "bg-surface-container text-on-surface-variant" },
    draft: { label: "Draft", tone: "bg-secondary/10 text-secondary" },
    completed: { label: "Completed", tone: "bg-tertiary/10 text-tertiary" },
};

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

export default function ConsultationTab() {
    const { patient, consult } = useOutletContext();
    const { form, setForm, status, setStatus } = consult;
    const locked = status === "completed";
    const badge = statusStyles[status];

    const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSaveDraft = () => setStatus("draft");

    const handleComplete = (e) => {
        e.preventDefault();
        setStatus("completed");
    };

    return (
        <section className="space-y-space-md">
            <div className="flex flex-wrap items-start justify-between gap-space-sm">
                <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Current Consultation
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {patient.visitType} • {formatDate(todayISO())}
                    </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${badge.tone}`}>
                    {badge.label}
                </span>
            </div>

            {status === "draft" && (
                <div
                    role="status"
                    className="flex items-center gap-2 px-space-md py-space-sm rounded-xl bg-secondary/10 text-secondary font-label-md text-label-md font-semibold"
                >
                    <Icon className="text-[18px]">save</Icon>
                    Draft saved.
                </div>
            )}
            {locked && (
                <div
                    role="status"
                    className="flex items-center gap-2 px-space-md py-space-sm rounded-xl bg-tertiary/10 text-tertiary font-label-md text-label-md font-semibold"
                >
                    <Icon className="text-[18px]">check_circle</Icon>
                    Consultation completed successfully.
                </div>
            )}

            <form onSubmit={handleComplete} className="space-y-space-md max-w-3xl">
                <Field id="consult-complaint" label="Chief Complaint">
                    <input
                        id="consult-complaint"
                        type="text"
                        required
                        disabled={locked}
                        value={form.chiefComplaint}
                        onChange={update("chiefComplaint")}
                        placeholder="e.g. Chest discomfort for 3 days"
                        className={inputClass}
                    />
                </Field>

                <Field id="consult-symptoms" label="Symptoms / Reason for Visit">
                    <textarea
                        id="consult-symptoms"
                        rows={3}
                        disabled={locked}
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
                        disabled={locked}
                        value={form.diagnosis}
                        onChange={update("diagnosis")}
                        placeholder="e.g. Primary hypertension"
                        className={inputClass}
                    />
                </Field>

                <Field id="consult-notes" label="Clinical Notes">
                    <textarea
                        id="consult-notes"
                        rows={4}
                        disabled={locked}
                        value={form.notes}
                        onChange={update("notes")}
                        placeholder="Treatment plan and clinical notes"
                        className={inputClass}
                    />
                </Field>

                <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={locked}
                        className="px-space-lg py-2.5 bg-surface-container-low text-on-surface rounded-xl font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Draft
                    </button>
                    <button
                        type="submit"
                        disabled={locked}
                        className="px-space-lg py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Complete Consultation
                    </button>
                </div>
            </form>
        </section>
    );
}
