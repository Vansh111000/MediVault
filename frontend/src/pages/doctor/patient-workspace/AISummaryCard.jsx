import { useState, useEffect } from "react";
import Icon from "../../../components/Icon";
import { patientsRecords, formatDate } from "../../../data/mockData";
import api from "../../../services/api";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Builds the clinical summary from authorized backend medical records or local patient data
function buildSummary(patient, allergyLabel, liveHistory) {
    const mockRecs = patientsRecords[patient?.id] || patientsRecords[patient?._id];

    // Priority to authorized live backend consultations
    const rawConsultations = liveHistory?.consultations || [];
    const consultations = rawConsultations.length > 0
        ? rawConsultations.map(c => ({
            id: c._id || c.id,
            diagnosis: c.diagnosis || (c.clinicalNote ? c.clinicalNote.slice(0, 45) + '...' : 'Clinical Consultation'),
            date: c.createdAt ? c.createdAt.split('T')[0] : '2026-08-12',
            hospital: c.hospital?.name || 'MediVault Medical Center',
            visitType: 'Outpatient Encounter',
            reason: c.reason || c.clinicalNote?.slice(0, 30) || 'General Consultation',
            treatment: c.clinicalNote || 'Advised treatment'
        }))
        : (mockRecs?.consultations ?? []);

    const rawPrescriptions = rawConsultations.flatMap(c => (c.prescriptions || []).map(p => ({
        id: `${c._id}-${p.name}`,
        status: 'Active',
        medications: [{ name: p.name, dosage: p.dosage || 'Standard', frequency: p.frequency || 'Once daily', duration: p.duration || '7 days' }]
    })));

    const prescriptions = rawPrescriptions.length > 0 ? rawPrescriptions : (mockRecs?.prescriptions ?? []);
    const bloodReports = mockRecs?.bloodReports ?? [];
    const otherReports = mockRecs?.otherReports ?? [];

    const hasRecords =
        consultations.length +
            prescriptions.length +
            bloodReports.length +
            otherReports.length >
        0;

    const latest = consultations[0];

    // Key conditions: distinct diagnoses or patient chronic conditions
    const conditions = [];

    if (patient?.chronicConditions && Array.isArray(patient.chronicConditions)) {
        patient.chronicConditions.forEach(cond => {
            const condName = typeof cond === 'string' ? cond : cond.condition || cond.name;
            if (condName) {
                conditions.push({ name: condName, date: 'Recorded on file' });
            }
        });
    }

    consultations.forEach((c, index) => {
        const lower = (c.diagnosis || '').toLowerCase();

        if (!lower || lower.startsWith("no significant")) return;
        if (lower.includes("under evaluation") && index !== 0) return;

        const duplicate = conditions.some((x) => {
            const existing = x.name.toLowerCase();
            return (
                existing.startsWith(lower) ||
                lower.startsWith(existing)
            );
        });

        if (!duplicate) {
            conditions.push({
                name: c.diagnosis,
                date: c.date,
            });
        }
    });

    // Current medications: medicines from active prescriptions
    const medications = prescriptions
        .filter((p) => p.status === "Active")
        .flatMap((p) =>
            p.medications.map((m) => ({
                key: `${p.id}-${m.name}`,
                name: `${m.name} ${m.dosage}`,
                detail: `${m.frequency} • ${m.duration}`,
            }))
        );

    // Recent findings: blood reports (flagged values) + other reports
    const findings = [];

    bloodReports.forEach((r) => {
        const flagged = r.results.filter((x) => x.flag);

        findings.push(
            flagged.length > 0
                ? {
                      key: r.id,
                      tone: "alert",
                      text: `${r.name} (${formatDate(r.date)}): ${flagged
                          .map(
                              (f) =>
                                  `${f.test} ${f.result} ${f.unit} (${f.flag})`
                          )
                          .join(", ")}`,
                  }
                : {
                      key: r.id,
                      tone: "ok",
                      text: `${r.name} (${formatDate(
                          r.date
                      )}): all values within the reference range`,
                  }
        );
    });

    otherReports.forEach((r) => {
        findings.push({
            key: r.id,
            tone: "info",
            text: `${r.name} (${formatDate(r.date)}): ${r.summary}`,
        });
    });

    // Relevant history: last three consultations
    const history = consultations.slice(0, 3).map((c) => ({
        key: c.id,
        title: `${formatDate(c.date)} • ${c.visitType}`,
        detail: `${c.reason} (${c.hospital})`,
    }));

    // Things to review
    const review = [];

    if (allergyLabel) {
        review.push(`${allergyLabel} — check before prescribing.`);
    }

    const flaggedReports = bloodReports.filter((r) =>
        r.results.some((x) => x.flag)
    );

    if (flaggedReports.length > 0) {
        review.push(
            `Values outside the reference range: ${flaggedReports
                .map(
                    (r) =>
                        `${r.name} (${plural(
                            r.results.filter((x) => x.flag).length,
                            "value"
                        )})`
                )
                .join(", ")}.`
        );
    }

    if (latest && /under evaluation/i.test(latest.diagnosis)) {
        review.push(
            `Diagnosis still under evaluation: ${latest.diagnosis}.`
        );
    }

    if (latest) {
        review.push(
            `Plan from the last visit (${formatDate(
                latest.date
            )}): ${latest.treatment}`
        );
    }

    if (!hasRecords) {
        review.push(
            "No previous records. Take a full history during this consultation."
        );
    }

    // Overview
    const sex = patient.gender.toLowerCase();

    let overview = `${patient.name} is a ${patient.age}-year-old ${sex}.`;

    if (!hasRecords) {
        overview +=
            " No previous records are available, so there is nothing to summarize yet.";
    } else {
        if (conditions.length > 0) {
            overview += ` Recorded conditions: ${conditions
                .map((c) => c.name)
                .join("; ")}.`;
        }

        if (latest) {
            overview += ` ${plural(
                consultations.length,
                "previous consultation"
            )} on record, the most recent on ${formatDate(
                latest.date
            )} at ${latest.hospital}.`;
        }

        if (medications.length > 0) {
            overview += ` Currently on ${plural(
                medications.length,
                "active medication"
            )}.`;
        }
    }

    return {
        hasRecords,
        overview,
        allergies: allergyLabel
            ? allergyLabel.replace(/^Allergy: /, "")
            : "None on record",
        conditions,
        medications,
        findings,
        history,
        review,
    };
}

