import Icon from "../Icon";

const statuses = {
    waiting: {
        label: "Waiting",
        icon: "schedule",
        className: "bg-error/10 text-error",
    },
    "checked-in": {
        label: "Checked In",
        icon: "how_to_reg",
        className: "bg-secondary/10 text-secondary",
    },
    "in-room": {
        label: "In Room",
        icon: "meeting_room",
        className: "bg-primary/10 text-primary",
    },
    upcoming: {
        label: "Upcoming",
        icon: "event",
        className: "bg-tertiary/10 text-tertiary",
    },
    completed: {
        label: "Completed",
        icon: "check_circle",
        className: "bg-surface-container text-on-surface-variant",
    },
};

export default function StatusBadge({ status }) {
    const current = statuses[status] ?? statuses.upcoming;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-label-sm text-label-sm font-medium ${current.className}`}
        >
            <Icon className="text-[14px]">{current.icon}</Icon>
            {current.label}
        </span>
    );
}