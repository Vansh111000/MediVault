// MediVault mock data: the single source of truth for the Patient, Doctor and Receptionist portals.
//
// Layout of this file:
//   1. Helpers
//   2. Reference data: hospitals, doctors, assistants
//   3. Patient profiles (ONE record per patient; id === MediVault ID)
//   4. Clinical history per patient (patientsRecords), the canonical medical history
//   5. PATIENTS: profiles + values derived from the clinical history
//   6. Doctor portal: doctor profile, today's appointments, joined patient list, drafts
//   7. Doctor-authored consultations / prescriptions, allergy and body helpers
//   8. Visits and live feed
//   9. Patient-portal records, consent requests, audit trail, OCR samples
//
// Doctor Portal data was used as the primary reference for patient identity.

// ================= 1. Helpers =================

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

export const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "As needed"];

// New prescription medicine row
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

// ================= 2. Reference data =================

export const HOSPITALS = [
  { id: "HOSP-001", name: "CityCare Hospital", location: "Downtown Medical District" },
  { id: "HOSP-002", name: "St. Jude Medical Center", location: "Westside Health Campus" },
  { id: "HOSP-003", name: "Apollo Health Gateway", location: "Greenwood Suburb" },
  { id: "HOSP-004", name: "Echo & ECG Telemetry Institute", location: "Tech Innovation Park" },
  { id: "HOSP-005", name: "Metro General Hospital", location: "Central City Plaza" },
  { id: "HOSP-006", name: "All India Medical Institute (AIMI)", location: "Medical Enclave" },
  { id: "HOSP-007", name: "Fortis Memorial Research Hospital", location: "Sector 44 Health Block" },
  { id: "HOSP-008", name: "Max Super Specialty Hospital", location: "East Wing Avenue" },
  { id: "HOSP-009", name: "Manipal Healthcare Institute", location: "Airport Road Complex" },
  { id: "HOSP-010", name: "Narayana Health Heart & Multispecialty", location: "Health City Zone" },
  { id: "HOSP-011", name: "Lilavati Medical Center & Research", location: "Bandra Sea Face" },
  { id: "HOSP-012", name: "Medanta The Medicity", location: "Medanta Boulevard" },
  { id: "HOSP-013", name: "Kokilaben Dhirubhai Ambani Hospital", location: "Four Bungalows" },
  { id: "HOSP-014", name: "Sir Ganga Ram Hospital", location: "Rajinder Nagar" },
  { id: "HOSP-015", name: "Ruby Hall Clinic & Diagnostics", location: "Sassoon Road" },
  { id: "HOSP-016", name: "HealthPlus Hospital", location: "Central Wing" },
  { id: "HOSP-017", name: "Sunrise Heart Institute", location: "Heart Care Campus" },
  { id: "HOSP-018", name: "Lotus Multispeciality", location: "Lotus Lane" }
];

export const DOCTORS = [
  {
    id: "DOC-001",
    name: "Dr. Sarah Sharma, MD",
    specialty: "Cardiology & Attending Physician",
    hospitalId: "HOSP-016",
    hospitalName: "HealthPlus Hospital",
    licenseNumber: "MCI-2014-99182",
    experience: "14 Years",
    rating: 4.95,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    email: "dr.sarah.sharma@healthplus.org",
    activePatients: 8
  },
  {
    id: "DOC-002",
    name: "Dr. Arvind Patel, MD",
    specialty: "Endocrinology & Diabetology",
    hospitalId: "HOSP-002",
    hospitalName: "St. Jude Medical Center",
    licenseNumber: "MCI-2012-88312",
    experience: "18 Years",
    rating: 4.9,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    email: "arvind.patel@stjudemed.org",
    activePatients: 5
  },
  {
    id: "DOC-003",
    name: "Dr. Rachel Zhang, MD",
    specialty: "Pulmonology & Critical Care",
    hospitalId: "HOSP-002",
    hospitalName: "St. Jude Medical Center",
    licenseNumber: "MCI-2016-77401",
    experience: "11 Years",
    rating: 4.88,
    avatar: "https://images.unsplash.com/photo-1594824813581-229d48b70f06?auto=format&fit=crop&q=80&w=200",
    email: "rachel.zhang@stjudemed.org",
    activePatients: 4
  }
];

// Doctors who authored historical records. Kept separate from DOCTORS so the receptionist's
// doctor list (check-in / assignment) does not change.
export const EXTERNAL_DOCTORS = [
  { id: "DOC-EXT-001", name: "Dr. Rohan Desai", specialty: "Cardiology", hospitalId: "HOSP-001", hospitalName: "CityCare Hospital" },
  { id: "DOC-EXT-002", name: "Dr. Anjali Rao", specialty: "General Medicine", hospitalId: "HOSP-001", hospitalName: "CityCare Hospital" },
  { id: "DOC-PATH-01", name: "Dr. Nathan Cole, MD", specialty: "Pathology", hospitalId: "HOSP-001", hospitalName: "CityCare Hospital" },
  { id: "DOC-EXT-003", name: "Dr. Neha Joshi", specialty: "Internal Medicine", hospitalId: "HOSP-016", hospitalName: "HealthPlus Hospital" },
  { id: "DOC-EXT-004", name: "Dr. Vikram Patil", specialty: "Cardiology", hospitalId: "HOSP-017", hospitalName: "Sunrise Heart Institute" },
  { id: "DOC-EXT-005", name: "Dr. Sameer Kulkarni", specialty: "General Medicine", hospitalId: "HOSP-018", hospitalName: "Lotus Multispeciality" }
];

// Full directory used to link every record to a doctor ID.
export const ALL_DOCTORS = [...DOCTORS, ...EXTERNAL_DOCTORS];

