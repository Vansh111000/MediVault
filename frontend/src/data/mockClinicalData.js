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
        rec("consultation", "General check-up", "2026-07-03", "No major concerns. Advised dietary changes.", "HealthPlus Hospital"),
        rec("diagnosis", "Mild iron deficiency", "2026-07-03", "Low ferritin levels noted.", "HealthPlus Hospital"),
        rec("prescription", "Iron supplement, once daily", "2026-07-03", "60-day course.", "HealthPlus Hospital"),
        rec("report", "Metabolic panel", "2026-07-02", "Values within normal range.", "HealthPlus Hospital"),
    ],
    "MV-09217": [
        rec("consultation", "Chest discomfort follow-up", "2026-08-22", "Follow-up after chest discomfort episode.", "Sunrise Heart Institute"),
        rec("diagnosis", "Stable angina", "2026-08-22", "No signs of acute coronary syndrome.", "Sunrise Heart Institute"),
        rec("prescription", "Atorvastatin 20mg, once daily", "2026-08-22", "Take at night.", "Sunrise Heart Institute"),
        rec("report", "ECG report", "2026-08-21", "Mild ST-segment changes noted.", "Sunrise Heart Institute"),
    ],
    "MV-11204": [
        rec("consultation", "Specialist referral review", "2026-08-30", "Referred for specialist cardiac review.", "HealthPlus Hospital"),
        rec("diagnosis", "Palpitations under evaluation", "2026-08-30", "Occasional episodes of irregular heartbeat.", "HealthPlus Hospital"),
        rec("prescription", "Metoprolol 25mg, twice daily", "2026-08-30", "Review after two weeks.", "HealthPlus Hospital"),
        rec("report", "Echocardiogram", "2026-08-29", "Normal heart structure and function.", "HealthPlus Hospital"),
    ],
    "MV-08943": [
        rec("consultation", "Lab results review", "2026-09-05", "Review of recent lab results.", "HealthPlus Hospital"),
        rec("diagnosis", "Type 2 diabetes, controlled", "2026-09-05", "Blood sugar within target range.", "HealthPlus Hospital"),
        rec("prescription", "Metformin 500mg, twice daily", "2026-09-05", "Take with meals.", "HealthPlus Hospital"),
        rec("report", "HbA1c report", "2026-09-04", "HbA1c 6.8%.", "HealthPlus Hospital"),
    ],
    "MV-11377": [
        rec("consultation", "Fatigue follow-up", "2026-09-14", "Follow-up for recurring fatigue.", "Lotus Multispeciality"),
        rec("diagnosis", "Mild anaemia", "2026-09-14", "Haemoglobin slightly below normal.", "Lotus Multispeciality"),
        rec("prescription", "Folic acid 5mg, once daily", "2026-09-14", "30-day course.", "Lotus Multispeciality"),
        rec("report", "Complete blood count", "2026-09-13", "Haemoglobin slightly low.", "Lotus Multispeciality"),
    ],
    "MV-07761": [
        rec("consultation", "Routine heart failure follow-up", "2026-09-18", "Condition stable. Continue current plan.", "HealthPlus Hospital"),
        rec("diagnosis", "Chronic heart failure, stable", "2026-09-18", "No change in symptoms since last visit.", "HealthPlus Hospital"),
        rec("prescription", "Furosemide 40mg, once daily", "2026-09-18", "Take in the morning.", "HealthPlus Hospital"),
        rec("report", "Chest X-ray", "2026-09-17", "No acute changes.", "HealthPlus Hospital"),
    ],
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

// ---------- Allergy details ----------
// The patients array only has hasAllergy (true/false); this adds a display name.
export const allergyNotes = {
    "MV-10482": "Penicillin",
    "MV-07761": "Sulfa drugs",
};

// "Allergy: Penicillin" / "Allergy on record" / null (no allergy)
export function getAllergyLabel(patient) {
    if (!patient.hasAllergy) return null;
    const note = allergyNotes[patient.id];
    return note ? `Allergy: ${note}` : "Allergy on record";
}

// ---------- Body measurements ----------
export const bodyMeasurements = {
    "MV-10482": { heightCm: 178, weightKg: 82 },
    "MV-10831": { heightCm: 160, weightKg: 54 },
    "MV-09217": { heightCm: 170, weightKg: 76 },
    "MV-11204": { heightCm: 163, weightKg: 62 },
    "MV-08943": { heightCm: 175, weightKg: 80 },
    "MV-11377": { heightCm: 158, weightKg: 60 },
    "MV-11590": { heightCm: 172, weightKg: 74 },
    "MV-07761": { heightCm: 172, weightKg: 78 },
};

export function getBodyMeasurements(patient) {
    const m = bodyMeasurements[patient.id];
    return {
        height: m ? `${m.heightCm} cm` : "—",
        weight: m ? `${m.weightKg} kg` : "—",
    };
}

// ---------- New prescription medicine row ----------
let medicineSeq = 0;
export function createMedicine() {
    medicineSeq += 1;
    return {
        id: `med-${medicineSeq}`,
        name: "",
        dosage: "",
        frequency: FREQUENCIES[0],
        duration: "",
        instructions: "",
    };
}
