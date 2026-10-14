import React, { useState } from 'react'
import {
  Calendar,
  Clock,
  Video,
  Ban,
  CalendarDays,
  Link as LinkIcon,
  Save,
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { useApp } from '../context/AppContext'

export const AvailabilityScheduling: React.FC = () => {
  const { isPreviewMode, addToast } = useApp()

  const [activeTab, setActiveTab] = useState<
    'Working Hours' | 'Time Slots' | 'Consultation Settings' | 'Blocked Dates' | 'Holidays'
  >('Working Hours')

  // Working Hours State
  const [daysState, setDaysState] = useState([
    { day: 'Monday', enabled: true, start: '09:00 AM', end: '05:00 PM' },
    { day: 'Tuesday', enabled: true, start: '09:00 AM', end: '05:00 PM' },
    { day: 'Wednesday', enabled: true, start: '09:00 AM', end: '01:00 PM' },
    { day: 'Thursday', enabled: true, start: '09:00 AM', end: '05:00 PM' },
    { day: 'Friday', enabled: true, start: '09:00 AM', end: '05:00 PM' },
    { day: 'Saturday', enabled: false, start: 'Closed', end: 'Closed' },
    { day: 'Sunday', enabled: false, start: 'Closed', end: 'Closed' },
  ])

  // Time Slots
  const [selectedSlotDay, setSelectedSlotDay] = useState('Monday')
  const [selectedSlots, setSelectedSlots] = useState<string[]>(['09:00 AM'])

  // Consultation Settings Toggles
  const [sameDay, setSameDay] = useState(true)
  const [requireConfirm, setRequireConfirm] = useState(true)
  const [autoRemind, setAutoRemind] = useState(true)
  const [allowReschedule, setAllowReschedule] = useState(true)

  // Blocked Dates
  const [blockedList, setBlockedList] = useState(
    isPreviewMode
      ? [
          { date: '03 Oct 2024', reason: 'Conference' },
          { date: '04 Oct 2024', reason: 'Personal Leave' },
          { date: '18 Oct 2024', reason: 'Medical Workshop' },
          { date: '25 Oct 2024', reason: 'Family Event' },
        ]
      : []
  )

  React.useEffect(() => {
    if (isPreviewMode) {
      setBlockedList([
        { date: '03 Oct 2024', reason: 'Conference' },
        { date: '04 Oct 2024', reason: 'Personal Leave' },
        { date: '18 Oct 2024', reason: 'Medical Workshop' },
        { date: '25 Oct 2024', reason: 'Family Event' },
      ])
    } else {
      setBlockedList([])
    }
  }, [isPreviewMode])

  const timeSlotOptions = [
    '09:00 AM', '09:30 AM', '10:00 AM',
    '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM',
    '02:00 PM', '02:30 PM', '03:00 PM',
    '03:30 PM', '04:00 PM', '04:30 PM',
  ]

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    )
  }

  return (
    <div className="space-y-6">
      {/* 14.1 Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Availability & Scheduling
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Set your working hours, manage time slots, and customize your appointment preferences.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => addToast('Public booking link copied to clipboard.', 'info')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5 text-teal-600" />
            <span>View Booking Link</span>
          </button>

          <button
            onClick={() =>
              addToast(
                'Schedule parameters verified in frontend state. Backend database sync required.',
                'info'
              )
            }
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
        {[
          { label: 'Working Hours', key: 'Working Hours', icon: Calendar },
          { label: 'Time Slots', key: 'Time Slots', icon: Clock },
          { label: 'Consultation Settings', key: 'Consultation Settings', icon: Video },
          { label: 'Blocked Dates', key: 'Blocked Dates', icon: Ban },
          { label: 'Holidays', key: 'Holidays', icon: CalendarDays },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
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

      {/* Upper Grid: Weekly Working Hours + Available Time Slots + Blocked Dates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Weekly Working Hours (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Working Hours</h3>
              <p className="text-[11px] text-slate-400">Set your regular working days and hours.</p>
            </div>

            <button
              onClick={() => addToast('Hours copied to all workdays.', 'info')}
              className="text-xs font-semibold text-teal-700 hover:underline bg-teal-50 px-2.5 py-1 rounded-lg"
            >
              Copy to All
            </button>
          </div>

          <div className="space-y-2.5">
            {daysState.map((d, index) => (
              <div
                key={d.day}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                  d.enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 w-28 shrink-0">
                  <input
                    type="checkbox"
                    checked={d.enabled}
                    onChange={(e) => {
                      const next = [...daysState]
                      next[index].enabled = e.target.checked
                      setDaysState(next)
                    }}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300"
                  />
                  <span className="font-bold text-slate-800">{d.day}</span>
                </div>

                {d.enabled ? (
                  <div className="flex items-center gap-1.5 flex-1 justify-center">
                    <select
                      value={d.start}
                      onChange={(e) => {
                        const next = [...daysState]
                        next[index].start = e.target.value
                        setDaysState(next)
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700"
                    >
                      <option>09:00 AM</option>
                      <option>08:00 AM</option>
                      <option>10:00 AM</option>
                    </select>
                    <span className="text-slate-400 text-[10px]">to</span>
                    <select
                      value={d.end}
                      onChange={(e) => {
                        const next = [...daysState]
                        next[index].end = e.target.value
                        setDaysState(next)
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700"
                    >
                      <option>05:00 PM</option>
                      <option>01:00 PM</option>
                      <option>06:00 PM</option>
                      <option>07:00 PM</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex-1 text-center text-[11px] text-slate-400 font-medium">
                    Closed
                  </div>
                )}

                <div className="flex items-center gap-1 text-slate-400 shrink-0">
                  <button className="p-1 hover:text-slate-700 rounded">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 hover:text-slate-700 rounded">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Time Slots (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Available Time Slots</h3>
            <p className="text-[11px] text-slate-400">
              Manage specific time slots for selected day.
            </p>
          </div>

          <select
            value={selectedSlotDay}
            onChange={(e) => setSelectedSlotDay(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none"
          >
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
          </select>

          {/* Slots grid */}
          <div className="grid grid-cols-3 gap-2">
            {timeSlotOptions.map((slot) => {
              const isSelected = selectedSlots.includes(slot)
              return (
                <button
                  key={slot}
                  onClick={() => toggleSlot(slot)}
                  className={`py-2 text-[11px] font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-slate-50/80 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-700" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Unavailable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-teal-600" /> Selected
            </span>
          </div>
        </div>

        {/* Blocked Dates (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Blocked Dates</h3>
            <p className="text-[11px] text-slate-400">Block dates when you are unavailable</p>
          </div>

          {/* Mini Calendar */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">October 2024</span>
              <div className="flex items-center gap-1 text-slate-400">
                <ChevronLeft className="w-3.5 h-3.5" />
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-7 text-center text-[9px] font-bold text-slate-400 mb-1">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>

            <div className="grid grid-cols-7 text-center text-[10px] gap-y-1 font-medium">
              <span /> <span /> <span>1</span> <span>2</span>
              <span className="font-bold text-rose-500">3</span>
              <span className="font-bold text-rose-500">4</span>
              <span>5</span> <span>6</span> <span>7</span> <span>8</span> <span>9</span> <span>10</span> <span>11</span>
              <span className="w-4 h-4 mx-auto rounded-full bg-teal-700 text-white font-bold flex items-center justify-center">
                12
              </span>
              <span>13</span> <span>14</span> <span>15</span> <span>16</span> <span>17</span>
              <span className="font-bold text-rose-500">18</span>
              <span>19</span> <span>20</span> <span>21</span> <span>22</span> <span>23</span> <span>24</span>
              <span className="font-bold text-rose-500">25</span>
              <span>26</span> <span>27</span> <span>28</span> <span>29</span> <span>30</span> <span>31</span>
            </div>
          </div>

          {/* Blocked Date List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800">Blocked Date List</h4>
              <button className="text-[10px] font-bold text-teal-700 hover:underline">
                View All →
              </button>
            </div>

            {blockedList.length > 0 ? (
              <div className="space-y-1.5 text-xs">
                {blockedList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-rose-50/50 border border-rose-100"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-rose-600 block leading-tight">
                        {item.date}
                      </span>
                      <span className="text-slate-700 font-medium">{item.reason}</span>
                    </div>
                    <button
                      onClick={() => setBlockedList((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1 text-rose-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2 text-center">No dates blocked.</p>
            )}
          </div>

          <button
            onClick={() => addToast('Add blocked date dialog.', 'info')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Blocked Date</span>
          </button>
        </div>
      </div>

      {/* Lower Grid: Consultation Settings + Schedule Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Consultation Settings (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Consultation Settings</h3>
            <p className="text-[11px] text-slate-400">
              Configure appointment preferences and consultation details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Appointment Duration
              </label>
              <select className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700">
                <option>30 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Buffer Time Between Appointments
              </label>
              <select className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700">
                <option>10 minutes</option>
                <option>15 minutes</option>
                <option>5 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Consultation Types
              </label>
              <div className="space-y-1.5 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="text-teal-600 rounded" />
                  <span>Video Consultation</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="text-teal-600 rounded" />
                  <span>In-Person Visit</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="text-teal-600 rounded" />
                  <span>Follow-up Consultation</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="text-teal-600 rounded" />
                  <span>Emergency Consultation</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maximum Appointments Per Day
              </label>
              <select className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 mb-4">
                <option>12 appointments</option>
                <option>15 appointments</option>
                <option>20 appointments</option>
              </select>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Allow Same Day Appointments</span>
                  <input
                    type="checkbox"
                    checked={sameDay}
                    onChange={(e) => setSameDay(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Require Patient Confirmation</span>
                  <input
                    type="checkbox"
                    checked={requireConfirm}
                    onChange={(e) => setRequireConfirm(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Send Automatic Reminders</span>
                  <input
                    type="checkbox"
                    checked={autoRemind}
                    onChange={(e) => setAutoRemind(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Allow Rescheduling by Patients</span>
                  <input
                    type="checkbox"
                    checked={allowReschedule}
                    onChange={(e) => setAllowReschedule(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Schedule Preview</h3>
              <p className="text-[11px] text-slate-400">
                Preview how your schedule looks for the selected date.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-800">12 Oct 2024 (Saturday)</span>
            <div className="flex items-center gap-1 text-slate-400">
              <button className="p-1 hover:text-slate-600">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 hover:text-slate-600">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isPreviewMode ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-16 font-mono text-[11px] text-slate-500">09:00 AM</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-700 font-semibold">Available</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-16 font-mono text-[11px] text-slate-500">09:30 AM</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-700 font-semibold">Available</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-16 font-mono text-[11px] text-slate-500">10:00 AM</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-700 font-semibold">Available</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-50/70 border border-blue-200">
                <span className="w-16 font-mono text-[11px] text-slate-700 font-bold">10:30 AM</span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-blue-900 font-bold">
                  Booked - Ramesh Kumar (Consultation)
                </span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-16 font-mono text-[11px] text-slate-500">11:00 AM</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-700 font-semibold">Available</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-50/70 border border-blue-200">
                <span className="w-16 font-mono text-[11px] text-slate-700 font-bold">11:30 AM</span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-blue-900 font-bold">
                  Booked - Priya Sharma (Follow-up)
                </span>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="w-5 h-5 text-slate-400" />}
              title="Schedule preview unconfigured"
              description="Save your working hours configuration to preview public patient booking slots."
              compact
            />
          )}
        </div>
      </div>
    </div>
  )
}
