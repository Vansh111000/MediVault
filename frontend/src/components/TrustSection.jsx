import Icon from "./Icon";

const items = [
    {
        icon: "lock",
        style: "bg-primary/10 text-primary",
        title: "Secure & Private",
        text: "Your medical information stays protected with controlled access, client-side encryption, and biometric verification at every stage.",
    },
    {
        icon: "rule_folder",
        style: "bg-secondary/10 text-secondary",
        title: "Patient-Controlled Consent",
        text: "You decide when another hospital can access your previous records. Revoke access instantly with a single tap from your personal device.",
    },
    {
        icon: "smart_toy",
        style: "bg-tertiary/10 text-tertiary",
        title: "AI-Assisted Clarity",
        text: "Automatically organize records, extract critical laboratory values, and summarize multi-year medical history in real-time.",
    },
];

export default function TrustSection() {
    return (
        <section className="bg-surface-container-lowest py-space-xl">
            <div className="max-w-7xl mx-auto px-margin">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                    {items.map((item) => (
                        <div
                            key={item.title}
                            className="bg-surface-container-low/50 rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-sm hover:shadow-md transition-all"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.style}`}>
                                <Icon className="text-[28px]">{item.icon}</Icon>
                            </div>

                            <h3 className="font-headline-sm text-headline-sm text-on-surface">
                                {item.title}
                            </h3>

                            <p className="font-body-md text-on-surface-variant">
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}