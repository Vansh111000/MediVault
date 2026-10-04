import { useState } from "react";
import { useParams } from "react-router-dom";
import Icon from "../../../components/Icon";
import { patientsRecords } from "../../../data/mockMedicalRecords";
import { formatDate } from "../../../data/mockClinicalData";

const SAMPLE_NOTE = "Sample data for demonstration only.";

function SummaryCard({ icon, label, value, caption }) {
    return (
        <div className="px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl shadow-xs flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shrink-0">
                <Icon className="text-[20px]">{icon}</Icon>
            </span>
            <div className="flex flex-col">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{value}</span>
                <span className="text-[11px] font-semibold text-slate-500 mt-1">{label}</span>
                {caption && <span className="text-[11px] text-slate-400 font-medium">{caption}</span>}
            </div>
        </div>
    );
}

function Section({ icon, title, count, emptyText, children }) {
    return (
        <section className="space-y-3">
            <div className="flex items-center gap-2">
                <Icon className="text-teal-700 text-[20px]">{icon}</Icon>
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                    {count}
                </span>
            </div>
            {count === 0 ? (
                <p className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-500 font-medium">
                    {emptyText}
                </p>
            ) : (
                children
            )}
        </section>
    );
}

function ToggleButton({ open, onClick, openLabel, closedLabel, controls }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-expanded={open}
            aria-controls={controls}
            className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-800 font-semibold hover:underline"
        >
            {open ? openLabel : closedLabel}
            <Icon className="text-[16px]">{open ? "expand_less" : "expand_more"}</Icon>
        </button>
    );
}

function HistoricalLabel() {
    return (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60 text-[11px] font-medium whitespace-nowrap">
            Historical record
        </span>
    );
}

function DetailRow({ label, children }) {
    return (
        <div>
            <dt className="text-[11px] text-slate-400 font-medium">{label}</dt>
            <dd className="text-xs text-slate-900 font-medium">{children}</dd>
        </div>
    );
}

const flagStyles = {
    high: { label: "High", tone: "bg-rose-50 text-rose-700 border border-rose-200/70" },
    low: { label: "Low", tone: "bg-sky-50 text-sky-700 border border-sky-200/70" },
};

