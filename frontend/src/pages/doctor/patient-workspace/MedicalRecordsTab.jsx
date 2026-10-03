import { useState } from "react";
import { useParams } from "react-router-dom";
import Icon from "../../../components/Icon";
import { patientsRecords } from "../../../data/mockMedicalRecords";
import { formatDate } from "../../../data/mockClinicalData";

const SAMPLE_NOTE = "Sample data for demonstration only.";

function SummaryCard({ icon, label, value, caption }) {
    return (
        <div className="px-space-md py-space-sm bg-surface-container-low rounded-xl flex items-center gap-space-sm">
            <span className="w-9 h-9 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shrink-0">
                <Icon className="text-[20px]">{icon}</Icon>
            </span>
            <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">{value}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span>
                {caption && <span className="font-body-sm text-body-sm text-outline">{caption}</span>}
            </div>
        </div>
    );
}

function Section({ icon, title, count, emptyText, children }) {
    return (
        <section className="space-y-space-sm">
            <div className="flex items-center gap-2">
                <Icon className="text-primary text-[20px]">{icon}</Icon>
                <h3 className="font-title-md text-title-md text-on-surface font-bold">{title}</h3>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold">
                    {count}
                </span>
            </div>
            {count === 0 ? (
                <p className="px-space-md py-space-sm bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface-variant">
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
            className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold hover:underline"
        >
            {open ? openLabel : closedLabel}
            <Icon className="text-[16px]">{open ? "expand_less" : "expand_more"}</Icon>
        </button>
    );
}

function HistoricalLabel() {
    return (
        <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">
            Historical record
        </span>
    );
}

function DetailRow({ label, children }) {
    return (
        <div>
            <dt className="font-body-sm text-body-sm text-outline">{label}</dt>
            <dd className="font-body-md text-body-md text-on-surface">{children}</dd>
        </div>
    );
}

const flagStyles = {
    high: { label: "High", tone: "bg-error/10 text-error" },
    low: { label: "Low", tone: "bg-secondary/10 text-secondary" },
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
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Medical Records</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
                Review the patient's previous consultations, prescriptions and reports.
            </p>
        </div>
    );

    if (!hasRecords) {
        return (
            <section className="space-y-space-md">
                {header}
                <div className="py-space-xl flex flex-col items-center text-center gap-1">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-space-sm">
                        <Icon className="text-[24px]">folder_off</Icon>
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface font-semibold">No previous records</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                        Medical history will appear here when records are available.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-space-lg">
            {header}

            {/* Summary row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
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
                <ul className="space-y-space-sm">
                    {consultations.map((c) => {
                        const open = !!openIds[c.id];
                        return (
                            <li key={c.id} className="p-space-md bg-surface-container-low rounded-xl space-y-space-sm">
                                <div className="flex flex-wrap items-start justify-between gap-space-sm">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-space-sm">
                                            <span className="font-label-md text-label-md text-on-surface font-semibold">
                                                {formatDate(c.date)}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-label-sm text-label-sm font-medium">
                                                {c.visitType}
                                            </span>
                                        </div>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                            {c.hospital} • {c.doctor}
                                        </p>
                                    </div>
                                    <HistoricalLabel />
                                </div>

                                <p className="font-body-md text-body-md text-on-surface">
                                    <span className="font-semibold">{c.diagnosis}</span>
                                </p>

                                {open && (
                                    <dl id={`${c.id}-details`} className="space-y-space-sm pt-space-sm border-t border-surface-container">
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
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-space-sm items-start">
                    {prescriptions.map((p) => {
                        const open = !!openIds[p.id];
                        return (
                            <li key={p.id} className="p-space-md bg-surface-container-low rounded-xl space-y-space-sm">
                                <div className="flex flex-wrap items-start justify-between gap-space-sm">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-space-sm">
                                            <span className="font-label-md text-label-md text-on-surface font-semibold">
                                                {formatDate(p.date)}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded-md font-label-sm text-label-sm font-medium ${
                                                    p.status === "Active"
                                                        ? "bg-tertiary/10 text-tertiary"
                                                        : "bg-surface-container text-on-surface-variant"
                                                }`}
                                            >
                                                {p.status}
                                            </span>
                                        </div>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                            {p.doctor} • {p.hospital}
                                        </p>
                                    </div>
                                    <HistoricalLabel />
                                </div>

                                <ul className="space-y-1.5">
                                    {p.medications.map((m) => (
                                        <li key={m.name} className="px-space-sm py-2 bg-surface-container-lowest rounded-lg">
                                            <span className="font-label-md text-label-md text-on-surface font-semibold">
                                                {m.name} {m.dosage}
                                            </span>
                                            <span className="block font-body-sm text-body-sm text-on-surface-variant">
                                                {m.frequency} • {m.duration}
                                            </span>
                                            {open && (
                                                <span className="block font-body-sm text-body-sm text-outline mt-0.5">
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
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-space-sm items-start">
                    {bloodReports.map((r) => {
                        const open = !!openIds[r.id];
                        return (
                            <li key={r.id} className="p-space-md bg-surface-container-low rounded-xl space-y-space-sm">
                                <div className="flex flex-wrap items-start justify-between gap-space-sm">
                                    <div>
                                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                                            {r.name}
                                        </span>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                            {formatDate(r.date)} • {r.lab}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="px-2 py-0.5 rounded-md bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-medium">
                                            {r.status}
                                        </span>
                                        <HistoricalLabel />
                                    </div>
                                </div>

                                {open && (
                                    <div id={`${r.id}-details`} className="space-y-space-sm pt-space-sm border-t border-surface-container">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left font-body-sm text-body-sm border-collapse">
                                                <thead>
                                                    <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                                                        <th className="py-2 px-3 rounded-l-lg">Test</th>
                                                        <th className="py-2 px-3">Result</th>
                                                        <th className="py-2 px-3">Unit</th>
                                                        <th className="py-2 px-3 rounded-r-lg">Reference Range</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-surface-container">
                                                    {r.results.map((row) => {
                                                        const flag = row.flag ? flagStyles[row.flag] : null;
                                                        return (
                                                            <tr key={row.test}>
                                                                <td className="py-2 px-3 text-on-surface font-semibold">{row.test}</td>
                                                                <td className="py-2 px-3 text-on-surface whitespace-nowrap">
                                                                    <span className="font-semibold">{row.result}</span>
                                                                    {flag && (
                                                                        <span
                                                                            className={`ml-1.5 px-1.5 py-0.5 rounded font-label-sm text-label-sm font-medium ${flag.tone}`}
                                                                        >
                                                                            {flag.label}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="py-2 px-3 text-on-surface-variant whitespace-nowrap">{row.unit}</td>
                                                                <td className="py-2 px-3 text-on-surface-variant whitespace-nowrap">{row.range}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="font-body-sm text-body-sm text-outline">{SAMPLE_NOTE}</p>
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
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-space-sm items-start">
                    {otherReports.map((r) => {
                        const open = !!openIds[r.id];
                        return (
                            <li key={r.id} className="p-space-md bg-surface-container-low rounded-xl space-y-space-sm">
                                <div className="flex flex-wrap items-start justify-between gap-space-sm">
                                    <div>
                                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                                            {r.name}
                                        </span>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                            {formatDate(r.date)} • {r.center}
                                        </p>
                                    </div>
                                    <HistoricalLabel />
                                </div>

                                <p className="font-body-md text-body-md text-on-surface">{r.description}</p>

                                {open && (
                                    <div id={`${r.id}-details`} className="space-y-space-sm pt-space-sm border-t border-surface-container">
                                        <dl className="space-y-space-sm">
                                            <DetailRow label="Summary">{r.summary}</DetailRow>
                                        </dl>
                                        <p className="font-body-sm text-body-sm text-outline">{SAMPLE_NOTE}</p>
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
