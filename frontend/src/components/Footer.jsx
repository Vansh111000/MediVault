import Icon from "./Icon";

const platform = [
    ["About", "#about"],
    ["How It Works", "#how-it-works"],
    ["Security Standards", "#security-standards"],
    ["Privacy Policy", "#privacy-policy"],
];

const support = [
    ["Contact Support", "#contact-support"],
    ["Login", "#sign-in"],
    ["Emergency Access Protocol", "#emergency-access"],
];

function Links({ title, items, className }) {
    return (
        <div className={className}>
            <h4 className="font-title-md text-on-surface">{title}</h4>

            <nav className="flex flex-col gap-space-xs">
                {items.map(([label, href]) => (
                    <a
                        key={href}
                        href={href}
                        className="font-body-md text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        {label}
                    </a>
                ))}
            </nav>
        </div>
    );
}

export default function Footer() {
    return (
        <footer className="bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] mt-space-xl">
            <div className="max-w-7xl mx-auto px-margin py-space-xl">

                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter pb-space-lg">

                    <div className="md:col-span-5 flex flex-col gap-space-sm">
                        <div className="flex items-center gap-space-sm">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                                <Icon className="text-[20px]">
                                    shield_with_heart
                                </Icon>
                            </div>

                            <span className="font-headline-sm text-headline-sm text-on-surface">
                                MediVault
                            </span>
                        </div>

                        <p className="font-body-md text-on-surface-variant max-w-sm">
                            Empowering patients with secure, consent-driven medical records
                            and AI-powered insights.
                        </p>

                        <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container-low rounded-full w-fit">
                            <Icon className="text-primary text-[16px]">
                                verified_user
                            </Icon>
                            <span className="font-label-sm text-on-surface-variant">
                                HIPAA & GDPR Compliant Architecture
                            </span>
                        </div>
                    </div>

                    <Links
                        title="Platform & Trust"
                        items={platform}
                        className="md:col-span-4 flex flex-col gap-space-sm"
                    />

                    <Links
                        title="Support & Access"
                        items={support}
                        className="md:col-span-3 flex flex-col gap-space-sm"
                    />
                </div>

                <div className="pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
                    <p className="font-label-sm text-on-surface-variant">
                        End-to-End Encrypted • Patient-Controlled Access • ISO 27001 Certified
                    </p>

                    <p className="font-body-sm text-on-surface-variant">
                        © 2024 MediVault Health Systems Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}