import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  api,
  getStoredDoctor,
  getStoredToken,
  type DoctorProfile,
} from '../services/api'

export interface ToastItem {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export interface AppNotification {
  id: string
  title: string
  desc: string
  time: string
  read: boolean
}

interface AppContextType {
  // Authentication & Doctor Identity
  currentDoctor: DoctorProfile | null
  isAuthenticated: boolean
  isLoadingAuth: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  refreshDoctorProfile: () => Promise<void>

  // Preview Mode
  isPreviewMode: boolean
  togglePreviewMode: () => void

  // Selection states
  selectedPatientId: string | null
  setSelectedPatientId: (id: string | null) => void
  selectedAssessmentId: string | null
  setSelectedAssessmentId: (id: string | null) => void
  selectedReportId: string | null
  setSelectedReportId: (id: string | null) => void
  selectedAppointmentId: string | null
  setSelectedAppointmentId: (id: string | null) => void
  selectedConversationId: string | null
  setSelectedConversationId: (id: string | null) => void

  // Modals & Notifications
  activeModal: string | null
  modalData: unknown
  openModal: (modalName: string, data?: unknown) => void
  closeModal: () => void
  toasts: ToastItem[]
  addToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
  removeToast: (id: string) => void
  notifications: AppNotification[]
  markNotificationsAsRead: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Doctor Auth State
  const [currentDoctor, setCurrentDoctor] = useState<DoctorProfile | null>(() => getStoredDoctor())
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getStoredToken())
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false)

  // ZERO FAKE DATA: isPreviewMode is FALSE by default
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false)

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [modalData, setModalData] = useState<unknown>(null)

  const [toasts, setToasts] = useState<ToastItem[]>([])

  const previewNotifications: AppNotification[] = [
    { id: '1', title: 'High-risk assessment alert', desc: 'Ramesh Kumar flagged for elevated systolic BP', time: '10m ago', read: false },
    { id: '2', title: 'New appointment request', desc: 'Anita Patel scheduled video consultation', time: '1h ago', read: false },
    { id: '3', title: 'New message received', desc: 'Suresh R uploaded recent MRI report', time: '3h ago', read: false },
  ]

  const [notifications, setNotifications] = useState<AppNotification[]>([])

  // Load dynamic notifications from backend or preview
  useEffect(() => {
    if (isPreviewMode) {
      setNotifications(previewNotifications)
    } else if (isAuthenticated) {
      api
        .getNotifications()
        .then((items) => {
          if (items && items.length > 0) {
            setNotifications(
              items.map((n: any) => ({
                id: String(n.id),
                title: n.title || 'Clinical Alert',
                desc: n.message || 'New notification received.',
                time: n.created_at
                  ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Recent',
                read: Boolean(n.is_read),
              }))
            )
          } else {
            setNotifications([])
          }
        })
        .catch(() => setNotifications([]))
    } else {
      setNotifications([])
    }
  }, [isPreviewMode, isAuthenticated])

  // Attempt to refresh profile on mount if token is stored
  useEffect(() => {
    const token = getStoredToken()
    if (token) {
      api
        .getDoctorProfile()
        .then((doc) => {
          setCurrentDoctor(doc)
          setIsAuthenticated(true)
        })
        .catch(() => {
          // Token may have expired or server offline; keep local cache if any
        })
    }
  }, [])

  const login = async (email: string, password: string, rememberMe = false): Promise<void> => {
    setIsLoadingAuth(true)
    try {
      const result = await api.loginDoctor(email, password, rememberMe)
      setCurrentDoctor(result.doctor)
      setIsAuthenticated(true)
      addToast(
        result.doctor.is_verified
          ? `Welcome to TrustBeat Doctor Portal, ${result.doctor.full_name}.`
          : `Welcome, ${result.doctor.full_name}. Professional verification is pending review.`,
        'success'
      )
    } finally {
      setIsLoadingAuth(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoadingAuth(true)
    try {
      await api.logoutDoctor()
    } finally {
      setCurrentDoctor(null)
      setIsAuthenticated(false)
      setIsLoadingAuth(false)
      addToast('You have been securely signed out.', 'info')
    }
  }

  const refreshDoctorProfile = async (): Promise<void> => {
    try {
      const doc = await api.getDoctorProfile()
      setCurrentDoctor(doc)
    } catch {
      // Ignore background refresh errors
    }
  }

  const togglePreviewMode = () => {
    setIsPreviewMode((prev) => {
      const next = !prev
      if (next) {
        setNotifications(previewNotifications)
        setSelectedPatientId('TBP00125')
        setSelectedAssessmentId('ASMT00123')
        setSelectedReportId('REP00123')
        setSelectedAppointmentId('APT001')
        setSelectedConversationId('CONV001')
        addToast('Switched to Design Reference Preview (Visual verification data loaded)', 'info')
      } else {
        setNotifications([])
        setSelectedPatientId(null)
        setSelectedAssessmentId(null)
        setSelectedReportId(null)
        setSelectedAppointmentId(null)
        setSelectedConversationId(null)
        addToast('Switched to Zero Fake Data Operational Mode (Real empty states)', 'info')
      }
      return next
    })
  }

  const openModal = (name: string, data?: unknown) => {
    setActiveModal(name)
    setModalData(data || null)
  }

  const closeModal = () => {
    setActiveModal(null)
    setModalData(null)
  }

  const addToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const markNotificationsAsRead = () => {
    if (!isPreviewMode && isAuthenticated) {
      api.markAllNotificationsRead().catch(() => {})
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <AppContext.Provider
      value={{
        currentDoctor,
        isAuthenticated,
        isLoadingAuth,
        login,
        logout,
        refreshDoctorProfile,
        isPreviewMode,
        togglePreviewMode,
        selectedPatientId,
        setSelectedPatientId,
        selectedAssessmentId,
        setSelectedAssessmentId,
        selectedReportId,
        setSelectedReportId,
        selectedAppointmentId,
        setSelectedAppointmentId,
        selectedConversationId,
        setSelectedConversationId,
        activeModal,
        modalData,
        openModal,
        closeModal,
        toasts,
        addToast,
        removeToast,
        notifications,
        markNotificationsAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
