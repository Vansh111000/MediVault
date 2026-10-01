import { Link, NavLink } from "react-router-dom";
import Icon from "../Icon";
import { doctor, liveFeed } from "../../data/mockDoctorData";

const navItems = [
    { label: "Dashboard", to: "/doctor", end: true },
    { label: "My Patients", to: "/doctor/patients" },
    { label: "Medical Records", to: "/doctor/records" },
    { label: "Consultations", to: "/doctor/consultations" },
    { label: "Prescriptions", to: "/doctor/prescriptions" },
];

const navClass = ({ isActive }) =>
    `whitespace-nowrap px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-colors ${
        isActive
            ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
    }`;

export default function DoctorHeader() {
    const unreadCount = liveFeed.filter((item) => item.unread).length;

    return (
        <header className="sticky top-0 z-50 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <div className="h-20 w-full px-margin-mobile sm:px-margin flex items-center justify-between gap-gutter">
                <div className="flex items-center gap-space-lg">
                    <Link to="/doctor" className="flex items-center gap-space-sm select-none">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_2px_6px_rgba(0,104,95,0.2)]">
                            <Icon className="text-on-primary text-[24px]">verified_user</Icon>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-title-md text-title-md text-on-surface tracking-tight leading-none font-bold">
                                MediVault
                            </span>
                            <span className="font-label-sm text-label-sm text-primary tracking-wider uppercase mt-space-xs">
                                Doctor Portal
                            </span>
                        </div>
                    </Link>

                </div>

                <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl">
                    {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-space-md">

                    <button
                        type="button"
                        aria-label="Notifications"
                        className="relative p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        <Icon className="text-[22px]">notifications</Icon>
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error rounded-full text-[10px] leading-none flex items-center justify-center font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-space-sm pl-space-xs">
                        <div className="hidden sm:flex flex-col text-right">
                            <div className="flex items-center justify-end gap-1.5">
                                <span className="font-label-md text-label-md text-on-surface font-semibold">
                                    {doctor.name}
                                </span>
                                {doctor.onDuty && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary text-[10px] font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                                        On Duty
                                    </span>
                                )}
                            </div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                                {doctor.specialty} • {doctor.role}
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Icon className="text-on-primary text-[18px]">person</Icon>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile / tablet navigation */}
            <nav className="lg:hidden flex items-center gap-1.5 overflow-x-auto px-margin-mobile sm:px-margin pb-space-sm">
                {navItems.map((item) => (
                    <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </header>
    );
}
