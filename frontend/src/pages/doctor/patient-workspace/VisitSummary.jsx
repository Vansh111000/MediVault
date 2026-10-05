import Icon from "../../../components/Icon";
import { initialConsultations, initialPrescriptions, formatDate } from "../../../data/mockClinicalData";
import { toDisplayVisitType } from "../../../components/doctor/patientDisplay";

function Row({ label, children }) {
    if (!children) return null;
    return (
        <div>
            <dt className="text-slate-400 text-[11px] font-semibold">{label}</dt>
            <dd className="text-slate-800 text-xs font-medium whitespace-pre-line mt-0.5">{children}</dd>
        </div>
    );
}

// Completed visits: shows only what this doctor recorded during the visit.
export default function VisitSummary({ patient }) {
    const consultations = initialConsultations.filter((c) => c.patientId === patient.id);
    const prescriptions = initialPrescriptions.filter((p) => p.patientId === patient.id);

    return (
        <section className="space-y-6">
            <div className="pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">Visit Summary</h2>
                <p className="text-xs text-slate-500 font-medium">
                    Consultation and prescription recorded during this visit.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Consultation</h3>
                {consultations.length === 0 ? (
                    <p className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-500 font-medium">
                        No consultation was recorded for this visit.
                    </p>
                ) : (
                    consultations.map((c) => (
                        <div key={c.id} className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">{formatDate(c.date)}</span>
                                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/60 text-[11px] font-semibold">
                                    {toDisplayVisitType(c.visitType)}
                                </span>
                            </div>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                                <Row label="Symptoms / clinical notes">{c.symptoms}</Row>
                                <Row label="Diagnosis">{c.diagnosis}</Row>
                                <Row label="Treatment / advice">{c.notes}</Row>
                            </dl>
                        </div>
                    ))
                )}
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Prescription</h3>
                {prescriptions.length === 0 ? (
                    <p className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-500 font-medium">
                        No medicines prescribed.
                    </p>
                ) : (
                    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {prescriptions.map((p) => (
                            <li key={p.id} className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl">
                                <span className="text-xs font-bold text-slate-900">
                                    {p.medication} {p.dosage}
                                </span>
                                <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                                    {p.frequency} • {p.duration}
                                </span>
                                {p.instructions && (
                                    <span className="block text-[11px] text-slate-400 mt-0.5">
                                        Instructions: {p.instructions}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 font-medium">
                <Icon className="text-[16px]">lock</Icon>
                Patient access for this visit has ended. Earlier records are not available.
            </div>
        </section>
    );
}