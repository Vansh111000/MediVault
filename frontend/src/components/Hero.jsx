import Icon from "./Icon";

const records = [
    {
        icon: "history_toggle_off",
        color: "text-primary",
        title: "Medical History",
        meta: "3d ago",
        content: (
            <>
                <div><strong>Chronic:</strong> Mild Asthma</div>
                <div><strong>Allergies:</strong> Penicillin</div>
            </>
        ),
    },
    {
        icon: "prescriptions",
        color: "text-secondary",
        title: "Prescription",
        meta: "Active",
        content: (
            <>
                <div className="font-title-md text-body-md">Amoxicillin 500mg</div>
                <div className="text-on-surface-variant">
                    1 tab bid × 7d • Dr. E. Vance
                </div>
            </>
        ),
    },
    {
        icon: "biotech",
        color: "text-on-surface",
        title: "Blood Panel",
        meta: "LabCorp",
        content: (
            <>
                <div className="flex justify-between">
                    <span>CMP Normal Range:</span>
                    <strong className="text-tertiary">98%</strong>
                </div>

                <div className="text-error flex items-center gap-0.5 mt-0.5">
                    <Icon className="text-[12px]">warning</Icon>
                    Flag: Vit-D Mild Deficit
                </div>
            </>
        ),
    },
    {
        icon: "stethoscope",
        color: "text-on-surface",
        title: "Cardiology",
        meta: "Next: 6 mos",
        content: (
            <>
                <div>Resting BPM: <strong>68</strong></div>
                <div>BP: <strong>118/76 mmHg</strong></div>
            </>
        ),
    },
];

export default function Hero() {
    return (
        <section className="relative w-full overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[460px] bg-gradient-to-b from-primary-fixed/20 via-surface-container-low/40 to-transparent blur-3xl pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto px-margin pt-space-xl pb-space-xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">

                    <div className="lg:col-span-6 flex flex-col gap-space-md">
                        <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low w-fit">
                            <Icon className="text-primary text-[18px]">
                                verified_user
                            </Icon>

                            <span className="font-label-md text-label-md text-primary">
                                Encrypted & Patient-Owned Health Records
                            </span>
                        </div>

                        <h1 className="font-display text-display text-on-surface tracking-tight leading-tight">
                            Your Medical History. Connected, Secure, and Smarter.
                        </h1>

                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                            MediVault brings your medical records, prescriptions, test
                            reports, and consultations together in one secure place —
                            helping doctors understand your history and helping you stay
                            informed.
                        </p>

                        <div className="flex flex-wrap items-center gap-space-sm">
                            <a
                                href="#get-started"
                                className="inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-title-md hover:bg-primary-container transition-all shadow-sm"
                            >
                                Get Started
                                <Icon className="text-[18px]">arrow_forward</Icon>
                            </a>

                            <a
                                href="#how-it-works"
                                className="inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-surface-container-lowest text-on-surface font-title-md hover:bg-surface-container transition-all shadow-sm"
                            >
                                <Icon className="text-primary text-[20px]">
                                    play_circle
                                </Icon>
                                How MediVault Works
                            </a>
                        </div>

                        <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md">
                            <span className="text-tertiary">★</span>
                            <span>
                                99.9% Consent Compliance • HIPAA & HL7 FHIR Compatible • Zero
                                Data Selling
                            </span>
                        </div>
                    </div>

                    <div className="lg:col-span-6">
                        <div className="bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-md flex flex-col gap-space-sm">

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface-container-low/60 rounded-xl p-space-sm gap-space-xs">
                                <div className="flex items-center gap-space-xs">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Icon className="text-[18px]">badge</Icon>
                                    </div>

                                    <div>
                                        <div className="font-title-md">
                                            Sarah Jenkins{" "}
                                            <span className="text-on-surface-variant font-body-sm">
                                                (DOB: 14 May 1989)
                                            </span>
                                        </div>

                                        <div className="font-label-sm text-on-surface-variant">
                                            Record ID #MV-8821
                                        </div>
                                    </div>
                                </div>

                                <div className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-surface-container-lowest text-tertiary font-label-sm shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                                    Verified Identity
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                                {records.map((record) => (
                                    <div
                                        key={record.title}
                                        className="bg-surface-container-low/40 rounded-xl p-space-sm flex flex-col gap-1"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`font-label-md flex items-center gap-1 ${record.color}`}>
                                                <Icon className="text-[16px]">
                                                    {record.icon}
                                                </Icon>
                                                {record.title}
                                            </span>

                                            <span className="font-label-sm text-on-surface-variant">
                                                {record.meta}
                                            </span>
                                        </div>

                                        <div className="text-on-surface font-body-sm mt-1">
                                            {record.content}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-surface-container-low/90 rounded-xl p-space-sm shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-primary font-label-md">
                                        <Icon className="text-[18px]">auto_awesome</Icon>
                                        MediVault AI Clinical Digest
                                    </div>

                                    <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm">
                                        Live Verification
                                    </span>
                                </div>

                                <p className="font-body-sm text-on-surface mt-1 leading-relaxed">
                                    <strong className="text-primary">Key Insight:</strong>{" "}
                                    No medication interactions detected between current asthma
                                    inhaler and prescribed antibiotics. Vital signs stable
                                    across past 3 hospital visits.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}