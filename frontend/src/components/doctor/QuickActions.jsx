import { Link } from "react-router-dom";
import Icon from "../Icon";

const actions = [
    { label: "Start Consultation", icon: "add_call", to: "/doctor/patients", primary: true },
    { label: "View Medical Records", icon: "folder_shared", to: "/doctor/records", iconTone: "text-teal-700" },
    { label: "Review Reports", icon: "lab_profile", to: "/doctor/records", iconTone: "text-sky-700" },
];

export default function QuickActions() {
    return (
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-2">
            {actions.map((action) => (
                <Link
                    key={action.label}
                    to={action.to}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                        action.primary
                            ? "bg-teal-700 text-white hover:bg-teal-800"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                    }`}
                >
                    <Icon className={`text-[18px] ${action.iconTone ?? ""}`}>{action.icon}</Icon>
                    <span>{action.label}</span>
                </Link>
            ))}
        </div>
    );
}
