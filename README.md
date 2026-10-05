# MediVault — AI-Powered Personal Medical History and Consultation Assistant

MediVault is a centralized medical record management platform built on the MERN stack. It brings together patient information, consultations, diagnoses, prescriptions, and test reports across registered hospitals and clinics — giving doctors instant access to authorized patient history and giving patients control over who can see their records.

## Problem Statement

Healthcare providers, especially small and medium-sized clinics, often rely on fragmented systems or paper-based records to manage patient information. Patient history, prescriptions, diagnostic reports, and appointment records are scattered across physical files, messaging apps, spreadsheets, or different software systems, making it difficult for doctors to quickly understand a patient's medical background during consultations.

**One-line problem statement:** Doctors waste valuable consultation time because patient records, appointments, prescriptions, reports, and medical history are scattered across multiple systems instead of being available in one organized, searchable platform.

## Vision

Build an operating system for clinics that centralizes every patient's medical journey — from consultation history to prescriptions, diagnostic reports, and follow-up care — allowing healthcare professionals to access complete patient information instantly while improving operational efficiency.

## Objectives

1. Develop a centralized medical record management system using the MERN stack for storing and managing patient information, consultations, diagnoses, prescriptions, and test reports across registered hospitals and clinics.
2. Implement role-based access control for patients, doctors, hospital assistants/administrators, and system administrators.
3. Enable hospital assistants/administrators to create patient accounts and record basic information, medical reports, and test results.
4. Allow assistants to assign patients to specific doctors and provide those doctors with access to the patient's authorized records.
5. Provide doctors with a personalized dashboard to view assigned patients, access authorized medical history, and create consultation records, diagnoses, prescriptions, and treatment information.
6. Implement temporary, visit-based patient consent for sharing medical records between registered hospitals, with access automatically expiring when the visit is completed.
7. Preserve the integrity and ownership of historical medical records — hospitals can view authorized records from other hospitals but cannot modify or delete them.
8. Automatically extract important medical information from uploaded documents using AI (medicines, diagnoses, tests, doctor details).
9. Generate AI-assisted summaries of a patient's medical history.
10. Provide optional plain-language explanations of medical reports as an informational aid, not a diagnosis.
11. Intelligently organize uploaded medical records by document type.
12. Improve continuity and efficiency of healthcare consultations through centralized records, controlled access, and AI assistance.
13. Develop a scalable platform initially supporting ~15–20 registered hospitals/clinics, with room for future expansion.

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **API:** REST APIs for frontend-backend communication
- **Auth:** JWT authentication, role-based authorization

## User Roles

| Role | Responsibilities |
|---|---|
| **Patient** | View personal medical history, manage consent, view AI summaries and plain-language report explanations |
| **Doctor** | View assigned patients, access authorized history, create consultations, diagnoses, and prescriptions |
| **Hospital Assistant / Admin** | Register patients, manage doctor assignments, handle consent requests, verify AI-extracted data, confirm/dispense prescriptions |
| **System Administrator** | Manage hospitals, staff, and overall platform users |

## Core Features

### Patient
- Secure registration and login
- Personal health profile (blood group, allergies, chronic conditions, emergency contacts)
- Chronological medical history timeline
- View prescriptions, lab reports, and medical documents (read-only — uploaded by hospital staff)
- AI-generated consultation summaries
- Plain-language explanation of medical reports
- Patient-controlled consent for cross-hospital record sharing
- Secure sharing of medical summary via time-limited link/QR code

### Doctor
- View patients assigned by hospital assistant
- Access authorized medical history, previous diagnoses, medications, and reports
- Create consultation notes, diagnoses, and prescriptions
- Recommend follow-ups and tests
- Request temporary access to patient records from other hospitals

### Hospital Assistant / Admin
- Create and manage patient accounts (first-time and returning patients)
- Search for existing patients
- Upload medical reports and verify AI-extracted data before saving
- Assign patients to doctors
- Manage cross-hospital consent requests
- Confirm and dispense prescriptions
- Complete patient visits (which expires temporary cross-hospital access)

### AI-Assisted Medical Record Understanding and Organization
- **Extract** — medicines, dosages, diagnoses, test values, doctor/hospital details from uploaded documents
- **Summarize** — condense a patient's medical history into a quick-review overview
- **Explain** — convert technical report language into plain, patient-friendly language
- **Organize** — classify uploaded documents (prescription, blood test, imaging report, consultation note, discharge summary, etc.)

> AI extracts → Human verifies → Record is saved. AI output is always informational, never a diagnosis.

## Cross-Hospital Consent Flow