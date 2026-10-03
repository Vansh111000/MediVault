import { useOutletContext } from "react-router-dom";
import Icon from "../../../components/Icon";
import { medicalRecords, formatDate } from "../../../data/mockClinicalData";

const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1);

export default function AISummaryTab() {
    const { patient, allergyLabel } = useOutletContext();
    const records = medicalRecords[patient.id] ?? [];

    const diagnosis = records.find((r) => r.type === "diagnosis");
    const consultation = records.find((r) => r.type === "consultation");
    const prescription = records.find((r) => r.type === "prescription");
    const report = records.find((r) => r.type === "report");

    const keyPoints = [
        { label: "Latest diagnosis", value: diagnosis ? `${diagnosis.title} (${formatDate(diagnosis.date)})` : "None on record" },
        { label: "Current medication", value: prescription ? prescription.title : "None on record" },
        { label: "Latest report", value: report ? `${report.title} (${formatDate(report.date)})` : "None on record" },
        { label: "Allergies", value: allergyLabel ? allergyLabel.replace("Allergy: ", "") : "None on record" },
    ];

    return (
        <section className="space-y-space-md">
            <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    AI Medical History Summary
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                    AI-generated summary of the patient's available medical history.
                </p>
            </div>

            {records.length === 0 ? (
                <div className="py-space-xl flex flex-col items-center text-center gap-1">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-space-sm">
                        <Icon className="text-[24px]">auto_awesome</Icon>
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                        Nothing to summarize yet
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                        A summary will be available once this patient has previous records.
                    </p>
                </div>
            ) : (
                <>
                    <div className="p-space-md bg-surface-container-low rounded-xl space-y-space-sm">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/10 text-secondary font-label-sm text-label-sm font-medium">
                            <Icon className="text-[14px]">auto_awesome</Icon>
                            Sample summary
                        </span>
                        <p className="font-body-md text-body-md text-on-surface">
                            {patient.name} is a {patient.age}-year-old {patient.sex.toLowerCase()} with{" "}
                            {diagnosis ? lowerFirst(diagnosis.title) : "no diagnosis"} on record.
                            {consultation && ` The most recent consultation was "${consultation.title}" on ${formatDate(consultation.date)}.`}
                            {prescription && ` Medication on record: ${prescription.title}.`}
                            {report && ` The latest report is ${report.title} (${formatDate(report.date)}).`}
                        </p>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                        {keyPoints.map((point) => (
                            <div key={point.label} className="px-space-md py-space-sm bg-surface-container-low rounded-xl">
                                <dt className="font-body-sm text-body-sm text-on-surface-variant">{point.label}</dt>
                                <dd className="font-label-md text-label-md text-on-surface font-semibold">
                                    {point.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </>
            )}

            <div className="flex items-start gap-2 px-space-md py-space-sm rounded-xl bg-secondary/10 text-secondary">
                <Icon className="text-[18px] mt-0.5">info</Icon>
                <p className="font-label-sm text-label-sm">
                    AI-generated information should be verified against the original medical records.
                </p>
            </div>
        </section>
    );
}