const DOCTOR_IDS_BY_NAME = Object.fromEntries(ALL_DOCTORS.map((d) => [d.name.replace(", MD", ""), d.id]));
const HOSPITAL_IDS_BY_NAME = Object.fromEntries(HOSPITALS.map((h) => [h.name, h.id]));

export const ASSISTANTS = [
  {
    id: "AST-001",
    name: "Elena Cruz",
    role: "Senior Frontdesk & Triage Coordinator",
    hospitalId: "HOSP-016",
    hospitalName: "HealthPlus Hospital",
    email: "elena.cruz@healthplus.org"
  }
];

// ================= 3. Patient profiles =================
// Placeholder profile details (ABHA, phone, email, address, emergency contact, vitals) for
// Kavya Iyer, Imran Qureshi and Sanjay Kulkarni were added so every portal has a complete record.

const PATIENT_PROFILES = [
  {
    id: "MV-10482",
    abhaId: "91-8429-1924-8192",
    mediVaultId: "MV-10482",
    name: "Aarav Mehta",
    age: 34,
    gender: "Male",
    bloodGroup: "O+",
    dob: "1992-04-18",
    phone: "+91 98450-39182",
    email: "aarav.mehta@example.com",
    address: "Flat 402, Green Glen Towers, Outer Ring Road",
    allergies: [
      {
        allergen: "Penicillin",
        severity: "Mild (Rash / Hives)",
        identified: "2021-03"
      }
    ],
    chronicConditions: [
      {
        condition: "Essential Hypertension (Stage 1)",
        diagnosedDate: "2023-08-12",
        status: "Managed with Amlodipine 5mg"
      },
      {
        condition: "Mild Elevated LDL",
        diagnosedDate: "2024-08-12",
        status: "Dietary Modification"
      }
    ],
    vitals: {
      bp: "136/84 mmHg",
      heartRate: "72 bpm",
      spO2: "99%",
      weight: "82 kg",
      height: "178 cm",
      bmi: "25.9",
      bloodGlucose: "92 mg/dL"
    },
    emergencyContact: {
      name: "Ananya Mehta",
      relation: "Spouse",
      phone: "+91 98450-39182"
    },
    registeredAt: "HOSP-001",
    homeHospital: "CityCare Hospital"
  },
  {
    id: "MV-10821",
    abhaId: "91-4432-8812-9011",
    mediVaultId: "MV-10821",
    name: "Sarah Jenkins",
    age: 29,
    gender: "Female",
    bloodGroup: "A+",
    dob: "1997-05-14",
    phone: "+1 (555) 901-2345",
    email: "sarah.jenkins@example.com",
    address: "742 Evergreen Terrace, West District",
    allergies: [
      {
        allergen: "Penicillin",
        severity: "Severe (Anaphylaxis)",
        identified: "2019-04"
      }
    ],
    chronicConditions: [
      {
        condition: "Mild Asthma",
        diagnosedDate: "2022-01-15",
        status: "Inhaler PRN"
      }
    ],
    vitals: {
      bp: "118/76 mmHg",
      heartRate: "68 bpm",
      spO2: "98%",
      weight: "62 kg",
      height: "168 cm",
      bmi: "22.0",
      bloodGlucose: "90 mg/dL"
    },
    emergencyContact: {
      name: "Mark Jenkins",
      relation: "Brother",
      phone: "+1 (555) 901-8899"
    },
    registeredAt: "HOSP-001",
    homeHospital: "CityCare Hospital",
    lastConsult: "3d ago",
    currentMed: "Amoxicillin 500mg"
  },
  {
    id: "MV-10831",
    abhaId: "91-8832-1192-3344",
    mediVaultId: "MV-10831",
    name: "Priya Shah",
    age: 28,
    gender: "Female",
    bloodGroup: "B+",
    dob: "1998-02-10",
    phone: "+91 98330-11223",
    email: "priya.shah@example.com",
    address: "14 Lotus Blvd",
    allergies: [],
    chronicConditions: [
      {
        condition: "Mild Iron Deficiency",
        diagnosedDate: "2026-07-03",
        status: "Iron supplement"
      },
      {
        condition: "Hypothyroidism",
        diagnosedDate: "2023-05-20",
        status: "Levothyroxine 25mcg"
      }
    ],
    vitals: {
      bp: "120/78 mmHg",
      heartRate: "70 bpm",
      spO2: "99%",
      weight: "54 kg",
      height: "160 cm",
      bmi: "21.1",
      bloodGlucose: "88 mg/dL"
    },
    emergencyContact: {
      name: "Rohan Shah",
      relation: "Spouse",
      phone: "+91 98330-11220"
    },
    registeredAt: "HOSP-016",
    homeHospital: "HealthPlus Hospital"
  },
  {
    id: "MV-09217",
    abhaId: "91-5511-9988-1200",
    mediVaultId: "MV-09217",
    name: "Rahul Verma",
    age: 52,
    gender: "Male",
    bloodGroup: "AB+",
    dob: "1974-08-15",
    phone: "+91 97722-44119",
    email: "rahul.v@example.com",
    address: "88 Horizon Tower",
    allergies: [],
    chronicConditions: [
      {
        condition: "Stable Angina",
        diagnosedDate: "2026-08-22",
        status: "Atorvastatin 20mg, Aspirin 75mg"
      }
    ],
    vitals: {
      bp: "128/82 mmHg",
      heartRate: "76 bpm",
      spO2: "98%",
      weight: "76 kg",
      height: "170 cm",
      bmi: "26.3",
      bloodGlucose: "132 mg/dL"
    },
    emergencyContact: {
      name: "Kavita Verma",
      relation: "Spouse",
      phone: "+91 97722-44110"
    },
    registeredAt: "HOSP-017",
    homeHospital: "Sunrise Heart Institute"
  },
  {
    id: "MV-11204",
    abhaId: "91-2299-4411-7788",
    mediVaultId: "MV-11204",
    name: "Meera Nair",
    age: 41,
    gender: "Female",
    bloodGroup: "A+",
    dob: "1985-09-23",
    phone: "+91 96633-88991",
    email: "meera.nair@example.com",
    address: "33 Pine Street",
    allergies: [],
    chronicConditions: [
      {
        condition: "Ventricular Premature Beats",
        diagnosedDate: "2025-03-14",
        status: "Sensor Bridge Telemetry"
      }
    ],
    vitals: {
      bp: "122/80 mmHg",
      heartRate: "82 bpm",
      spO2: "98%",
      weight: "62 kg",
      height: "163 cm",
      bmi: "23.3",
      bloodGlucose: "94 mg/dL"
    },
    emergencyContact: {
      name: "Suresh Nair",
      relation: "Spouse",
      phone: "+91 96633-88990"
    },
    registeredAt: "HOSP-016",
    homeHospital: "HealthPlus Hospital"
  },
  {
    id: "MV-08943",
    abhaId: "91-3311-6655-0012",
    mediVaultId: "MV-08943",
    name: "David Chen",
    age: 60,
    gender: "Male",
    bloodGroup: "O-",
    dob: "1966-07-04",
    phone: "+1 (555) 777-1122",
    email: "david.chen@example.com",
    address: "12 Harbor View Road",
    allergies: [],
    chronicConditions: [
      {
        condition: "Type 2 Diabetes Mellitus (controlled)",
        diagnosedDate: "2026-09-05",
        status: "Metformin 500mg"
      },
      {
        condition: "Post-CABG Routine Surveillance",
        diagnosedDate: "2021-09-01",
        status: "Stable"
      }
    ],
    vitals: {
      bp: "116/74 mmHg",
      heartRate: "66 bpm",
      spO2: "99%",
      weight: "80 kg",
      height: "175 cm",
      bmi: "26.1",
      bloodGlucose: "91 mg/dL"
    },
    emergencyContact: {
      name: "Linda Chen",
      relation: "Spouse",
      phone: "+1 (555) 777-1120"
    },
    registeredAt: "HOSP-016",
    homeHospital: "HealthPlus Hospital"
  },
  {
    id: "MV-11377",
    abhaId: "91-7744-2031-5566",
    mediVaultId: "MV-11377",
    name: "Kavya Iyer",
    age: 46,
    gender: "Female",
    bloodGroup: "A-",
    dob: "1980-03-12",
    phone: "+91 98200-45521",
    email: "kavya.iyer@example.com",
    address: "21 Jasmine Court, Lotus Lane",
    allergies: [],
    chronicConditions: [
      {
        condition: "Mild Anaemia",
        diagnosedDate: "2026-09-14",
        status: "Folic acid 5 mg"
      }
    ],
    vitals: {
      bp: "118/76 mmHg",
      heartRate: "74 bpm",
      spO2: "98%",
      weight: "60 kg",
      height: "158 cm",
      bmi: "24.0",
      bloodGlucose: "90 mg/dL"
    },
    emergencyContact: {
      name: "Ramesh Iyer",
      relation: "Spouse",
      phone: "+91 98200-45520"
    },
    registeredAt: "HOSP-018",
    homeHospital: "Lotus Multispeciality"
  },
  {
    id: "MV-11590",
    abhaId: "91-6623-7781-3409",
    mediVaultId: "MV-11590",
    name: "Imran Qureshi",
    age: 39,
    gender: "Male",
    bloodGroup: "B-",
    dob: "1987-06-30",
    phone: "+91 98765-12034",
    email: "imran.qureshi@example.com",
    address: "7 Crescent Heights, Marine Drive",
    allergies: [],
    chronicConditions: [],
    vitals: {
      bp: "122/78 mmHg",
      heartRate: "76 bpm",
      spO2: "99%",
      weight: "74 kg",
      height: "172 cm",
      bmi: "25.0",
      bloodGlucose: "93 mg/dL"
    },
    emergencyContact: {
      name: "Zoya Qureshi",
      relation: "Spouse",
      phone: "+91 98765-12030"
    },
    registeredAt: "HOSP-016",
    homeHospital: "HealthPlus Hospital"
  },
  {
    id: "MV-07761",
    abhaId: "91-5120-8844-7301",
    mediVaultId: "MV-07761",
    name: "Sanjay Kulkarni",
    age: 67,
    gender: "Male",
    bloodGroup: "O+",
    dob: "1959-01-20",
    phone: "+91 98230-77614",
    email: "sanjay.kulkarni@example.com",
    address: "45 Shivaji Nagar Society",
    allergies: [
      {
        allergen: "Sulfa drugs",
        severity: "Not specified",
        identified: "Not specified"
      }
    ],
    chronicConditions: [
      {
        condition: "Chronic Heart Failure (stable)",
        diagnosedDate: "2026-09-18",
        status: "Furosemide 40 mg, Ramipril 2.5 mg"
      }
    ],
    vitals: {
      bp: "130/80 mmHg",
      heartRate: "70 bpm",
      spO2: "96%",
      weight: "78 kg",
      height: "172 cm",
      bmi: "26.4",
      bloodGlucose: "104 mg/dL"
    },
    emergencyContact: {
      name: "Meena Kulkarni",
      relation: "Spouse",
      phone: "+91 98230-77610"
    },
    registeredAt: "HOSP-016",
    homeHospital: "HealthPlus Hospital"
  }
];

