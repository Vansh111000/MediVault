import Icon from "../Icon";

const tones = {
    primary: "text-teal-700 bg-teal-50",
    secondary: "text-sky-700 bg-sky-50",
    tertiary: "text-emerald-700 bg-emerald-50",
    error: "text-rose-700 bg-rose-50",
};

export default function StatCard({ label, icon, value, tone = "primary" }) {
    return (
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tones[tone] || tones.primary}`}>
                <Icon className="text-[18px]">{icon}</Icon>
            </span>
            <div className="min-w-0">
                <span className="block text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                    {String(value).padStart(2, "0")}
                </span>
                <span className="block text-[11px] font-semibold text-slate-500 mt-1 truncate">{label}</span>
            </div>
        </div>
    );
}
