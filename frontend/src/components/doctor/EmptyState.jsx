import Icon from "../Icon";

export default function EmptyState({ icon, title, description }) {
    return (
        <div className="w-full px-margin-mobile sm:px-margin py-space-xl">
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm min-h-[420px] flex flex-col items-center justify-center text-center px-space-xl">

                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-space-md">
                    <Icon className="text-[30px]">
                        {icon}
                    </Icon>
                </div>

                <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
                    {title}
                </h1>

                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-space-sm">
                    {description}
                </p>

            </div>
        </div>
    );
}