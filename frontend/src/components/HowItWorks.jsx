import Icon from "./Icon";

const steps = [
    ["01", "qr_code_scanner", "text-primary", "Visit a Hospital",
        "Your account is created or retrieved by the hospital assistant via your secure QR or National Health ID in seconds."],

    ["02", "person_add", "text-secondary", "Get Connected to Doctor",
        "The assistant assigns you to the doctor handling your consultation with verified department credentials and specialty scope."],

    ["03", "inventory_2", "text-tertiary", "Records Stay Organized",
        "Doctors can view authorized history, add consultations, prescriptions, and reports directly into your personal vault."],

    ["04", "share_location", "text-primary", "Share Only When You Choose",
        "When visiting another hospital, you can grant temporary access to your previous records that automatically lapses after care."],
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="max-w-7xl mx-auto px-margin py-space-xl">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-xl">
                <div className="inline-flex items-center gap-1 text-primary font-label-md uppercase tracking-wider mb-space-xs">
                    <Icon className="text-[16px]">sync_alt</Icon>
                    Step-by-Step Experience
                </div>

                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    Designed for seamless care across every clinic and hospital
                </h2>

                <p className="font-body-lg text-on-surface-variant mt-space-xs">
                    Move effortlessly between general practitioners, specialized clinics,
                    and regional diagnostic labs without repeated paperwork.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                {steps.map(([number, icon, color, title, text]) => (
                    <div
                        key={number}
                        className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-sm"
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-display text-display text-primary/20">
                                {number}
                            </span>

                            <div className={`w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center ${color}`}>
                                <Icon className="text-[22px]">{icon}</Icon>
                            </div>
                        </div>

                        <h4 className="font-title-md text-on-surface">
                            {title}
                        </h4>

                        <p className="font-body-sm text-on-surface-variant leading-relaxed">
                            {text}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}