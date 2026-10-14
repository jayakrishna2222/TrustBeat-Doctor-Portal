import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Activity,
  FileText,
  Sparkles,
  Scan,
  Calendar,
  MessageSquare,
  Settings,
  Link2,
  ShieldCheck,
} from 'lucide-react'
import { TrustBeatLogo } from './TrustBeatLogo'
import sidebarBanner from '../assets/sidebar_banner.png'
import { useApp } from '../context/AppContext'

interface SidebarProps {
  className?: string
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '', onCloseMobile }) => {
  const { currentDoctor, isPreviewMode } = useApp()
  const isAdmin = Boolean(currentDoctor?.role === 'admin' || currentDoctor?.is_staff)

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Patients', path: '/patients', icon: Users },
    { label: 'Assessments', path: '/assessments', icon: Activity },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'AI Insights', path: '/ai-insights', icon: Sparkles },
    { label: 'Grad-CAM Analysis', path: '/gradcam', icon: Scan },
    { label: 'Appointments', path: '/appointments', icon: Calendar },
    {
      label: 'Messages',
      path: '/messages',
      icon: MessageSquare,
      badge: isPreviewMode ? '3' : undefined,
    },
    ...(isAdmin
      ? [{ label: 'Doctor Verification', path: '/doctor-verification', icon: ShieldCheck }]
      : []),
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Integrations', path: '/integrations', icon: Link2 },
  ]

  return (
    <aside
      className={`w-60 shrink-0 bg-white border-r border-slate-100 flex flex-col justify-between h-screen sticky top-0 overflow-y-auto z-30 select-none ${className}`}
    >
      <div className="p-4 flex flex-col">
        {/* Brand Header */}
        <div className="px-2 py-2 mb-4">
          <TrustBeatLogo size="md" />
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Bottom Promo Card */}
      <div className="p-4 pt-0">
        <div className="rounded-2xl overflow-hidden shadow-sm border border-teal-50 relative group">
          <img
            src={sidebarBanner}
            alt="Better Heart Health Together"
            className="w-full h-auto object-cover block"
            onError={(e) => {
              // Fallback if image asset is not found
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      </div>
    </aside>
  )
}
