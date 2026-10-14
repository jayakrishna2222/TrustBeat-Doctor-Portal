/**
 * TrustBeat Backend API Client
 * Connects the React Doctor Web Application with the authoritative Django backend.
 */

export interface DoctorProfile {
  id: number
  doctor_id: string
  full_name: string
  email: string
  specialty: string
  license_number: string
  licensing_authority: string
  hospital_affiliation: string
  phone_number: string
  verification_status: 'pending' | 'under_review' | 'approved' | 'verified' | 'rejected' | 'suspended'
  is_verified: boolean
  email_verified: boolean
  identity_hash: string
  registered_at: string
  role?: string
  is_staff?: boolean
  is_active?: boolean
  bio?: string
  submitted_at?: string | null
  reviewed_at?: string | null
  reviewed_by_email?: string
  reviewed_by_name?: string
  review_notes?: string
  has_credential_document?: boolean
  credential_document_url?: string
  missing_requirements?: string[]
  preview_access_enabled?: boolean
  preview_status_label?: string
}

export interface RegisterDoctorPayload {
  full_name: string
  email: string
  password: string
  password_confirm: string
  license_number: string
  licensing_authority: string
  specialty?: string
  hospital_affiliation?: string
  phone_number?: string
}

export interface DoctorLookupResult {
  doctor_id: string
  name: string
  specialty: string
  hospital_affiliation: string
  verification_status: 'pending' | 'verified' | 'rejected'
  is_verified: boolean
}

export interface PatientDoctorRelationship {
  relationship_id: number
  doctor_id: string
  doctor_name: string
  specialty: string
  hospital_affiliation: string
  patient_id: number
  patient_name: string
  status: 'active' | 'revoked'
  granted_at: string
  revoked_at?: string | null
}

export interface ClinicalExplanation {
  name: string
  label: string
  importance: number
  contribution_pct: number
  direction: string
}

export interface RetinalAnalysisInfo {
  id: number
  status: string
  status_display?: string
  status_message?: string
  validation_passed?: boolean
  model_version?: string
  microvascular_index?: number | null
  arteriolar_narrowing_detected?: boolean | null
  venular_dilation_detected?: boolean | null
  image_url?: string | null
  gradcam_heatmap_url?: string | null
  predicted_label?: string | null
  confidence?: number | null
  created_at?: string
}

export interface KeyFindingItem {
  type: 'danger' | 'warning' | 'success' | 'info'
  label: string
  detail: string
}

export interface RecommendationItem {
  type: 'primary' | 'clinical' | 'lifestyle' | string
  title: string
  text: string
}

export interface ClinicalReport {
  id: number
  report_id: string
  assessment_id?: number | null
  patient_id: number
  patient_name: string
  patient_email?: string
  created_at: string
  age: number
  sex: string
  systolic_bp?: number | null
  diastolic_bp?: number | null
  total_cholesterol?: number | null
  hdl_cholesterol?: number | null
  bmi?: number | null
  smoking_status?: boolean | null
  diabetes_status?: boolean | null
  hypertension_treatment?: boolean | null
  is_extrapolated_age?: boolean
  model_type_used?: string
  clinical_recommendation?: string
  inference_engine?: string
  heart_rate?: number | null
  fasting_glucose?: number | null
  retinal_record?: RetinalAnalysisInfo | null
  key_findings?: KeyFindingItem[]
  recommendations?: RecommendationItem[]
  // Legacy fields
  cp?: string
  trestbps?: number | null
  chol?: number | null
  fbs?: boolean | null
  restecg?: string
  thalch?: number | null
  exang?: boolean
  oldpeak?: number
  slope?: string
  ca?: number
  thal?: string
  risk_percentage: number
  risk_probability: number
  risk_level: 'Low' | 'Moderate' | 'High' | string
  prediction: number
  result: string
  status: 'PENDING' | 'COMPLETED' | 'ARCHIVED' | string
  integrity_hash: string
  tx_hash: string
  blockchain_status: 'unregistered' | 'pending' | 'confirmed' | 'failed' | 'service_offline' | string
  on_chain_index?: number | null
  explanations?: ClinicalExplanation[]
  report_number?: string
  document_sha256?: string
  pdf_sha256?: string
  clinician_notes?: string
}

export interface ReportVerificationResponse {
  success: boolean
  verified: boolean
  status: 'CONFIRMED' | 'PENDING' | 'TAMPERED_MISMATCH' | 'SERVICE_OFFLINE' | 'UNREGISTERED' | string
  message: string
  report_id: string
  stored_hash?: string
  computed_hash?: string
  integrity_hash?: string
  tx_hash?: string
  record_index?: number
  block_timestamp?: number
  blockchain?: {
    connected: boolean
    tx_hash?: string | null
  }
}