// ================= 4. Clinical history (canonical) =================
// Keyed by patient ID. A patient with no entry has no previous records.
//   consultations[].diagnosis          -> previous diagnoses
//   prescriptions[] (status "Active")  -> current / recent medications
//   bloodReports[].results[] (flag)    -> important blood values
//   otherReports[].summary             -> imaging / ECG findings

// flag: "high" | "low"
const t = (test, result, unit, range, flag) => ({ test, result, unit, range, flag });

const RAW_PATIENT_RECORDS = {
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
            {
                id: "MV-10482-b0",
                name: "Blood Chemistry Panel",
                date: "2025-11-20",
                lab: "CityCare Hospital",
                status: "Available",
                results: [
                    t("Total Cholesterol", "218", "mg/dL", "< 200", "high"),
                    t("LDL Cholesterol", "138", "mg/dL", "< 100", "high"),
                    t("HDL Cholesterol", "44", "mg/dL", "> 40"),
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
                hospital: "HealthPlus Hospital",
                visitType: "New Consultation",
                reason: "Tiredness and low energy for the past month",
                diagnosis: "Mild iron deficiency",
                treatment: "Iron supplement started. Increase iron-rich foods. Repeat blood test in 8 weeks.",
            },
            {
                id: "MV-10831-c2",
                date: "2026-04-18",
                doctor: "Dr. Neha Joshi",
                hospital: "HealthPlus Hospital",
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
                hospital: "HealthPlus Hospital",
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
                lab: "HealthPlus Diagnostics",
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
                lab: "HealthPlus Diagnostics",
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
                doctor: "Dr. Sarah Sharma",
                hospital: "HealthPlus Hospital",
                visitType: "Specialist Review",
                reason: "Occasional palpitations and episodes of irregular heartbeat",
                diagnosis: "Palpitations under evaluation",
                treatment: "Echocardiogram ordered. Start low-dose beta blocker. Thyroid tests ordered.",
            },
        ],
        prescriptions: [
            {
                id: "MV-11204-p1",
                date: "2026-08-30",
                doctor: "Dr. Sarah Sharma",
                hospital: "HealthPlus Hospital",
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
                lab: "HealthPlus Diagnostics",
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
                center: "HealthPlus Hospital",
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
                hospital: "HealthPlus Hospital",
                visitType: "Lab Review",
                reason: "Review of recent blood sugar results",
                diagnosis: "Type 2 diabetes, controlled",
                treatment: "Continue Metformin. Diet and exercise advice reinforced. Repeat HbA1c in 3 months.",
            },
            {
                id: "MV-08943-c2",
                date: "2026-06-12",
                doctor: "Dr. Neha Joshi",
                hospital: "HealthPlus Hospital",
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
                hospital: "HealthPlus Hospital",
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
                lab: "HealthPlus Diagnostics",
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
                doctor: "Dr. Sarah Sharma",
                hospital: "HealthPlus Hospital",
                visitType: "Follow-up",
                reason: "Routine heart failure follow-up. Mild ankle swelling in the evenings.",
                diagnosis: "Chronic heart failure, stable",
                treatment: "Condition stable. Reduce salt and fluid intake. Continue diuretic and current medication.",
            },
            {
                id: "MV-07761-c2",
                date: "2026-06-20",
                doctor: "Dr. Neha Joshi",
                hospital: "HealthPlus Hospital",
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
                doctor: "Dr. Sarah Sharma",
                hospital: "HealthPlus Hospital",
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
                lab: "HealthPlus Diagnostics",
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
                center: "HealthPlus Hospital Radiology",
                description: "Frontal chest radiograph.",
                summary: "No acute changes described in the submitted chest X-ray report.",
            },
        ],
    },

};

