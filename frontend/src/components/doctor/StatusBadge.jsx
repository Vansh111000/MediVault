import Icon from "../Icon";

const statuses = {
    waiting: {
        label: "Waiting",
        icon: "schedule",
        className: "bg-amber-50 text-amber-700 border border-amber-200/70",
    },
    "checked-in": {
        label: "Checked In",
        icon: "how_to_reg",
        className: "bg-sky-50 text-sky-700 border border-sky-200/70",
    },
    "in-room": {
        label: "In Room",
        icon: "meeting_room",
        className: "bg-teal-50 text-teal-700 border border-teal-200/70",
    },
    upcoming: {
        label: "Upcoming",
        icon: "event",
        className: "bg-indigo-50 text-indigo-700 border border-indigo-200/70",
    },
    completed: {
        label: "Completed",
        icon: "check_circle",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200/70",
    },
};

export default function StatusBadge({ status }) {
    const current = statuses[status] ?? statuses.upcoming;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${current.className}`}
        >
            <Icon className="text-[13px]">{current.icon}</Icon>
            {current.label}
        </span>
    );
}