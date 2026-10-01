import Icon from "../Icon";

const tones = {
    primary: { soft: "bg-primary/10 text-primary", bar: "bg-primary" },
    secondary: { soft: "bg-secondary/10 text-secondary", bar: "bg-secondary" },
    tertiary: { soft: "bg-tertiary/10 text-tertiary", bar: "bg-tertiary" },
    error: { soft: "bg-error/10 text-error", bar: "bg-error" },
};

export default function StatCard({ label, icon, value, badge, caption, progress = 0, tone = "primary" }) {
    const t = tones[tone];

    return (
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.soft}`}>
                    <Icon className="text-[18px]">{icon}</Icon>
                </span>
            </div>

            <div className="mt-space-md flex items-baseline gap-2">
                <span className="font-display text-display text-on-surface font-bold">
                    {String(value).padStart(2, "0")}
                </span>
                <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold ${t.soft}`}>
                    {badge}
                </span>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">{caption}</p>

            <div className="w-full bg-surface-container h-1 rounded-full mt-3 overflow-hidden">
                <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}
