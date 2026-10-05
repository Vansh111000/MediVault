export const HOSPITALS = [
  { id: "HOSP-001", name: "CityCare Multi-Specialty Hospital", location: "Downtown Medical District" },
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
  { id: "HOSP-015", name: "Ruby Hall Clinic & Diagnostics", location: "Sassoon Road" }
];

export const DOCTORS = [
  {
    id: "DOC-001",
    name: "Dr. Sarah Sharma, MD",
    specialty: "Cardiology & Attending Physician",
    hospitalId: "HOSP-001",
    hospitalName: "CityCare Hospital",
    licenseNumber: "MCI-2014-99182",
    experience: "14 Years",
    rating: 4.95,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    email: "dr.sarah.sharma@citycare.org",
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

export const ASSISTANTS = [
  {
    id: "AST-001",
    name: "Elena Cruz",
    role: "Senior Frontdesk & Triage Coordinator",
    hospitalId: "HOSP-001",
    hospitalName: "CityCare Hospital",
    email: "elena.cruz@citycare.org"
  }
];

export const PATIENTS = [
  {
    id: "PAT-10412",
    abhaId: "91-8429-1924-8192",
    mediVaultId: "MV-10412",
    name: "Aarav Mehta",
    age: 34,
    gender: "Male",
    bloodGroup: "O+",
    dob: "1992-04-18",
    phone: "+91 98450-39182",
    email: "aarav.mehta@example.com",
    address: "Flat 402, Green Glen Towers, Outer Ring Road",
    allergies: [
      { allergen: "Mild Penicillin", severity: "Mild (Rash / Hives)", identified: "2021-03" }
    ],
    chronicConditions: [
      { condition: "Essential Hypertension (Stage 1)", diagnosedDate: "2023-08-12", status: "Managed with Amlodipine 5mg" },
      { condition: "Mild Elevated LDL", diagnosedDate: "2024-08-12", status: "Dietary Modification" }
    ],
    vitals: {
      bp: "136/84 mmHg",
      heartRate: "72 bpm",
      spO2: "99%",
      weight: "74 kg",
      height: "176 cm",
      bmi: "23.9",
      bloodGlucose: "92 mg/dL"
    },
    emergencyContact: {
      name: "Ananya Mehta",
      relation: "Spouse",
      phone: "+91 98450-39182"
    },
    registeredAt: "HOSP-001",
    homeHospital: "CityCare Hospital",
    lastConsult: "18 Sep 2026",
    currentMed: "Amlodipine 5mg"
  },
  {
    id: "PAT-10821",
    abhaId: "91-4432-8812-9011",
    mediVaultId: "MV-6821",
    name: "Sarah Jenkins",
    age: 29,
    gender: "Female",
    bloodGroup: "A+",
    dob: "1997-05-14",
    phone: "+1 (555) 901-2345",
    email: "sarah.jenkins@example.com",
    address: "742 Evergreen Terrace, West District",
    allergies: [
      { allergen: "Penicillin", severity: "Severe (Anaphylaxis)", identified: "2019-04" }
    ],
    chronicConditions: [
      { condition: "Mild Asthma", diagnosedDate: "2022-01-15", status: "Inhaler PRN" }
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
    id: "PAT-10833",
    abhaId: "91-8832-1192-3344",
    mediVaultId: "MV-10833",
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
      { condition: "Hypothyroidism", diagnosedDate: "2023-05-20", status: "Levothyroxine 25mcg" }
    ],
    vitals: {
      bp: "120/78 mmHg",
      heartRate: "70 bpm",
      spO2: "99%",
      weight: "58 kg",
      height: "162 cm",
      bmi: "22.1",
      bloodGlucose: "88 mg/dL"
    },
    emergencyContact: {
      name: "Rohan Shah",
      relation: "Spouse",
      phone: "+91 98330-11220"
    },
    registeredAt: "HOSP-002",
    homeHospital: "St. Jude Medical Center",
    lastConsult: "12 Oct 2026",
    currentMed: "Levothyroxine 25mcg"
  },
  {
    id: "PAT-10917",
    abhaId: "91-5511-9988-1200",
    mediVaultId: "MV-09117",
    name: "Rahul Verma",
    age: 45,
    gender: "Male",
    bloodGroup: "AB+",
    dob: "1981-08-15",
    phone: "+91 97722-44119",
    email: "rahul.v@example.com",
    address: "88 Horizon Tower",
    allergies: [],
    chronicConditions: [
      { condition: "Type 2 Diabetes Mellitus", diagnosedDate: "2022-10-10", status: "Metformin 500mg" }
    ],
    vitals: {
      bp: "128/82 mmHg",
      heartRate: "76 bpm",
      spO2: "98%",
      weight: "78 kg",
      height: "175 cm",
      bmi: "25.5",
      bloodGlucose: "132 mg/dL"
    },
    emergencyContact: {
      name: "Kavita Verma",
      relation: "Spouse",
      phone: "+91 97722-44110"
    },
    registeredAt: "HOSP-003",
    homeHospital: "Apollo Health Gateway",
    lastConsult: "10 Oct 2026",
    currentMed: "Metformin 500mg"
  },
  {
    id: "PAT-11204",
    abhaId: "91-2299-4411-7788",
    mediVaultId: "MV-11204",
    name: "Meera Nair",
    age: 41,
    gender: "Female",
    bloodGroup: "A+",
    dob: "1985-11-23",
    phone: "+91 96633-88991",
    email: "meera.nair@example.com",
    address: "33 Pine Street",
    allergies: [],
    chronicConditions: [
      { condition: "Ventricular Premature Beats", diagnosedDate: "2025-03-14", status: "Sensor Bridge Telemetry" }
    ],
    vitals: {
      bp: "122/80 mmHg",
      heartRate: "82 bpm",
      spO2: "98%",
      weight: "64 kg",
      height: "165 cm",
      bmi: "23.5",
      bloodGlucose: "94 mg/dL"
    },
    emergencyContact: {
      name: "Suresh Nair",
      relation: "Spouse",
      phone: "+91 96633-88990"
    },
    registeredAt: "HOSP-004",
    homeHospital: "Echo & ECG Telemetry Institute",
    lastConsult: "20 Oct 2026",
    currentMed: "Metoprolol 25mg"
  },
  {
    id: "PAT-08142",
    abhaId: "91-3311-6655-0012",
    mediVaultId: "MV-08142",
    name: "David Chen",
    age: 65,
    gender: "Male",
    bloodGroup: "O-",
    dob: "1961-07-04",
    phone: "+1 (555) 777-1122",
    email: "david.chen@example.com",
    address: "12 Harbor View Road",
    allergies: [],
    chronicConditions: [
      { condition: "Post-CABG Routine Surveillance", diagnosedDate: "2021-09-01", status: "Stable" }
    ],
    vitals: {
      bp: "116/74 mmHg",
      heartRate: "66 bpm",
      spO2: "99%",
      weight: "70 kg",
      height: "170 cm",
      bmi: "24.2",
      bloodGlucose: "91 mg/dL"
    },
    emergencyContact: {
      name: "Linda Chen",
      relation: "Spouse",
      phone: "+1 (555) 777-1120"
    },
    registeredAt: "HOSP-001",
    homeHospital: "CityCare Hospital",
    lastConsult: "Today, 08:45 AM",
    currentMed: "Atorvastatin 20mg"
  }
];

export const TODAY_DOCTOR_QUEUE = [
  {
    id: "VISIT-001",
    patientId: "PAT-10412",
    patientName: "Aarav Mehta",
    age: 34,
    gender: "Male",
    bloodGroup: "O+",
    patientIdCode: "MV-10412",
    appointmentTime: "09:30 AM",
    appointmentLocation: "In Suite Lobby",
    visitType: "Follow-up",
    consentStatus: "CityCare Hospital",
    consentExpiry: "Expires 6:00 PM Today",
    status: "Waiting",
    statusColor: "amber",
    actionLabel: "Open Vault",
    actionType: "primary"
  },
  {
    id: "VISIT-002",
    patientId: "PAT-10833",
    patientName: "Priya Shah",
    age: 28,
    gender: "Female",
    bloodGroup: "B+",
    patientIdCode: "MV-10833",
    appointmentTime: "10:15 AM",
    appointmentLocation: "Slot 2",
    visitType: "New Consultation",
    consentStatus: "Full MediVault Care",
    consentExpiry: "Perpetual OPD Consent",
    status: "Checked In",
    statusColor: "emerald",
    actionLabel: "View",
    actionType: "secondary"
  },
  {
    id: "VISIT-003",
    patientId: "PAT-10917",
    patientName: "Rahul Verma",
    age: 45,
    gender: "Male",
    bloodGroup: "AB+",
    patientIdCode: "MV-09117",
    appointmentTime: "11:00 AM",
    appointmentLocation: "Pre-test Queue",
    visitType: "Follow-up",
    consentStatus: "Apollo Health Gateway",
    consentExpiry: "Expires in 3 hours",
    status: "Upcoming",
    statusColor: "blue",
    actionLabel: "View",
    actionType: "secondary"
  },
  {
    id: "VISIT-004",
    patientId: "PAT-11204",
    patientName: "Meera Nair",
    age: 41,
    gender: "Female",
    bloodGroup: "A+",
    patientIdCode: "MV-11204",
    appointmentTime: "11:45 AM",
    appointmentLocation: "Cardio Lab 2",
    visitType: "Specialist Review",
    consentStatus: "Echo & ECG Telemetry",
    consentExpiry: "Real-time Sensor Bridge",
    status: "In Exam",
    statusColor: "purple",
    actionLabel: "View",
    actionType: "secondary"
  },
  {
    id: "VISIT-005",
    patientId: "PAT-08142",
    patientName: "David Chen",
    age: 65,
    gender: "Male",
    bloodGroup: "O-",
    patientIdCode: "MV-08142",
    appointmentTime: "08:45 AM",
    appointmentLocation: "Concluded",
    visitType: "Lab Review",
    consentStatus: "Archived (Discharged)",
    consentExpiry: "Session Closed",
    status: "Completed",
    statusColor: "slate",
    actionLabel: "Summary",
    actionType: "secondary"
  }
];

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
    description: "Automated entity extraction completed for Priya Shah (Metabolic Panel).",
    time: "24m ago",
    type: "ocr"
  },
  {
    id: "FEED-4",
    title: "Consent Lease Expiring",
    description: "Cross-hospital access for Rahul Verma (Apollo) auto-revokes in 3 hours.",
    time: "1h ago",
    type: "consent"
  }
];

