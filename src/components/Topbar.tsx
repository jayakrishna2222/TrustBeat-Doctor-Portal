import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  Check,
  ShieldAlert,
} from 'lucide-react'
import doctorAvatar from '../assets/doctor_avatar.png'
import { useApp } from '../context/AppContext'

interface TopbarProps {
  onToggleMobileSidebar?: () => void
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileSidebar }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    isPreviewMode,
    togglePreviewMode,
    notifications,
    markNotificationsAsRead,
    addToast,
    currentDoctor,
    logout,
  } = useApp()

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotificationMenu, setShowNotificationMenu] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotificationMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Screen-specific search placeholder
  const getSearchPlaceholder = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Search patient name, ID or phone number...'
      case '/patients':
        return 'Search patient name, ID, or phone number...'
      case '/assessments':
        return 'Search patient name, ID, or assessment ID...'
      case '/reports':
        return 'Search patient name, report ID, or keyword...'
      case '/ai-insights':
        return 'Search patient name, ID, or keyword...'
      case '/gradcam':
        return 'Search patient name, ID, or assessment ID...'
      case '/appointments':
        return 'Search patient name, ID, or appointment ID...'
      case '/availability':
        return 'Search patients, appointments, or reports...'
      case '/messages':
        return 'Search patients, messages, reports...'
      case '/settings':
        return 'Search patients, reports, appointments...'
      case '/integrations':
        return 'Search patients, appointments, reports...'
      default:
        return 'Search patient name, ID or phone number...'
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchVal.trim()) return
    if (!isPreviewMode) {
      addToast(`No operational records match "${searchVal}" (Zero Fake Data mode)`, 'info')
    } else {
      addToast(`Filtering preview results for "${searchVal}"`, 'info')
    }
  }

  const unreadNotifs = notifications.filter((n) => !n.read).length

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Menu & Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/80 focus:border-teal-600 focus:outline-none transition-all shadow-inner"
          />
        </form>
      </div>

      {/* Right controls: Dev preview toggle, notifications, profile */}
      <div className="flex items-center gap-4">
        {/* Design Reference Preview Toggle */}
        <button
          onClick={togglePreviewMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
            isPreviewMode
              ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
          title="Toggle between Zero Fake Data (default) and Reference Screenshot Preview"
        >
          {isPreviewMode ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>DESIGN PREVIEW (SAMPLE DATA)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Zero Fake Data Mode</span>
            </>
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu)
              if (unreadNotifs > 0) markNotificationsAsRead()
            }}
            className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* Notification Popover */}
          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                <span className="text-[10px] text-slate-400">
                  {notifications.length} {notifications.length === 1 ? 'alert' : 'alerts'}
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-600">No notifications</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Operational alerts will appear when configured.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Doctor Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
          >
            {currentDoctor?.full_name || isPreviewMode ? (
              <img
                src={doctorAvatar}
                alt={currentDoctor?.full_name || 'Dr. Arjun Mehta'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-600/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs ring-2 ring-teal-600/20">
                TB
              </div>
            )}
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {currentDoctor?.full_name || (isPreviewMode ? 'Dr. Arjun Mehta' : 'Doctor Portal')}
              </p>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-teal-700 font-mono font-medium leading-tight">
                  {currentDoctor?.doctor_id || (isPreviewMode ? 'DOC-7F21A9C84D36B508' : 'Not Connected')}
                </p>
                {currentDoctor?.preview_access_enabled && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded leading-none">
                    Preview
                  </span>
                )}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">
                  {currentDoctor?.full_name || (isPreviewMode ? 'Dr. Arjun Mehta' : 'Account Disconnected')}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentDoctor?.email || (isPreviewMode ? 'arjun.mehta@trustbeat.com' : 'Auth not configured')}
                </p>
                {(currentDoctor?.doctor_id || isPreviewMode) && (
                  <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                        Doctor ID
                      </span>
                      <p className="font-mono text-[11px] font-bold text-teal-800">
                        {currentDoctor?.doctor_id || 'DOC-7F21A9C84D36B508'}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        (currentDoctor ? currentDoctor.is_verified : isPreviewMode)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : currentDoctor?.preview_access_enabled
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {(currentDoctor ? currentDoctor.is_verified : isPreviewMode)
                        ? 'Verified'
                        : currentDoctor?.preview_access_enabled
                        ? 'Preview Active'
                        : 'Pending'}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false)
                  navigate('/settings')
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Profile & Settings</span>
              </button>

              <button
                onClick={() => {
                  togglePreviewMode()
                  setShowProfileMenu(false)
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Design Preview</span>
                </div>
                {isPreviewMode && <Check className="w-3.5 h-3.5 text-teal-600" />}
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={async () => {
                  setShowProfileMenu(false)
                  await logout()
                  navigate('/login')
                  addToast('Signed out successfully', 'info')
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
