import { Shield, ArrowLeft, LogOut } from "lucide-react";
import { doctor } from "../../data/mockData";

export default function DoctorHeader({ onNavigateHome }) {
    const initials = doctor.shortName
        ? doctor.shortName
              .replace("Dr. ", "")
              .split(" ")
              .map((n) => n[0])
              .join("")
        : "DR";

    return (
        <nav className="bg-[#f8fafc] sticky top-0 z-40">
            <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onNavigateHome}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
                            <Shield className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 block leading-tight">MediVault</span>
                            <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">
                                DOCTOR PORTAL
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center text-xs border border-slate-200">
                            {initials}
                        </div>
                        <div className="hidden sm:block text-left text-xs">
                            <div className="font-bold text-slate-900">{doctor.name}</div>
                            <div className="text-[11px] text-slate-700 font-medium">
                                {doctor.specialty} • {doctor.hospital}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onNavigateHome}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors ml-2 py-1 px-1.5"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}