// Temporary mock clinical data for the Medical Records, Consultations and
// Prescriptions pages. Patients themselves come from mockDoctorData.js.
// Replace with API calls once the backend exists.

// ---------- Small helpers ----------

// Today's date as YYYY-MM-DD in the user's local time zone.
export function todayISO() {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
}

// "2026-08-12" -> "12 Aug 2026"
export function formatDate(iso) {
    if (!iso) return "";
    return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// ---------- Medical records (read-only history) ----------
// type: consultation | diagnosis | prescription | report
const rec = (type, title, date, description, source) => ({ type, title, date, description, source });

export const medicalRecords = {
    "MV-10482": [
        rec("consultation", "Previous cardiac review", "2026-08-12", "Routine cardiac review. Advised lifestyle changes.", "CityCare Hospital"),
        rec("diagnosis", "Primary hypertension", "2026-08-12", "Blood pressure persistently above normal range.", "CityCare Hospital"),
        rec("prescription", "Amlodipine 5mg, once daily", "2026-08-12", "30-day course. Take after breakfast.", "CityCare Hospital"),
        rec("report", "Lipid panel", "2026-08-10", "Total cholesterol 218 mg/dL.", "CityCare Hospital"),
    ],
    "MV-10831": [
        rec("consultation", "General check-up", "2026-07-03", "No major concerns. Advised dietary changes.", "MediVault Clinic"),
        rec("diagnosis", "Mild iron deficiency", "2026-07-03", "Low ferritin levels noted.", "MediVault Clinic"),
        rec("prescription", "Iron supplement, once daily", "2026-07-03", "60-day course.", "MediVault Clinic"),
        rec("report", "Metabolic panel", "2026-07-02", "Values within normal range.", "MediVault Clinic"),
    ],
    "MV-09217": [
        rec("consultation", "Chest discomfort follow-up", "2026-08-22", "Follow-up after chest discomfort episode.", "Sunrise Heart Institute"),
        rec("diagnosis", "Stable angina", "2026-08-22", "No signs of acute coronary syndrome.", "Sunrise Heart Institute"),
        rec("prescription", "Atorvastatin 20mg, once daily", "2026-08-22", "Take at night.", "Sunrise Heart Institute"),
        rec("report", "ECG report", "2026-08-21", "Mild ST-segment changes noted.", "Sunrise Heart Institute"),
    ],
    "MV-11204": [
        rec("consultation", "Specialist referral review", "2026-08-30", "Referred for specialist cardiac review.", "MediVault Clinic"),
        rec("diagnosis", "Palpitations under evaluation", "2026-08-30", "Occasional episodes of irregular heartbeat.", "MediVault Clinic"),
        rec("prescription", "Metoprolol 25mg, twice daily", "2026-08-30", "Review after two weeks.", "MediVault Clinic"),
        rec("report", "Echocardiogram", "2026-08-29", "Normal heart structure and function.", "MediVault Clinic"),
    ],
    "MV-08943": [
        rec("consultation", "Lab results review", "2026-09-05", "Review of recent lab results.", "MediVault Clinic"),
        rec("diagnosis", "Type 2 diabetes, controlled", "2026-09-05", "Blood sugar within target range.", "MediVault Clinic"),
        rec("prescription", "Metformin 500mg, twice daily", "2026-09-05", "Take with meals.", "MediVault Clinic"),
        rec("report", "HbA1c report", "2026-09-04", "HbA1c 6.8%.", "MediVault Clinic"),
    ],
    "MV-11377": [
        rec("consultation", "Fatigue follow-up", "2026-09-14", "Follow-up for recurring fatigue.", "Lotus Multispeciality"),
        rec("diagnosis", "Mild anaemia", "2026-09-14", "Haemoglobin slightly below normal.", "Lotus Multispeciality"),
        rec("prescription", "Folic acid 5mg, once daily", "2026-09-14", "30-day course.", "Lotus Multispeciality"),
        rec("report", "Complete blood count", "2026-09-13", "Haemoglobin slightly low.", "Lotus Multispeciality"),
    ],
    "MV-07761": [
        rec("consultation", "Routine heart failure follow-up", "2026-09-18", "Condition stable. Continue current plan.", "MediVault Clinic"),
        rec("diagnosis", "Chronic heart failure, stable", "2026-09-18", "No change in symptoms since last visit.", "MediVault Clinic"),
        rec("prescription", "Furosemide 40mg, once daily", "2026-09-18", "Take in the morning.", "MediVault Clinic"),
        rec("report", "Chest X-ray", "2026-09-17", "No acute changes.", "MediVault Clinic"),
    ],
    // MV-11590 (new patient) intentionally has no records.
};

// ---------- Consultations ----------
// status: Completed | Saved
export const initialConsultations = [
    {
        id: "c-1",
        patientId: "MV-08943",
        visitType: "Lab Review",
        symptoms: "Review of recent blood sugar results.",
        diagnosis: "Type 2 diabetes, controlled",
        notes: "Continue current medication. Repeat HbA1c in 3 months.",
        date: "2026-10-01",
        status: "Completed",
    },
    {
        id: "c-2",
        patientId: "MV-07761",
        visitType: "Follow-up",
        symptoms: "Mild ankle swelling in the evenings.",
        diagnosis: "Chronic heart failure, stable",
        notes: "Reduce salt intake. Continue diuretic.",
        date: "2026-09-18",
        status: "Completed",
    },
    {
        id: "c-3",
        patientId: "MV-11204",
        visitType: "Specialist Review",
        symptoms: "Occasional palpitations.",
        diagnosis: "Palpitations under evaluation",
        notes: "Echocardiogram ordered. Start low-dose beta blocker.",
        date: "2026-08-30",
        status: "Completed",
    },
];

// ---------- Prescriptions ----------
export const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "As needed"];

export const initialPrescriptions = [
    {
        id: "p-1",
        patientId: "MV-08943",
        medication: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "30 days",
        instructions: "Take with meals.",
        date: "2026-10-01",
    },
    {
        id: "p-2",
        patientId: "MV-07761",
        medication: "Furosemide",
        dosage: "40mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take in the morning.",
        date: "2026-09-18",
    },
    {
        id: "p-3",
        patientId: "MV-11204",
        medication: "Metoprolol",
        dosage: "25mg",
        frequency: "Twice daily",
        duration: "14 days",
        instructions: "Review after two weeks.",
        date: "2026-08-30",
    },
];
