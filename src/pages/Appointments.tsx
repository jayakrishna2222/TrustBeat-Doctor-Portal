import React, { useState } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  UserPlus,
  CheckCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Video,
  MessageSquare,
  XCircle,
  RotateCcw,
  MoreVertical,
  Activity,
  Droplet,
  HeartPulse,
  ShieldCheck,
  RotateCw,
} from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { RiskBadge } from '../components/RiskBadge'
import { EmptyState } from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { PREVIEW_APPOINTMENTS } from '../data/referencePreviewData'
import type { Appointment } from '../types'

export const Appointments: React.FC = () => {
  const { isPreviewMode, addToast } = useApp()

  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All')
  const [detailTab, setDetailTab] = useState<'Overview' | 'Medical History' | 'Previous Reports' | 'Notes'>('Overview')

  const [statusFilter, setStatusFilter] = useState('All Status')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [riskFilter, setRiskFilter] = useState('All Risk Levels')
  const [doctorFilter, setDoctorFilter] = useState('Dr. Arjun Mehta (Me)')

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(
    isPreviewMode ? PREVIEW_APPOINTMENTS[0] : null
  )

  React.useEffect(() => {
    if (isPreviewMode) {
      setSelectedAppointment(PREVIEW_APPOINTMENTS[0])
    } else {
      setSelectedAppointment(null)
    }
  }, [isPreviewMode])

  const appointmentsList = isPreviewMode
    ? PREVIEW_APPOINTMENTS.filter((a) => {
        if (activeTab === 'Upcoming' && a.status !== 'Upcoming' && a.status !== 'Scheduled') return false
        if (activeTab === 'Completed' && a.status !== 'Completed') return false
        if (activeTab === 'Cancelled' && a.status !== 'Cancelled') return false
        if (statusFilter !== 'All Status' && a.status !== statusFilter) return false
        if (typeFilter !== 'All Types' && a.type !== typeFilter) return false
        if (riskFilter !== 'All Risk Levels' && a.riskLevel !== riskFilter) return false
        return true
      })
    : []

  return (
    <div className="space-y-6">
      {/* 13.1 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage patient appointments, consultations and follow-ups.
          </p>
        </div>

        <button
          onClick={() => addToast('Scheduling booking dialog loaded.', 'info')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-700/20 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Appointment</span>
        </button>
      </div>

      {/* 13.1 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Appointments"
          value={isPreviewMode ? '86' : '0'}
          trend="↗ +12%"
          trendPositive={true}
          subtext={isPreviewMode ? "This month" : "0 scheduled"}
          icon={<CalendarIcon className="w-6 h-6" />}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          isUnavailable={false}
        />
        <StatCard
          title="Upcoming Today"
          value={isPreviewMode ? '12' : '0'}
          trend="↗ +3"
          trendPositive={true}
          subtext={isPreviewMode ? "Scheduled" : "0 today"}
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
          isUnavailable={false}
        />
        <StatCard
          title="New Requests"
          value={isPreviewMode ? '8' : '0'}
          trend="↗ +60%"
          trendPositive={true}
          subtext={isPreviewMode ? "Pending approval" : "0 pending"}
          icon={<UserPlus className="w-6 h-6" />}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
          isUnavailable={false}
        />
        <StatCard
          title="Completed"
          value={isPreviewMode ? '64' : '0'}
          trend="↗ +18%"
          trendPositive={true}
          subtext={isPreviewMode ? "This month" : "0 completed"}
          icon={<CheckCircle className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          isUnavailable={false}
        />
      </div>

      {/* Main 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Calendar & Filters (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* 13.2 Calendar Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">October 2024</span>
              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1 hover:text-slate-700">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 hover:text-slate-700">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 text-center text-xs gap-y-1.5 font-medium">
              <span className="text-slate-300"></span>
              <span className="text-slate-300"></span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
              <span>11</span>
              {/* Selected Day 12 */}
              <span className="w-6 h-6 mx-auto rounded-full bg-teal-700 text-white font-bold flex items-center justify-center">
                12
              </span>
              <span>13</span>
              <span>14</span>
              <span>15</span>
              <span>16</span>
              <span>17</span>
              <span>18</span>
              <span>19</span>
              <span>20</span>
              <span>21</span>
              <span>22</span>
              <span>23</span>
              <span>24</span>
              <span>25</span>
              <span>26</span>
              <span>27</span>
              <span>28</span>
              <span>29</span>
              <span>30</span>
              <span>31</span>
            </div>
          </div>

          {/* 13.4 Filters Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Filter Appointments</h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option>All Status</option>
                <option>Upcoming</option>
                <option>Scheduled</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Appointment Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option>All Types</option>
                <option>Consultation</option>
                <option>Follow-up</option>
                <option>Routine Checkup</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Risk Level</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option>All Risk Levels</option>
                <option>High</option>
                <option>Moderate</option>
                <option>Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Doctor</label>
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option>Dr. Arjun Mehta (Me)</option>
                <option>All Clinicians</option>
              </select>
            </div>

            <button
              onClick={() => {
                setStatusFilter('All Status')
                setTypeFilter('All Types')
                setRiskFilter('All Risk Levels')
                addToast('Filters reset.', 'info')
              }}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Center Column: 13.3 Appointments List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-slate-900">Appointments (12 Oct 2024)</h3>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100">
                Today
              </button>
              <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="px-4 pt-3 flex gap-2 border-b border-slate-50 pb-3">
            {[
              { label: 'All (12)', key: 'All' },
              { label: 'Upcoming (8)', key: 'Upcoming' },
              { label: 'Completed (3)', key: 'Completed' },
              { label: 'Cancelled (1)', key: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          {isPreviewMode ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-4">Time</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-2">Type</th>
                    <th className="py-2.5 px-2">Risk Level</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {appointmentsList.map((apt) => {
                    const isSelected = selectedAppointment?.id === apt.id
                    return (
                      <tr
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-teal-50/50' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                          {apt.time}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                              {apt.patientName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{apt.patientName}</p>
                              <p className="text-[10px] text-slate-400">{apt.patientId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-slate-600 text-[11px]">{apt.type}</td>
                        <td className="py-3 px-2">
                          <RiskBadge level={apt.riskLevel} size="sm" />
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              apt.status === 'Upcoming'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => addToast('Joining video consultation room.', 'info')}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs"
                            >
                              Join
                            </button>
                            <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className="p-3 border-t border-slate-100 text-xs text-slate-400 text-center">
                Showing 1-12 of 12 appointments
              </div>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={<CalendarIcon className="w-6 h-6 text-slate-400" />}
                title="No appointments scheduled"
                description="Consultations and follow-up meetings booked by patients will populate this timeline."
              />
            </div>
          )}
        </div>

        {/* Right Column: 13.5 Appointment Details (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-4">
          {selectedAppointment ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base shrink-0">
                    {selectedAppointment.patientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedAppointment.patientName}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      ID: {selectedAppointment.patientId} | {selectedAppointment.patientAge} years, Male
                    </p>
                  </div>
                </div>

                <RiskBadge level={selectedAppointment.riskLevel} size="sm" />
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 text-xs font-semibold gap-3">
                {(['Overview', 'Medical History', 'Previous Reports', 'Notes'] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`pb-2 border-b-2 transition-all cursor-pointer ${
                        detailTab === tab
                          ? 'border-teal-700 text-teal-700'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>

              {/* Appointment Metadata */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Date & Time</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {selectedAppointment.dateTime}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600">
                      Upcoming
                    </span>
                  </div>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Appointment Type</span>
                  <span className="font-semibold text-slate-800">
                    {selectedAppointment.type}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-semibold text-slate-800">
                    {selectedAppointment.duration}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Consultation Mode</span>
                  <span className="font-semibold text-slate-800">
                    {selectedAppointment.mode}
                  </span>
                </div>

                <div className="py-1">
                  <span className="text-slate-400 block mb-1">Reason for Visit</span>
                  <p className="p-2 bg-slate-50 rounded-xl text-slate-700 font-medium">
                    {selectedAppointment.reason}
                  </p>
                </div>

                {selectedAppointment.notes && (
                  <div className="py-1">
                    <span className="text-slate-400 block mb-1">Notes</span>
                    <p className="p-2 bg-slate-50 rounded-xl text-slate-600 leading-relaxed">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Health Metrics */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">Recent Health Metrics</h4>
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

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => addToast('Joining telehealth consultation room.', 'info')}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Video Call</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addToast('Reschedule modal opened.', 'info')}
                    className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reschedule</span>
                  </button>

                  <button
                    onClick={() => addToast('Appointment cancellation requires confirmation.', 'warning')}
                    className="py-2 px-3 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Appointment</span>
                  </button>
                </div>

                <button
                  onClick={() => addToast('Navigating to patient conversation.', 'info')}
                  className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<CalendarIcon className="w-6 h-6 text-slate-400" />}
              title="No Appointment Selected"
              description="Select an appointment to inspect patient schedule information and consultation mode."
            />
          )}
        </div>
      </div>
    </div>
  )
}
