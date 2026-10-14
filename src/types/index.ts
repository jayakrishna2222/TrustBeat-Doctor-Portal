export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High'

export interface Patient {
  id: string
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  lastAssessment: string
  lastAssessmentRelative?: string
  riskLevel: RiskLevel
  status: 'Active' | 'Inactive'
  avatarUrl?: string
  riskScore?: number
  metrics?: {
    bp: string
    cholesterol: number
    glucose: number
    heartRate: number
  }
  medicalInfo?: {
    knownConditions: string
    currentMedications: string
    allergies: string
    familyHistory: string
  }
}

export interface Assessment {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  patientGender?: 'Male' | 'Female'
  dateTime: string
  riskLevel: RiskLevel
  riskScore: number
  keyFindings: string
  status: 'Completed' | 'Processing' | 'Failed'
  avatarUrl?: string
  metrics?: {
    bp: string
    cholesterol: number
    glucose: number
    heartRate: number
  }
}

export interface ReportItem {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  patientGender: 'Male' | 'Female'
  dateTime: string
  riskLevel: RiskLevel
  riskScore: number
  reportType: 'Heart Assessment' | 'Follow-up Report' | 'Routine Checkup'
  avatarUrl?: string
}

export interface Appointment {
  id: string
  time: string
  dateTime: string
  patientId: string
  patientName: string
  patientAge: number
  patientGender: 'Male' | 'Female'
  type: 'Consultation' | 'Follow-up' | 'Routine Checkup' | 'New Patient Consultation'
  riskLevel: RiskLevel
  status: 'Upcoming' | 'Scheduled' | 'Completed' | 'Cancelled'
  duration: string
  mode: 'Video Call' | 'In-Person Visit' | 'Follow-up Consultation'
  reason: string
  notes?: string
  avatarUrl?: string
}

export interface MessageItem {
  id: string
  sender: 'doctor' | 'patient' | 'system'
  text: string
  time: string
  attachment?: {
    name: string
    size: string
    type: 'pdf' | 'image'
  }
  delivered?: boolean
}

export interface Conversation {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  patientGender: 'Male' | 'Female'
  lastMessage: string
  lastTime: string
  unreadCount: number
  riskLevel: RiskLevel
  category: 'Patients' | 'System'
  avatarUrl?: string
  messages: MessageItem[]
}

export interface IntegrationService {
  id: string
  name: string
  category: 'Calendar' | 'Video Consultation' | 'Communication' | 'Health Records' | 'Cloud & Storage' | 'AI & Analytics'
  description: string
  icon: string
  connected: boolean
  account?: string
  lastSynced?: string
  lastTested?: string
}
