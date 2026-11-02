/**
 * MediVault API Service Layer
 * Single source of truth: MongoDB Atlas via backend Express API.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('medivault_token') || null;
    this.activeHospitalId = localStorage.getItem('medivault_hospital_id') || null;
    this.pendingPatientSummary = null;
    this.pendingRecordExplanations = new Map();
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('medivault_token', token);
    } else {
      localStorage.removeItem('medivault_token');
    }
  }

  setActiveHospitalId(hospitalId) {
    this.activeHospitalId = hospitalId;
    if (hospitalId) {
      localStorage.setItem('medivault_hospital_id', hospitalId);
    } else {
      localStorage.removeItem('medivault_hospital_id');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (this.activeHospitalId) {
      headers['x-hospital-id'] = this.activeHospitalId;
    }

    const config = {
      ...options,
      headers
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
      throw err;
    }
  }

  // --- Auth Endpoints ---
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async registerStaff(staffData) {
    const res = await this.request('/auth/register-staff', {
      method: 'POST',
      body: staffData
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async claimPatientAccount(claimData) {
    const res = await this.request('/auth/claim-patient', {
      method: 'POST',
      body: claimData
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  logout() {
    this.setToken(null);
    this.setActiveHospitalId(null);
  }

  // --- Hospitals ---
  async getHospitals(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/hospitals${query ? `?${query}` : ''}`);
  }

  async getHospitalById(id) {
    return this.request(`/hospitals/${id}`);
  }

  // --- Patients ---
  async searchPatients(query = '') {
    return this.request(`/patients/search?q=${encodeURIComponent(query)}`);
  }

  async createPatient(patientData) {
    return this.request('/patients', {
      method: 'POST',
      body: patientData
    });
  }

  async getPatient(id) {
    return this.request(`/patients/${id}`);
  }

  async updatePatient(id, patientData) {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: patientData
    });
  }

  async reissueActivationCode(patientId) {
    return this.request(`/patients/${patientId}/reissue-code`, {
      method: 'POST'
    });
  }

  async getPatientMedicalHistory(patientId) {
    return this.request(`/patients/${patientId}/history`);
  }

  async generatePatientAiSummary() {
    if (!this.pendingPatientSummary) {
      this.pendingPatientSummary = this.request('/ai/patient/summary', { method: 'POST', body: {} })
        .finally(() => { this.pendingPatientSummary = null; });
    }
    return this.pendingPatientSummary;
  }

  async explainPatientRecord(recordId) {
    if (!this.pendingRecordExplanations.has(recordId)) {
      const request = this.request('/ai/patient/explain-record', { method: 'POST', body: { recordId } })
        .finally(() => this.pendingRecordExplanations.delete(recordId));
      this.pendingRecordExplanations.set(recordId, request);
    }
    return this.pendingRecordExplanations.get(recordId);
  }

  // --- Visits ---
  async createVisit(visitData) {
    return this.request('/visits', {
      method: 'POST',
      body: visitData
    });
  }

  async getVisits(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/visits${query ? `?${query}` : ''}`);
  }

  async getVisitById(id) {
    return this.request(`/visits/${id}`);
  }

  async updateVisitStatus(id, status) {
    return this.request(`/visits/${id}/status`, {
      method: 'PATCH',
      body: { status }
    });
  }

  async assignDoctor(visitId, doctorId) {
    return this.request(`/visits/${visitId}/assign-doctor`, {
      method: 'POST',
      body: { doctorId }
    });
  }

  async removeDoctorAssignment(visitId, doctorId) {
    return this.request(`/visits/${visitId}/remove-doctor`, {
      method: 'POST',
      body: { doctorId }
    });
  }

  // --- Hospital Patient Directory ---
  async getHospitalPatients(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/hospital-patients${query ? `?${query}` : ''}`);
  }

  async lookupPatientByExactMediVaultId(mediVaultId) {
    return this.request(`/hospital-patients/lookup?mediVaultId=${encodeURIComponent(mediVaultId)}`);
  }

  async addPatientToHospitalDirectory(data) {
    return this.request('/hospital-patients', {
      method: 'POST',
      body: data
    });
  }

  // --- Doctors ---
  async getDoctors(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/doctors${query ? `?${query}` : ''}`);
  }

  async getDoctorDashboard() {
    return this.request('/doctors/dashboard');
  }

  // --- Consultations ---
  async saveConsultationDraft(draftData) {
    return this.request('/consultations/draft', {
      method: 'POST',
      body: draftData
    });
  }

  async completeConsultation(id, data) {
    return this.request(`/consultations/${id}/complete`, {
      method: 'POST',
      body: data
    });
  }

  async addAmendment(id, amendmentData) {
    return this.request(`/consultations/${id}/amendments`, {
      method: 'POST',
      body: amendmentData
    });
  }

  async getConsultationById(id) {
    return this.request(`/consultations/${id}`);
  }

  async getDoctorConsultations(status) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/consultations/doctor/my-consultations${query}`);
  }

  // --- Consents ---
  async requestConsent(consentData) {
    return this.request('/consents/request', {
      method: 'POST',
      body: consentData
    });
  }

  async getPatientConsents(patientId) {
    const endpoint = patientId ? `/consents/patient/${patientId}` : '/consents/patient';
    return this.request(endpoint);
  }

  async respondConsent(id, approved) {
    return this.request(`/consents/${id}/respond`, {
      method: 'POST',
      body: { approved }
    });
  }

  async revokeConsent(id) {
    return this.request(`/consents/${id}/revoke`, {
      method: 'POST'
    });
  }

  // --- Audit Logs ---
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/audit-logs${query ? `?${query}` : ''}`);
  }

  // --- Health ---
  async checkHealth() {
    return this.request('/health');
  }
}

export const api = new ApiService();
export default api;
