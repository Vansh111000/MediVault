import Icon from "./Icon";

const links = [
    ["How It Works", "#how-it-works"],
    ["Features", "#features"],
    ["Security & Consent", "#security-and-consent"],
    ["For Doctors", "#for-doctors"],
    ["Pricing", "#pricing"],
];

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <div className="h-20 max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-lg">
                <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
                        <Icon className="text-[24px]">shield_with_heart</Icon>
                    </div>

                    <div className="flex flex-col">
                        <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">
                            MediVault
                        </span>
                        <span className="font-label-sm text-label-sm text-primary tracking-wide uppercase mt-0.5">
                            Healthcare AI
                        </span>
                    </div>
                </div>

                <nav className="hidden lg:flex items-center gap-space-md">
                    {links.map(([label, href]) => (
                        <a
                            key={href}
                            href={href}
                            className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface px-space-sm py-space-xs rounded-lg transition-colors"
                        >
                            {label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-space-sm">
                    <a
                        href="#sign-in"
                        className="font-title-md text-title-md text-on-surface-variant hover:text-on-surface px-space-md py-space-sm rounded-lg transition-colors"
                    >
                        Sign In
                    </a>

                    <a
                        href="#get-started"
                        className="font-title-md text-title-md bg-primary text-on-primary hover:bg-primary-container px-space-lg py-space-sm rounded-full transition-colors shadow-sm"
                    >
                        Get Started
                    </a>

                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-xs">
                        <Icon className="text-on-primary text-[18px]">person</Icon>
                    </div>
                </div>
            </div>
        </header>
    );
}