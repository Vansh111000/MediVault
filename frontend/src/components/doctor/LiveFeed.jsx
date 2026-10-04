import Icon from "../Icon";

const tones = {
    primary: { icon: "bg-teal-50 text-teal-700", card: "bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60", title: "text-slate-900", text: "text-slate-600" },
    secondary: { icon: "bg-sky-50 text-sky-700", card: "bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60", title: "text-slate-900", text: "text-slate-600" },
    tertiary: { icon: "bg-emerald-50 text-emerald-700", card: "bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60", title: "text-slate-900", text: "text-slate-600" },
    error: { icon: "bg-rose-100 text-rose-700", card: "bg-rose-50/50 hover:bg-rose-50 border border-rose-200/60", title: "text-rose-900", text: "text-rose-700" },
};

export default function LiveFeed({ items }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Icon className="text-teal-700 text-[20px]">notifications_active</Icon>
                    <h3 className="text-sm font-bold text-slate-900">OPD Desk Live Feed</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                    {items.length} Updates
                </span>
            </div>

            <div className="space-y-2.5 mt-3">
                {items.map((item) => {
                    const t = tones[item.tone] ?? tones.primary;
                    return (
                        <div key={item.id} className={`p-3 rounded-xl flex items-start gap-3 transition-colors ${t.card}`}>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${t.icon}`}>
                                <Icon className="text-[18px]">{item.icon}</Icon>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <span className={`text-xs font-bold truncate ${t.title}`}>{item.title}</span>
                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{item.time}</span>
                                </div>
                                <p className={`text-xs mt-0.5 leading-relaxed ${t.text}`}>{item.text}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
