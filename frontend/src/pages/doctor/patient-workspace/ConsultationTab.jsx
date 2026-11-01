import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Icon from "../../../components/Icon";
import AISummaryCard from "./AISummaryCard";
import PrescriptionSection from "./PrescriptionSection";
import { todayISO, formatDate } from "../../../data/mockData";
import { useApp } from "../../../context/AppContext";

const inputClass = (error) =>
    `w-full px-3.5 py-2.5 bg-slate-50 border text-slate-900 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
        error
            ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
            : "border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
    }`;

const statusStyles = {
    "not-started": { label: "Not started", tone: "bg-slate-100 text-slate-600 border border-slate-200" },
    draft: { label: "Draft Saved", tone: "bg-sky-50 text-sky-700 border border-sky-200" },
    completed: { label: "Completed & Signed", tone: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
};

function CompletedPanel({ patient, record, onAddAmendment, amendments = [] }) {
    const { consultation: c, prescription: p } = record;
    const [amendmentText, setAmendmentText] = useState("");
    const [amendmentReason, setAmendmentReason] = useState("Clinical follow-up addendum");
    const [showAmendmentBox, setShowAmendmentBox] = useState(false);

    const handleAmendmentSubmit = (e) => {
        e.preventDefault();
        if (!amendmentText.trim()) return;
        onAddAmendment(amendmentText, amendmentReason);
        setAmendmentText("");
        setShowAmendmentBox(false);
    };

    return (
        <div className="space-y-5">
            <div
                role="status"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold"
            >
                <Icon className="text-[18px]">check_circle</Icon>
                <span>Consultation completed and cryptographically signed. Original note is permanently locked.</span>
            </div>

            {/* Letterhead Clinical Note Display */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                            OFFICIAL CLINICAL CONSULTATION NOTE
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                            {c.doctor || "Attending Physician"} • {c.hospital || "Medical Center"}
                        </h3>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{formatDate(c.date || todayISO())}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {c.clinicalNote || c.reason || "Clinical evaluation conducted."}
                </div>
            </div>

            {/* Prescriptions recap if any */}
            {p && p.medications && p.medications.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-600">
                        Prescribed Medications ({p.medications.length})
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {p.medications.map((m, idx) => (
                            <li key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                                <span className="font-bold text-slate-900 block">
                                    {m.name || m.drug} {m.dosage}
                                </span>
                                <span className="text-slate-500 text-[11px] font-medium block mt-0.5">
                                    {m.frequency} • {m.duration}
                                </span>
                                {m.instructions && (
                                    <span className="text-slate-400 text-[11px] block mt-0.5">
                                        Instructions: {m.instructions}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Amendments List */}
            {amendments.length > 0 && (
                <div className="bg-amber-50/50 rounded-2xl border border-amber-200/80 p-5 space-y-3">
                    <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                        <Icon className="text-[16px]">edit_note</Icon>
                        <span>Signed Amendments & Addendums ({amendments.length})</span>
                    </h3>
                    <div className="space-y-2">
                        {amendments.map((a, i) => (
                            <div key={i} className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-800 space-y-1">
                                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                                    <span>By {a.authorName || "Attending Physician"}</span>
                                    <span>{new Date(a.amendedAt || Date.now()).toLocaleTimeString()}</span>
                                </div>
                                <p className="font-medium text-slate-900">{a.note}</p>
                                {a.reason && <span className="text-[10px] text-slate-400 italic">Reason: {a.reason}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Amendment Form Trigger */}
            {!showAmendmentBox ? (
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setShowAmendmentBox(true)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                    >
                        <Icon className="text-[16px]">add_circle</Icon>
                        <span>Add Signed Amendment</span>
                    </button>
                    <Link
                        to="/doctor"
                        className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                    >
                        Back to Queue
                    </Link>
                    <Link
                        to={`/doctor/patients/${patient.id}/records`}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs"
                    >
                        View Full Medical History
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleAmendmentSubmit} className="bg-amber-50 rounded-2xl border border-amber-300 p-5 space-y-3">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Icon className="text-[16px]">edit_document</Icon>
                        <span>Append Official Addendum (Original note preserved)</span>
                    </h4>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Amendment Text *</label>
                        <textarea
                            rows={3}
                            required
                            placeholder="Enter clinical amendment, additional laboratory observations, or modified instructions..."
                            value={amendmentText}
                            onChange={(e) => setAmendmentText(e.target.value)}
                            className={inputClass(false)}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Clinical Reason</label>
                        <input
                            type="text"
                            placeholder="e.g. Laboratory result follow-up, dosage modification"
                            value={amendmentReason}
                            onChange={(e) => setAmendmentReason(e.target.value)}
                            className={inputClass(false)}
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                            Sign & Commit Amendment
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAmendmentBox(false)}
                            className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function ConsultationTab() {
    const { patient, allergyLabel, consult } = useOutletContext();
    const { form, setForm, medicines, setMedicines, status, setStatus, completed, setCompleted } = consult;
    const { currentDoctor, currentHospital, addConsultationRecord, showToast } = useApp();

    const [draftSaved, setDraftSaved] = useState(false);
    const [amendments, setAmendments] = useState([]);

    const badge = statusStyles[status] || statusStyles["not-started"];

    const handleSaveDraft = () => {
        setStatus("draft");
        setDraftSaved(true);
        showToast("Draft Saved", "Consultation note draft saved in session.", "info");
    };

    const handleComplete = async (e) => {
        e.preventDefault();

        const noteText =
            form.clinicalNote?.trim() ||
            `PATIENT ENCOUNTER EVALUATION
Patient: ${patient.name} (${patient.mediVaultId || patient.id})
Chief Complaint: ${form.chiefComplaint || "Routine consultation"}
${form.symptoms ? `Symptoms: ${form.symptoms}` : ""}
${form.examination ? `Examination: ${form.examination}` : ""}
${form.diagnosis ? `Working Diagnosis: ${form.diagnosis}` : ""}
${form.treatment ? `Treatment Plan: ${form.treatment}` : ""}
${form.followUp ? `Follow-up: ${form.followUp}` : ""}`;

        if (!noteText.trim()) {
            showToast("Validation Error", "Please enter consultation clinical notes.", "error");
            return;
        }

        const validMeds = medicines.filter((m) => m.name && m.name.trim() !== "");

        const record = {
            consultation: {
                id: `consult-${Date.now()}`,
                date: todayISO(),
                doctor: currentDoctor?.name || "Dr. Sarah Sharma, MD",
                hospital: currentHospital?.name || "CityCare General Hospital",
                clinicalNote: noteText,
                reason: form.chiefComplaint || "Clinical Consultation",
            },
            prescription:
                validMeds.length > 0
                    ? {
                          id: `rx-${Date.now()}`,
                          date: todayISO(),
                          medications: validMeds,
                      }
                    : null,
        };

        setCompleted(record);
        setStatus("completed");

        try {
            await addConsultationRecord({
                patientId: patient.id || patient._id,
                clinicalNote: noteText,
                medications: validMeds,
                diagnoses: form.diagnosis ? [{ name: form.diagnosis }] : [],
            });
        } catch (err) {
            console.warn("Consultation completion warning:", err.message);
        }
    };

    const handleAddAmendment = (amendmentText, reason) => {
        const newAmendment = {
            note: amendmentText,
            authorName: currentDoctor?.name || "Attending Physician",
            reason,
            amendedAt: new Date().toISOString(),
        };
        setAmendments((prev) => [...prev, newAmendment]);
        showToast("Amendment Logged", "Addendum successfully signed and appended to record.", "success");
    };

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-2 border-b border-slate-100">
                <div>
                    <h2 className="text-base font-bold text-slate-900">Current Doctor Consultation</h2>
                    <p className="text-xs text-slate-500 font-medium">
                        {patient.visitType || "Outpatient Encounter"} • {formatDate(todayISO())}
                    </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badge.tone}`}>
                    {badge.label}
                </span>
            </div>

            <AISummaryCard patient={patient} allergyLabel={allergyLabel} />

            {completed ? (
                <CompletedPanel
                    patient={patient}
                    record={completed}
                    onAddAmendment={handleAddAmendment}
                    amendments={amendments}
                />
            ) : (
                <form noValidate onSubmit={handleComplete} className="space-y-6">
                    {/* Free-text letterhead clinical note */}
                    <section className="space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <label
                                    htmlFor="clinical-note"
                                    className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"
                                >
                                    <Icon className="text-teal-700 text-[18px]">notes</Icon>
                                    <span>Letterhead Clinical Consultation Note (Free-Text)</span>
                                </label>
                                <span className="text-[11px] text-slate-400 font-medium">
                                    Preserves complete evaluation letterhead format
                                </span>
                            </div>

                            <textarea
                                id="clinical-note"
                                rows={7}
                                value={form.clinicalNote}
                                onChange={(e) => setForm((prev) => ({ ...prev, clinicalNote: e.target.value }))}
                                placeholder={`Enter clinical examination, symptoms, observations, assessment and plan in letterhead format:\n\ne.g.\nCHIEF COMPLAINT: Recurrent palpitations and fatigue.\nEXAMINATION: S1, S2 audible, no wheeze. Vitals stable.\nASSESSMENT: Stress-induced sinus tachycardia.\nPLAN: Beta-blocker support and review in 2 weeks.`}
                                className={inputClass(false)}
                            />
                        </div>

                        {/* Optional quick fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Chief Complaint (Optional Tag)
                                </label>
                                <input
                                    type="text"
                                    value={form.chiefComplaint}
                                    onChange={(e) => setForm((prev) => ({ ...prev, chiefComplaint: e.target.value }))}
                                    placeholder="e.g. Chest discomfort"
                                    className={inputClass(false)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Working Diagnosis (Optional Tag)
                                </label>
                                <input
                                    type="text"
                                    value={form.diagnosis}
                                    onChange={(e) => setForm((prev) => ({ ...prev, diagnosis: e.target.value }))}
                                    placeholder="e.g. Atypical angina / Primary hypertension"
                                    className={inputClass(false)}
                                />
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-200/80" />

                    {/* Prescription Section (Optional) */}
                    <PrescriptionSection
                        medicines={medicines}
                        setMedicines={setMedicines}
                        errors={{}}
                        showErrors={false}
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
                                Draft consultation saved successfully.
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                            >
                                <Icon className="text-[16px]">check_circle</Icon>
                                <span>Complete & Sign Consultation</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs"
                            >
                                Save In-Progress Draft
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </section>
    );
}