export default function MedicalRecordsTab() {
    const { patientId } = useParams();
    const records = patientsRecords[patientId];

    // Which record cards are expanded (by record id). Read-only: nothing is edited.
    const [openIds, setOpenIds] = useState({});
    const toggle = (id) => setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));

    const consultations = records?.consultations ?? [];
    const prescriptions = records?.prescriptions ?? [];
    const bloodReports = records?.bloodReports ?? [];
    const otherReports = records?.otherReports ?? [];
    const activePrescriptions = prescriptions.filter((p) => p.status === "Active").length;

    const hasRecords =
        consultations.length + prescriptions.length + bloodReports.length + otherReports.length > 0;

    const header = (
        <div>
            <h2 className="text-lg font-bold text-slate-900">Medical Records</h2>
            <p className="text-xs text-slate-500 font-medium">
                Review the patient's previous consultations, prescriptions and reports.
            </p>
        </div>
    );

    if (!hasRecords) {
        return (
            <section className="space-y-4">
                {header}
                <div className="py-10 flex flex-col items-center text-center gap-1">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center mb-2">
                        <Icon className="text-[24px]">folder_off</Icon>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">No previous records</h3>
                    <p className="text-xs text-slate-500 font-medium">
                        Medical history will appear here when records are available.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            {header}

            {/* Summary row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryCard icon="stethoscope" label="Consultations" value={consultations.length} />
                <SummaryCard
                    icon="medication"
                    label="Prescriptions"
                    value={prescriptions.length}
                    caption={`${activePrescriptions} active`}
                />
                <SummaryCard icon="bloodtype" label="Blood Reports" value={bloodReports.length} />
                <SummaryCard icon="description" label="Other Reports" value={otherReports.length} />
            </div>

            {/* 1. Previous consultations */}
            <Section
                icon="stethoscope"
                title="Previous Consultations"
                count={consultations.length}
                emptyText="No previous consultations."
            >
                <ul className="space-y-3">
                    {consultations.map((c) => {
                        const open = !!openIds[c.id];
                        return (
                            <li key={c.id} className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xs font-bold text-slate-900">
                                                {formatDate(c.date)}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/60 text-[11px] font-semibold">
                                                {c.visitType}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                            {c.hospital} • {c.doctor}
                                        </p>
                                    </div>
                                    <HistoricalLabel />
                                </div>

                                <p className="text-xs text-slate-900 font-medium">
                                    <span className="font-semibold">{c.diagnosis}</span>
                                </p>

                                {open && (
                                    <dl id={`${c.id}-details`} className="space-y-3 pt-3 border-t border-slate-100">
                                        <DetailRow label="Reason for visit">{c.reason}</DetailRow>
                                        <DetailRow label="Diagnosis">{c.diagnosis}</DetailRow>
                                        <DetailRow label="Treatment / clinical notes">{c.treatment}</DetailRow>
                                    </dl>
                                )}

                                <ToggleButton
                                    open={open}
                                    onClick={() => toggle(c.id)}
                                    openLabel="Hide Details"
                                    closedLabel="View Details"
                                    controls={`${c.id}-details`}
                                />
                            </li>
                        );
                    })}
                </ul>
            </Section>

            {/* 2. Prescriptions */}
            <Section
                icon="medication"
                title="Prescriptions"
                count={prescriptions.length}
                emptyText="No previous prescriptions."
            >
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                    {prescriptions.map((p) => {
                        const open = !!openIds[p.id];
                        return (
                            <li key={p.id} className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xs font-bold text-slate-900">
                                                {formatDate(p.date)}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                                    p.status === "Active"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                                        : "bg-slate-100 text-slate-600 border border-slate-200/60"
                                                }`}
                                            >
                                                {p.status}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                            {p.doctor} • {p.hospital}
                                        </p>
                                    </div>
                                    <HistoricalLabel />
                                </div>

                                <ul className="space-y-1.5">
                                    {p.medications.map((m) => (
                                        <li key={m.name} className="px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl">
                                            <span className="text-xs font-bold text-slate-900">
                                                {m.name} {m.dosage}
                                            </span>
                                            <span className="block text-[11px] text-slate-500 font-medium">
                                                {m.frequency} • {m.duration}
                                            </span>
                                            {open && (
                                                <span className="block text-[11px] text-slate-400 font-medium mt-0.5">
                                                    Instructions: {m.instructions}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>

                                <ToggleButton
                                    open={open}
                                    onClick={() => toggle(p.id)}
                                    openLabel="Hide Details"
                                    closedLabel="View Details"
                                />
                            </li>
                        );
                    })}
                </ul>
            </Section>

            {/* 3. Blood reports */}
            <Section
                icon="bloodtype"
                title="Blood Reports"
                count={bloodReports.length}
                emptyText="No blood reports."
            >
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                    {bloodReports.map((r) => {
                        const open = !!openIds[r.id];
                        return (
                            <li key={r.id} className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <span className="text-xs font-bold text-slate-900">
                                            {r.name}
                                        </span>
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                            {formatDate(r.date)} • {r.lab}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-semibold">
                                            {r.status}
                                        </span>
                                        <HistoricalLabel />
                                    </div>
                                </div>

                                {open && (
                                    <div id={`${r.id}-details`} className="space-y-3 pt-3 border-t border-slate-100">
                                        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                                                        <th className="py-2 px-3">Test</th>
                                                        <th className="py-2 px-3">Result</th>
                                                        <th className="py-2 px-3">Unit</th>
                                                        <th className="py-2 px-3">Reference Range</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {r.results.map((row) => {
                                                        const flag = row.flag ? flagStyles[row.flag] : null;
                                                        return (
                                                            <tr key={row.test}>
                                                                <td className="py-2 px-3 text-slate-900 font-semibold">{row.test}</td>
                                                                <td className="py-2 px-3 text-slate-900 whitespace-nowrap">
                                                                    <span className="font-semibold">{row.result}</span>
                                                                    {flag && (
                                                                        <span
                                                                            className={`ml-1.5 px-1.5 py-0.5 rounded text-[11px] font-semibold ${flag.tone}`}
                                                                        >
                                                                            {flag.label}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{row.unit}</td>
                                                                <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{row.range}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-medium">{SAMPLE_NOTE}</p>
                                    </div>
                                )}

                                <ToggleButton
                                    open={open}
                                    onClick={() => toggle(r.id)}
                                    openLabel="Hide Report"
                                    closedLabel="View Report"
                                    controls={`${r.id}-details`}
                                />
                            </li>
                        );
                    })}
                </ul>
            </Section>

            {/* 4. Other reports */}
            <Section
                icon="description"
                title="Other Reports"
                count={otherReports.length}
                emptyText="No other reports."
            >
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                    {otherReports.map((r) => {
                        const open = !!openIds[r.id];
                        return (
                            <li key={r.id} className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <span className="text-xs font-bold text-slate-900">
                                            {r.name}
                                        </span>
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                            {formatDate(r.date)} • {r.center}
                                        </p>
                                    </div>
                                    <HistoricalLabel />
                                </div>

                                <p className="text-xs text-slate-700 font-medium">{r.description}</p>

                                {open && (
                                    <div id={`${r.id}-details`} className="space-y-3 pt-3 border-t border-slate-100">
                                        <dl className="space-y-3">
                                            <DetailRow label="Summary">{r.summary}</DetailRow>
                                        </dl>
                                        <p className="text-[11px] text-slate-400 font-medium">{SAMPLE_NOTE}</p>
                                    </div>
                                )}

                                <ToggleButton
                                    open={open}
                                    onClick={() => toggle(r.id)}
                                    openLabel="Hide Report"
                                    closedLabel="View Report"
                                    controls={`${r.id}-details`}
                                />
                            </li>
                        );
                    })}
                </ul>
            </Section>
        </section>
    );
}