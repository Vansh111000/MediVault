import { useOutletContext } from "react-router-dom";
import Icon from "../../../components/Icon";
import { medicalRecords, formatDate } from "../../../data/mockClinicalData";

const isBloodReport = (title) => /panel|blood|hba1c|lipid|cholesterol/i.test(title);

export default function MedicalRecordsTab() {
    const { patient } = useOutletContext();
    const records = medicalRecords[patient.id] ?? [];

    const groups = [
        {
            title: "Previous Consultations",
            icon: "stethoscope",
            items: records.filter((r) => r.type === "consultation" || r.type === "diagnosis"),
        },
        {
            title: "Prescriptions",
            icon: "medication",
            items: records.filter((r) => r.type === "prescription"),
        },
        {
            title: "Blood Reports",
            icon: "bloodtype",
            items: records.filter((r) => r.type === "report" && isBloodReport(r.title)),
        },
        {
            title: "Other Reports",
            icon: "description",
            items: records.filter((r) => r.type === "report" && !isBloodReport(r.title)),
        },
    ];

    return (
        <section className="space-y-space-md">
            <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Medical Records</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Previous consultations, prescriptions and reports for this patient.
                </p>
            </div>

            {records.length === 0 ? (
                <div className="py-space-xl flex flex-col items-center text-center gap-1">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-space-sm">
                        <Icon className="text-[24px]">folder_off</Icon>
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                        No previous records
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                        Medical history will appear here when records are available.
                    </p>
                </div>
            ) : (
                <>
                    <p className="font-body-sm text-body-sm text-outline">
                        Historical records are read-only.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                        {groups.map((group) => (
                            <div key={group.title} className="p-space-md bg-surface-container-low rounded-xl space-y-space-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center">
                                            <Icon className="text-[18px]">{group.icon}</Icon>
                                        </span>
                                        <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                                            {group.title}
                                        </h3>
                                    </div>
                                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold">
                                        {group.items.length}
                                    </span>
                                </div>

                                {group.items.length === 0 ? (
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                                        No records available.
                                    </p>
                                ) : (
                                    <ul className="space-y-1.5">
                                        {group.items.map((item) => (
                                            <li
                                                key={`${item.type}-${item.title}`}
                                                className="px-space-sm py-2 bg-surface-container-lowest rounded-lg"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-1">
                                                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                                                        {item.title}
                                                    </span>
                                                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                                                        {formatDate(item.date)}
                                                    </span>
                                                </div>
                                                <span className="font-body-sm text-body-sm text-outline">
                                                    {item.type === "diagnosis" ? "Diagnosis • " : ""}
                                                    {item.source}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
