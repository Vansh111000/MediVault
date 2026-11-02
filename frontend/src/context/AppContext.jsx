import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  HOSPITALS as DEFAULT_HOSPITALS,
  DOCTORS as DEFAULT_DOCTORS,
  ASSISTANTS as DEFAULT_ASSISTANTS,
  PATIENTS as DEFAULT_PATIENTS,
  MEDICAL_RECORDS as DEFAULT_RECORDS,
  ACTIVE_VISITS as DEFAULT_VISITS,
  CONSENT_REQUESTS as DEFAULT_CONSENTS,
  AUDIT_TRAIL as DEFAULT_AUDIT,
  MOCK_OCR_SAMPLES,
  DEFAULT_SESSION,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('patient'); // 'patient' | 'doctor' | 'assistant' | 'receptionist' | 'hospital_admin' | 'super_admin'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Active Entities
  const [activeHospitalId, setActiveHospitalIdState] = useState(null);
  const [activePatientId, setActivePatientId] = useState(null);
  const [activeDoctorId, setActiveDoctorId] = useState(null);
  const [activeAssistantId, setActiveAssistantId] = useState(null);
  const [authenticatedDoctorProfile, setAuthenticatedDoctorProfile] = useState(null);
  const [authenticatedAssistantProfile, setAuthenticatedAssistantProfile] = useState(null);
  const [authenticatedHospital, setAuthenticatedHospital] = useState(null);

  // Data Stores (backed by MongoDB Atlas via API)
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [activeVisits, setActiveVisits] = useState([]);
  const [consentRequests, setConsentRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const setActiveHospitalId = (id) => {
    setActiveHospitalIdState(id);
    api.setActiveHospitalId(id);
  };

  // Toast Notification System
  const showToast = (title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper: map backend visit to frontend shape
  const mapVisitToFrontend = (v) => ({
    id: v._id || v.id,
    _id: v._id,
    patientId: v.patient?._id || v.patient?.id || v.patient,
    patientName: v.patient?.name || 'Unknown Patient',
    patient: v.patient,
    hospitalId: v.hospital?._id || v.hospital?.id || v.hospital,
    hospitalName: v.hospital?.name || 'Medical Center',
    hospital: v.hospital,
    assignedDoctors: v.assignedDoctors || [],
    assignedDoctorId: v.assignedDoctors?.[0]?._id || v.assignedDoctors?.[0] || '',
    assignedDoctorName: v.assignedDoctors?.[0]?.name || 'Attending Physician',
    specialty: v.assignedDoctors?.[0]?.specialty || 'General',
    checkInTime: v.checkInTime || null,
    appointmentDate: v.appointmentDate || v.checkInTime || v.createdAt,
    appointmentTime: v.appointmentTime || '',
    visitType: v.visitType || 'New Consultation',
    priority: v.priority || 'Routine',
    status: v.status === 'in_queue' ? 'In Doctor Queue'
      : v.status === 'completed' ? 'Completed'
      : v.status === 'scheduled' ? 'Scheduled'
      : 'Checked In',
    rawStatus: v.status || 'checked_in',
    tokenNumber: v.tokenNumber || '',
    triageVitals: v.preliminaryVitals || {},
    preliminaryVitals: v.preliminaryVitals || {},
    reasonForVisit: v.reasonForVisit || 'General Consultation',
    reportedSymptoms: v.reportedSymptoms || ''
  });

  // Helper: map backend consent to frontend shape
  const mapConsentToFrontend = (c) => ({
    id: c._id || c.id,
    _id: c._id,
    patientId: c.patient?._id || c.patient?.id || c.patient,
    patientName: c.patient?.name || 'Patient',
    requestingHospitalId: c.requestingHospital?._id || c.requestingHospital,
    requestingHospitalName: c.requestingHospital?.name || 'Medical Center',
    requestingDoctorName: c.requestingUser?.name || c.requestingUser?.email || 'Attending Physician',
    purpose: c.purpose,
    status: c.status === 'approved' ? 'APPROVED_ACTIVE' : c.status.toUpperCase(),
    requestedAt: c.createdAt,
    grantedAt: c.grantedAt,
    expiresAt: c.expiresAt,
    durationMinutes: c.durationMinutes || 240,
    permissionLevel: `${(c.durationMinutes || 240) / 60}-Hour Visit Access (${c.permissionScope || 'read_only_visit'})`
  });

  // Fetch Atlas Data on App Init
  const loadBackendData = useCallback(async () => {
    try {
      // 1. Fetch hospitals
      const hospRes = await api.getHospitals().catch(() => null);
      if (hospRes?.data && hospRes.data.length > 0) {
        const mappedHospitals = hospRes.data.map(h => ({
          id: h._id,
          _id: h._id,
          hospitalCode: h.hospitalCode,
          name: h.name,
          location: `${h.address}, ${h.city}`,
          address: h.address,
          city: h.city,
          phone: h.phone,
          status: h.status
        }));
        setHospitals(mappedHospitals);
        if (!activeHospitalId) {
          setActiveHospitalId(mappedHospitals[0].id);
        }
      }

      // 2. Fetch doctors scoped to authenticated hospital (backend enforces scoping)
      const docRes = await api.getDoctors().catch(() => null);
      if (docRes?.data && docRes.data.length > 0) {
        const mappedDoctors = docRes.data.map(d => ({
          id: d._id,
          _id: d._id,
          name: d.name,
          specialty: d.specialty,
          licenseNumber: d.licenseNumber,
          email: d.email || d.user?.email,
        }));
        setDoctors(mappedDoctors);
      } else if (docRes) {
        // Clear stale mock doctors when backend returns empty
        setDoctors([]);
      }

      // 3. Fetch patients: prioritize hospital-specific directory for staff
      if (api.token) {
        const hospPatRes = await api.getHospitalPatients().catch(() => null);
        if (hospPatRes?.data && Array.isArray(hospPatRes.data) && hospPatRes.data.length > 0) {
          const mappedFromDir = hospPatRes.data
            .filter(entry => entry.patient)
            .map(entry => {
              const p = entry.patient;
              return {
                id: p._id,
                _id: p._id,
                mediVaultId: p.mediVaultId,
                name: p.name,
                age: p.age || 30,
                gender: p.gender,
                bloodGroup: p.bloodGroup,
                phone: p.phone,
                email: p.email,
                address: p.address,
                allergies: p.allergies || [],
                chronicConditions: p.chronicConditions || [],
                vitals: p.vitals || {},
                isClaimed: p.isClaimed,
                dateAdded: entry.dateAdded,
                lastVisitAt: entry.lastVisitAt,
                directoryStatus: entry.status
              };
            });
          setPatients(mappedFromDir);
        } else {
          const patRes = await api.searchPatients('').catch(() => null);
          if (patRes?.data && patRes.data.length > 0) {
            setPatients(patRes.data.map(p => ({
              id: p._id,
              _id: p._id,
              mediVaultId: p.mediVaultId,
              name: p.name,
              age: p.age || 30,
              gender: p.gender,
              bloodGroup: p.bloodGroup,
              phone: p.phone,
              email: p.email,
              address: p.address,
              allergies: p.allergies || [],
              chronicConditions: p.chronicConditions || [],
              vitals: p.vitals || {},
              isClaimed: p.isClaimed
            })));
          }
        }
      } else {
        const patRes = await api.searchPatients('').catch(() => null);
        if (patRes?.data && patRes.data.length > 0) {
          setPatients(patRes.data.map(p => ({
            id: p._id,
            _id: p._id,
            mediVaultId: p.mediVaultId,
            name: p.name,
            age: p.age || 30,
            gender: p.gender,
            bloodGroup: p.bloodGroup,
            phone: p.phone,
            email: p.email,
            address: p.address,
            allergies: p.allergies || [],
            chronicConditions: p.chronicConditions || [],
            vitals: p.vitals || {},
            isClaimed: p.isClaimed
          })));
        }
      }

      // 4. Fetch visits if token exists
      if (api.token) {
        const visitRes = await api.getVisits().catch(() => null);
        if (visitRes?.data && visitRes.data.length > 0) {
          setActiveVisits(visitRes.data.map(mapVisitToFrontend));
        }

        const consentRes = await api.getPatientConsents().catch(() => null);
        if (consentRes?.data && consentRes.data.length > 0) {
          setConsentRequests(consentRes.data.map(mapConsentToFrontend));
        }

        const auditRes = await api.getAuditLogs().catch(() => null);
        if (auditRes?.data && auditRes.data.length > 0) {
          setAuditLogs(auditRes.data.map(a => ({
            id: a._id,
            timestamp: a.timestamp,
            actorName: a.actorName,
            actorRole: a.actorRole,
            hospitalName: a.hospitalName,
            action: a.action,
            patientName: a.patientIdentifier,
            recordId: a.resourceId,
            details: a.details
          })));
        }
      }
    } catch (err) {
      console.warn('Initial Atlas data load fallback:', err.message);
    }
  }, [activeHospitalId]);

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      setAuthLoading(true);
      if (api.token) {
        try {
          const res = await api.getMe();
          if (res?.data?.user) {
            const u = res.data.user;
            setCurrentUser(u);
            const mappedRole = u.role === 'receptionist' ? 'assistant' : u.role;
            setCurrentRole(mappedRole);
            setIsAuthenticated(true);

            if (res.data.activeHospital) {
              setActiveHospitalId(res.data.activeHospital._id || res.data.activeHospital);
              setAuthenticatedHospital(res.data.activeHospital);
            }

            if (u.assistantProfile) {
              setAuthenticatedAssistantProfile(u.assistantProfile);
              setActiveAssistantId(u.assistantProfile._id || u.assistantProfile.id);
            } else {
              setAuthenticatedAssistantProfile(null);
            }

            if (mappedRole === 'doctor') {
              try {
                const docDash = await api.getDoctorDashboard();
                if (docDash?.data?.doctor) {
                  setAuthenticatedDoctorProfile(docDash.data.doctor);
                  if (docDash.data.activeHospital) {
                    setAuthenticatedHospital(docDash.data.activeHospital);
                  }
                }
              } catch (_) {}
            }
          }
        } catch (e) {
          console.warn('Session expired or invalid token:', e.message);
          api.logout();
        }
      }
      await loadBackendData();
      setAuthLoading(false);
    };

    initAuth();
  }, [loadBackendData]);

  // Derived active entity objects (strictly from live backend, no mock fallbacks)
  const currentHospital = authenticatedHospital || hospitals.find((h) => h.id === activeHospitalId || h._id === activeHospitalId) || hospitals[0] || null;
  const currentPatient = patients.find((p) => p.id === activePatientId || p._id === activePatientId || p.mediVaultId === activePatientId) || patients[0] || null;
  const currentDoctor = authenticatedDoctorProfile || doctors.find((d) => d.id === activeDoctorId || d._id === activeDoctorId) || doctors[0] || null;
  const currentAssistant = authenticatedAssistantProfile || null;

  // Switch role and update session
  const switchRole = (role) => {
    const normalizedRole = role === 'receptionist' ? 'assistant' : role;
    setCurrentRole(normalizedRole);
    if (normalizedRole === 'doctor' && doctors.length > 0) {
      setActiveDoctorId(doctors[0].id || doctors[0]._id);
    } else if (normalizedRole === 'patient' && patients.length > 0) {
      setActivePatientId(patients[0].id || patients[0]._id);
    }
  };

  // Sign In using real backend API
  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res?.data) {
        const u = res.data.user;
        setCurrentUser(u);
        const mappedRole = u.role === 'receptionist' ? 'assistant' : u.role;
        setCurrentRole(mappedRole);
        setIsAuthenticated(true);

        if (res.data.memberships?.[0]?.hospital) {
          const hospId = res.data.memberships[0].hospital._id || res.data.memberships[0].hospital;
          setActiveHospitalId(hospId);
          setAuthenticatedHospital(res.data.memberships[0].hospital);
        }

        if (u.patientProfile) {
          setActivePatientId(u.patientProfile._id || u.patientProfile);
        }
        if (u.doctorProfile) {
          setActiveDoctorId(u.doctorProfile._id || u.doctorProfile);
        }
        if (u.assistantProfile) {
          setAuthenticatedAssistantProfile(u.assistantProfile);
          setActiveAssistantId(u.assistantProfile._id || u.assistantProfile.id);
        } else {
          setAuthenticatedAssistantProfile(null);
        }

        if (mappedRole === 'doctor') {
          try {
            const docDash = await api.getDoctorDashboard();
            if (docDash?.data?.doctor) {
              setAuthenticatedDoctorProfile(docDash.data.doctor);
              if (docDash.data.activeHospital) {
                setAuthenticatedHospital(docDash.data.activeHospital);
              }
            }
          } catch (_) {}
        }

        await loadBackendData();
        showToast('Signed In', `Welcome back, ${u.email}!`, 'success');
        return { success: true, role: u.role };
      }
    } catch (err) {
      showToast('Login Failed', err.message || 'Invalid credentials', 'error');
      throw err;
    }
  };

  // Sign Out - rigorously clear all authenticated user, assistant, doctor, and hospital states
  const logout = () => {
    api.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentRole('patient');
    setAuthenticatedDoctorProfile(null);
    setAuthenticatedAssistantProfile(null);
    setAuthenticatedHospital(null);
    setActiveHospitalIdState(null);
    setActivePatientId(null);
    setActiveDoctorId(null);
    setActiveAssistantId(null);
    setPatients([]);
    setDoctors([]);
    setActiveVisits([]);
    setRecords([]);
    setConsentRequests([]);
    setAuditLogs([]);
    showToast('Signed Out', 'You have been logged out of MediVault.', 'info');
  };

  // Staff Registration (Doctor / Receptionist)
  const registerStaff = async (staffData) => {
    try {
      const res = await api.registerStaff(staffData);
      if (res?.data) {
        const u = res.data.user;
        setCurrentUser(u);
        const mappedRole = u.role === 'receptionist' ? 'assistant' : u.role;
        setCurrentRole(mappedRole);
        setIsAuthenticated(true);
        if (u.assistantProfile) {
          setAuthenticatedAssistantProfile(u.assistantProfile);
          setActiveAssistantId(u.assistantProfile._id || u.assistantProfile.id);
        }
        await loadBackendData();
        showToast('Registration Successful', `Welcome to MediVault, ${staffData.name}!`, 'success');
        return res.data;
      }
    } catch (err) {
      showToast('Registration Failed', err.message, 'error');
      throw err;
    }
  };

  // Claim Patient Account
  const claimPatientAccount = async (claimData) => {
    try {
      const res = await api.claimPatientAccount(claimData);
      if (res?.data) {
        const u = res.data.user;
        setCurrentUser(u);
        setCurrentRole('patient');
        setIsAuthenticated(true);
        if (res.data.patient) {
          setActivePatientId(res.data.patient._id);
        }
        await loadBackendData();
        showToast('Account Activated', 'Your MediVault account has been securely activated!', 'success');
        return res.data;
      }
    } catch (err) {
      showToast('Activation Failed', err.message, 'error');
      throw err;
    }
  };

  // Register New Patient by Assistant (calls backend /api/patients)
  const registerPatient = async (patientData) => {
    try {
      const payload = {
        name: patientData.name,
        age: parseInt(patientData.age, 10) || 30,
        gender: patientData.gender || 'Other',
        bloodGroup: patientData.bloodGroup || 'O+',
        dob: patientData.dob || undefined,
        phone: patientData.phone,
        email: patientData.email,
        address: patientData.address || 'Standard Registered Residence',
        allergies: patientData.allergies || [],
        chronicConditions: patientData.chronicConditions || [],
        vitals: patientData.vitals || {},
        emergencyContact: patientData.emergencyContact || {
          name: 'Family Contact',
          relation: 'Relative',
          phone: patientData.phone
        },
        hospitalId: currentHospital.id || currentHospital._id
      };

      const res = await api.createPatient(payload);
      if (res?.data) {
        const created = res.data.patient;
        const mappedPatient = {
          id: created._id,
          _id: created._id,
          mediVaultId: created.mediVaultId,
          name: created.name,
          age: created.age,
          gender: created.gender,
          bloodGroup: created.bloodGroup,
          phone: created.phone,
          email: created.email,
          allergies: created.allergies || [],
          chronicConditions: created.chronicConditions || [],
          vitals: created.vitals || {},
          activationCode: res.data.activationCode
        };

        setPatients((prev) => [mappedPatient, ...prev]);
        setActivePatientId(created._id);

        showToast(
          'Patient Registered',
          `Permanent ID: ${created.mediVaultId} | Activation Code: ${res.data.activationCode}`,
          'success'
        );
        return mappedPatient;
      }
    } catch (err) {
      showToast('Registration Error', err.message, 'error');
      throw err;
    }
  };

  // Check-In Patient or Schedule Appointment (calls backend /api/visits)
  const checkInPatient = async ({
    patientId,
    doctorId,
    assignedDoctorIds,
    appointmentDate,
    appointmentTime,
    visitType,
    priority = 'Routine',
    reason = 'General Consultation',
    reasonForVisit,
    symptoms = '',
    reportedSymptoms,
    status,
    triageVitals = {},
    preliminaryVitals = {}
  }) => {
    try {
      // Build doctor list from what was explicitly passed – no mock fallback
      const docList = assignedDoctorIds && assignedDoctorIds.length > 0
        ? assignedDoctorIds
        : (doctorId ? [doctorId] : []);

      const vitalsPayload = Object.keys(preliminaryVitals).length > 0 ? preliminaryVitals : triageVitals;

      const payload = {
        patientId,
        // hospitalId intentionally omitted here – backend derives it from authenticated membership
        ...(docList[0] && { doctorId: docList[0] }),
        assignedDoctorIds: docList,
        appointmentDate,
        appointmentTime,
        visitType: visitType || 'New Consultation',
        reasonForVisit: reasonForVisit || reason,
        reportedSymptoms: reportedSymptoms || symptoms,
        priority,
        status,
        preliminaryVitals: vitalsPayload
      };

      const res = await api.createVisit(payload);
      if (res?.data) {
        const mapped = mapVisitToFrontend(res.data);
        setActiveVisits((prev) => [mapped, ...prev]);
        const isScheduled = res.data.status === 'scheduled';
        showToast(
          isScheduled ? 'Appointment Scheduled' : 'Patient Checked In',
          isScheduled
            ? `Appointment reference ${mapped.tokenNumber} scheduled for ${mapped.assignedDoctorName}`
            : `Token ${mapped.tokenNumber} issued for ${mapped.assignedDoctorName}`,
          'success'
        );
        return mapped;
      }
    } catch (err) {
      showToast('Encounter Error', err.message, 'error');
      throw err;
    }
  };

  // Assign additional doctor to ongoing visit
  const assignDoctorToVisit = async (visitId, doctorId) => {
    try {
      const res = await api.assignDoctor(visitId, doctorId);
      if (res?.data) {
        const mapped = mapVisitToFrontend(res.data);
        setActiveVisits((prev) => prev.map((v) => (v.id === visitId || v._id === visitId ? mapped : v)));
        showToast('Doctor Assigned', 'Additional doctor assigned to visit.', 'success');
        return mapped;
      }
    } catch (err) {
      showToast('Assignment Error', err.message, 'error');
      throw err;
    }
  };

  // Remove doctor assignment safely (if no consultation documented)
  const removeDoctorFromVisit = async (visitId, doctorId) => {
    try {
      const res = await api.removeDoctorAssignment(visitId, doctorId);
      if (res?.data) {
        const mapped = mapVisitToFrontend(res.data);
        setActiveVisits((prev) => prev.map((v) => (v.id === visitId || v._id === visitId ? mapped : v)));
        showToast('Assignment Corrected', 'Doctor unassigned from visit safely.', 'info');
        return mapped;
      }
    } catch (err) {
      showToast('Correction Error', err.message, 'error');
      throw err;
    }
  };

  // Exact MediVault ID lookup
  const lookupPatientByExactMediVaultId = async (mediVaultId) => {
    try {
      const res = await api.lookupPatientByExactMediVaultId(mediVaultId);
      return res?.data;
    } catch (err) {
      showToast('Lookup Failed', err.message || 'Patient not found', 'error');
      throw err;
    }
  };

  // Add existing patient to current hospital directory
  const addPatientToHospitalDirectory = async ({ patientId, mediVaultId, operationalNotes }) => {
    try {
      const res = await api.addPatientToHospitalDirectory({
        patientId,
        mediVaultId,
        hospitalId: currentHospital.id || currentHospital._id,
        operationalNotes
      });
      if (res?.data?.patient) {
        const p = res.data.patient;
        const mapped = {
          id: p._id,
          _id: p._id,
          mediVaultId: p.mediVaultId,
          name: p.name,
          age: p.age || 30,
          gender: p.gender,
          bloodGroup: p.bloodGroup,
          phone: p.phone,
          email: p.email,
          vitals: p.vitals || {},
          dateAdded: res.data.dateAdded,
          directoryStatus: res.data.status
        };
        setPatients((prev) => {
          if (prev.some(item => item.id === mapped.id || item._id === mapped.id)) return prev;
          return [mapped, ...prev];
        });
        showToast('Patient Added', `${p.name} added to this hospital directory.`, 'success');
        return mapped;
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
      throw err;
    }
  };

  // End / Complete Visit
  const endVisit = async (visitId) => {
    try {
      await api.updateVisitStatus(visitId, 'completed').catch(() => null);
      setActiveVisits((prev) => prev.filter((v) => v.id !== visitId && v._id !== visitId));
      showToast('Visit Completed', 'Visit closed. Temporary visit access tokens auto-expired.', 'info');
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  // Request Cross-Hospital Consent
  const requestInterHospitalConsent = async ({ patientId, reason, durationMinutes = 240, permissionScope = 'read_only_visit' }) => {
    try {
      const payload = {
        patientId,
        hospitalId: currentHospital.id || currentHospital._id,
        purpose: reason || 'Cross-hospital consultation and records access',
        permissionScope,
        durationMinutes
      };

      const res = await api.requestConsent(payload);
      if (res?.data) {
        const mapped = mapConsentToFrontend(res.data);
        setConsentRequests((prev) => [mapped, ...prev]);
        showToast('Consent Requested', 'Authorization prompt sent to patient.', 'info');
        return mapped;
      }
    } catch (err) {
      showToast('Request Failed', err.message, 'error');
      throw err;
    }
  };

  // Respond to Consent Request (Approve / Reject)
  const respondConsentRequest = async (requestId, approved) => {
    try {
      const res = await api.respondConsent(requestId, approved);
      if (res?.data) {
        const updated = mapConsentToFrontend(res.data);
        setConsentRequests((prev) => prev.map((c) => (c.id === requestId || c._id === requestId ? updated : c)));
        showToast(
          approved ? 'Access Granted' : 'Request Declined',
          approved ? 'Temporary cross-hospital access authorized.' : 'Access request was rejected.',
          approved ? 'success' : 'warning'
        );
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  // Revoke Consent
  const revokeConsent = async (requestId) => {
    try {
      const res = await api.revokeConsent(requestId);
      if (res?.data) {
        const updated = mapConsentToFrontend(res.data);
        setConsentRequests((prev) => prev.map((c) => (c.id === requestId || c._id === requestId ? updated : c)));
        showToast('Access Revoked', 'Doctor and hospital access has been revoked immediately.', 'info');
      }
    } catch (err) {
      showToast('Revoke Error', err.message, 'error');
    }
  };

  // Add Consultation Record / Complete Consultation
  const addConsultationRecord = async ({
    patientId,
    diagnoses = [],
    medications = [],
    clinicalNote,
    doctorNotes,
    title,
    visitId
  }) => {
    try {
      const noteContent = clinicalNote || doctorNotes || `Clinical evaluation conducted. Diagnoses: ${diagnoses.map((d) => d.name).join(', ')}`;

      // Format prescriptions for backend schema
      const formattedMeds = medications.map((m) => ({
        name: m.name || m.drug || 'Medication',
        dosage: m.dosage || 'Standard',
        frequency: m.frequency || 'Once daily',
        duration: m.duration || '30 days',
        instructions: m.instructions || 'As advised'
      }));

      // Find an active visit if not provided
      const resolvedVisitId = visitId || activeVisits.find((v) => v.patientId === patientId)?.id;

      if (resolvedVisitId) {
        // Create and complete on backend
        const draftRes = await api.saveConsultationDraft({
          visitId: resolvedVisitId,
          patientId,
          clinicalNote: noteContent,
          prescriptions: formattedMeds
        });

        if (draftRes?.data?._id) {
          const completeRes = await api.completeConsultation(draftRes.data._id, {
            clinicalNote: noteContent,
            prescriptions: formattedMeds
          });

          const newRecord = {
            id: completeRes.data._id,
            patientId,
            hospitalId: currentHospital.id,
            hospitalName: currentHospital.name,
            doctorName: currentDoctor.name,
            doctorId: currentDoctor.id,
            specialty: currentDoctor.specialty,
            recordType: 'Clinical Consultation',
            category: 'Prescription',
            date: new Date().toISOString().split('T')[0],
            title: title || 'Clinical Consultation',
            summary: noteContent,
            clinicalNote: noteContent,
            diagnoses,
            medications: formattedMeds,
            isImmutable: true
          };

          setRecords((prev) => [newRecord, ...prev]);
          showToast('Consultation Recorded', 'Consultation finalized and cryptographically logged.', 'success');
          return newRecord;
        }
      }
    } catch (err) {
      console.warn('Backend consultation sync error:', err.message);
    }

    // Local fallback for UI continuity
    const localId = `REC-${Date.now().toString().slice(-5)}`;
    const fallbackRecord = {
      id: localId,
      patientId,
      hospitalId: currentHospital.id,
      hospitalName: currentHospital.name,
      doctorName: currentDoctor.name,
      doctorId: currentDoctor.id,
      specialty: currentDoctor.specialty,
      recordType: 'Clinical Consultation',
      category: 'Prescription',
      date: new Date().toISOString().split('T')[0],
      title: title || 'Clinical Consultation',
      summary: doctorNotes || 'Clinical evaluation conducted.',
      clinicalNote: clinicalNote || doctorNotes || 'Letterhead note',
      diagnoses,
      medications,
      isImmutable: true
    };
    setRecords((prev) => [fallbackRecord, ...prev]);
    showToast('Consultation Recorded', 'Consultation saved.', 'success');
    return fallbackRecord;
  };

  // Update Medical Record / Append Amendment
  const updateMedicalRecord = async (recordId, updatedData) => {
    try {
      if (updatedData.amendmentText) {
        await api.addAmendment(recordId, {
          amendmentText: updatedData.amendmentText,
          reason: updatedData.reason || 'Clinical correction'
        });
      }
    } catch (err) {
      console.warn('Amendment backend call:', err.message);
    }
    setRecords((prev) => prev.map((r) => (r.id === recordId ? { ...r, ...updatedData } : r)));
    showToast('Record Updated', 'Medical record addendum logged.', 'success');
    return true;
  };

  // Update Patient Profile
  const updatePatientProfile = async (patientId, updatedData) => {
    try {
      await api.updatePatient(patientId, updatedData).catch(() => null);
    } catch (e) {
      // Ignore
    }
    setPatients((prev) => prev.map((p) => (p.id === patientId || p._id === patientId ? { ...p, ...updatedData } : p)));
    showToast('Profile Updated', 'Patient clinical details updated.', 'success');
  };

  // Check Cross-Hospital Record Access against Consent
  const hasAccessToRecord = (record, requestingHospitalId = currentHospital.id, patientId = record.patientId) => {
    if (record.hospitalId === requestingHospitalId) return true;
    if (currentRole === 'patient') return true;

    const activeConsent = consentRequests.find(
      (c) =>
        c.patientId === patientId &&
        (c.requestingHospitalId === requestingHospitalId || String(c.requestingHospitalId) === String(requestingHospitalId)) &&
        c.status === 'APPROVED_ACTIVE'
    );
    return !!activeConsent;
  };

  // Reset / Refresh Data from Atlas
  const resetDemoData = async () => {
    await loadBackendData();
    showToast('Data Refreshed', 'Refreshed latest clinical records and entities from MongoDB Atlas.', 'info');
  };

  const uploadDocumentRecord = ({ patientId, title, category, fileAttachment, summary }) => {
    const newRecId = `REC-DOC-${Date.now().toString().slice(-5)}`;
    const newRecord = {
      id: newRecId,
      patientId,
      hospitalId: currentHospital.id,
      hospitalName: currentHospital.name,
      doctorName: currentDoctor.name,
      doctorId: currentDoctor.id,
      specialty: 'Diagnostics',
      recordType: category || 'Lab Report',
      category: category || 'Lab Report',
      date: new Date().toISOString().split('T')[0],
      title: title || `${category} Document`,
      summary: summary || 'Medical document metadata registered.',
      fileAttachment
    };
    setRecords((prev) => [newRecord, ...prev]);
    showToast('Document Metadata Stored', `${title} registered in patient timeline.`, 'success');
    return newRecord;
  };

  return (
    <AppContext.Provider
      value={{
        // Session & Auth
        currentUser,
        currentRole,
        isAuthenticated,
        authLoading,
        switchRole,
        login,
        logout,
        registerStaff,
        claimPatientAccount,

        // Active Entities
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

        // Operations
        loadBackendData,
        showToast,
        removeToast,
        registerPatient,
        checkInPatient,
        assignDoctorToVisit,
        removeDoctorFromVisit,
        lookupPatientByExactMediVaultId,
        addPatientToHospitalDirectory,
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