// Adds doctorId and hospitalId (linked to the directories above) to each history entry.
const withIds = (list) =>
    list.map((x) => ({
        ...x,
        doctorId: DOCTOR_IDS_BY_NAME[x.doctor],
        hospitalId: HOSPITAL_IDS_BY_NAME[x.hospital],
    }));

export const patientsRecords = Object.fromEntries(
    Object.entries(RAW_PATIENT_RECORDS).map(([id, r]) => [
        id,
        { ...r, consultations: withIds(r.consultations), prescriptions: withIds(r.prescriptions) },
    ]),
);

// ================= 5. PATIENTS (profile + derived values) =================

// Doctor-authored notes. The current visit is kept here; earlier visits by this doctor are
// derived from patientsRecords so the same visit is never stored twice.
const CURRENT_VISIT_CONSULTATIONS = [
    {
        id: "c-1",
        patientId: "MV-08943",
        doctorId: "DOC-001",
        visitType: "Lab Review",
        symptoms: "Review of recent blood sugar results.",
        diagnosis: "Type 2 diabetes, controlled",
        notes: "Continue current medication. Repeat HbA1c in 3 months.",
        date: "2026-10-01",
        status: "Completed",
    },
];

const CURRENT_VISIT_PRESCRIPTIONS = [
    {
        id: "p-1",
        patientId: "MV-08943",
        doctorId: "DOC-001",
        medication: "Metformin",
        dosage: "500 mg",
        frequency: "Twice daily",
        duration: "30 days",
        instructions: "Take with meals.",
        date: "2026-10-01",
    },
];

const byNewest = (a, b) => b.date.localeCompare(a.date);

// status: Completed | Saved
export const initialConsultations = [
    ...CURRENT_VISIT_CONSULTATIONS,
    ...Object.entries(patientsRecords).flatMap(([patientId, r]) =>
        r.consultations
            .filter((c) => c.doctorId === "DOC-001")
            .map((c) => ({
                id: c.id,
                patientId,
                doctorId: c.doctorId,
                visitType: c.visitType,
                symptoms: c.reason,
                diagnosis: c.diagnosis,
                notes: c.treatment,
                date: c.date,
                status: "Completed",
            })),
    ),
].sort(byNewest);

