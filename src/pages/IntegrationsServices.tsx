import React, { useState } from 'react'
import {
  Grid,
  Calendar,
  Video,
  MessageSquare,
  FileText,
  Cloud,
  Sparkles,
  Link as LinkIcon,
  Settings,
  Headphones,
  Clock,
  MoreVertical,
} from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { EmptyState } from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { PREVIEW_INTEGRATIONS } from '../data/referencePreviewData'

export const IntegrationsServices: React.FC = () => {
  const { isPreviewMode, openModal, addToast } = useApp()

  const [activeCategory, setActiveCategory] = useState<
    | 'All Integrations'
    | 'Calendar'
    | 'Video Consultation'
    | 'Communication'
    | 'Health Records'
    | 'Cloud & Storage'
    | 'AI & Analytics'
  >('All Integrations')

  // Donut data for Integration Status
  const statusDonutData = isPreviewMode
    ? [
        { name: 'Connected', value: 5, color: '#0d9488' },
        { name: 'Not Connected', value: 3, color: '#94a3b8' },
      ]
    : [
        { name: 'Connected', value: 0, color: '#0d9488' },
        { name: 'Not Connected', value: 8, color: '#94a3b8' },
      ]

  const integrationsList = PREVIEW_INTEGRATIONS.map((item) => {
    // In Zero Fake Data mode, STRICTLY force connected to false and remove fake account info!
    if (!isPreviewMode) {
      return {
        ...item,
        connected: false,
        account: undefined,
        lastSynced: undefined,
        lastTested: undefined,
      }
    }
    return item
  }).filter((item) => {
    if (activeCategory === 'All Integrations') return true
    return item.category === activeCategory
  })

  // Group by category if All Integrations
  const categories = [
    { title: 'Calendar Integration', category: 'Calendar', desc: 'Sync your appointments with external calendar services.' },
    { title: 'Video Consultation Integration', category: 'Video Consultation', desc: 'Connect video platforms for online consultations.' },
    { title: 'Communication Services', category: 'Communication', desc: 'Set up email and SMS services for patient notifications.' },
    { title: 'Health Records Integration', category: 'Health Records', desc: 'Connect with electronic health record systems.' },
    { title: 'Cloud & Storage', category: 'Cloud & Storage', desc: 'Connect cloud storage for medical images and reports.' },
    { title: 'AI & Analytics Services', category: 'AI & Analytics', desc: 'Connect AI and analytics tools for enhanced insights.' },
  ]

  const filteredCategories =
    activeCategory === 'All Integrations'
      ? categories
      : categories.filter((c) => c.category === activeCategory)

  return (
    <div className="space-y-6">
      {/* 17.1 Header & Tabs */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Integrations & Connected Services
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Connect your favorite tools and services to enhance your workflow and patient care.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
        {[
          { label: 'All Integrations', key: 'All Integrations', icon: Grid },
          { label: 'Calendar', key: 'Calendar', icon: Calendar },
          { label: 'Video Consultation', key: 'Video Consultation', icon: Video },
          { label: 'Communication', key: 'Communication', icon: MessageSquare },
          { label: 'Health Records', key: 'Health Records', icon: FileText },
          { label: 'Cloud & Storage', key: 'Cloud & Storage', icon: Cloud },
          { label: 'AI & Analytics', key: 'AI & Analytics', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeCategory === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Main Grid: Left Service Cards (8 cols) + Right Status (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Categorized Integration Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {filteredCategories.map((cat) => {
            const catItems = integrationsList.filter((i) => i.category === cat.category)
            if (catItems.length === 0) return null

            return (
              <div key={cat.title} className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cat.title}</h3>
                  <p className="text-[11px] text-slate-400">{cat.desc}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-4 flex flex-col justify-between space-y-3 transition-all hover:border-slate-200"
                    >
                      {/* Top icon and title */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                            {item.name.charAt(0)}
                          </div>

                          <div className="flex items-center gap-2">
                            {item.category === 'Video Consultation' ||
                            item.category === 'Communication' ||
                            item.category === 'Health Records' ||
                            item.category === 'Cloud & Storage' ||
                            item.category === 'AI & Analytics' ? (
                              <input
                                type="checkbox"
                                checked={item.connected}
                                onChange={() =>
                                  addToast(
                                    `Service state toggle for ${item.name} simulated.`,
                                    'info'
                                  )
                                }
                                className="w-4 h-4 text-teal-600 rounded"
                              />
                            ) : (
                              <button className="text-slate-400 hover:text-slate-600">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                          <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Status and metadata */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-50">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.connected ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            />
                            <span
                              className={
                                item.connected ? 'text-emerald-700' : 'text-slate-400'
                              }
                            >
                              {item.connected ? 'Connected' : 'Not Connected'}
                            </span>
                          </span>
                        </div>

                        {item.account && (
                          <div className="text-[10px] text-slate-500 truncate">
                            <span className="block truncate font-medium">{item.account}</span>
                            {item.lastSynced && (
                              <span className="text-slate-400 block mt-0.5">
                                Last synced: {item.lastSynced}
                              </span>
                            )}
                            {item.lastTested && (
                              <span className="text-slate-400 block mt-0.5">
                                Last tested: {item.lastTested}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action buttons */}
                        {item.connected ? (
                          <button
                            onClick={() => openModal('integration-connect', item)}
                            className="w-full py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {item.category === 'Video Consultation'
                                ? 'Test Connection'
                                : 'Configure'}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openModal('integration-connect', item)}
                            className="w-full py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <LinkIcon className="w-3.5 h-3.5 text-teal-600" />
                            <span>Connect</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Column: Status Donut, Activity & Support (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 17.5 Integration Status */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Integration Status</h3>

            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="relative w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDonutData}
                      innerRadius={46}
                      outerRadius={62}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-extrabold text-slate-900 leading-tight">
                    {isPreviewMode ? '5/8' : '0/8'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">Connected</span>
                </div>
              </div>

              <div className="space-y-2 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-700" /> Connected
                  </span>
                  <span className="font-extrabold text-slate-800">
                    {isPreviewMode ? 5 : 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Not Connected
                  </span>
                  <span className="font-extrabold text-slate-800">
                    {isPreviewMode ? 3 : 8}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Error
                  </span>
                  <span className="font-extrabold text-slate-800">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">Recent Activity</h4>
              <button className="text-[11px] font-bold text-teal-700 hover:underline">
                View All →
              </button>
            </div>

            {isPreviewMode ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-medium text-slate-800">Google Calendar synced</span>
                  </div>
                  <span className="text-[10px] text-slate-400">12 Oct 2024, 10:28 AM</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span className="font-medium text-slate-800">Zoom connection tested</span>
                  </div>
                  <span className="text-[10px] text-slate-400">12 Oct 2024, 09:45 AM</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="font-medium text-slate-800">Email service verified</span>
                  </div>
                  <span className="text-[10px] text-slate-400">12 Oct 2024, 09:40 AM</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-slate-800">EMR data synced</span>
                  </div>
                  <span className="text-[10px] text-slate-400">12 Oct 2024, 08:30 AM</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-medium text-slate-800">OpenAI API connected</span>
                  </div>
                  <span className="text-[10px] text-slate-400">11 Oct 2024, 06:15 PM</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="font-medium text-slate-800">Dropbox connection failed</span>
                  </div>
                  <span className="text-[10px] text-slate-400">11 Oct 2024, 05:20 PM</span>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Clock className="w-5 h-5 text-slate-400" />}
                title="No integration activity"
                description="Synchronization logs will report here once API keys or webhooks are connected."
                compact
              />
            )}
          </div>

          {/* Need Help? Support Card */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Need Help?</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get help with setting up integrations or contact our support team.
            </p>
            <button
              onClick={() => openModal('contact-admin')}
              className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-teal-700" />
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
