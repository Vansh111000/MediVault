import Icon from "../Icon";

const tones = {
    primary: { icon: "bg-primary/10 text-primary", card: "bg-surface-container-low hover:bg-surface-container", title: "text-on-surface", text: "text-on-surface-variant" },
    secondary: { icon: "bg-secondary/10 text-secondary", card: "bg-surface-container-low hover:bg-surface-container", title: "text-on-surface", text: "text-on-surface-variant" },
    tertiary: { icon: "bg-tertiary/10 text-tertiary", card: "bg-surface-container-low hover:bg-surface-container", title: "text-on-surface", text: "text-on-surface-variant" },
    error: { icon: "bg-error/10 text-error", card: "bg-error-container/20", title: "text-on-error-container", text: "text-on-error-container" },
};

export default function LiveFeed({ items }) {
    return (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg">
            <div className="flex items-center justify-between pb-space-sm">
                <div className="flex items-center gap-2">
                    <Icon className="text-primary text-[20px]">notifications_active</Icon>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold">OPD Desk Live Feed</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                    {items.length} Updates
                </span>
            </div>

            <div className="space-y-space-sm mt-space-sm">
                {items.map((item) => {
                    const t = tones[item.tone] ?? tones.primary;
                    return (
                        <div key={item.id} className={`p-space-sm rounded-xl flex items-start gap-space-sm transition-colors ${t.card}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${t.icon}`}>
                                <Icon className="text-[18px]">{item.icon}</Icon>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className={`font-label-sm text-label-sm font-bold ${t.title}`}>{item.title}</span>
                                    <span className="font-body-sm text-body-sm text-outline whitespace-nowrap">{item.time}</span>
                                </div>
                                <p className={`font-body-sm text-body-sm mt-0.5 ${t.text}`}>{item.text}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