export const initialPrescriptions = [
    ...CURRENT_VISIT_PRESCRIPTIONS,
    ...Object.entries(patientsRecords).flatMap(([patientId, r]) =>
        r.prescriptions
            .filter((p) => p.doctorId === "DOC-001")
            .flatMap((p) =>
                p.medications.map((m, i) => ({
                    id: `${p.id}-m${i + 1}`,
                    patientId,
                    doctorId: p.doctorId,
                    medication: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration,
                    instructions: m.instructions,
                    date: p.date,
                })),
            ),
    ),
].sort(byNewest);

function latestDate(patientId) {
    const dates = [
        ...(patientsRecords[patientId]?.consultations || []).map((c) => c.date),
        ...initialConsultations.filter((c) => c.patientId === patientId).map((c) => c.date),
    ].sort();
    return dates.length ? dates[dates.length - 1] : null;
}

function activeMedication(patientId) {
    const meds = (patientsRecords[patientId]?.prescriptions || [])
        .filter((p) => p.status === "Active")
        .flatMap((p) => p.medications.map((m) => `${m.name} ${m.dosage}`));
    return meds.length ? meds.join(", ") : null;
}

export const PATIENTS = PATIENT_PROFILES.map((p) => ({
    ...p,
    lastConsult: latestDate(p.id) ? formatDate(latestDate(p.id)) : p.lastConsult || "No previous visits",
    currentMed: activeMedication(p.id) || p.currentMed || "None",
}));

// ================= 6. Doctor portal =================

const DOCTOR_ID = "DOC-001";
const DOCTOR_RECORD = DOCTORS.find((d) => d.id === DOCTOR_ID);

export const doctor = {
    name: DOCTOR_RECORD.name.replace(", MD", ""),
    shortName: "Dr. Sharma",
    specialty: "Cardiology",
    role: "Attending Physician",
    onDuty: true,
    hospital: DOCTOR_RECORD.hospitalName,
    wing: "Central Wing",
    room: "OPD Suite 4B",
    shift: "08:30 AM – 02:00 PM",
};

// Today's appointments for the doctor. status: waiting | checked-in | in-room | upcoming | completed
const DOCTOR_VISITS = [
    {
        patientId: "MV-10482",
        time: "09:30 AM",
        location: "In Suite Lobby",
        visitType: "Follow-up",
        consent: {
            type: "cross-hospital",
            hospital: "CityCare Hospital",
            label: "Previous records available",
            note: "Authorized for this visit",
        },
        status: "waiting",
    },
    {
        patientId: "MV-10831",
        time: "10:15 AM",
        location: "Slot 2",
        visitType: "New Consultation",
        consent: {
            type: "own-hospital",
            label: "Patient records available",
            note: "Records from this hospital",
        },
        status: "checked-in",
    },
    {
        patientId: "MV-09217",
        time: "11:00 AM",
        location: "Pre-test Queue",
        visitType: "Follow-up",
        consent: {
            type: "cross-hospital",
            hospital: "Sunrise Heart Institute",
            label: "Previous records available",
            note: "Authorized for this visit",
        },
        status: "upcoming",
    },
    {
        patientId: "MV-11204",
        time: "11:45 AM",
        location: "Cardio Lab 2",
        visitType: "Specialist Review",
        consent: {
            type: "own-hospital",
            label: "Patient records available",
            note: "Records from this hospital",
        },
        status: "in-room",
    },
    {
        patientId: "MV-08943",
        time: "08:45 AM",
        location: "Concluded",
        visitType: "Lab Review",
        consent: {
            type: "revoked",
            label: "Visit completed",
            note: "Record access ended",
        },
        status: "completed",
    },
    {
        patientId: "MV-11377",
        time: "12:15 PM",
        location: "Reception Desk 1",
        visitType: "Follow-up",
        consent: {
            type: "cross-hospital",
            hospital: "Lotus Multispeciality",
            label: "Previous records available",
            note: "Authorized for this visit",
        },
        status: "waiting",
    },
    {
        patientId: "MV-11590",
        time: "12:45 PM",
        location: "Not arrived",
        visitType: "New Consultation",
        consent: {
            type: "none",
            label: "No previous records",
            note: "New patient",
        },
        status: "upcoming",
    },
    {
        patientId: "MV-07761",
        time: "01:15 PM",
        location: "Slot 6",
        visitType: "Follow-up",
        consent: {
            type: "own-hospital",
            label: "Patient records available",
            note: "Records from this hospital",
        },
        status: "waiting",
    },
];

// Doctor-facing patient list: each appointment joined with the patient's profile.
export const patients = DOCTOR_VISITS.map((visit) => {
    const profile = PATIENTS.find((p) => p.id === visit.patientId);
    return { ...profile, ...visit, hasAllergy: profile.allergies.length > 0 };
});

// Drafts the doctor still has to finalize.
export const pendingDrafts = [
    { id: "d1", patientId: "MV-08943", type: "Consultation note" },
    { id: "d2", patientId: "MV-08943", type: "Prescription" },
];

// ================= 7. Allergy and body helpers =================

// "Allergy: Penicillin" / "Allergy on record" / null (no allergy)
export function getAllergyLabel(patient) {
    if (!patient.allergies || patient.allergies.length === 0) return null;
    return `Allergy: ${patient.allergies.map((a) => a.allergen).join(", ")}`;
}

export function getBodyMeasurements(patient) {
    return {
        height: patient.vitals?.height || "—",
        weight: patient.vitals?.weight || "—",
    };
}

// Flat, read-only history list (type: consultation | diagnosis | prescription | report),
// derived from patientsRecords so it can never disagree with it.
const flagText = (r) => `${r.flag === "high" ? "High" : "Low"}: ${r.test} ${r.result} ${r.unit}`;

