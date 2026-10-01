import Icon from "../Icon";

export default function ConsentCell({ consent }) {
    switch (consent.type) {
        case "cross-hospital":
            return (
                <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm font-medium text-primary flex items-center gap-1">
                        <Icon className="text-[14px]">folder_shared</Icon>
                        {consent.label}
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                        {consent.hospital}
                    </span>
                </div>
            );

        case "own-hospital":
            return (
                <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm font-medium text-primary flex items-center gap-1">
                        <Icon className="text-[14px]">folder_open</Icon>
                        {consent.label}
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                        {consent.note}
                    </span>
                </div>
            );

        case "revoked":
            return (
                <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                        <Icon className="text-[14px]">check_circle</Icon>
                        {consent.label}
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                        {consent.note}
                    </span>
                </div>
            );

        default:
            return (
                <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                        <Icon className="text-[14px]">folder_off</Icon>
                        {consent.label}
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                        {consent.note}
                    </span>
                </div>
            );
    }
}