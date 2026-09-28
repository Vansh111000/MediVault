import Icon from "./Icon";

export default function CTA() {
    return (
        <section id="get-started" className="max-w-7xl mx-auto px-margin pb-space-xl">
            <div className="relative overflow-hidden bg-primary rounded-3xl p-space-lg md:p-space-xl text-on-primary shadow-xl">

                <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-primary-container/40 blur-2xl" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
                    <div className="max-w-2xl flex flex-col gap-space-xs">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-md w-fit font-label-sm">
                            <Icon className="text-[16px]">favorite</Icon>
                            Patient Sovereignty First
                        </div>

                        <h2 className="font-display text-display tracking-tight">
                            Take control of your health story today.
                        </h2>

                        <p className="font-body-lg text-on-primary-container leading-relaxed">
                            Join thousands of patients who never have to hunt for lost paper
                            prescriptions or repeat unnecessary lab tests.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-space-sm">
                        <a
                            href="#signup"
                            className="inline-flex items-center justify-center gap-space-xs px-space-lg py-space-md rounded-xl bg-surface-container-lowest text-primary font-title-md hover:bg-surface-container shadow-md"
                        >
                            Create Your Free Vault
                            <Icon className="text-[18px]">arrow_forward</Icon>
                        </a>

                        <a
                            href="#demo"
                            className="inline-flex items-center justify-center gap-space-xs px-space-lg py-space-md rounded-xl bg-surface-container-lowest/10 text-on-primary font-title-md"
                        >
                            <Icon className="text-[18px]">domain_add</Icon>
                            Schedule Hospital Demo
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}