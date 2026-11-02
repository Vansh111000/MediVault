import { useState, useEffect, useCallback } from "react";
import StatCard from "../../components/doctor/StatCard";
import PatientQueue from "../../components/doctor/PatientQueue";
import { useApp } from "../../context/AppContext";
import api from "../../services/api";

/**
 * Greeting follows strict time bands:
 *  05:00 – 11:59  Good morning
 *  12:00 – 16:59  Good afternoon
 *  17:00 – 04:59  Good evening
 */
function getGreeting(date) {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    return "Good evening";
}

/**
 * Clean academic qualifications and suffixes (MD, MBBS, MS, PhD, etc.)
 * and format doctor name with Dr. prefix.
 */
function formatDoctorGreetingName(name) {
    if (!name) return "Doctor";
    let cleaned = name
        .replace(/,?\s*\b(M\.?D\.?|M\.?B\.?B\.?S\.?|M\.?S\.?|M\.?Ch\.?|DNB|DM|Ph\.?D\.?|FRCS|FRCP|DO|BDS|MDS)\b/gi, "")
        .replace(/,\s*$/, "")
        .replace(/\s+/g, " ")
        .trim();
    if (!cleaned) return "Doctor";
    if (!cleaned.startsWith("Dr.") && !cleaned.startsWith("Dr ")) {
        cleaned = `Dr. ${cleaned}`;
    }
    return cleaned;
}

function mapVisit(v) {
    const patient = v.patient || {};
    return {
        id: patient._id || v.patient,
        _id: patient._id || v.patient,
        mediVaultId: patient.mediVaultId || "",
        visitId: v._id,
        name: patient.name || "Unknown Patient",
        age: patient.age || "--",
        gender: patient.gender || "--",
        bloodGroup: patient.bloodGroup || "--",
        status: v.status === "in_queue" ? "waiting"
            : v.status === "completed" ? "completed"
            : v.status === "scheduled" ? "upcoming"
            : "checked-in",
        rawStatus: v.status || "checked_in",
        appointmentDate: v.appointmentDate,
        appointmentTime: v.appointmentTime,
        checkInTime: v.checkInTime,
        time: v.appointmentTime || (v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "Scheduled"),
        visitType: v.visitType || "New Consultation",
        reasonForVisit: v.reasonForVisit || "General Consultation",
        reportedSymptoms: v.reportedSymptoms || "",
        preliminaryVitals: v.preliminaryVitals || {},
        priority: v.priority || "Routine",
        tokenNumber: v.tokenNumber || "",
        hasAllergy: (patient.allergies || []).length > 0,
    };
}

export default function DoctorDashboard() {
    const [now] = useState(() => new Date());
    const { currentUser } = useApp();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.getDoctorDashboard();
            if (res?.data) {
                setDashboardData(res.data);
            }
        } catch (err) {
            setError(err.message || "Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const doctor = dashboardData?.doctor;
    const stats = dashboardData?.stats || {};
    const patientQueue = (dashboardData?.patientQueue || []).map(mapVisit);

    // Use authenticated backend doctor name – strip suffixes and format cleanly
    const doctorName = formatDoctorGreetingName(doctor?.name);

    const total = stats.totalToday ?? 0;
    const completed = stats.completed ?? 0;
    const upcoming = stats.upcoming ?? 0;
    const draftsCount = stats.pendingDraftsCount ?? 0;

    if (loading) {
        return (
            <div className="flex flex-col w-full">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
                    <div className="flex items-center justify-center h-48 text-slate-400 text-sm font-medium">
                        Loading your dashboard…
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col w-full">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4">
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700 text-xs font-semibold">
                        Failed to load dashboard: {error}
                    </div>
                    <button
                        onClick={fetchDashboard}
                        className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {getGreeting(now)}, {doctorName}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        You have {total} patient{total !== 1 ? "s" : ""} today.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Patients Today" icon="group" tone="primary" value={total} />
                    <StatCard label="Upcoming" icon="schedule" tone="secondary" value={upcoming} />
                    <StatCard label="Completed" icon="check_circle" tone="tertiary" value={completed} />
                    <StatCard label="Pending Drafts" icon="draw" tone="error" value={draftsCount} />
                </div>

                <PatientQueue patients={patientQueue} onRefresh={fetchDashboard} />
            </div>
        </div>
    );
}
