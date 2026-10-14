import React, { useState } from 'react'
import {
  MessageSquare,
  Mail,
  Users,
  Share2,
  Search,
  Filter,
  Plus,
  Video,
  Phone,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Send,
  Download,
  Calendar,
  MapPin,
  FileText,
  Activity,
  Droplet,
  HeartPulse,
  ShieldCheck,
  CheckCheck,
  Pill,
  Lightbulb,
} from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { RiskBadge } from '../components/RiskBadge'
import { EmptyState } from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { api } from '../services/api'
import {
  PREVIEW_CONVERSATIONS,
} from '../data/referencePreviewData'
import type { Conversation } from '../types'

export const Messages: React.FC = () => {
  const { isPreviewMode, addToast } = useApp()

  const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'Patients' | 'System'>('All')
  const [patientInfoTab, setPatientInfoTab] = useState<
    'Overview' | 'Medical History' | 'Reports' | 'Notes'
  >('Overview')

  const [searchVal, setSearchVal] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    isPreviewMode ? PREVIEW_CONVERSATIONS[0] : null
  )

  const [typedMessage, setTypedMessage] = useState('')
  const [realStats, setRealStats] = useState<{ total_patients: number; total_reports: number } | null>(null)

  React.useEffect(() => {
    if (isPreviewMode) {
      setSelectedConversation(PREVIEW_CONVERSATIONS[0])
    } else {
      setSelectedConversation(null)
      api.getDoctorDashboardSummary()
        .then((s) => setRealStats({ total_patients: s.stats.total_patients, total_reports: s.stats.total_reports }))
        .catch(() => {})
    }
  }, [isPreviewMode])

  const conversationList = isPreviewMode
    ? PREVIEW_CONVERSATIONS.filter((c) => {
        if (activeTab === 'Unread' && c.unreadCount === 0) return false
        if (activeTab === 'Patients' && c.category !== 'Patients') return false
        if (activeTab === 'System' && c.category !== 'System') return false
        if (searchVal && !c.patientName.toLowerCase().includes(searchVal.toLowerCase())) {
          return false
        }
        return true
      })
    : []

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!typedMessage.trim()) return

    if (!isPreviewMode) {
      addToast('Messaging requires WebSocket or Twilio/SMS connector.', 'info')
      setTypedMessage('')
      return
    }

    if (selectedConversation) {
      const newMessage = {
        id: `M${Date.now()}`,
        sender: 'doctor' as const,
        text: typedMessage,
        time: 'Just now',
        delivered: true,
      }
      setSelectedConversation({
        ...selectedConversation,
        messages: [...selectedConversation.messages, newMessage],
      })
      setTypedMessage('')
      addToast('Message posted locally.', 'info')
    }
  }

  return (
    <div className="space-y-6">
      {/* 15.1 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Messages</h1>
          <p className="text-xs text-slate-500 mt-1">
            Communicate with patients, share reports, and provide guidance.
          </p>
        </div>

        <button
          onClick={() => addToast('Patient dispatch dialog loaded.', 'info')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-700/20 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Message</span>
        </button>
      </div>

      {/* 15.1 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Messages"
          value={isPreviewMode ? '48' : '0'}
          trend={isPreviewMode ? '↗ +12%' : undefined}
          trendPositive={true}
          icon={<MessageSquare className="w-6 h-6" />}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          isUnavailable={false}
        />
        <StatCard
          title="Unread Messages"
          value={isPreviewMode ? '3' : '0'}
          icon={<Mail className="w-6 h-6" />}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
          isUnavailable={false}
        />
        <StatCard
          title="Active Patients"
          value={isPreviewMode ? '32' : (realStats ? String(realStats.total_patients) : '0')}
          trend={isPreviewMode ? '↗ +8%' : undefined}
          trendPositive={true}
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
          isUnavailable={false}
        />
        <StatCard
          title="Reports Shared"
          value={isPreviewMode ? '12' : (realStats ? String(realStats.total_reports) : '0')}
          trend={isPreviewMode ? '↗ +25%' : undefined}
          trendPositive={true}
          icon={<Share2 className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
          isUnavailable={false}
        />
      </div>

      {/* Main 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: 15.2 Conversation List (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600"
              />
            </div>
            <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500">
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Conversation Tabs */}
          <div className="flex gap-2 border-b border-slate-50 pb-2">
            {[
              { label: 'All', key: 'All' },
              { label: 'Unread (3)', key: 'Unread' },
              { label: 'Patients', key: 'Patients' },
              { label: 'System', key: 'System' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conversation Items */}
          {isPreviewMode ? (
            <div className="space-y-1 max-h-[580px] overflow-y-auto pr-1">
              {conversationList.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-300 shadow-xs'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {conv.patientName.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {conv.patientName}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {conv.lastTime}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0 ml-1">
                      {conv.unreadCount > 0 ? (
                        <span className="w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      ) : (
                        <RiskBadge level={conv.riskLevel} size="sm" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={<MessageSquare className="w-5 h-5 text-slate-400" />}
              title="No messages yet"
              description="Message threads with active patients will appear here."
              compact
            />
          )}
        </div>

        {/* Center Column: 15.3 Conversation View (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex flex-col h-[700px]">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {selectedConversation.patientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {selectedConversation.patientName}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      58 years, Male | ID: {selectedConversation.patientId}
                    </p>
                  </div>
                  <RiskBadge level={selectedConversation.riskLevel} size="sm" />
                </div>

                <div className="flex items-center gap-1.5 text-slate-500">
                  <button
                    onClick={() => addToast('Starting secure video call room.', 'info')}
                    className="p-1.5 hover:bg-slate-50 hover:text-slate-800 rounded-lg"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => addToast('Starting direct voice call.', 'info')}
                    className="p-1.5 hover:bg-slate-50 hover:text-slate-800 rounded-lg"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-slate-50 hover:text-slate-800 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                <div className="flex items-center justify-center my-1">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-semibold">
                    Today
                  </span>
                </div>

                {selectedConversation.messages.map((m) => {
                  const isDoctor = m.sender === 'doctor'
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isDoctor ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                          isDoctor
                            ? 'bg-emerald-50/90 text-slate-800 border border-emerald-100 rounded-br-sm'
                            : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-bl-sm'
                        }`}
                      >
                        {m.text}

                        {/* PDF Attachment preview */}
                        {m.attachment && (
                          <div className="mt-2.5 p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-rose-500 shrink-0" />
                              <div>
                                <p className="font-bold text-slate-900 text-[11px] leading-tight">
                                  {m.attachment.name}
                                </p>
                                <p className="text-[9px] text-slate-400">{m.attachment.size}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => addToast('Downloading document.', 'info')}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-slate-400">{m.time}</span>
                        {isDoctor && m.delivered && (
                          <CheckCheck className="w-3 h-3 text-teal-600" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Message Composer & Quick Action Chips */}
              <div className="p-3 border-t border-slate-100 space-y-2 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addToast('File upload attachment dialog.', 'info')}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => addToast('Image attachment dialog.', 'info')}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                  />

                  <button
                    type="button"
                    onClick={() => addToast('Emoji selector opened.', 'info')}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    className="p-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick Action Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                  <button
                    onClick={() => addToast('Sharing latest cardiovascular report.', 'info')}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 flex items-center gap-1 whitespace-nowrap"
                  >
                    <Share2 className="w-3 h-3 text-teal-600" />
                    <span>Share Report</span>
                  </button>

                  <button
                    onClick={() => addToast('Scheduling appointment from chat.', 'info')}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 flex items-center gap-1 whitespace-nowrap"
                  >
                    <Calendar className="w-3 h-3 text-blue-600" />
                    <span>Schedule Appointment</span>
                  </button>

                  <button
                    onClick={() => addToast('Prescription engine loaded.', 'info')}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 flex items-center gap-1 whitespace-nowrap"
                  >
                    <Pill className="w-3 h-3 text-amber-600" />
                    <span>Prescribe Medication</span>
                  </button>

                  <button
                    onClick={() => addToast('Sending preventive health tips.', 'info')}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 flex items-center gap-1 whitespace-nowrap"
                  >
                    <Lightbulb className="w-3 h-3 text-emerald-600" />
                    <span>Send Health Tips</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                icon={<MessageSquare className="w-6 h-6 text-slate-400" />}
                title="No conversation selected"
                description="Select a conversation thread on the left to review communication logs or type a reply."
              />
            </div>
          )}
        </div>

        {/* Right Column: 15.4 Patient Information Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-4">
          {selectedConversation ? (
            <>
              {/* Patient identity */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base shrink-0">
                    {selectedConversation.patientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedConversation.patientName}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      58 years, Male | {selectedConversation.patientId}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <RiskBadge level={selectedConversation.riskLevel} size="sm" />
                  <button className="text-[10px] font-bold text-teal-700 hover:underline block mt-1">
                    View Profile →
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 text-xs font-semibold gap-3">
                {(['Overview', 'Medical History', 'Reports', 'Notes'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPatientInfoTab(tab)}
                    className={`pb-2 border-b-2 transition-all cursor-pointer ${
                      patientInfoTab === tab
                        ? 'border-teal-700 text-teal-700'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Contact Information */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block">Phone</span>
                    <span className="font-semibold text-slate-800">+91 98765 43210</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block">Email</span>
                    <span className="font-semibold text-slate-800">ramesh.kumar@email.com</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block">Location</span>
                    <span className="font-semibold text-slate-800">Bangalore, Karnataka</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block">
                      Last Appointment
                    </span>
                    <span className="font-semibold text-slate-800">12 Oct 2024, 10:30 AM</span>
                  </div>
                </div>
              </div>

              {/* Health Summary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800">Health Summary</h4>
                  <button className="text-[10px] font-bold text-teal-700 hover:underline">
                    View Full Report →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-rose-50/60 border border-rose-100 rounded-xl flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-semibold block">BP</span>
                      <span className="text-xs font-bold text-slate-800">142/90</span>
                    </div>
                  </div>

                  <div className="p-2 bg-amber-50/60 border border-amber-100 rounded-xl flex items-center gap-2">
                    <Droplet className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-semibold block">
                        Cholesterol
                      </span>
                      <span className="text-xs font-bold text-slate-800">240</span>
                    </div>
                  </div>

                  <div className="p-2 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-semibold block">Glucose</span>
                      <span className="text-xs font-bold text-slate-800">110</span>
                    </div>
                  </div>

                  <div className="p-2 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-2">
                    <HeartPulse className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-semibold block">Heart Rate</span>
                      <span className="text-xs font-bold text-slate-800">82</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Reports */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800">Recent Reports</h4>
                  <button className="text-[10px] font-bold text-teal-700 hover:underline">
                    View All →
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <div>
                        <p className="font-bold text-slate-800 text-[11px] leading-tight">MRI Scan</p>
                        <p className="text-[9px] text-slate-400">12 Oct 2024</p>
                      </div>
                    </div>
                    <button className="text-[11px] font-bold text-teal-700 hover:underline">
                      View
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <div>
                        <p className="font-bold text-slate-800 text-[11px] leading-tight">
                          Heart Assessment Report
                        </p>
                        <p className="text-[9px] text-slate-400">05 Oct 2024</p>
                      </div>
                    </div>
                    <button className="text-[11px] font-bold text-teal-700 hover:underline">
                      View
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => addToast('Opening full patient report history.', 'info')}
                  className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Full Reports</span>
                </button>

                <button
                  onClick={() => addToast('Booking follow-up appointment.', 'info')}
                  className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule</span>
                </button>

                <button
                  onClick={() => addToast('Adding physician notes.', 'info')}
                  className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Add Notes</span>
                </button>

                <button
                  onClick={() => addToast('Sharing report with patient.', 'info')}
                  className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Report</span>
                </button>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Users className="w-6 h-6 text-slate-400" />}
              title="No Patient Context"
              description="Select an active conversation to inspect patient health telemetry and records."
            />
          )}
        </div>
      </div>
    </div>
  )
}
