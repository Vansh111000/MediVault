import Icon from "./Icon";

const features = [
    {
        icon: "document_scanner",
        style: "bg-primary/10 text-primary",
        title: "Automatic Extraction",
        description:
            "Extract medicines, diagnoses, tests, and doctor details from uploaded documents and scanned lab PDFs in seconds.",
    },
    {
        icon: "summarize",
        style: "bg-secondary/10 text-secondary",
        title: "AI Medical History Summary",
        description:
            "Turn lengthy medical histories into a concise, easy-to-review summary so any specialist grasps your background in 30 seconds.",
    },
    {
        icon: "translate",
        style: "bg-tertiary/10 text-tertiary",
        title: "Plain-Language Reports",
        description:
            "Optionally explain complex medical terminology in simpler language, helping you understand your lab results without anxiety.",
    },
];

export default function AIFeatures() {
    return (
        <section id="features" className="bg-surface-container-low/40 py-space-xl">
            <div className="max-w-7xl mx-auto px-margin">

                <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-space-xl">
                    <div className="inline-flex items-center gap-1 text-primary font-label-md uppercase tracking-wider mb-space-xs">
                        <Icon className="text-[16px]">psychology</Icon>
                        Clinical Intelligence
                    </div>

                    <h2 className="font-headline-lg text-headline-lg text-on-surface">
                        Make sense of your medical records with AI.
                    </h2>

                    <p className="font-body-lg text-on-surface-variant mt-space-xs">
                        Clinical intelligence that saves time for physicians and provides
                        total clarity for patients.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md"
                        >
                            <div>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-space-xs ${feature.style}`}>
                                    <Icon className="text-[22px]">{feature.icon}</Icon>
                                </div>

                                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                                    {feature.title}
                                </h3>

                                <p className="font-body-md text-on-surface-variant">
                                    {feature.description}
                                </p>
                            </div>

                            <div className="bg-surface-container-low rounded-xl p-space-sm shadow-inner">
                                <span className="font-label-sm text-on-surface-variant">
                                    AI-powered clinical preview
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}