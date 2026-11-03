import { useState, useEffect, useRef } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Icon from "../../../components/Icon";
import { useApp } from "../../../context/AppContext";
import api from "../../../services/api";

const statusStyles = {
    "not-started": { label: "Not started", tone: "bg-slate-100 text-slate-600 border border-slate-200" },
    draft: { label: "Draft Saved", tone: "bg-sky-50 text-sky-700 border border-sky-200" },
    completed: { label: "Completed & Signed", tone: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
};

const MIN_FONT = 12;
const MAX_FONT = 24;

function todayISO() {
    return new Date().toISOString().split("T")[0];
}

function formatDate(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? isoStr : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function CompletedPanel({ patient, record, onAddAmendment, amendments = [] }) {
    const { consultation: c } = record;
    const [amendmentText, setAmendmentText] = useState("");
    const [amendmentReason, setAmendmentReason] = useState("Clinical follow-up addendum");
    const [showAmendmentBox, setShowAmendmentBox] = useState(false);
    const [submittingAmendment, setSubmittingAmendment] = useState(false);

    const handleAmendmentSubmit = async (e) => {
        e.preventDefault();
        if (!amendmentText.trim()) return;
        setSubmittingAmendment(true);
        try {
            await onAddAmendment(amendmentText, amendmentReason);
            setAmendmentText("");
            setShowAmendmentBox(false);
        } finally {
            setSubmittingAmendment(false);
        }
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

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 font-sans text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {c.clinicalNote || c.reason || "Clinical evaluation conducted."}
                </div>
            </div>

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
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Clinical Reason</label>
                        <input
                            type="text"
                            placeholder="e.g. Laboratory result follow-up, dosage modification"
                            value={amendmentReason}
                            onChange={(e) => setAmendmentReason(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <button
                            type="submit"
                            disabled={submittingAmendment}
                            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                            {submittingAmendment ? "Saving..." : "Sign & Commit Amendment"}
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
    const { patient, visitId, allergyLabel, consult } = useOutletContext();
    const { form, setForm, status, setStatus, completed, setCompleted, consultationId, setConsultationId, initialConsultation } = consult;
    const { currentDoctor, currentHospital, showToast } = useApp();

    const [draftSaved, setDraftSaved] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [amendments, setAmendments] = useState(initialConsultation?.amendments || []);
    const [fontSize, setFontSize] = useState(16);
    const [scanningLetterhead, setScanningLetterhead] = useState(false);
    const letterheadInputRef = useRef(null);

    // Sync amendments if initialConsultation updates
    useEffect(() => {
        if (initialConsultation?.amendments) {
            setAmendments(initialConsultation.amendments);
        }
    }, [initialConsultation]);

    const badge = statusStyles[status] || statusStyles["not-started"];

    const handleFontIncrease = () => setFontSize((prev) => Math.min(MAX_FONT, prev + 1));
    const handleFontDecrease = () => setFontSize((prev) => Math.max(MIN_FONT, prev - 1));

    const handleLetterheadImage = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            showToast("Unsupported Image", "Choose a JPEG, PNG, or WebP image.", "error");
            return;
        }
        if (file.size > 4 * 1024 * 1024) {
            showToast("Image Too Large", "Choose an image smaller than 4 MB.", "error");
            return;
        }

        setScanningLetterhead(true);
        try {
            const image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result).split(",")[1]);
                reader.onerror = () => reject(new Error("Could not read the selected image."));
                reader.readAsDataURL(file);
            });
            const response = await api.extractLetterheadText(image, file.type);
            const extractedText = response?.data?.text?.trim();
            if (!extractedText) throw new Error("No readable text was found. Try a clearer image.");
            setForm((previous) => ({
                ...previous,
                clinicalNote: previous.clinicalNote?.trim()
                    ? `${previous.clinicalNote.trim()}\n\n${extractedText}`
                    : extractedText,
            }));
            showToast("Text Added", "Review the extracted note carefully before saving or signing.", "success");
        } catch (error) {
            showToast("Text Extraction Failed", error.message || "Could not read the letterhead image.", "error");
        } finally {
            setScanningLetterhead(false);
        }
    };

    const handleSaveDraft = async () => {
        setSavingDraft(true);
        try {
            const res = await api.saveConsultationDraft({
                consultationId: consultationId || undefined,
                visitId: visitId || undefined,
                patientId: patient.id || patient._id,
                clinicalNote: form.clinicalNote,
            });

            if (res?.data?._id) {
                if (setConsultationId) setConsultationId(res.data._id);
            }
            setStatus("draft");
            setDraftSaved(true);
            showToast("Draft Saved", "Consultation note draft saved to backend database.", "info");
        } catch (err) {
            showToast("Draft Save Error", err.message || "Failed to save draft to database", "error");
        } finally {
            setSavingDraft(false);
        }
    };

    const handleComplete = async (e) => {
        e.preventDefault();

        const noteText = form.clinicalNote?.trim();
        if (!noteText) {
            showToast("Validation Error", "Please enter consultation clinical notes.", "error");
            return;
        }

        setCompleting(true);
        try {
            let activeCId = consultationId;

            // If no existing consultation draft in DB, save one first to obtain ID
            if (!activeCId) {
                const draftRes = await api.saveConsultationDraft({
                    visitId: visitId || undefined,
                    patientId: patient.id || patient._id,
                    clinicalNote: noteText,
                });
                activeCId = draftRes.data._id;
                if (setConsultationId) setConsultationId(activeCId);
            }

            // Complete consultation on backend
            const completeRes = await api.completeConsultation(activeCId, {
                clinicalNote: noteText,
            });

            // Mark consultation complete ONLY after backend confirmation
            const finalData = completeRes?.data || {};
            const record = {
                consultation: {
                    id: finalData._id || activeCId,
                    date: finalData.completedAt || todayISO(),
                    doctor: finalData.doctor?.name || currentDoctor?.name || "Attending Physician",
                    hospital: finalData.hospital?.name || currentHospital?.name || "Medical Center",
                    clinicalNote: finalData.clinicalNote || noteText,
                    reason: form.chiefComplaint || "Clinical Consultation",
                },
                prescription: null,
            };

            setCompleted(record);
            setStatus("completed");
            showToast("Consultation Completed", "Official consultation note finalized and signed.", "success");
        } catch (err) {
            showToast("Completion Failed", err.message || "Failed to finalize consultation", "error");
        } finally {
            setCompleting(false);
        }
    };

    const handleAddAmendment = async (amendmentText, reason) => {
        const activeCId = consultationId || completed?.consultation?.id;
        if (!activeCId) {
            showToast("Error", "No completed consultation record found to amend.", "error");
            return;
        }

        try {
            const res = await api.addAmendment(activeCId, {
                amendmentText: amendmentText.trim(),
                reason,
            });

            if (res?.data?.amendments) {
                setAmendments(res.data.amendments);
            } else {
                setAmendments((prev) => [
                    ...prev,
                    {
                        note: amendmentText,
                        authorName: currentDoctor?.name || "Attending Physician",
                        reason,
                        amendedAt: new Date().toISOString(),
                    },
                ]);
            }
            showToast("Amendment Logged", "Addendum successfully signed and appended to record.", "success");
        } catch (err) {
            showToast("Amendment Error", err.message || "Failed to log amendment", "error");
            throw err;
        }
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
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                                <label
                                    htmlFor="clinical-note"
                                    className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"
                                >
                                    <Icon className="text-teal-700 text-[18px]">notes</Icon>
                                    <span>Letterhead Clinical Consultation Note (Free-Text)</span>
                                </label>
                                {/* Font size controls */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-slate-400 font-medium">Font:</span>
                                    <button
                                        type="button"
                                        onClick={handleFontDecrease}
                                        disabled={fontSize <= MIN_FONT}
                                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-all disabled:opacity-40"
                                        title="Decrease font size"
                                    >
                                        A<sup>-</sup>
                                    </button>
                                    <span className="text-[11px] text-slate-600 font-mono w-5 text-center">{fontSize}</span>
                                    <button
                                        type="button"
                                        onClick={handleFontIncrease}
                                        disabled={fontSize >= MAX_FONT}
                                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-all disabled:opacity-40"
                                        title="Increase font size"
                                    >
                                        A<sup>+</sup>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-100 bg-teal-50/70 px-3.5 py-3">
                                <div>
                                    <p className="text-xs font-semibold text-slate-800">Import a handwritten or printed note</p>
                                    <p className="mt-0.5 text-[11px] text-slate-500">Image is sent to Gemini for transcription. Review all extracted text.</p>
                                </div>
                                <input
                                    ref={letterheadInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleLetterheadImage}
                                />
                                <button
                                    type="button"
                                    onClick={() => letterheadInputRef.current?.click()}
                                    disabled={scanningLetterhead}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
                                >
                                    <Icon className="text-[16px]">{scanningLetterhead ? "progress_activity" : "document_scanner"}</Icon>
                                    {scanningLetterhead ? "Transcribing..." : "Upload / Take Photo"}
                                </button>
                            </div>

                            <textarea
                                id="clinical-note"
                                rows={18}
                                value={form.clinicalNote}
                                onChange={(e) => setForm((prev) => ({ ...prev, clinicalNote: e.target.value }))}
                                placeholder={`Enter clinical examination, symptoms, observations, assessment and plan in letterhead format:\n\ne.g.\nCHIEF COMPLAINT: Recurrent palpitations and fatigue.\nEXAMINATION: S1, S2 audible, no wheeze. Vitals stable.\nASSESSMENT: Stress-induced sinus tachycardia.\nPLAN: Beta-blocker support and review in 2 weeks.`}
                                style={{ fontSize: `${fontSize}px`, lineHeight: "1.7" }}
                                className="w-full min-h-[380px] px-3.5 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all resize-y"
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
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
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
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-200/80" />

                    {/* Actions */}
                    <div className="space-y-3">
                        {draftSaved && (
                            <div
                                role="status"
                                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200/80 text-xs font-semibold"
                            >
                                <Icon className="text-[18px]">save</Icon>
                                Draft consultation saved to backend database.
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="submit"
                                disabled={completing}
                                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                            >
                                <Icon className="text-[16px]">check_circle</Icon>
                                <span>{completing ? "Finalizing..." : "Complete & Sign Consultation"}</span>
                            </button>
                            <button
                                type="button"
                                disabled={savingDraft}
                                onClick={handleSaveDraft}
                                className="px-4 py-2.5 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs"
                            >
                                {savingDraft ? "Saving..." : "Save In-Progress Draft"}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </section>
    );
}
