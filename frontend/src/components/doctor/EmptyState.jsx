import Icon from "../Icon";

export default function EmptyState({ icon, title, description }) {
    return (
        <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs min-h-[420px] flex flex-col items-center justify-center text-center p-8">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center mb-4">
                    <Icon className="text-[28px]">
                        {icon}
                    </Icon>
                </div>

                <h1 className="text-xl font-bold text-slate-900">
                    {title}
                </h1>

                <p className="text-xs text-slate-500 max-w-md mt-2 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}