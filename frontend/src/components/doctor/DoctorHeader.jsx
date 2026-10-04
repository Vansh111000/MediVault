import { Link, NavLink } from "react-router-dom";
import { Shield, ArrowLeft, Bell } from "lucide-react";
import { doctor, liveFeed } from "../../data/mockDoctorData";

const navItems = [
    { label: "Dashboard", to: "/doctor", end: true },
    { label: "My Patients", to: "/doctor/patients" },
    { label: "Medical Records", to: "/doctor/records" },
];

export default function DoctorHeader() {
    const unreadCount = liveFeed.filter((item) => item.unread).length;

    const navClass = ({ isActive }) =>
        `whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isActive
                ? "bg-teal-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
        }`;

    return (
        <header className="sticky top-0 z-40 bg-[#f8fafc] border-b border-slate-200/80 shadow-xs">
            <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Home</span>
                    </Link>

                    <Link to="/doctor" className="flex items-center gap-2 select-none">
                        <div className="w-8 h-8 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
                            <Shield className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 block leading-tight">MediVault</span>
                            <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">DOCTOR PORTAL</span>
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
                    {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Right Profile & Actions */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Notifications"
                        className="relative p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
                    >
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-700 text-white rounded-full text-[10px] leading-none flex items-center justify-center font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center text-xs border border-slate-200">
                            {doctor.shortName ? doctor.shortName.replace('Dr. ', '').split(' ').map((n) => n[0]).join('') : 'DR'}
                        </div>
                        <div className="hidden sm:block text-left text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{doctor.name}</span>
                                {doctor.onDuty && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                        On Duty
                                    </span>
                                )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">
                                {doctor.specialty} • {doctor.hospital}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile navigation */}
            <nav className="md:hidden flex items-center gap-1.5 overflow-x-auto px-4 sm:px-6 py-2 border-t border-slate-200/60 bg-[#f8fafc]">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isActive
                                    ? "bg-teal-700 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80"
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </header>
    );
}
