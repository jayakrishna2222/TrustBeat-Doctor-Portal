import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AppShell } from './components/AppShell'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Patients } from './pages/Patients'
import { Assessments } from './pages/Assessments'
import { Reports } from './pages/Reports'
import { AIInsights } from './pages/AIInsights'
import { GradCAMAnalysis } from './pages/GradCAMAnalysis'
import { Appointments } from './pages/Appointments'
import { AvailabilityScheduling } from './pages/AvailabilityScheduling'
import { Messages } from './pages/Messages'
import { SettingsProfile } from './pages/SettingsProfile'
import { IntegrationsServices } from './pages/IntegrationsServices'
import { DoctorVerification } from './pages/DoctorVerification'

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Routes>
        {/* Screen 1 & Registration: Independent Fullscreen Landing & Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctor-register" element={<Register />} />

        {/* Screens 2 - 12: Authenticated Common Application Shell */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/gradcam" element={<GradCAMAnalysis />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/availability" element={<AvailabilityScheduling />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<SettingsProfile />} />
          <Route path="/integrations" element={<IntegrationsServices />} />
          <Route path="/doctor-verification" element={<DoctorVerification />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppProvider>
  )
}

export default App
