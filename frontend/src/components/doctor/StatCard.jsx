import Icon from "../Icon";

const tones = {
    primary: { soft: "bg-teal-50 text-teal-700 border border-teal-200/60", bar: "bg-teal-700", icon: "text-teal-700 bg-teal-50" },
    secondary: { soft: "bg-sky-50 text-sky-700 border border-sky-200/60", bar: "bg-sky-600", icon: "text-sky-700 bg-sky-50" },
    tertiary: { soft: "bg-emerald-50 text-emerald-700 border border-emerald-200/60", bar: "bg-emerald-600", icon: "text-emerald-700 bg-emerald-50" },
    error: { soft: "bg-rose-50 text-rose-700 border border-rose-200/60", bar: "bg-rose-600", icon: "text-rose-700 bg-rose-50" },
};

export default function StatCard({ label, icon, value, badge, caption, progress = 0, tone = "primary" }) {
    const t = tones[tone] || tones.primary;

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{label}</span>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.icon}`}>
                    <Icon className="text-[18px]">{icon}</Icon>
                </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {String(value).padStart(2, "0")}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${t.soft}`}>
                    {badge}
                </span>
            </div>

            <p className="text-xs text-slate-500 mt-2 font-medium">{caption}</p>

            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${t.bar}`} style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}
