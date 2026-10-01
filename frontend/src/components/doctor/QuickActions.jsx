import { Link } from "react-router-dom";
import Icon from "../Icon";

const actions = [
    { label: "Start Consultation", icon: "add_call", to: "/doctor/consultations", primary: true },
    { label: "View Medical Records", icon: "folder_shared", to: "/doctor/records", iconTone: "text-primary" },
    { label: "Create Prescription", icon: "prescriptions", to: "/doctor/prescriptions", iconTone: "text-secondary" },
    { label: "Upload / Review Report", icon: "upload_file", to: "/doctor/records", iconTone: "text-tertiary" },
];

export default function QuickActions() {
    return (
        <div className="bg-surface-container-low p-space-sm rounded-xl flex flex-wrap items-center gap-space-xs">
            {actions.map((action) => (
                <Link
                    key={action.label}
                    to={action.to}
                    className={`inline-flex items-center gap-2 px-space-md py-2 rounded-lg font-label-md text-label-md shadow-sm transition-colors ${
                        action.primary
                            ? "bg-primary text-on-primary hover:bg-primary-container"
                            : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
                    }`}
                >
                    <Icon className={`text-[18px] ${action.iconTone ?? ""}`}>{action.icon}</Icon>
                    <span>{action.label}</span>
                </Link>
            ))}
        </div>
    );
}
