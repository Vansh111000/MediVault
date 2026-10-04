import Icon from "./Icon";

const flow = [
    ["person", "bg-primary/10 text-primary", "Patient (You)", "Primary Keyholder"],
    ["how_to_reg", "bg-secondary/10 text-secondary", "Granular Consent", "Scope Selected"],
    ["local_hospital", "bg-tertiary/10 text-tertiary", "Temporary Access", "Consultant In-Session"],
    ["task_alt", "bg-surface-container-high text-on-surface-variant", "Visit Completed", "Care Discharged"],
    ["lock_clock", "bg-error-container text-error", "Access Expired", "Auto-Revoked • Zero Cache"],
];

export default function PrivacyConsent() {
    return (
        <section id="security-and-consent" className="max-w-7xl mx-auto px-margin py-space-xl">
            <div className="bg-surface-container-lowest rounded-3xl p-space-lg md:p-space-xl shadow-sm flex flex-col gap-space-lg">

                <div className="max-w-3xl flex flex-col gap-space-xs">
                    <div className="inline-flex items-center gap-1.5 text-primary font-label-md uppercase tracking-wider">
                        <Icon className="text-[18px]">verified</Icon>
                        Sovereign Patient Rights
                    </div>

                    <h2 className="font-headline-lg text-headline-lg text-on-surface">
                        Your records. Your consent.
                    </h2>

                    <p className="font-body-lg text-on-surface-variant leading-relaxed">
                        Medical records are never permanently shared between hospitals or
                        stored unencrypted. Access to another hospital or specialist is
                        granted only with explicit patient consent and automatically
                        expires when the hospital visit is completed.
                    </p>
                </div>

                <div className="bg-surface-container-low/70 rounded-2xl p-space-md md:p-space-lg shadow-inner">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-sm">
                        {flow.map(([icon, style, title, subtitle]) => (
                            <div
                                key={title}
                                className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col items-center text-center gap-1"
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style}`}>
                                    <Icon className="text-[20px]">{icon}</Icon>
                                </div>

                                <span className="font-title-md text-on-surface">
                                    {title}
                                </span>

                                <span className="font-label-sm text-on-surface-variant">
                                    {subtitle}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-space-md pt-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm">
                        <div className="flex items-center gap-space-xs font-label-md">
                            <Icon className="text-primary text-[20px]">schedule</Icon>
                            Active Session Auto-Revoke (24h default or instant patient tap)
                        </div>

                        <div className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-sm shadow-sm">
                            <Icon className="text-primary text-[14px]">shield</Icon>
                            Cryptographically Enforced TTL
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}