function buildFlatRecords(r) {
    const rec = (type, title, date, description, source) => ({ type, title, date, description, source });
    const list = [];
    r.consultations.forEach((c) => {
        list.push(rec("consultation", c.reason, c.date, c.treatment, c.hospital));
        list.push(rec("diagnosis", c.diagnosis, c.date, `Recorded at a ${c.visitType.toLowerCase()} visit.`, c.hospital));
    });
    r.prescriptions.forEach((p) =>
        p.medications.forEach((m) =>
            list.push(
                rec("prescription", `${m.name} ${m.dosage}, ${m.frequency.toLowerCase()}`, p.date, `${m.duration} course. ${m.instructions}`, p.hospital),
            ),
        ),
    );
    r.bloodReports.forEach((b) => {
        const flagged = b.results.filter((x) => x.flag).map(flagText);
        list.push(rec("report", b.name, b.date, flagged.length ? flagged.join("; ") + "." : "Values within normal range.", b.lab));
    });
    r.otherReports.forEach((o) => list.push(rec("report", o.name, o.date, o.summary, o.center)));
    return list.sort((a, b) => b.date.localeCompare(a.date));
}

export const medicalRecords = Object.fromEntries(
    Object.entries(patientsRecords).map(([id, r]) => [id, buildFlatRecords(r)]),
);

// ================= 8. Visits and live feed =================

const VISIT_STATUS = {
    waiting: { label: "Waiting", color: "amber", action: "Open Vault", actionType: "primary" },
    "checked-in": { label: "Checked In", color: "emerald", action: "View", actionType: "secondary" },
    "in-room": { label: "In Exam", color: "purple", action: "View", actionType: "secondary" },
    upcoming: { label: "Upcoming", color: "blue", action: "View", actionType: "secondary" },
    completed: { label: "Completed", color: "slate", action: "Summary", actionType: "secondary" },
};

// Visit queue (used by the context as activeVisits), built from the same appointments and patients.
export const TODAY_DOCTOR_QUEUE = DOCTOR_VISITS.map((visit, i) => {
    const p = PATIENTS.find((x) => x.id === visit.patientId);
    const s = VISIT_STATUS[visit.status];
    return {
        id: `VISIT-${String(i + 1).padStart(3, "0")}`,
        patientId: p.id,
        patientName: p.name,
        age: p.age,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        patientIdCode: p.mediVaultId,
        hospitalId: DOCTOR_RECORD.hospitalId,
        hospitalName: DOCTOR_RECORD.hospitalName,
        assignedDoctorId: DOCTOR_RECORD.id,
        assignedDoctorName: DOCTOR_RECORD.name,
        specialty: DOCTOR_RECORD.specialty,
        appointmentTime: visit.time,
        appointmentLocation: visit.location,
        visitType: visit.visitType,
        consentStatus: visit.consent.hospital || visit.consent.label,
        consentExpiry: visit.consent.note,
        status: s.label,
        statusColor: s.color,
        actionLabel: s.action,
        actionType: s.actionType,
    };
});

export const ACTIVE_VISITS = TODAY_DOCTOR_QUEUE;

export const OPD_LIVE_FEED = [
  {
    id: "FEED-1",
    title: "New patient assigned",
    description: "Meera Nair routed from OPD Desk 2 with telemetry slip attached.",
    time: "5m ago",
    type: "assignment"
  },
  {
    id: "FEED-2",
    title: "Patient ready in waiting",
    description: "Aarav Mehta has checked in and seated in OPD Suite 4B lobby.",
    time: "12m ago",
    type: "ready"
  },
  {
    id: "FEED-3",
    title: "Blood report extracted",
    description: "Automated entity extraction completed for Priya Shah (Iron Studies).",
    time: "24m ago",
    type: "ocr"
  },
  {
    id: "FEED-4",
    title: "Consent Lease Expiring",
    description: "Cross-hospital access for Rahul Verma (Sunrise Heart Institute) auto-revokes in 3 hours.",
    time: "1h ago",
    type: "consent"
  }
];

// ================= 9. Patient-portal records, consent, audit, OCR =================

// Hand-authored records with patient-friendly explanations.
const HAND_AUTHORED_RECORDS = [
  {
    id: "REC-2026-001",
    patientId: "MV-10482",
    hospitalId: "HOSP-001",
    hospitalName: "CityCare Hospital",
    doctorName: "Dr. Rohan Desai",
    doctorId: "DOC-EXT-001",
    specialty: "Cardiology",
    recordType: "Consultation & Prescription",
    category: "Doctor Visit",
    date: "2026-08-12",
    title: "Doctor Visit & Prescription",
    summary: "• Routine blood pressure checkup and cardiovascular health review.\n• Started Amlodipine 2.5mg once daily and Vitamin D3 60,000 IU once weekly.\n• Recommended low-sodium diet and twice-weekly home blood pressure logging.\n• Scheduled follow-up consultation in 30 days.",
    plainLanguageExplanation: "The doctor checked your blood pressure and heart health. Your blood pressure is fairly well-managed on Amlodipine, which was started at a low dose. Your kidney function test looks completely healthy. Continue taking your daily medicine and moderate salt in your diet.",
    diagnoses: [
      { code: "I10", name: "Primary Hypertension", status: "Active" },
      { code: "E78.0", name: "Borderline Dyslipidemia", status: "Managed" }
    ],
    medications: [
      { drug: "Amlodipine", dosage: "2.5 mg", frequency: "Once daily", duration: "30 Days", instructions: "Take after breakfast. Maintain steady timing." },
      { drug: "Vitamin D3", dosage: "60,000 IU", frequency: "Once weekly", duration: "8 weeks", instructions: "Take after a meal." }
    ],
    testsOrdered: ["Lipid Profile (Fasting)", "Serum Creatinine"],
    isImmutable: true
  },
  {
    id: "REC-2025-089",
    patientId: "MV-10482",
    hospitalId: "HOSP-001",
    hospitalName: "CityCare Hospital",
    doctorName: "Dr. Nathan Cole, MD",
    doctorId: "DOC-PATH-01",
    specialty: "Pathology",
    recordType: "Blood Chemistry Panel",
    category: "Lab Report",
    date: "2025-11-20",
    title: "Blood Test & Cholesterol Report",
    summary: "• Total Cholesterol: 218 mg/dL (Borderline elevated).\n• Fasting Blood Glucose: 95 mg/dL (Normal physiological range).\n• Renal and liver metabolic panels are completely healthy.\n• Dietary modification and light aerobic exercise recommended.",
    plainLanguageExplanation: "This lab test measured your blood fats (cholesterol) and sugar levels. Your LDL is slightly above the recommended target, while your kidney and liver tests look completely healthy.",
    testResults: [
      { test: "Total Cholesterol", value: "218 mg/dL", reference: "< 200 mg/dL", status: "High" },
      { test: "LDL Cholesterol", value: "138 mg/dL", reference: "< 100 mg/dL", status: "High" },
      { test: "HDL Cholesterol", value: "44 mg/dL", reference: "> 40 mg/dL", status: "Normal" }
    ],
    isImmutable: true
  }
];

