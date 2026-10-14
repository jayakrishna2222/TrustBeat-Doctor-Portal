import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ModalManager } from './ModalManager'
import { ToastContainer } from './ToastContainer'
import { useApp } from '../context/AppContext'
import ambientBg from '../assets/ambient_bg.png'
import { AlertCircle } from 'lucide-react'

export const AppShell: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { isPreviewMode, togglePreviewMode } = useApp()

  return (
    <div className="min-h-screen bg-[#f0f7fa] flex text-slate-800 antialiased relative">
      {/* Ambient medical background with soft overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${ambientBg})` }}
      />

      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block relative z-20">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white z-50">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 min-h-screen">
        <Topbar onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* Persistent Design Preview Indicator Banner (only when preview mode is explicitly active) */}
        {isPreviewMode && (
          <div className="bg-amber-500 text-slate-950 px-6 py-2 flex items-center justify-between text-xs font-bold tracking-wide shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-950 shrink-0" />
              <span>
                DESIGN REFERENCE PREVIEW ACTIVE — DISPLAYING SCREENSHOT DATA FOR PIXEL VERIFICATION ONLY — ZERO REAL DATA CONNECTED
              </span>
            </div>
            <button
              onClick={togglePreviewMode}
              className="px-2.5 py-0.5 bg-slate-950 text-white rounded text-[11px] font-semibold hover:bg-slate-800 transition-colors"
            >
              Exit to Zero Fake Data
            </button>
          </div>
        )}

        <main className="flex-1 p-6 lg:p-8 max-w-[1536px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ModalManager />
      <ToastContainer />
    </div>
  )
}
