// Mock medical records for the patient workspace (Medical Records tab).
// Keyed by patient ID (same IDs as the `patients` array in mockDoctorData.js).
// A patient with no entry here has no previous records.
//
// Each patient has four lists. 
//   consultations[].diagnosis                -> previous diagnoses
//   prescriptions[] (status "Active")        -> current / recent medications
//   bloodReports[].results[] (flag set)      -> important blood values
//   otherReports[].summary                   -> imaging / ECG findings

// flag: "high" | "low" (omit when the value is inside the reference range)
const t = (test, result, unit, range, flag) => ({ test, result, unit, range, flag });

export const patientsRecords = {
    // ---------------- Aarav Mehta ----------------
    "MV-10482": {
        consultations: [
            {
                id: "MV-10482-c1",
                date: "2026-09-18",
                doctor: "Dr. Rohan Desai",
                hospital: "CityCare Hospital",
                visitType: "Follow-up",
                reason: "Routine hypertension follow-up",
                diagnosis: "Primary hypertension",
                treatment: "Continue current medication and monitor blood pressure at home. Review in 4 weeks.",
            },
            {
                id: "MV-10482-c2",
                date: "2026-08-12",
                doctor: "Dr. Rohan Desai",
                hospital: "CityCare Hospital",
                visitType: "Specialist Review",
                reason: "Routine cardiac review",
                diagnosis: "Primary hypertension",
                treatment: "Started Amlodipine. Advised reduced salt intake and regular walking.",
            },
            {
                id: "MV-10482-c3",
                date: "2026-06-02",
                doctor: "Dr. Anjali Rao",
                hospital: "CityCare Hospital",
                visitType: "New Consultation",
                reason: "Occasional headaches and high blood pressure readings",
                diagnosis: "Elevated blood pressure under evaluation",
                treatment: "Blood tests advised. Home blood pressure log to be maintained.",
            },
        ],
        prescriptions: [
            {
                id: "MV-10482-p1",
                date: "2026-09-18",
                doctor: "Dr. Rohan Desai",
                hospital: "CityCare Hospital",
                status: "Active",
                medications: [
                    { name: "Amlodipine", dosage: "5 mg", frequency: "Once daily", duration: "30 days", instructions: "Take after breakfast." },
                ],
            },
            {
                id: "MV-10482-p2",
                date: "2026-08-12",
                doctor: "Dr. Rohan Desai",
                hospital: "CityCare Hospital",
                status: "Completed",
                medications: [
                    { name: "Amlodipine", dosage: "2.5 mg", frequency: "Once daily", duration: "30 days", instructions: "Take after breakfast." },
                    { name: "Vitamin D3", dosage: "60,000 IU", frequency: "Once weekly", duration: "8 weeks", instructions: "Take after a meal." },
                ],
            },
        ],
        bloodReports: [
            {
                id: "MV-10482-b1",
                name: "Complete Blood Count (CBC)",
                date: "2026-09-18",
                lab: "CityCare Diagnostics",
                status: "Available",
                results: [
                    t("Hemoglobin", "13.8", "g/dL", "13.0–17.0"),
                    t("WBC", "7,200", "cells/µL", "4,000–11,000"),
                    t("Platelets", "245,000", "cells/µL", "150,000–450,000"),
                    t("RBC", "4.9", "million/µL", "4.5–5.9"),
                    t("Hematocrit", "42", "%", "40–52"),
                    t("MCV", "88", "fL", "80–100"),
                ],
            },
            {
                id: "MV-10482-b2",
                name: "Lipid Profile",
                date: "2026-09-18",
                lab: "CityCare Diagnostics",
                status: "Available",
                results: [
                    t("Total Cholesterol", "218", "mg/dL", "< 200", "high"),
                    t("LDL Cholesterol", "142", "mg/dL", "< 100", "high"),
                    t("HDL Cholesterol", "46", "mg/dL", "> 40"),
                    t("Triglycerides", "152", "mg/dL", "< 150", "high"),
                    t("Non-HDL Cholesterol", "172", "mg/dL", "< 130", "high"),
                ],
            },
        ],
        otherReports: [
            {
                id: "MV-10482-o1",
                name: "ECG Report",
                type: "ECG",
                date: "2026-09-12",
                center: "CityCare Hospital",
                description: "Resting 12-lead electrocardiogram.",
                summary: "Sinus rhythm noted in the submitted ECG report. No acute changes described.",
            },
        ],
    },

    // ---------------- Priya Shah ----------------
    "MV-10831": {
        consultations: [
            {
                id: "MV-10831-c1",
                date: "2026-07-03",
                doctor: "Dr. Neha Joshi",
                hospital: "MediVault Clinic",
                visitType: "New Consultation",
                reason: "Tiredness and low energy for the past month",
                diagnosis: "Mild iron deficiency",
                treatment: "Iron supplement started. Increase iron-rich foods. Repeat blood test in 8 weeks.",
            },
            {
                id: "MV-10831-c2",
                date: "2026-04-18",
                doctor: "Dr. Neha Joshi",
                hospital: "MediVault Clinic",
                visitType: "Follow-up",
                reason: "General health check-up",
                diagnosis: "No significant findings",
                treatment: "Routine advice on diet and exercise.",
            },
        ],
        prescriptions: [
            {
                id: "MV-10831-p1",
                date: "2026-07-03",
                doctor: "Dr. Neha Joshi",
                hospital: "MediVault Clinic",
                status: "Active",
                medications: [
                    { name: "Ferrous sulfate", dosage: "200 mg", frequency: "Once daily", duration: "60 days", instructions: "Take after a meal. May cause mild stomach upset." },
                ],
            },
        ],
        bloodReports: [
            {
                id: "MV-10831-b1",
                name: "Complete Blood Count (CBC)",
                date: "2026-07-02",
                lab: "MediVault Diagnostics",
                status: "Available",
                results: [
                    t("Hemoglobin", "11.2", "g/dL", "12.0–15.5", "low"),
                    t("WBC", "6,400", "cells/µL", "4,000–11,000"),
                    t("Platelets", "268,000", "cells/µL", "150,000–450,000"),
                    t("RBC", "4.0", "million/µL", "4.1–5.1", "low"),
                    t("Hematocrit", "34", "%", "36–46", "low"),
                    t("MCV", "78", "fL", "80–100", "low"),
                ],
            },
            {
                id: "MV-10831-b2",
                name: "Iron Studies",
                date: "2026-07-02",
                lab: "MediVault Diagnostics",
                status: "Available",
                results: [
                    t("Serum Iron", "42", "µg/dL", "60–170", "low"),
                    t("Ferritin", "9", "ng/mL", "12–150", "low"),
                    t("TIBC", "420", "µg/dL", "250–450"),
                    t("Transferrin Saturation", "10", "%", "20–50", "low"),
                ],
            },
        ],
        otherReports: [],
    },

    // ---------------- Rahul Verma ----------------
    "MV-09217": {
        consultations: [
            {
                id: "MV-09217-c1",
                date: "2026-08-22",
                doctor: "Dr. Vikram Patil",
                hospital: "Sunrise Heart Institute",
                visitType: "Follow-up",
                reason: "Follow-up after an episode of chest discomfort",
                diagnosis: "Stable angina",
                treatment: "Continue statin therapy. Avoid heavy exertion. Stress test advised if symptoms return.",
            },
            {
                id: "MV-09217-c2",
                date: "2026-06-10",
                doctor: "Dr. Vikram Patil",
                hospital: "Sunrise Heart Institute",
                visitType: "New Consultation",
                reason: "Chest discomfort while climbing stairs",
                diagnosis: "Chest pain under evaluation",
                treatment: "ECG and lipid profile ordered. Aspirin started.",
            },
        ],
        prescriptions: [
            {
                id: "MV-09217-p1",
                date: "2026-08-22",
                doctor: "Dr. Vikram Patil",
                hospital: "Sunrise Heart Institute",
                status: "Active",
                medications: [
                    { name: "Atorvastatin", dosage: "20 mg", frequency: "Once daily", duration: "90 days", instructions: "Take at night." },
                    { name: "Aspirin", dosage: "75 mg", frequency: "Once daily", duration: "90 days", instructions: "Take after lunch." },
                ],
            },
        ],
        bloodReports: [
            {
                id: "MV-09217-b1",
                name: "Lipid Profile",
                date: "2026-08-21",
                lab: "Sunrise Diagnostics",
                status: "Available",
                results: [
                    t("Total Cholesterol", "236", "mg/dL", "< 200", "high"),
                    t("LDL Cholesterol", "158", "mg/dL", "< 100", "high"),
                    t("HDL Cholesterol", "38", "mg/dL", "> 40", "low"),
                    t("Triglycerides", "190", "mg/dL", "< 150", "high"),
                    t("Non-HDL Cholesterol", "198", "mg/dL", "< 130", "high"),
                ],
            },
        ],
        otherReports: [
            {
                id: "MV-09217-o1",
                name: "ECG Report",
                type: "ECG",
                date: "2026-08-21",
                center: "Sunrise Heart Institute",
                description: "Resting 12-lead electrocardiogram.",
                summary: "Sinus rhythm with mild ST-segment changes noted in the submitted ECG report.",
            },
        ],
    },

    // ---------------- Meera Nair ----------------
    "MV-11204": {
        consultations: [
            {
                id: "MV-11204-c1",
                date: "2026-08-30",
                doctor: "Dr. Neha Joshi",
                hospital: "MediVault Clinic",
                visitType: "Specialist Review",
                reason: "Occasional episodes of irregular heartbeat",
                diagnosis: "Palpitations under evaluation",
                treatment: "Low-dose beta blocker started. Echocardiogram and thyroid tests ordered.",
            },
        ],
        prescriptions: [
            {
                id: "MV-11204-p1",
                date: "2026-08-30",
                doctor: "Dr. Neha Joshi",
                hospital: "MediVault Clinic",
                status: "Active",
                medications: [
                    { name: "Metoprolol", dosage: "25 mg", frequency: "Twice daily", duration: "14 days", instructions: "Review after two weeks." },
                ],
            },
        ],
        bloodReports: [
            {
                id: "MV-11204-b1",
                name: "Thyroid Profile",
                date: "2026-08-29",
                lab: "MediVault Diagnostics",
                status: "Available",
                results: [
                    t("TSH", "2.4", "µIU/mL", "0.4–4.0"),
                    t("Free T3", "3.1", "pg/mL", "2.3–4.2"),
                    t("Free T4", "1.2", "ng/dL", "0.8–1.8"),
                ],
            },
        ],
        otherReports: [
            {
                id: "MV-11204-o1",
                name: "Echocardiogram Report",
                type: "Echo",
                date: "2026-08-29",
                center: "MediVault Clinic",
                description: "Transthoracic echocardiogram.",
                summary: "Normal heart structure and function described in the submitted echocardiogram report.",
            },
        ],
    },

    // ---------------- David Chen ----------------
    "MV-08943": {
        consultations: [
            {
                id: "MV-08943-c1",
                date: "2026-09-05",
                doctor: "Dr. Neha Joshi",
                hospital: "MediVault Clinic",
                visitType: "Lab Review",
                reason: "Review of recent blood sugar results",
                diagnosis: "Type 2 diabetes, controlled",
                treatment: "Continue Metformin. Diet and exercise advice reinforced. Repeat HbA1c in 3 months.",
            },
            {
                id: "MV-08943-c2",
                date: "2026-06-12",
                doctor: "Dr. Neha Joshi",
                hospital: "MediVault Clinic",
                visitType: "Follow-up",
                reason: "Routine diabetes follow-up",
                diagnosis: "Type 2 diabetes",
                treatment: "Medication dose adjusted. Foot care advice given.",
            },
        ],
        prescriptions: [
            {
                id: "MV-08943-p1",
                date: "2026-09-05",
                doctor: "Dr. Neha Joshi",
                hospital: "MediVault Clinic",
                status: "Active",
                medications: [
                    { name: "Metformin", dosage: "500 mg", frequency: "Twice daily", duration: "90 days", instructions: "Take with meals." },
                ],
            },
        ],
        bloodReports: [
            {
                id: "MV-08943-b1",
                name: "HbA1c and Fasting Glucose",
                date: "2026-09-04",
                lab: "MediVault Diagnostics",
                status: "Available",
                results: [
                    t("HbA1c", "6.8", "%", "< 5.7 (non-diabetic)", "high"),
                    t("Fasting Glucose", "118", "mg/dL", "70–99", "high"),
                    t("Post-meal Glucose", "164", "mg/dL", "< 140", "high"),
                ],
            },
        ],
        otherReports: [],
    },

    // ---------------- Kavya Iyer ----------------
    "MV-11377": {
        consultations: [
            {
                id: "MV-11377-c1",
                date: "2026-09-14",
                doctor: "Dr. Sameer Kulkarni",
                hospital: "Lotus Multispeciality",
                visitType: "Follow-up",
                reason: "Follow-up for recurring fatigue",
                diagnosis: "Mild anaemia",
                treatment: "Folic acid started. Dietary advice given. Repeat blood count in 6 weeks.",
            },
        ],
        prescriptions: [
            {
                id: "MV-11377-p1",
                date: "2026-09-14",
                doctor: "Dr. Sameer Kulkarni",
                hospital: "Lotus Multispeciality",
                status: "Active",
                medications: [
                    { name: "Folic acid", dosage: "5 mg", frequency: "Once daily", duration: "30 days", instructions: "Take after breakfast." },
                ],
            },
        ],
        bloodReports: [
            {
                id: "MV-11377-b1",
                name: "Complete Blood Count (CBC)",
                date: "2026-09-13",
                lab: "Lotus Diagnostics",
                status: "Available",
                results: [
                    t("Hemoglobin", "10.9", "g/dL", "12.0–15.5", "low"),
                    t("WBC", "7,000", "cells/µL", "4,000–11,000"),
                    t("Platelets", "310,000", "cells/µL", "150,000–450,000"),
                    t("RBC", "3.9", "million/µL", "4.1–5.1", "low"),
                    t("Hematocrit", "33", "%", "36–46", "low"),
                    t("MCV", "84", "fL", "80–100"),
                ],
            },
        ],
        otherReports: [],
    },

    // ---------------- Sanjay Kulkarni ----------------
    "MV-07761": {
        consultations: [
            {
                id: "MV-07761-c1",
                date: "2026-09-18",
                doctor: "Dr. Neha Joshi",
                hospital: "MediVault Clinic",
                visitType: "Follow-up",
                reason: "Routine heart failure follow-up",
                diagnosis: "Chronic heart failure, stable",
                treatment: "Condition stable. Continue current medication. Limit salt and fluid intake.",
            },
            {
                id: "MV-07761-c2",
                date: "2026-06-20",
                doctor: "Dr. Neha Joshi",
                hospital: "MediVault Clinic",
                visitType: "Follow-up",
                reason: "Mild ankle swelling in the evenings",
                diagnosis: "Chronic heart failure",
                treatment: "Diuretic dose adjusted. Daily weight monitoring advised.",
            },
        ],
        prescriptions: [
            {
                id: "MV-07761-p1",
                date: "2026-09-18",
                doctor: "Dr. Neha Joshi",
                hospital: "MediVault Clinic",
                status: "Active",
                medications: [
                    { name: "Furosemide", dosage: "40 mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning." },
                    { name: "Ramipril", dosage: "2.5 mg", frequency: "Once daily", duration: "30 days", instructions: "Take at the same time each day." },
                ],
            },
        ],
        bloodReports: [
            {
                id: "MV-07761-b1",
                name: "Kidney Function Test",
                date: "2026-09-17",
                lab: "MediVault Diagnostics",
                status: "Available",
                results: [
                    t("Creatinine", "1.2", "mg/dL", "0.7–1.3"),
                    t("Urea", "46", "mg/dL", "15–45", "high"),
                    t("Sodium", "138", "mmol/L", "135–145"),
                    t("Potassium", "4.4", "mmol/L", "3.5–5.0"),
                ],
            },
        ],
        otherReports: [
            {
                id: "MV-07761-o1",
                name: "Chest X-Ray Report",
                type: "X-Ray",
                date: "2026-09-17",
                center: "MediVault Clinic Radiology",
                description: "Frontal chest radiograph.",
                summary: "No acute changes described in the submitted chest X-ray report.",
            },
        ],
    },

};