// Remaining clinical history, generated from patientsRecords in the patient-portal record shape.
// Items already covered by a hand-authored record (same patient, date and kind) are skipped.
function buildPortalRecords() {
    const out = [];
    const covered = (patientId, date, categories) =>
        HAND_AUTHORED_RECORDS.some((h) => h.patientId === patientId && h.date === date && categories.includes(h.category));
    const medText = (m) => `${m.name} ${m.dosage}, ${m.frequency.toLowerCase()} for ${m.duration}. ${m.instructions}`;

    Object.entries(patientsRecords).forEach(([patientId, r]) => {
        const hospital = r.consultations[0]?.hospital || "";
        const doctorName = r.consultations[0]?.doctor || "";
        const hospitalId = HOSPITAL_IDS_BY_NAME[hospital];
        const doctorId = DOCTOR_IDS_BY_NAME[doctorName];
        const base = { patientId, isImmutable: true };

        r.consultations.forEach((c) => {
            if (covered(patientId, c.date, ["Doctor Visit"])) return;
            out.push({
                ...base,
                id: c.id,
                hospitalId: c.hospitalId,
                hospitalName: c.hospital,
                doctorId: c.doctorId,
                doctorName: c.doctor,
                recordType: c.visitType,
                category: "Consultation Note",
                date: c.date,
                title: c.reason,
                summary: `• Diagnosis: ${c.diagnosis}.\n• ${c.treatment}`,
                plainLanguageExplanation: `${c.treatment} Your doctor recorded this visit as: ${c.diagnosis}.`,
                diagnoses: [{ name: c.diagnosis, status: "Recorded" }],
            });
        });

        r.prescriptions.forEach((p) => {
            if (covered(patientId, p.date, ["Doctor Visit"])) return;
            out.push({
                ...base,
                id: p.id,
                hospitalId: p.hospitalId,
                hospitalName: p.hospital,
                doctorId: p.doctorId,
                doctorName: p.doctor,
                recordType: "Prescription",
                category: "Prescription",
                date: p.date,
                title: `Prescription: ${p.medications.map((m) => m.name).join(", ")}`,
                summary: p.medications.map((m) => `• ${medText(m)}`).join("\n"),
                plainLanguageExplanation: `Take your medicines exactly as written. ${p.medications.map(medText).join(" ")}`,
                medications: p.medications.map((m) => ({
                    drug: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration,
                    instructions: m.instructions,
                })),
            });
        });

        r.bloodReports.forEach((b) => {
            if (covered(patientId, b.date, ["Lab Report"])) return;
            const flagged = b.results.filter((x) => x.flag);
            out.push({
                ...base,
                id: b.id,
                hospitalId,
                hospitalName: hospital,
                doctorId,
                doctorName,
                recordType: b.name,
                category: "Lab Report",
                date: b.date,
                title: b.name,
                summary: flagged.length
                    ? flagged.map((x) => `• ${flagText(x)}`).join("\n")
                    : "• All values are within the normal range.",
                plainLanguageExplanation: flagged.length
                    ? "This blood test has some values outside the usual range. Your doctor will explain what they mean for you."
                    : "This blood test shows all values within the usual range.",
                testResults: b.results.map((x) => ({
                    test: x.test,
                    value: `${x.result} ${x.unit}`,
                    reference: x.range,
                    status: x.flag ? (x.flag === "high" ? "High" : "Low") : "Normal",
                })),
            });
        });

        r.otherReports.forEach((o) =>
            out.push({
                ...base,
                id: o.id,
                hospitalId: HOSPITAL_IDS_BY_NAME[o.center] || hospitalId,
                hospitalName: o.center,
                doctorId,
                doctorName,
                recordType: o.type,
                category: "Diagnostic Imaging",
                date: o.date,
                title: o.name,
                summary: `• ${o.description}\n• ${o.summary}`,
                plainLanguageExplanation: o.summary,
            }),
        );
    });
    return out;
}

export const MEDICAL_RECORDS = [...HAND_AUTHORED_RECORDS, ...buildPortalRecords()].sort((a, b) =>
    b.date.localeCompare(a.date),
);