export interface DoctorDashboardSummary {
  doctor: {
    doctor_id: string
    full_name: string
    specialty: string
    is_verified: boolean
  }
  stats: {
    total_patients: number
    total_reports: number
    high_risk_count: number
    moderate_risk_count: number
    low_risk_count: number
    verified_onchain_count: number
  }
  recent_reports: ClinicalReport[]
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/+$/, '')
const TOKEN_KEY = 'trustbeat_auth_token'
const REMEMBER_KEY = 'trustbeat_remember_me'
const DOCTOR_KEY = 'trustbeat_doctor_profile'

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export const setStoredAuth = (token: string, doctor: DoctorProfile, remember = false): void => {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
  storage.setItem(DOCTOR_KEY, JSON.stringify(doctor))
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, 'true')
  } else {
    localStorage.removeItem(REMEMBER_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(DOCTOR_KEY)
  }
}

export const getStoredDoctor = (): DoctorProfile | null => {
  const raw = localStorage.getItem(DOCTOR_KEY) || sessionStorage.getItem(DOCTOR_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DoctorProfile
  } catch {
    return null
  }
}

export const clearStoredAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(DOCTOR_KEY)
  localStorage.removeItem(REMEMBER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(DOCTOR_KEY)
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(options.headers || {})
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  headers.set('Accept', 'application/json')

  if (token) {
    headers.set('Authorization', `Token ${token}`)
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  let response: Response
  try {
    response = await fetch(url, { ...options, headers })
  } catch (err) {
    throw new Error(
      'Unable to connect to the TrustBeat authentication server. Please verify the backend is running.'
    )
  }

  let data: any
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`
    const rawError = data?.error || data?.errors || data?.detail
    if (typeof rawError === 'string') {
      errorMsg = rawError
    } else if (Array.isArray(rawError)) {
      errorMsg = rawError.map(String).join(', ')
    } else if (typeof rawError === 'object' && rawError !== null) {
      errorMsg = Object.entries(rawError)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
        .join(' | ')
    }
    throw new Error(errorMsg)
  }

  return data as T
}

export const api = {
  // Doctor Auth
  async loginDoctor(email: string, password: string, rememberMe = false): Promise<{ token: string; doctor: DoctorProfile }> {
    const data = await request<{ success: boolean; token: string; doctor: DoctorProfile }>('/auth/doctor/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setStoredAuth(data.token, data.doctor, rememberMe)
    return data
  },

  async registerDoctor(payload: RegisterDoctorPayload): Promise<{ success: boolean; doctor: DoctorProfile; message: string }> {
    return request<{ success: boolean; doctor: DoctorProfile; message: string }>('/auth/doctor/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async logoutDoctor(): Promise<void> {
    try {
      await request('/auth/logout/', { method: 'POST' })
    } catch {
      // Clear local storage regardless of backend response
    } finally {
      clearStoredAuth()
    }
  },

  async getDoctorProfile(): Promise<DoctorProfile> {
    const data = await request<{ success: boolean; doctor: DoctorProfile }>('/doctor/profile/', {
      method: 'GET',
    })
    const remember = localStorage.getItem(REMEMBER_KEY) === 'true'
    const token = getStoredToken()
    if (token) {
      setStoredAuth(token, data.doctor, remember)
    }
    return data.doctor
  },

  async updateDoctorProfile(updates: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const data = await request<{ success: boolean; doctor: DoctorProfile }>('/doctor/profile/', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    return data.doctor
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/auth/password-reset/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  // Lookup & Mobile Integration
  async lookupDoctor(doctorId: string): Promise<DoctorLookupResult> {
    const data = await request<{ success: boolean; doctor: DoctorLookupResult }>(
      `/doctors/lookup/${encodeURIComponent(doctorId)}/`,
      { method: 'GET' }
    )
    return data.doctor
  },

  async getPatientDoctorRelationships(): Promise<PatientDoctorRelationship[]> {
    const data = await request<{ success: boolean; relationships: PatientDoctorRelationship[] }>(
      '/patient-doctor-relationships/',
      { method: 'GET' }
    )
    return data.relationships
  },

  async connectDoctor(doctorId: string): Promise<{ success: boolean; relationship: PatientDoctorRelationship; message: string }> {
    return request<{ success: boolean; relationship: PatientDoctorRelationship; message: string }>(
      '/patient-doctor-relationships/',
      {
        method: 'POST',
        body: JSON.stringify({ doctor_id: doctorId }),
      }
    )
  },

  async revokeRelationship(relationshipId: number): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(
      `/patient-doctor-relationships/${relationshipId}/`,
      { method: 'DELETE' }
    )
  },

  // Authorized Clinical Reports & Blockchain Verification
  async getDoctorReports(): Promise<ClinicalReport[]> {
    const data = await request<{ success: boolean; reports: ClinicalReport[] }>('/doctor/reports/', {
      method: 'GET',
    })
    return data.reports || []
  },

  async getDoctorReportDetail(reportId: string | number): Promise<ClinicalReport> {
    const data = await request<{ success: boolean; report: ClinicalReport }>(
      `/doctor/reports/${encodeURIComponent(reportId)}/`,
      { method: 'GET' }
    )
    return data.report
  },

  async verifyReportIntegrity(reportId: string | number): Promise<ReportVerificationResponse> {
    return request<ReportVerificationResponse>(
      `/doctor/reports/${encodeURIComponent(reportId)}/verify/`,
      { method: 'GET' }
    )
  },

  async downloadReportPdf(reportId: string | number): Promise<Blob> {
    const token = getStoredToken()
    const headers = new Headers()
    if (token) {
      headers.set('Authorization', `Token ${token}`)
    }
    const url = `${API_BASE}/doctor/reports/${encodeURIComponent(reportId)}/download/`
    let response: Response
    try {
      response = await fetch(url, { method: 'GET', headers })
    } catch {
      throw new Error('Network error: Unable to connect to TrustBeat PDF download service.')
    }
    if (!response.ok) {
      let errorMsg = `PDF download failed (HTTP ${response.status})`
      try {
        const errJson = await response.json()
        if (errJson?.error) errorMsg = errJson.error
      } catch {
        // Not JSON
      }
      throw new Error(errorMsg)
    }
    const contentType = response.headers.get('content-type')
    if (contentType && !contentType.includes('application/pdf')) {
      throw new Error('Invalid file format received from server. Expected application/pdf.')
    }
    return response.blob()
  },

  async shareReportWithPatient(reportId: string | number): Promise<{ success: boolean; message: string; report_id: string; patient_name: string }> {
    return request<{ success: boolean; message: string; report_id: string; patient_name: string }>(
      `/doctor/reports/${encodeURIComponent(reportId)}/share/`,
      { method: 'POST' }
    )
  },

  async updateReportNotes(reportId: string | number, notes: string): Promise<any> {
    return request<any>(
      `/reports/${encodeURIComponent(reportId)}/`,
      {
        method: 'PATCH',
        body: JSON.stringify({ clinician_notes: notes })
      }
    )
  },

  async getDoctorDashboardSummary(): Promise<DoctorDashboardSummary> {
    return request<DoctorDashboardSummary>('/doctor/dashboard-summary/', {
      method: 'GET',
    })
  },

  async getDoctorPatients(): Promise<any[]> {
    const data = await request<any>('/doctor/patients/', { method: 'GET' })
    return Array.isArray(data) ? data : (data?.patients || [])
  },

  async getNotifications(): Promise<any[]> {
    const data = await request<any[]>('/notifications/', { method: 'GET' })
    return Array.isArray(data) ? data : []
  },

  async markAllNotificationsRead(): Promise<void> {
    await request('/notifications/', { method: 'POST' })
  },

  // Clinician credential submission & self verification status
  async submitDoctorCredentials(data: FormData | Record<string, any>): Promise<{
    success: boolean
    message: string
    doctor: DoctorProfile
    missing_requirements: string[]
  }> {
    const isFormData = data instanceof FormData
    return request<{
      success: boolean
      message: string
      doctor: DoctorProfile
      missing_requirements: string[]
    }>('/doctor-access/submit-credentials/', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    })
  },

  // Hospital Administrator Doctor Verification & Credential Review
  async adminGetDoctors(status?: string): Promise<{
    success: boolean
    count: number
    doctors: DoctorProfile[]
  }> {
    const q = status ? `?status=${encodeURIComponent(status)}` : ''
    return request<{
      success: boolean
      count: number
      doctors: DoctorProfile[]
    }>(`/doctor-access/admin/doctors/${q}`, { method: 'GET' })
  },

  async adminInspectDoctor(doctorId: string): Promise<{
    success: boolean
    doctor: DoctorProfile
    decision_history: Array<{
      action: string
      actor: string
      details: string
      timestamp: string
    }>
  }> {
    return request<{
      success: boolean
      doctor: DoctorProfile
      decision_history: Array<{
        action: string
        actor: string
        details: string
        timestamp: string
      }>
    }>(`/doctor-access/verify-approval/${encodeURIComponent(doctorId)}/`, { method: 'GET' })
  },

  async adminVerifyDoctor(
    doctorId: string,
    action: 'approve' | 'reject',
    reason: string
  ): Promise<{
    success: boolean
    message: string
    doctor: DoctorProfile
  }> {
    return request<{
      success: boolean
      message: string
      doctor: DoctorProfile
    }>(`/doctor-access/verify-approval/${encodeURIComponent(doctorId)}/`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    })
  },

  async downloadCredentialDocument(doctorId: string): Promise<Blob> {
    const token = getStoredToken()
    const headers = new Headers()
    if (token) {
      headers.set('Authorization', `Token ${token}`)
    }
    const url = `${API_BASE}/doctor-access/credentials/${encodeURIComponent(doctorId)}/document/`
    const res = await fetch(url, { method: 'GET', headers })
    if (!res.ok) {
      let errMsg = `Failed to download credential document (HTTP ${res.status})`
      try {
        const j = await res.json()
        if (j.error) errMsg = j.error
      } catch {
        // Not JSON
      }
      throw new Error(errMsg)
    }
    return res.blob()
  },
}

export const getBackendMediaUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = API_BASE.replace(/\/api\/v1\/?$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
