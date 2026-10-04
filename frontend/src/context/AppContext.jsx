import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  HOSPITALS,
  DOCTORS,
  ASSISTANTS,
  PATIENTS,
  MEDICAL_RECORDS,
  ACTIVE_VISITS,
  CONSENT_REQUESTS,
  AUDIT_TRAIL,
  MOCK_OCR_SAMPLES
} from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Roles: 'patient' | 'doctor' | 'assistant' | 'admin'
  const [currentRole, setCurrentRole] = useState('patient');
  
  // Active Entities
  const [activeHospitalId, setActiveHospitalId] = useState('HOSP-002'); // St. Jude Medical Center
  const [activePatientId, setActivePatientId] = useState('PAT-1001'); // Alex Mercer
  const [activeDoctorId, setActiveDoctorId] = useState('DOC-002'); // Dr. Arvind Patel
  const [activeAssistantId, setActiveAssistantId] = useState('AST-001'); // Elena Cruz

  // State Stores
  const [hospitals] = useState(HOSPITALS);
  const [doctors] = useState(DOCTORS);
  const [assistants] = useState(ASSISTANTS);
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('medivault_patients');
    return saved ? JSON.parse(saved) : PATIENTS;
  });
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('medivault_records');
    return saved ? JSON.parse(saved) : MEDICAL_RECORDS;
  });
  const [activeVisits, setActiveVisits] = useState(() => {
    const saved = localStorage.getItem('medivault_visits');
    return saved ? JSON.parse(saved) : ACTIVE_VISITS;
  });
  const [consentRequests, setConsentRequests] = useState(() => {
    const saved = localStorage.getItem('medivault_consents');
    return saved ? JSON.parse(saved) : CONSENT_REQUESTS;
  });
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('medivault_audit');
    return saved ? JSON.parse(saved) : AUDIT_TRAIL;
  });

  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 'NOTIF-1',
      title: 'Access Request from St. Jude Medical Center',
      message: 'Dr. Arvind Patel requested temporary 4-hour visit access to your past cardiology and lab records.',
      type: 'consent_request',
      requestId: 'REQ-CONSENT-890',
      time: '10 mins ago',
      read: false
    },
    {
      id: 'NOTIF-2',
      title: 'New Consultation Record Added',
      message: 'Metro General Hospital uploaded your quarterly hypertension review and prescription.',
      type: 'new_record',
      time: 'Yesterday',
      read: true
    }
  ]);

  // Persist modifications
  useEffect(() => {
    localStorage.setItem('medivault_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('medivault_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('medivault_visits', JSON.stringify(activeVisits));
  }, [activeVisits]);

  useEffect(() => {
    localStorage.setItem('medivault_consents', JSON.stringify(consentRequests));
  }, [consentRequests]);

  useEffect(() => {
    localStorage.setItem('medivault_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Derived current objects
  const currentHospital = hospitals.find(h => h.id === activeHospitalId) || hospitals[0];
  const currentPatient = patients.find(p => p.id === activePatientId) || patients[0];
  const currentDoctor = doctors.find(d => d.id === activeDoctorId) || doctors[0];
  const currentAssistant = assistants.find(a => a.id === activeAssistantId) || assistants[0];

  // Helper Toast Alert
  const showToast = (title, message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Add Audit Entry
  const addAuditLog = (action, details, recordId = 'N/A', patientName = '') => {
    const newLog = {
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      actorName: currentRole === 'doctor' ? currentDoctor.name : currentRole === 'assistant' ? currentAssistant.name : currentRole === 'patient' ? currentPatient.name : 'System Admin',
      actorRole: currentRole.charAt(0).toUpperCase() + currentRole.slice(1),
      hospitalName: currentHospital.name,
      action,
      patientName: patientName || (currentPatient ? `${currentPatient.name} (${currentPatient.id})` : 'N/A'),
      recordId,
      consentToken: 'Active Authorization',
      ipAddress: '192.168.10.88 [Encrypted SSL]',
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Switch role and automatically configure relevant active entities
  const switchRole = (role) => {
    setCurrentRole(role);
    if (role === 'doctor') {
      setActiveDoctorId(DOCTORS[1].id); // Dr. Arvind Patel at St. Jude
      setActiveHospitalId(DOCTORS[1].hospitalId);
    } else if (role === 'assistant') {
      setActiveAssistantId(ASSISTANTS[0].id); // Elena Cruz at St. Jude
      setActiveHospitalId(ASSISTANTS[0].hospitalId);
    } else if (role === 'patient') {
      setActivePatientId(PATIENTS[0].id); // Alex Mercer
    } else if (role === 'admin') {
      setActiveHospitalId(HOSPITALS[0].id);
    }
  };

  // Create new patient account (by assistant or patient)
  const registerPatient = (patientData) => {
    const newId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAbha = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMvId = `MV-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPatient = {
      id: newId,
      abhaId: newAbha,
      mediVaultId: newMvId,
      name: patientData.name,
      age: parseInt(patientData.age, 10) || 30,
      gender: patientData.gender || 'Other',
      bloodGroup: patientData.bloodGroup || 'O+',
      dob: patientData.dob || '1995-01-01',
      phone: patientData.phone || '+1 (555) 000-0000',
      email: patientData.email || `${patientData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      address: patientData.address || 'Standard Registered Residence',
      allergies: patientData.allergies || [],
      chronicConditions: patientData.chronicConditions || [],
      vitals: patientData.vitals || {
        bp: '120/80 mmHg',
        heartRate: '72 bpm',
        spO2: '98%',
        weight: '70 kg',
        height: '172 cm',
        bmi: '23.6',
        bloodGlucose: '95 mg/dL'
      },
      emergencyContact: patientData.emergencyContact || {
        name: 'Family Contact',
        relation: 'Relative',
        phone: patientData.phone
      },
      registeredAt: currentHospital.id,
      homeHospital: currentHospital.name,
      registeredDate: new Date().toISOString().split('T')[0]
    };

    setPatients(prev => [newPatient, ...prev]);
    addAuditLog('CREATE_PATIENT_ACCOUNT', `New patient account created by frontdesk with ID ${newId}`, 'N/A', `${newPatient.name} (${newId})`);
    showToast('Account Created', `Patient ${newPatient.name} registered with MediVault ID ${newMvId}`, 'success');
    return newPatient;
  };

  // Hospital Check-In & Doctor Assignment
  const checkInPatient = ({ patientId, doctorId, priority = 'Routine', reason = 'General Consultation', triageVitals = {} }) => {
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId) || doctors[0];

    // Check if consent is already active for this hospital
    const existingConsent = consentRequests.find(
      c => c.patientId === patientId && c.requestingHospitalId === currentHospital.id && c.status === 'APPROVED_ACTIVE'
    );

    const tokenNum = `${priority === 'Urgent' ? 'U' : 'R'}-${Math.floor(100 + Math.random() * 900)}`;
    const newVisitId = `VISIT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newVisit = {
      id: newVisitId,
      patientId,
      patientName: patient ? patient.name : 'Unknown Patient',
      hospitalId: currentHospital.id,
      hospitalName: currentHospital.name,
      assignedDoctorId: doctor.id,
      assignedDoctorName: doctor.name,
      specialty: doctor.specialty,
      checkInTime: new Date().toISOString(),
      priority,
      status: 'In Doctor Queue',
      tokenNumber: tokenNum,
      triageVitals: {
        bp: triageVitals.bp || patient?.vitals?.bp || '120/80 mmHg',
        pulse: triageVitals.pulse || patient?.vitals?.heartRate || '72 bpm',
        temp: triageVitals.temp || '98.6 °F',
        spO2: triageVitals.spO2 || '98%'
      },
      reasonForVisit: reason,
      crossHospitalConsent: existingConsent ? {
        requestId: existingConsent.id,
        status: 'APPROVED_ACTIVE',
        grantedAt: existingConsent.grantedAt,
        expiresAt: existingConsent.expiresAt,
        sharedHospitals: ['Metro General Hospital', 'Apollo Health Clinic', 'St. Jude Medical Center'],
        consentScope: 'Full Cross-Hospital Medical History'
      } : {
        status: 'PENDING_AUTHORIZATION',
        message: 'Patient consent required for cross-hospital records'
      }
    };

    setActiveVisits(prev => [newVisit, ...prev]);
    addAuditLog('PATIENT_CHECK_IN', `Assigned token ${tokenNum} to ${doctor.name} (${priority})`, newVisitId, `${patient?.name} (${patientId})`);
    showToast('Patient Checked In', `Assigned to ${doctor.name} with Token ${tokenNum}`, 'success');
  };

  // Complete / End Visit (Revokes temporary access automatically)
  const endVisit = (visitId) => {
    const visit = activeVisits.find(v => v.id === visitId);
    if (!visit) return;

    setActiveVisits(prev => prev.filter(v => v.id !== visitId));

    // Automatically expire any temporary visit consent for this patient at this hospital
    setConsentRequests(prev => prev.map(c => {
      if (c.patientId === visit.patientId && c.requestingHospitalId === visit.hospitalId && c.status === 'APPROVED_ACTIVE') {
        return { ...c, status: 'EXPIRED', remainingSeconds: 0 };
      }
      return c;
    }));

    addAuditLog('END_PATIENT_VISIT_AUTO_REVOKE', `Visit ${visitId} closed. Temporary cross-hospital access tokens automatically expired and invalidated.`, visitId, visit.patientName);
    showToast('Visit Completed', `Visit closed. Cross-hospital temporary access auto-expired for patient safety.`, 'info');
  };

  // Request Inter-Hospital Consent
  const requestInterHospitalConsent = ({ patientId, reason, durationMinutes = 240 }) => {
    const patient = patients.find(p => p.id === patientId);
    const newReqId = `REQ-CONSENT-${Math.floor(100 + Math.random() * 900)}`;

    const newRequest = {
      id: newReqId,
      patientId,
      patientName: patient?.name || 'Patient',
      requestingHospitalId: currentHospital.id,
      requestingHospitalName: currentHospital.name,
      requestingDoctorId: currentDoctor?.id || 'DOC-EXT',
      requestingDoctorName: currentDoctor?.name || 'Assigned Clinician',
      purpose: reason || `Access previous clinical records & lab tests for current consultation at ${currentHospital.name}`,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      grantedAt: null,
      expiresAt: null,
      durationMinutes,
      permissionLevel: `Read-Only ${durationMinutes / 60}-Hour Visit Token`
    };

    setConsentRequests(prev => [newRequest, ...prev]);

    // Send in-app notification to patient
    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: `Consent Request: ${currentHospital.name}`,
        message: `${currentDoctor?.name || 'Doctor'} is requesting temporary read-only access to your medical history for today's visit.`,
        type: 'consent_request',
        requestId: newReqId,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);

    addAuditLog('REQUEST_CROSS_HOSPITAL_CONSENT', `Requested ${durationMinutes}m read-only token from ${patient?.name}`, newReqId, `${patient?.name} (${patientId})`);
    showToast('Consent Request Sent', `Authorization prompt sent to ${patient?.name}'s device.`, 'info');
  };

  // Respond to Consent Request (Approve / Reject)
  const respondConsentRequest = (requestId, approved) => {
    const request = consentRequests.find(c => c.id === requestId);
    if (!request) return;

    const now = new Date();
    const expiry = new Date(now.getTime() + (request.durationMinutes || 240) * 60 * 1000);

    setConsentRequests(prev => prev.map(c => {
      if (c.id === requestId) {
        return {
          ...c,
          status: approved ? 'APPROVED_ACTIVE' : 'REJECTED',
          grantedAt: approved ? now.toISOString() : null,
          expiresAt: approved ? expiry.toISOString() : null,
          remainingSeconds: approved ? (request.durationMinutes || 240) * 60 : 0
        };
      }
      return c;
    }));

    // Update active visit consent status if any
    if (approved) {
      setActiveVisits(prev => prev.map(v => {
        if (v.patientId === request.patientId && v.hospitalId === request.requestingHospitalId) {
          return {
            ...v,
            crossHospitalConsent: {
              requestId: request.id,
              status: 'APPROVED_ACTIVE',
              grantedAt: now.toISOString(),
              expiresAt: expiry.toISOString(),
              sharedHospitals: ['Metro General Hospital', 'Apollo Health Clinic', 'Trinity Diagnostic Lab'],
              consentScope: 'Full Cross-Hospital Medical History'
            }
          };
        }
        return v;
      }));
    }

    addAuditLog(
      approved ? 'GRANT_TEMPORARY_VISIT_CONSENT' : 'REJECT_CONSENT_REQUEST',
      approved
        ? `Patient granted temporary ${request.durationMinutes}m access to ${request.requestingHospitalName}. Auto-expires at ${expiry.toLocaleTimeString()}`
        : `Patient denied access request from ${request.requestingHospitalName}`,
      requestId,
      `${request.patientName} (${request.patientId})`
    );

    showToast(
      approved ? 'Access Granted' : 'Request Declined',
      approved ? `Temporary ${request.durationMinutes / 60}-hour visit access enabled.` : 'Access request was rejected.',
      approved ? 'success' : 'warning'
    );
  };

  // Revoke Consent manually
  const revokeConsent = (requestId) => {
    const req = consentRequests.find(c => c.id === requestId);
    setConsentRequests(prev => prev.map(c => c.id === requestId ? { ...c, status: 'REVOKED', remainingSeconds: 0 } : c));
    
    // Also remove from active visit
    if (req) {
      setActiveVisits(prev => prev.map(v => {
        if (v.patientId === req.patientId && v.hospitalId === req.requestingHospitalId) {
          return {
            ...v,
            crossHospitalConsent: {
              status: 'REVOKED',
              message: 'Consent was revoked by patient'
            }
          };
        }
        return v;
      }));
    }

    addAuditLog('REVOKE_PATIENT_CONSENT', `Patient revoked access token ${requestId} immediately.`, requestId, req?.patientName);
    showToast('Access Revoked', 'Doctor and hospital access has been revoked.', 'info');
  };

  // Add Consultation Record by Doctor
  const addConsultationRecord = ({ patientId, diagnoses, medications, testsOrdered, doctorNotes, title, category = 'Prescription' }) => {
    const newRecId = `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const patient = patients.find(p => p.id === patientId);

    // AI plain language generation simulation
    const medsText = medications.map(m => `${m.drug} (${m.dosage})`).join(', ');
    const diagText = diagnoses.map(d => d.name).join(', ');
    const plainExplanation = `During your consultation with ${currentDoctor.name} at ${currentHospital.name}, you were evaluated for ${diagText || 'your health condition'}. You were prescribed ${medsText || 'supportive medications'}. Follow all instructions and take tests as recommended.`;

    const newRecord = {
      id: newRecId,
      patientId,
      hospitalId: currentHospital.id,
      hospitalName: currentHospital.name,
      doctorName: currentDoctor.name,
      doctorId: currentDoctor.id,
      specialty: currentDoctor.specialty,
      recordType: category === 'Prescription' ? 'Consultation & Prescription' : 'Clinical Consultation',
      category,
      date: new Date().toISOString().split('T')[0],
      title: title || `Consultation: ${diagText || 'Health Review'}`,
      summary: doctorNotes || `Clinical evaluation conducted. Prescribed ${medsText}.`,
      plainLanguageExplanation: plainExplanation,
      diagnoses: diagnoses || [],
      medications: medications || [],
      testsOrdered: testsOrdered || [],
      doctorNotes: doctorNotes || '',
      isImmutable: true,
      fileAttachment: {
        name: `${currentHospital.name.replace(/\s+/g, '_')}_Consult_${newRecId}.pdf`,
        size: '320 KB',
        ocrExtracted: true
      }
    };

    setRecords(prev => [newRecord, ...prev]);
    addAuditLog('CREATE_CONSULTATION_RECORD', `Doctor recorded new consultation with ${medications.length} meds and ${diagnoses.length} diagnoses.`, newRecId, `${patient?.name} (${patientId})`);
    showToast('Consultation Recorded', `New record ${newRecId} securely stored and cryptographically signed.`, 'success');
    return newRecord;
  };

  // Upload Lab Report / Document (by Assistant, Patient, or Doctor)
  const uploadDocumentRecord = ({ patientId, title, category, fileAttachment, testResults, summary, extractedData }) => {
    const newRecId = `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const patient = patients.find(p => p.id === patientId);

    const newRecord = {
      id: newRecId,
      patientId,
      hospitalId: currentHospital.id,
      hospitalName: currentHospital.name,
      doctorName: currentRole === 'doctor' ? currentDoctor.name : 'Attending Radiologist/Pathologist',
      doctorId: currentRole === 'doctor' ? currentDoctor.id : 'DOC-LAB-01',
      specialty: category === 'Lab Report' ? 'Pathology' : category === 'Diagnostic Imaging' ? 'Radiology' : 'General Care',
      recordType: category,
      category: category || 'Lab Report',
      date: new Date().toISOString().split('T')[0],
      title: title || `Uploaded ${category} Report`,
      summary: summary || (extractedData ? `AI OCR extracted ${extractedData.medicines?.length || 0} meds / ${extractedData.results?.length || 0} test values.` : 'Uploaded medical diagnostic document.'),
      plainLanguageExplanation: `This ${category.toLowerCase()} was uploaded to your MediVault record. It contains lab/diagnostic results from ${currentHospital.name}. Check with your doctor to interpret any flagged values.`,
      testResults: testResults || extractedData?.results?.map(r => ({ test: r.param, value: r.value, reference: r.normalRange, status: r.flag })) || [],
      diagnoses: extractedData?.diagnosis ? [{ code: 'AI-OCR', name: extractedData.diagnosis, status: 'Extracted' }] : [],
      medications: extractedData?.medicines?.map(m => ({ drug: m.name, dosage: m.dosage, frequency: m.frequency, duration: m.duration, instructions: 'As per upload' })) || [],
      isImmutable: true,
      fileAttachment: fileAttachment || {
        name: `${category.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
        size: '640 KB',
        ocrExtracted: true
      }
    };

    setRecords(prev => [newRecord, ...prev]);
    addAuditLog('UPLOAD_MEDICAL_DOCUMENT', `Uploaded and categorized ${category} document. AI OCR parsed entities.`, newRecId, `${patient?.name} (${patientId})`);
    showToast('Document Stored', `${title || category} uploaded and added to patient medical timeline.`, 'success');
    return newRecord;
  };

  // Update existing medical record (by Doctor)
  const updateMedicalRecord = (recordId, updatedData) => {
    const existing = records.find(r => r.id === recordId);
    if (existing && currentRole === 'doctor') {
      const isAuthor = (existing.doctorId && currentDoctor?.id && existing.doctorId === currentDoctor.id) ||
        (existing.doctorName && currentDoctor?.name && (
          existing.doctorName.toLowerCase().includes(currentDoctor.name.toLowerCase().split(',')[0].trim()) ||
          currentDoctor.name.toLowerCase().includes(existing.doctorName.toLowerCase().split(',')[0].trim())
        ));

      if (!isAuthor) {
        showToast(
          'Permission Denied',
          `Cannot edit record authored by ${existing.doctorName || 'another doctor'}. You can only edit records you have personally authored.`,
          'error'
        );
        return false;
      }
    }

    setRecords(prev => prev.map(r => r.id === recordId ? { ...r, ...updatedData } : r));
    addAuditLog('EDIT_PATIENT_MEDICAL_RECORD', `Doctor ${currentDoctor?.name || 'Doctor'} edited their signed record ${recordId}.`, recordId);
    showToast('Record Updated', `Medical record ${recordId} successfully saved and signed.`, 'success');
    return true;
  };

  // Update patient clinical profile (e.g. chronic conditions, allergies, currentMed, vitals)
  const updatePatientProfile = (patientId, updatedData) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...updatedData } : p));
    addAuditLog('UPDATE_PATIENT_CLINICAL_PROFILE', `Doctor updated clinical profile for patient ${patientId}.`, 'N/A', `${updatedData.name || patientId}`);
    showToast('Patient Record Updated', 'Patient medical profile and active prescriptions updated.', 'success');
  };

  // Check if active user/doctor has authorized access to a patient's records from another hospital
  const hasAccessToRecord = (record, requestingHospitalId = currentHospital.id, patientId = record.patientId) => {
    // If own hospital record, always accessible
    if (record.hospitalId === requestingHospitalId) return true;

    // If viewing as the patient themselves, always accessible
    if (currentRole === 'patient') return true;

    // Check if there is an active temporary consent token
    const activeConsent = consentRequests.find(
      c => c.patientId === patientId && c.requestingHospitalId === requestingHospitalId && c.status === 'APPROVED_ACTIVE'
    );

    return !!activeConsent;
  };

  // Reset demo state
  const resetDemoData = () => {
    localStorage.removeItem('medivault_patients');
    localStorage.removeItem('medivault_records');
    localStorage.removeItem('medivault_visits');
    localStorage.removeItem('medivault_consents');
    localStorage.removeItem('medivault_audit');
    setPatients(PATIENTS);
    setRecords(MEDICAL_RECORDS);
    setActiveVisits(ACTIVE_VISITS);
    setConsentRequests(CONSENT_REQUESTS);
    setAuditLogs(AUDIT_TRAIL);
    showToast('Data Reset', 'Restored default MediVault demo state and test scenarios.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        // Roles & Identities
        currentRole,
        switchRole,
        activeHospitalId,
        setActiveHospitalId,
        currentHospital,
        activePatientId,
        setActivePatientId,
        currentPatient,
        activeDoctorId,
        setActiveDoctorId,
        currentDoctor,
        activeAssistantId,
        setActiveAssistantId,
        currentAssistant,

        // Data Stores
        hospitals,
        doctors,
        assistants,
        patients,
        records,
        activeVisits,
        consentRequests,
        auditLogs,
        notifications,
        toasts,

        // Actions
        showToast,
        removeToast,
        addAuditLog,
        registerPatient,
        checkInPatient,
        endVisit,
        requestInterHospitalConsent,
        respondConsentRequest,
        revokeConsent,
        addConsultationRecord,
        updateMedicalRecord,
        updatePatientProfile,
        uploadDocumentRecord,
        hasAccessToRecord,
        resetDemoData,
        ocrSamples: MOCK_OCR_SAMPLES
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