function Block({ title, children }) {
    return (
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 shadow-2xs space-y-1.5">
            <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {title}
                </h4>
            </div>

            {children}
        </div>
    );
}

const emptyLine = (text) => (
    <p className="text-xs text-slate-400 font-medium">
        {text}
    </p>
);

export default function AISummaryCard({ patient, allergyLabel, records }) {
    const [open, setOpen] = useState(true);
    const [liveHistory, setLiveHistory] = useState(records || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (records) {
            setLiveHistory(records);
            return;
        }

        const patId = patient?._id || patient?.id;
        if (!patId) return;

        let isMounted = true;
        setLoading(true);

        api.getPatientMedicalHistory(patId)
            .then((res) => {
                if (isMounted && res?.data) {
                    setLiveHistory(res.data);
                }
            })
            .catch(() => {})
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [patient?._id, patient?.id, records]);

    const s = buildSummary(patient, allergyLabel, liveHistory);

    return (
        <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                    <Icon className="text-teal-700 text-[20px]">auto_awesome</Icon>
                    <h3 className="text-sm font-bold text-slate-900">
                        AI Medical History Summary
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
                >
                    {open ? "Hide summary" : "Show summary"}

                    <Icon className="text-[16px]">
                        {open ? "expand_less" : "expand_more"}
                    </Icon>
                </button>
            </div>

            {open && (
                <>
                    {/* Overview */}
                    <Block title="Overview">
                        <p className="text-xs text-slate-800 leading-relaxed font-medium">
                            {s.overview}
                        </p>

                        <p className="text-xs text-slate-500 pt-1">
                            <span className="font-semibold text-slate-400">
                                Allergies:
                            </span>{" "}
                            <span
                                className={
                                    allergyLabel
                                        ? "text-rose-600 font-bold"
                                        : "font-semibold text-slate-700"
                                }
                            >
                                {s.allergies}
                            </span>
                        </p>
                    </Block>

                    {s.hasRecords && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                            <Block title="Key Conditions">
                                {s.conditions.length === 0 ? (
                                    emptyLine("No diagnoses on record.")
                                ) : (
                                    <ul className="space-y-1">
                                        {s.conditions.map((c) => (
                                            <li
                                                key={c.name}
                                                className="text-xs text-slate-800 font-medium"
                                            >
                                                <span className="font-semibold">{c.name}</span>
                                                <span className="text-[11px] text-slate-400">
                                                    {" "}• last recorded {formatDate(c.date)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Block>

                            <Block title="Current Medications">
                                {s.medications.length === 0 ? (
                                    emptyLine(
                                        "No active prescriptions on record."
                                    )
                                ) : (
                                    <ul className="space-y-1">
                                        {s.medications.map((m) => (
                                            <li
                                                key={m.key}
                                                className="text-xs text-slate-800"
                                            >
                                                <span className="font-semibold text-slate-900">
                                                    {m.name}
                                                </span>
                                                <span className="text-[11px] text-slate-500 font-medium">
                                                    {" "}• {m.detail}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Block>

                            <Block title="Recent Findings">
                                {s.findings.length === 0 ? (
                                    emptyLine("No reports on record.")
                                ) : (
                                    <ul className="space-y-1.5">
                                        {s.findings.map((f) => (
                                            <li key={f.key}>
                                                <span className="text-xs text-slate-700 leading-relaxed font-medium">
                                                    {f.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Block>

                            <Block title="Relevant History">
                                {s.history.length === 0 ? (
                                    emptyLine(
                                        "No previous consultations."
                                    )
                                ) : (
                                    <ul className="space-y-1.5">
                                        {s.history.map((h) => (
                                            <li key={h.key}>
                                                <span className="block text-xs text-slate-900 font-bold">
                                                    {h.title}
                                                </span>
                                                <span className="block text-[11px] text-slate-500 font-medium">
                                                    {h.detail}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Block>
                        </div>
                    )}

                    {/* Things to review */}
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
                        <div className="text-amber-800">
                            <h4 className="text-xs font-bold uppercase tracking-wider">
                                Things to Review
                            </h4>
                        </div>

                        <ul className="space-y-1 list-disc pl-5 marker:text-amber-600">
                            {s.review.map((item) => (
                                <li
                                    key={item}
                                    className="text-xs text-amber-950 font-medium"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="flex items-start gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
                        <Icon className="!text-[14px] !leading-[14px] mt-px text-slate-400">
                            info
                        </Icon>
                        AI-generated summary. Verify information against the original medical records.
                    </p>
                </>
            )}
        </div>
    );
}