export const MEDICAL_RECORDS = [
  {
    id: "REC-2026-001",
    patientId: "PAT-10412",
    hospitalId: "HOSP-001",
    hospitalName: "CityCare Hospital",
    doctorName: "Dr. Sarah Sharma, MD",
    doctorId: "DOC-001",
    specialty: "Cardiology",
    recordType: "Consultation & Prescription",
    category: "Doctor Visit",
    date: "2026-08-12",
    title: "Doctor Visit & Prescription",
    summary: "• Routine blood pressure checkup and cardiovascular health review.\n• Prescribed Amlodipine 5mg (morning) and Telmisartan 40mg (evening).\n• Recommended low-sodium diet and twice-weekly home blood pressure logging.\n• Scheduled follow-up consultation in 30 days.",
    plainLanguageExplanation: "The doctor checked your blood pressure and heart health. Your blood pressure is fairly well-managed on Amlodipine. Your kidney function test looks completely healthy. Continue taking your daily medicine and moderate salt in your diet.",
    diagnoses: [
      { code: "I10", name: "Primary Hypertension", status: "Active" },
      { code: "E78.0", name: "Borderline Dyslipidemia", status: "Managed" }
    ],
    medications: [
      { drug: "Amlodipine", dosage: "5mg", frequency: "Once daily (Morning)", duration: "30 Days", instructions: "Take after breakfast. Maintain steady timing." },
      { drug: "Telmisartan", dosage: "40mg", frequency: "Once daily (Evening)", duration: "30 Days", instructions: "Log home blood pressure 2x/week in MediVault app." }
    ],
    testsOrdered: ["Lipid Profile (Fasting)", "Serum Creatinine"],
    isImmutable: true
  },
  {
    id: "REC-2025-089",
    patientId: "PAT-10412",
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

export const ACTIVE_CONSENT_REQUEST = {
  id: "REQ-ABDM-8821",
  patientId: "PAT-10412",
  patientName: "Aarav Mehta",
  requestingHospitalId: "HOSP-001",
  requestingHospitalName: "CityCare Hospital",
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
      recordsCount: "4 active medications",
      icon: "pill",
      selected: true
    },
    {
      id: "scope-3",
      title: "Cardio Diagnostics",
      description: "Lipid panels, Resting 12-lead ECG, Echo scans",
      recordsCount: "2 verified labs",
      icon: "heart",
      selected: true
    }
  ],
  liveTransactions: [
    { id: "TX-1", actor: "Dr. Sarah Sharma", action: "Decrypted: Cardiology Routine Review (2023)", time: "09:38 AM" },
    { id: "TX-2", actor: "E-Prescription Query", action: "Fetched: Atorvastatin & Metoprolol posology", time: "09:36 AM" },
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
    hospitalName: "CityCare Hospital",
    action: "VIEW_CROSS_HOSPITAL_RECORD",
    patientName: "Aarav Mehta (PAT-10412)",
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
    hospitalName: "CityCare Hospital",
    action: "GRANT_TEMPORARY_VISIT_CONSENT",
    patientName: "Aarav Mehta (PAT-10412)",
    recordId: "All Historical Records",
    consentToken: "REQ-ABDM-8821",
    ipAddress: "Mobile App (Biometric Verified)",
    details: "Granted 6-hour temporary visit access to Dr. Sarah Sharma at CityCare Hospital."
  }
];

export const MOCK_OCR_SAMPLES = [
  {
    id: "OCR-PRESET-1",
    title: "Handwritten Prescription (Cardiology OPD)",
    type: "Prescription",
    extractedData: {
      doctor: "Dr. Sarah Sharma, MD (Cardiologist)",
      hospital: "CityCare Hospital",
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