export const ACTIVE_CONSENT_REQUEST = {
  id: "REQ-ABDM-8821",
  patientId: "MV-10482",
  patientName: "Aarav Mehta",
  requestingHospitalId: "HOSP-016",
  requestingHospitalName: "HealthPlus Hospital",
  department: "OPD Cardiology Wing B • Desk Terminal #04",
  requestingDoctorId: "DOC-001",
  requestingDoctorName: "Dr. Sarah Sharma",
  doctorTitle: "Primary Care Provider",
  doctorLicense: "MCI-2014-99182 • Clinical Trust Level 1",
  purpose: "OPD Cardiology Consultation & Triage",
  purposeDetail: "Dr. Sarah Sharma, MD (Cardiology) is requesting selective clinical context for today's in-person diagnostic review.",
  status: "PENDING",
  receivedTime: "Today, 09:30 AM",
  expiresAt: "2026-10-04T13:45:00Z",
  sessionRemainingTime: "04h 14m 47s",
  requestedScopes: [
    {
      id: "scope-1",
      title: "Discharge Summaries",
      description: "Last 24 months consultations & procedures",
      recordsCount: "3 records available",
      icon: "file",
      selected: true
    },
    {
      id: "scope-2",
      title: "Active Prescriptions",
      description: "Ongoing cardiovascular & metabolic regimens",
      recordsCount: "1 active medication",
      icon: "pill",
      selected: true
    },
    {
      id: "scope-3",
      title: "Cardio Diagnostics",
      description: "Lipid panels, Resting 12-lead ECG, Echo scans",
      recordsCount: "3 verified reports",
      icon: "heart",
      selected: true
    }
  ],
  liveTransactions: [
    { id: "TX-1", actor: "Dr. Sarah Sharma", action: "Decrypted: Cardiology Routine Review (2023)", time: "09:38 AM" },
    { id: "TX-2", actor: "E-Prescription Query", action: "Fetched: Amlodipine posology", time: "09:36 AM" },
    { id: "TX-3", actor: "Zero-Knowledge Token", action: "Delegated scoped authorization to Wing B", time: "09:35 AM" }
  ]
};

export const CONSENT_REQUESTS = [
  ACTIVE_CONSENT_REQUEST
];

export const AUDIT_TRAIL = [
  {
    id: "AUD-99120",
    timestamp: "2026-10-24T09:38:12Z",
    actorName: "Dr. Sarah Sharma, MD",
    actorRole: "Doctor",
    hospitalName: "HealthPlus Hospital",
    action: "VIEW_CROSS_HOSPITAL_RECORD",
    patientName: "Aarav Mehta (MV-10482)",
    recordId: "REC-2026-001 (CityCare)",
    consentToken: "REQ-ABDM-8821 (Valid)",
    ipAddress: "192.168.10.45 [Central Wing LAN]",
    details: "Authorized review of historical hypertension prescription prior to consultation."
  },
  {
    id: "AUD-99119",
    timestamp: "2026-10-24T09:35:00Z",
    actorName: "Aarav Mehta",
    actorRole: "Patient",
    hospitalName: "HealthPlus Hospital",
    action: "GRANT_TEMPORARY_VISIT_CONSENT",
    patientName: "Aarav Mehta (MV-10482)",
    recordId: "All Historical Records",
    consentToken: "REQ-ABDM-8821",
    ipAddress: "Mobile App (Biometric Verified)",
    details: "Granted 6-hour temporary visit access to Dr. Sarah Sharma at HealthPlus Hospital."
  }
];

export const MOCK_OCR_SAMPLES = [
  {
    id: "OCR-PRESET-1",
    title: "Handwritten Prescription (Cardiology OPD)",
    type: "Prescription",
    extractedData: {
      doctor: "Dr. Sarah Sharma, MD (Cardiologist)",
      hospital: "HealthPlus Hospital",
      date: "2026-10-24",
      diagnosis: "Essential Hypertension (ICD-10 I10)",
      medicines: [
        { name: "Tab. Amlodipine", dosage: "5mg", frequency: "1-0-0 (Morning OD)", duration: "30 Days" },
        { name: "Tab. Telmisartan", dosage: "40mg", frequency: "0-0-1 (Evening OD)", duration: "30 Days" }
      ],
      advisedTests: ["Lipid Profile (Fasting)", "Serum Creatinine"],
      confidenceScore: "99.1%"
    }
  }
];

// ================= 10. App defaults =================

// Who is "logged in" by default. All values reference records above.
export const DEFAULT_SESSION = {
  hospitalId: DOCTOR_RECORD.hospitalId,
  doctorId: DOCTOR_ID,
  assistantId: ASSISTANTS[0].id,
  patientId: PATIENTS[0].id
};

const DEFAULT_PATIENT_RECORDS = MEDICAL_RECORDS.filter((r) => r.patientId === DEFAULT_SESSION.patientId);
const LATEST_CROSS_HOSPITAL_RECORD = DEFAULT_PATIENT_RECORDS.find((r) => r.hospitalId !== DEFAULT_SESSION.hospitalId);

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-1',
    title: `Access Request from ${ACTIVE_CONSENT_REQUEST.requestingHospitalName}`,
    message: `${ACTIVE_CONSENT_REQUEST.requestingDoctorName} requested temporary 4-hour visit access to your past cardiology and lab records.`,
    type: 'consent_request',
    requestId: ACTIVE_CONSENT_REQUEST.id,
    time: '10 mins ago',
    read: false
  },
  {
    id: 'NOTIF-2',
    title: 'New Consultation Record Added',
    message: `${LATEST_CROSS_HOSPITAL_RECORD.hospitalName} uploaded your ${LATEST_CROSS_HOSPITAL_RECORD.title.toLowerCase()} record.`,
    type: 'new_record',
    time: 'Yesterday',
    read: true
  }
];
