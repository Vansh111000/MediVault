import { useState } from "react";
import Icon from "../../../components/Icon";
import { patientsRecords } from "../../../data/mockMedicalRecords";
import { formatDate } from "../../../data/mockClinicalData";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Builds the summary from the patient's existing mock records (mockMedicalRecords.js).
function buildSummary(patient, allergyLabel) {
    const records = patientsRecords[patient.id];

    const consultations = records?.consultations ?? [];
    const prescriptions = records?.prescriptions ?? [];
    const bloodReports = records?.bloodReports ?? [];
    const otherReports = records?.otherReports ?? [];

    const hasRecords =
        consultations.length +
            prescriptions.length +
            bloodReports.length +
            otherReports.length >
        0;

    const latest = consultations[0];

    // Key conditions: distinct diagnoses
    const conditions = [];

    consultations.forEach((c, index) => {
        const lower = c.diagnosis.toLowerCase();

        if (lower.startsWith("no significant")) return;
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
    const sex = patient.sex.toLowerCase();

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
        <div className="p-space-sm bg-surface-container-lowest rounded-xl space-y-1.5">
            <div>
                <h4 className="font-label-md text-label-md text-on-surface font-bold">
                    {title}
                </h4>
            </div>

            {children}
        </div>
    );
}

const emptyLine = (text) => (
    <p className="font-body-sm text-body-sm text-on-surface-variant">
        {text}
    </p>
);

export default function AISummaryCard({ patient, allergyLabel }) {
    const [open, setOpen] = useState(true);
    const s = buildSummary(patient, allergyLabel);

    return (
        <div className="bg-surface-container-low rounded-2xl p-space-md space-y-space-sm">
            <div className="flex items-center justify-between gap-space-sm">
                <div>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold">
                        AI Medical History Summary
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold hover:underline"
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
                        <p className="font-body-md text-body-md text-on-surface">
                            {s.overview}
                        </p>

                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                            <span className="text-outline">
                                Allergies:
                            </span>{" "}
                            <span
                                className={
                                    allergyLabel
                                        ? "text-error font-semibold"
                                        : "font-medium"
                                }
                            >
                                {s.allergies}
                            </span>
                        </p>
                    </Block>

                    {s.hasRecords && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-sm items-start">
                            <Block title="Key Conditions">
                                {s.conditions.length === 0 ? (
                                    emptyLine("No diagnoses on record.")
                                ) : (
                                    <ul className="space-y-1">
                                        {s.conditions.map((c) => (
                                            <li
                                                key={c.name}
                                                className="font-body-md text-body-md text-on-surface"
                                            >
                                                {c.name}

                                                <span className="font-body-sm text-body-sm text-outline">
                                                    {" "}
                                                    • last recorded{" "}
                                                    {formatDate(c.date)}
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
                                                className="font-body-md text-body-md text-on-surface"
                                            >
                                                <span className="font-semibold">
                                                    {m.name}
                                                </span>

                                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                                    {" "}
                                                    • {m.detail}
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
                                                <span className="font-body-md text-body-md text-on-surface">
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
                                                <span className="block font-label-md text-label-md text-on-surface font-semibold">
                                                    {h.title}
                                                </span>

                                                <span className="block font-body-sm text-body-sm text-on-surface-variant">
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
                    <div className="p-space-md bg-secondary/10 rounded-xl space-y-space-sm">
                        <div className="text-secondary">
                            <h4 className="font-label-md text-label-md font-bold">
                                Things to Review
                            </h4>
                        </div>

                        <ul className="space-y-1 list-disc pl-space-lg marker:text-secondary">
                            {s.review.map((item) => (
                                <li
                                    key={item}
                                    className="font-body-md text-body-md text-on-surface"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="flex items-start gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                        <Icon className="!text-[14px] !leading-[14px] mt-px">
                            info
                        </Icon>
                        AI-generated summary. Verify information against the original medical records.
                    </p>
                </>
            )}
        </div>
    );
}